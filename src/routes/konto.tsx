import { Link, createFileRoute } from '@tanstack/react-router'
import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { site } from '../config/site'
import { kontoClient } from '../lib/konto'
import { formatGrosze, type ProductType } from '../lib/shop'
import { pageHead } from '../lib/seo'
import { requestLoginLink } from '../server/account'

// Konto klienta, zakladka "Moje zakupy" (regulamin §2 i §6): pobieranie kupionych plikow z limitem, historia
// zamowien z fakturami, dane firmy, haslo. Konto powstaje automatycznie po zakupie (src/server/entitlements.ts).
export const Route = createFileRoute('/konto')({
  head: () =>
    pageHead({ title: 'Moje zakupy – Safety First', description: 'Konto klienta sklepu Safety First.', path: '/konto', noindex: true }),
  component: Konto,
})

type Stan = { kind: 'loading' } | { kind: 'guest'; info?: string } | { kind: 'user'; session: Session }

function Konto() {
  const [stan, setStan] = useState<Stan>({ kind: 'loading' })

  useEffect(() => {
    const supabase = kontoClient()
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    async function start() {
      if (tokenHash) {
        // Link z maila: jednorazowy token, potem usuwamy go z adresu.
        window.history.replaceState(null, '', window.location.pathname)
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
        if (error || !data.session) return setStan({ kind: 'guest', info: 'Link logowania wygasł albo został już użyty. Wyślij nowy.' })
        return setStan({ kind: 'user', session: data.session })
      }
      const { data } = await supabase.auth.getSession()
      setStan(data.session ? { kind: 'user', session: data.session } : { kind: 'guest' })
    }
    start()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') setStan({ kind: 'guest' })
      if (event === 'SIGNED_IN' && session) setStan({ kind: 'user', session })
      if (event === 'TOKEN_REFRESHED' && session) setStan({ kind: 'user', session })
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <main className="kontener max-w-4xl py-16 md:py-20">
      <h1>Moje zakupy</h1>
      {stan.kind === 'loading' && <p className="mt-6">Ładowanie…</p>}
      {stan.kind === 'guest' && <Logowanie info={stan.info} />}
      {stan.kind === 'user' && <Zakupy session={stan.session} />}
    </main>
  )
}

function Logowanie({ info }: { info?: string }) {
  const [wyslano, setWyslano] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(info ?? null)
  const [sending, setSending] = useState<'link' | 'haslo' | null>(null)

  async function link(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    setError(null)
    setSending('link')
    try {
      const result = await requestLoginLink({ data: { email, website: String(form.get('website') ?? '') } })
      if (result.ok) setWyslano(email)
      else
        setError(
          result.error === 'invalid'
            ? 'Podaj poprawny adres e-mail.'
            : result.error === 'limit'
              ? 'Za dużo prób. Spróbuj za godzinę.'
              : `Nie udało się wysłać linku. Napisz na ${site.emails.main}.`,
        )
    } catch {
      setError(`Nie udało się wysłać linku. Napisz na ${site.emails.main}.`)
    } finally {
      setSending(null)
    }
  }

  async function haslo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    setSending('haslo')
    const { error } = await kontoClient().auth.signInWithPassword({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    })
    setSending(null)
    if (error) setError('Nieprawidłowy e-mail lub hasło. Jeśli nie masz hasła, zaloguj się linkiem.')
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <p className="text-lg text-tusz-2 md:col-span-2">
        Konto zakładamy automatycznie przy pierwszym zakupie, na adres e-mail z zamówienia. Tu pobierzesz kupione dokumenty
        i faktury.
      </p>
      <form className="panel grid content-start gap-3" onSubmit={link}>
        <h2 className="text-xl">Zaloguj się linkiem</h2>
        {wyslano ? (
          <p role="status" className="rounded-xl bg-znak-jasny p-4">
            Wysłaliśmy link logowania na {wyslano}. Sprawdź skrzynkę (także spam). Link działa przez godzinę.
          </p>
        ) : (
          <>
            <label htmlFor="k-email" className="text-sm font-semibold">E-mail</label>
            <input id="k-email" name="email" type="email" required autoComplete="email" className="pole w-full" />
            <div aria-hidden="true" className="hidden">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" className="btn btn-glowny justify-self-start" disabled={sending !== null}>
              {sending === 'link' ? 'Wysyłam…' : 'Wyślij link logowania'}
            </button>
          </>
        )}
      </form>
      <form className="panel grid content-start gap-3" onSubmit={haslo}>
        <h2 className="text-xl">Zaloguj się hasłem</h2>
        <label htmlFor="k-email2" className="text-sm font-semibold">E-mail</label>
        <input id="k-email2" name="email" type="email" required autoComplete="username" className="pole w-full" />
        <label htmlFor="k-pass" className="text-sm font-semibold">Hasło</label>
        <input id="k-pass" name="password" type="password" required autoComplete="current-password" className="pole w-full" />
        <button type="submit" className="btn btn-obrys justify-self-start" disabled={sending !== null}>
          {sending === 'haslo' ? 'Logowanie…' : 'Zaloguj'}
        </button>
      </form>
      {error && <p role="alert" className="font-semibold text-blad md:col-span-2">{error}</p>}
    </div>
  )
}

type Uprawnienie = {
  id: string
  product_id: string
  granted_at: string
  download_limit: number | null
  products: { title: string; type: ProductType; edition: string | null; short_description: string | null } | null
  order_items: { orders: { order_number: string } | null } | null
}

type Zamowienie = {
  id: string
  order_number: string
  status: string
  created_at: string
  total_gross_cents: number
  invoice_number: string | null
  invoice_pdf_url: string | null
  order_items: { title: string; quantity: number }[]
}

const STATUS: Record<string, string> = { pending: 'oczekuje na płatność', paid: 'opłacone', failed: 'płatność nieudana', refunded: 'zwrócone', cancelled: 'anulowane' }

function dataPl(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeZone: 'Europe/Warsaw' }).format(new Date(iso))
}

function Zakupy({ session }: { session: Session }) {
  const [uprawnienia, setUprawnienia] = useState<Uprawnienie[] | null>(null)
  const [pobrania, setPobrania] = useState<Record<string, number>>({})
  const [limitDomyslny, setLimitDomyslny] = useState(10)
  const [zamowienia, setZamowienia] = useState<Zamowienie[]>([])
  const [error, setError] = useState<string | null>(null)
  const [wTrakcie, setWTrakcie] = useState<string | null>(null)
  const [komunikat, setKomunikat] = useState<{ id: string; text: string } | null>(null)

  const wczytaj = useCallback(async () => {
    const supabase = kontoClient()
    const [u, d, s, z] = await Promise.all([
      supabase
        .from('entitlements')
        .select('id,product_id,granted_at,download_limit,products(title,type,edition,short_description),order_items(orders(order_number))')
        .is('revoked_at', null)
        .order('granted_at', { ascending: false }),
      supabase.from('download_log').select('product_id'),
      supabase.from('app_settings').select('max_downloads_per_item').maybeSingle(),
      supabase
        .from('orders')
        .select('id,order_number,status,created_at,total_gross_cents,invoice_number,invoice_pdf_url,order_items(title,quantity)')
        .order('created_at', { ascending: false }),
    ])
    if (u.error) return setError('Nie udało się wczytać zakupów. Odśwież stronę.')
    setUprawnienia(u.data as unknown as Uprawnienie[])
    const count: Record<string, number> = {}
    for (const row of (d.data ?? []) as { product_id: string | null }[]) if (row.product_id) count[row.product_id] = (count[row.product_id] ?? 0) + 1
    setPobrania(count)
    if (s.data) setLimitDomyslny(s.data.max_downloads_per_item)
    setZamowienia((z.data ?? []) as Zamowienie[])
  }, [])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  async function pobierz(u: Uprawnienie) {
    setKomunikat(null)
    setWTrakcie(u.id)
    try {
      const { data } = await kontoClient().auth.getSession()
      const response = await fetch('/api/konto/pobierz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ productId: u.product_id }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setKomunikat({
          id: u.id,
          text:
            body.error === 'limit'
              ? `Limit pobrań został wykorzystany. Napisz na ${site.emails.main}, jeśli potrzebujesz pobrać plik ponownie.`
              : body.error === 'unauthorized'
                ? 'Sesja wygasła. Zaloguj się ponownie.'
                : body.error === 'no_file'
                  ? 'Plik jest w przygotowaniu. Poinformujemy, gdy będzie dostępny.'
                  : `Nie udało się pobrać pliku. Napisz na ${site.emails.main}.`,
        })
        return
      }
      const blob = await response.blob()
      const name = /filename="([^"]+)"/.exec(response.headers.get('content-disposition') ?? '')?.[1] ?? 'dokument'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      await wczytaj()
    } catch {
      setKomunikat({ id: u.id, text: `Nie udało się pobrać pliku. Napisz na ${site.emails.main}.` })
    } finally {
      setWTrakcie(null)
    }
  }

  return (
    <div className="mt-6 grid gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-tusz-2">Zalogowano jako <strong className="text-tusz">{session.user.email}</strong></p>
        <button type="button" className="btn btn-obrys" onClick={() => kontoClient().auth.signOut()}>Wyloguj</button>
      </div>

      <section aria-labelledby="zakupy-h">
        <h2 id="zakupy-h" className="text-2xl">Dokumenty i szkolenia</h2>
        {error && <p role="alert" className="mt-4 font-semibold text-blad">{error}</p>}
        {!uprawnienia && !error && <p className="mt-4">Ładowanie…</p>}
        {uprawnienia && uprawnienia.length === 0 && (
          <p className="mt-4">
            Nie masz jeszcze zakupów. Dokumenty pojawią się tu po opłaceniu zamówienia.
          </p>
        )}
        <ul className="mt-4 grid gap-4">
          {(uprawnienia ?? []).map((u) => {
            const limit = u.download_limit ?? limitDomyslny
            const uzyte = pobrania[u.product_id] ?? 0
            const szkolenie = u.products?.type === 'training_online'
            return (
              <li key={u.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg">{u.products?.title ?? 'Produkt'}</h3>
                    <p className="text-sm text-tusz-2">
                      {u.products?.edition ? `Wydanie ${u.products.edition} · ` : ''}
                      Zakup {dataPl(u.granted_at)}
                      {u.order_items?.orders ? ` · zamówienie ${u.order_items.orders.order_number}` : ''}
                    </p>
                  </div>
                  {szkolenie ? (
                    <p className="text-sm">Dostęp do szkolenia przekażemy e-mailem.</p>
                  ) : (
                    <div className="text-right">
                      <button type="button" className="btn btn-zielony" disabled={wTrakcie === u.id || uzyte >= limit} onClick={() => pobierz(u)}>
                        {wTrakcie === u.id ? 'Przygotowuję…' : 'Pobierz'}
                      </button>
                      <p className="mt-1 text-xs text-tusz-2">Pobrano {uzyte} z {limit}</p>
                    </div>
                  )}
                </div>
                {komunikat?.id === u.id && <p role="alert" className="mt-3 font-semibold text-blad">{komunikat.text}</p>}
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-sm text-tusz-2">
          Pobierany plik PDF ma w stopce nazwę nabywcy i numer zamówienia. Zasady licencji i pobrań opisują §6 i §7{' '}
          <Link to="/regulamin" className="link">Regulaminu</Link>.
        </p>
      </section>

      <section aria-labelledby="zam-h">
        <h2 id="zam-h" className="text-2xl">Zamówienia i faktury</h2>
        {zamowienia.length === 0 && <p className="mt-4">Brak zamówień.</p>}
        <ul className="mt-4 grid gap-3">
          {zamowienia.map((z) => (
            <li key={z.id} className="panel flex flex-wrap items-center justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold">{z.order_number} · {STATUS[z.status] ?? z.status}</p>
                <p className="text-tusz-2">
                  {dataPl(z.created_at)} · {z.order_items.map((i) => `${i.title} × ${i.quantity}`).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatGrosze(z.total_gross_cents)}</p>
                {z.invoice_pdf_url && (
                  <a href={z.invoice_pdf_url} target="_blank" rel="noreferrer" className="link">{z.invoice_number ?? 'Faktura'} (PDF)</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DaneFirmy userId={session.user.id} />
      <Haslo />

      <p className="text-sm text-tusz-2">
        Usunięcie Konta: napisz na {site.emails.main}. Przed usunięciem pobierz zakupione pliki (§2 ust. 4{' '}
        <Link to="/regulamin" className="link">Regulaminu</Link>).
      </p>
    </div>
  )
}

type Profil = { full_name: string; company_name: string; nip: string; address_street: string; address_postcode: string; address_city: string; phone: string }

function DaneFirmy({ userId }: { userId: string }) {
  const [form, setForm] = useState<Profil | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    kontoClient()
      .from('profiles')
      .select('full_name,company_name,nip,address_street,address_postcode,address_city,phone')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        const d = (data ?? {}) as Partial<Record<keyof Profil, string | null>>
        setForm({
          full_name: d.full_name ?? '',
          company_name: d.company_name ?? '',
          nip: d.nip ?? '',
          address_street: d.address_street ?? '',
          address_postcode: d.address_postcode ?? '',
          address_city: d.address_city ?? '',
          phone: d.phone ?? '',
        })
      })
  }, [userId])

  if (!form) return null

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form) return
    setInfo(null)
    setError(null)
    const nip = form.nip.replace(/^PL/i, '').replace(/\D/g, '')
    if (nip && nip.length !== 10) return setError('NIP: 10 cyfr.')
    const t = (v: string) => v.trim() || null
    const { error } = await kontoClient()
      .from('profiles')
      .update({
        full_name: t(form.full_name),
        company_name: t(form.company_name),
        nip: nip || null,
        address_street: t(form.address_street),
        address_postcode: t(form.address_postcode),
        address_city: t(form.address_city),
        phone: t(form.phone),
      })
      .eq('id', userId)
    if (error) return setError('Nie udało się zapisać danych.')
    setInfo('Zapisano.')
  }

  const pole = (key: keyof Profil, label: string, wide = false) => (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label htmlFor={`pf-${key}`} className="block text-sm font-semibold">{label}</label>
      <input id={`pf-${key}`} className="pole mt-1 w-full" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  )

  return (
    <form className="panel grid gap-4 md:grid-cols-2" onSubmit={zapisz} aria-labelledby="dane-h">
      <h2 id="dane-h" className="text-2xl md:col-span-2">Dane firmy</h2>
      <p className="text-sm text-tusz-2 md:col-span-2">Faktury wystawiamy na dane podane przy płatności. Tu zapisujesz dane firmy w Koncie.</p>
      {pole('company_name', 'Nazwa firmy', true)}
      {pole('nip', 'NIP')}
      {pole('full_name', 'Imię i nazwisko')}
      {pole('address_street', 'Ulica i numer', true)}
      {pole('address_postcode', 'Kod pocztowy')}
      {pole('address_city', 'Miejscowość')}
      {pole('phone', 'Telefon')}
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" className="btn btn-obrys">Zapisz dane</button>
        {info && <p role="status" className="font-semibold text-znak">{info}</p>}
        {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
      </div>
    </form>
  )
}

function Haslo() {
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const password = String(form.get('password') ?? '')
    setInfo(null)
    setError(null)
    if (password.length < 8) return setError('Hasło: co najmniej 8 znaków.')
    if (password !== String(form.get('password2') ?? '')) return setError('Hasła się różnią.')
    const { error } = await kontoClient().auth.updateUser({ password })
    if (error) return setError('Nie udało się ustawić hasła. Spróbuj innego hasła.')
    formEl.reset()
    setInfo('Hasło ustawione. Możesz logować się hasłem.')
  }

  return (
    <form className="panel grid gap-4 md:grid-cols-2" onSubmit={zapisz} aria-labelledby="haslo-h">
      <h2 id="haslo-h" className="text-2xl md:col-span-2">Hasło</h2>
      <div>
        <label htmlFor="h-1" className="block text-sm font-semibold">Nowe hasło</label>
        <input id="h-1" name="password" type="password" autoComplete="new-password" className="pole mt-1 w-full" required />
      </div>
      <div>
        <label htmlFor="h-2" className="block text-sm font-semibold">Powtórz hasło</label>
        <input id="h-2" name="password2" type="password" autoComplete="new-password" className="pole mt-1 w-full" required />
      </div>
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" className="btn btn-obrys">Ustaw hasło</button>
        {info && <p role="status" className="font-semibold text-znak">{info}</p>}
        {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
      </div>
    </form>
  )
}
