import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PageHero } from '../components/blocks'
import { DocPlaceholder, ShopSoon, docTypeLabel } from '../components/shop'
import { site } from '../config/site'
import { cart, useCart, useShopEnabled } from '../lib/cart'
import { pageHead } from '../lib/seo'
import { DIGITAL_CONSENT_TEXT, formatGrosze, isDigital, normalizeNip, unitGrossCents } from '../lib/shop'
import { startCheckout } from '../server/checkout'
import { getCartProducts, type CatalogProduct } from '../server/shop'

type Search = { anulowano?: boolean }

// Koszyk i zamowienie: dane firmy, NIP i zgody raz na cale zamowienie, potem Stripe Checkout (adres i platnosc).
export const Route = createFileRoute('/koszyk')({
  validateSearch: (search: Record<string, unknown>): Search => (search.anulowano ? { anulowano: true } : {}),
  head: () =>
    pageHead({ title: 'Koszyk – Safety First', description: 'Koszyk sklepu z dokumentami Safety First.', path: '/koszyk', noindex: true }),
  component: Koszyk,
})

const BLAD_NIP = 'Sprawdź NIP: powinien mieć 10 cyfr i poprawną sumę kontrolną.'
const BLAD_OGOLNY = `Płatności są chwilowo niedostępne. Spróbuj za chwilę albo napisz na ${site.emails.main}.`

function Koszyk() {
  const enabled = useShopEnabled()
  const { anulowano } = Route.useSearch()
  const lines = useCart()
  const ids = lines.map((l) => l.id).join(',')
  const [products, setProducts] = useState<CatalogProduct[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [removed, setRemoved] = useState(0)
  const [reload, setReload] = useState(0)

  // Ceny i dostepnosc zawsze z serwera. Produkty, ktorych juz nie ma w sklepie, usuwamy z koszyka z informacja.
  useEffect(() => {
    if (!ids) {
      setProducts([])
      return
    }
    let active = true
    getCartProducts({ data: { ids: ids.split(',') } })
      .then((list) => {
        if (!active) return
        if (!list) return setLoadError(true)
        setLoadError(false)
        const found = new Set(list.map((p) => p.id))
        const missing = ids.split(',').filter((id) => !found.has(id)).length
        if (missing) {
          setRemoved((n) => n + missing)
          cart.keep([...found])
        }
        setProducts(list)
      })
      .catch(() => active && setLoadError(true))
    return () => {
      active = false
    }
  }, [ids, reload])

  const items = useMemo(() => {
    const byId = new Map((products ?? []).map((p) => [p.id, p]))
    return lines.flatMap((l) => {
      const product = byId.get(l.id)
      return product ? [{ product, quantity: l.quantity }] : []
    })
  }, [lines, products])

  const net = items.reduce((s, i) => s + i.product.price_net_cents * i.quantity, 0)
  const gross = items.reduce((s, i) => s + unitGrossCents(i.product.price_net_cents, i.product.vat_rate) * i.quantity, 0)

  return (
    <main>
      <PageHero crumb="Koszyk" parent={{ label: 'Sklep', to: '/sklep' }} title="Koszyk" lead="Sprawdź dokumenty, podaj dane firmy do faktury i przejdź do płatności." />
      <section className="sekcja bg-papier">
        <div className="kontener">
          {!enabled ? (
            <div className="max-w-2xl">
              <ShopSoon />
            </div>
          ) : (
            <>
              {anulowano && (
                <p role="status" className="mb-6 max-w-3xl rounded-xl border-l-4 border-tasma bg-white p-4 shadow-sm">
                  Płatność została przerwana, nic nie pobraliśmy. Dokumenty czekają w koszyku, możesz spróbować jeszcze raz.
                </p>
              )}
              {removed > 0 && (
                <p role="status" className="mb-6 max-w-3xl rounded-xl border-l-4 border-tasma bg-white p-4 shadow-sm">
                  {removed === 1 ? 'Jeden dokument nie jest już dostępny' : `Dokumenty (${removed}) nie są już dostępne`} w sklepie i
                  {removed === 1 ? ' został usunięty' : ' zostały usunięte'} z koszyka.
                </p>
              )}
              {loadError && (
                <p role="alert" className="mb-6 max-w-3xl rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">
                  Nie udało się wczytać koszyka.{' '}
                  <button type="button" className="underline" onClick={() => setReload((n) => n + 1)}>Spróbuj ponownie</button>
                </p>
              )}

              {lines.length === 0 ? (
                <div className="panel max-w-2xl">
                  <p className="text-lg font-semibold">Koszyk jest pusty.</p>
                  <p className="mt-2">Wybierz dokumenty w sklepie i dodaj je do koszyka.</p>
                  <Link to="/sklep" className="btn btn-glowny mt-5">Przejdź do sklepu</Link>
                </div>
              ) : products === null ? (
                !loadError && <p>Wczytuję koszyk…</p>
              ) : (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
                  <div>
                    <ul className="divide-y divide-linia rounded-[var(--radius-panel)] border border-linia bg-white">
                      {items.map(({ product: p }) => (
                        <li key={p.id} className="flex gap-4 p-4">
                          <Link to="/sklep/$slug" params={{ slug: p.slug }} className="w-16 shrink-0 overflow-hidden rounded-lg border border-linia bg-mgla" tabIndex={-1} aria-hidden="true">
                            {p.preview ? (
                              <img src={p.preview} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover object-top" />
                            ) : (
                              <div className="aspect-[3/4]"><DocPlaceholder /></div>
                            )}
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide text-tusz-2 uppercase">{docTypeLabel(p)}</p>
                              <Link to="/sklep/$slug" params={{ slug: p.slug }} className="font-semibold hover:text-znak hover:underline">
                                {p.title}
                              </Link>
                              <button type="button" onClick={() => cart.remove(p.id)} className="mt-1 block text-sm text-tusz-2 underline hover:text-blad">
                                Usuń<span className="sr-only">: {p.title}</span>
                              </button>
                            </div>
                            <p className="shrink-0 text-right sm:min-w-32">
                              <span className="font-semibold">{formatGrosze(p.price_net_cents)}</span> <span className="text-sm">netto</span>
                              <span className="block text-sm text-tusz-2">{formatGrosze(unitGrossCents(p.price_net_cents, p.vat_rate))} brutto</span>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link to="/sklep" className="link mt-4 inline-block font-semibold">← Dodaj kolejne dokumenty</Link>
                  </div>

                  {items.length > 0 && (
                    <OrderForm
                      items={items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))}
                      digital={items.some((i) => isDigital(i.product.type))}
                      net={net}
                      gross={gross}
                      onUnavailable={() => setReload((n) => n + 1)}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function OrderForm({
  items,
  digital,
  net,
  gross,
  onUnavailable,
}: {
  items: { productId: string; quantity: number }[]
  digital: boolean
  net: number
  gross: number
  onUnavailable: () => void
}) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nipError, setNipError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    const nip = String(form.get('nip') ?? '')
    if (!normalizeNip(nip)) {
      setNipError(BLAD_NIP)
      document.getElementById('zam-nip')?.focus()
      return
    }
    setSending(true)
    try {
      const result = await startCheckout({
        data: {
          items,
          email: String(form.get('email') ?? ''),
          company: String(form.get('company') ?? ''),
          nip,
          consent: form.get('consent') === 'on',
          terms: form.get('terms') === 'on',
        },
      })
      if (result.ok) {
        window.location.assign(result.url)
        return
      }
      if (result.field === 'nip') setNipError(BLAD_NIP)
      if (result.field === 'unavailable' || result.field === 'items') onUnavailable()
      const messages: Record<string, string> = {
        company: 'Podaj nazwę firmy.',
        nip: BLAD_NIP,
        email: 'Podaj poprawny adres e-mail.',
        consent: 'Zaznacz oświadczenie o dostarczeniu treści cyfrowych.',
        terms: 'Zaakceptuj Regulamin i Politykę prywatności.',
        unavailable: 'Część dokumentów nie jest już dostępna. Odświeżyliśmy koszyk, sprawdź go i spróbuj ponownie.',
        items: 'Odświeżyliśmy koszyk, sprawdź go i spróbuj ponownie.',
      }
      setError((result.field && messages[result.field]) || (result.error === 'invalid' ? 'Sprawdź dane i spróbuj jeszcze raz.' : BLAD_OGOLNY))
    } catch {
      setError(BLAD_OGOLNY)
    }
    setSending(false)
  }

  return (
    <form className="panel p-6 lg:sticky lg:top-28" onSubmit={onSubmit}>
      <h2 className="text-xl">Zamówienie</h2>
      {site.payments.mode === 'test' && (
        <p className="mt-3 rounded-xl border-l-4 border-tasma bg-tasma/10 p-3 text-sm font-semibold">
          Tryb testowy: płatności nie są pobierane. Karta 4242 4242 4242 4242, dowolna przyszła data i CVC.
        </p>
      )}
      <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
        <dt>Pozycje</dt>
        <dd className="text-right">{items.length}</dd>
        <dt>Razem netto</dt>
        <dd className="text-right">{formatGrosze(net)}</dd>
        <dt>VAT</dt>
        <dd className="text-right">{formatGrosze(gross - net)}</dd>
        <dt className="mt-2 border-t border-linia pt-2 text-base font-semibold">Do zapłaty</dt>
        <dd className="mt-2 border-t border-linia pt-2 text-right text-base font-semibold">{formatGrosze(gross)}</dd>
      </dl>

      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="zam-email" className="block text-sm font-semibold">E-mail do zamówienia i faktury</label>
          <input id="zam-email" name="email" type="email" required autoComplete="email" className="pole mt-1 w-full" />
          <p className="mt-1 text-xs text-tusz-2">Na ten adres założymy konto z dostępem do plików.</p>
        </div>
        <div>
          <label htmlFor="zam-firma" className="block text-sm font-semibold">Nazwa firmy (do faktury)</label>
          <input id="zam-firma" name="company" required minLength={2} maxLength={256} autoComplete="organization" className="pole mt-1 w-full" />
        </div>
        <div>
          <label htmlFor="zam-nip" className="block text-sm font-semibold">NIP</label>
          <input
            id="zam-nip"
            name="nip"
            required
            inputMode="numeric"
            maxLength={16}
            aria-invalid={nipError ? true : undefined}
            aria-describedby={nipError ? 'zam-nip-blad' : undefined}
            onChange={() => nipError && setNipError(null)}
            onBlur={(e) => setNipError(e.currentTarget.value && !normalizeNip(e.currentTarget.value) ? BLAD_NIP : null)}
            className="pole mt-1 w-full"
          />
          {nipError && <p id="zam-nip-blad" className="mt-1 text-sm font-semibold text-blad">{nipError}</p>}
        </div>
      </div>

      <label className="mt-5 flex gap-3 text-sm">
        <input type="checkbox" name="terms" required className="mt-1" />
        <span>
          Akceptuję <Link to="/regulamin" className="link" target="_blank">Regulamin sklepu</Link> i{' '}
          <Link to="/polityka-prywatnosci" className="link" target="_blank">Politykę prywatności</Link>.
        </span>
      </label>
      {digital && (
        // Oswiadczenie z regulaminu §8 ust. 2 (zapis daty w orders.digital_content_consent_at).
        <label className="mt-3 flex gap-3 text-sm">
          <input type="checkbox" name="consent" required className="mt-1" />
          <span>{DIGITAL_CONSENT_TEXT}</span>
        </label>
      )}

      <button type="submit" className="btn btn-glowny mt-5 w-full" disabled={sending}>
        {sending ? 'Przekierowuję do płatności…' : 'Zamawiam z obowiązkiem zapłaty'}
      </button>
      <p className="mt-3 text-xs text-tusz-2">
        Adres do faktury i metodę płatności (karta, BLIK, Przelewy24) podasz na następnej stronie, obsługiwanej przez Stripe.
      </p>
      {error && <p role="alert" className="mt-4 rounded-xl border-l-4 border-blad bg-blad/8 p-4 text-sm font-semibold text-blad">{error}</p>}
    </form>
  )
}
