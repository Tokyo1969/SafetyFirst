import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { PageHero } from '../components/blocks'
import { site } from '../config/site'
import { DIGITAL_CONSENT_TEXT, formatGrosze, isDigital, maxQuantity, normalizeNip, unitGrossCents, type ShopProduct } from '../lib/shop'
import { pageHead } from '../lib/seo'
import { listShopProducts, startCheckout } from '../server/checkout'

type Search = { status?: 'ok' | 'anulowano'; nr?: string }

// Strona platnosci online. Bez linkow w nawigacji i poza sitemap do czasu wlaczenia site.payments.enabled.
export const Route = createFileRoute('/zamowienie')({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(search.status === 'ok' || search.status === 'anulowano' ? { status: search.status } : {}),
    ...(typeof search.nr === 'string' && /^SF-\d{4}-\d{6}$/.test(search.nr) ? { nr: search.nr } : {}),
  }),
  loader: () => listShopProducts(),
  head: () =>
    pageHead({
      title: 'Zamówienie i płatność online – Safety First',
      description: 'Płatność online za usługi Safety First.',
      path: '/zamowienie',
      noindex: true,
    }),
  component: Zamowienie,
})

function Zamowienie() {
  const { status, nr } = Route.useSearch()
  const products = Route.useLoaderData()
  const [aktywny, setAktywny] = useState<boolean>(site.payments.enabled)

  // Do testow przed wlaczeniem: dopisz ?platnosci=1 do adresu (jak ?asystent=1 przy czacie).
  useEffect(() => {
    const podglad = new URLSearchParams(window.location.search).has('platnosci')
    setAktywny(site.payments.enabled || podglad)
  }, [])

  return (
    <main>
      <PageHero
        crumb="Zamówienie"
        title="Płatność online"
        lead="Zapłać kartą, BLIK-iem lub przelewem online. Płatność obsługuje Stripe, fakturę VAT wystawiamy na firmę i NIP z formularza zamówienia."
      />
      <section className="sekcja bg-papier">
        <div className="kontener max-w-3xl">
          {status === 'ok' && (
            <div role="status" className="mb-8 rounded-2xl bg-znak-jasny p-6">
              <p className="font-semibold">Dziękujemy{nr ? `, zamówienie ${nr} zostało przyjęte` : ', zamówienie zostało przyjęte'}.</p>
              <p className="mt-2">
                Jeśli płatność BLIK-iem lub przelewem jeszcze się przetwarza, potwierdzimy ją e-mailem. Fakturę wyślemy na adres
                podany przy zamówieniu.
              </p>
            </div>
          )}
          {status === 'anulowano' && (
            <p role="status" className="mb-8 rounded-xl border-l-4 border-tasma bg-white p-4">
              Płatność została przerwana, nic nie pobraliśmy. Możesz spróbować jeszcze raz.
            </p>
          )}
          {aktywny && products.length > 0 ? (
            <>
              {site.payments.mode === 'test' && (
                <p className="mb-8 rounded-xl border-l-4 border-tasma bg-white p-4 font-semibold">
                  Tryb testowy: płatności nie są pobierane. Karta testowa 4242 4242 4242 4242, dowolna przyszła data i CVC.
                </p>
              )}
              <ul className="grid gap-6">
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="panel">
              <p className="font-semibold">Płatności online będą dostępne wkrótce.</p>
              <p className="mt-2">
                Do tego czasu napisz do nas przez{' '}
                <Link to="/kontakt" hash="konsultacja" className="link">formularz kontaktowy</Link>.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

const BLAD_NIP = 'Sprawdź NIP: powinien mieć 10 cyfr i poprawną sumę kontrolną.'
const BLAD_OGOLNY = 'Płatności są chwilowo niedostępne. Napisz do nas przez formularz kontaktowy.'

function ProductCard({ product }: { product: ShopProduct }) {
  const [quantity, setQuantity] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nipError, setNipError] = useState<string | null>(null)
  const gross = unitGrossCents(product.price_net_cents, product.vat_rate)
  const max = maxQuantity(product.type)
  const digital = isDigital(product.type)
  const perPerson = product.type === 'training_online' || product.type === 'training_onsite'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    const nip = String(form.get('nip') ?? '')
    if (!normalizeNip(nip)) {
      setNipError(BLAD_NIP)
      document.getElementById(`nip-${product.id}`)?.focus()
      return
    }
    setSending(true)
    try {
      const result = await startCheckout({
        data: {
          productId: product.id,
          quantity,
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
      setError(
        result.field === 'company'
          ? 'Podaj nazwę firmy.'
          : result.field === 'nip'
            ? BLAD_NIP
          : result.field === 'email'
          ? 'Podaj poprawny adres e-mail.'
          : result.field === 'consent'
            ? 'Zaznacz oświadczenie o dostarczeniu treści cyfrowych.'
            : result.field === 'terms'
              ? 'Zaakceptuj Regulamin i Politykę prywatności.'
            : result.error === 'invalid'
              ? 'Sprawdź dane i spróbuj jeszcze raz.'
              : BLAD_OGOLNY,
      )
    } catch {
      setError(BLAD_OGOLNY)
    }
    setSending(false)
  }

  const id = product.id
  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2 className="text-xl">{product.title}</h2>
      {product.short_description && <p className="mt-2 text-tusz-2">{product.short_description}</p>}
      <p className="mt-4">
        <span className="text-2xl font-semibold">{formatGrosze(product.price_net_cents)}</span> netto
        {perPerson ? ' / osoba' : ''}
        <span className="ml-2 text-tusz-2">({formatGrosze(gross)} brutto)</span>
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor={`email-${id}`} className="block text-sm font-semibold">E-mail do zamówienia i faktury</label>
          <input id={`email-${id}`} name="email" type="email" required autoComplete="email" className="pole mt-1 w-full" />
        </div>
        {max > 1 && (
          <div>
            <label htmlFor={`ilosc-${id}`} className="block text-sm font-semibold">Liczba osób</label>
            <select
              id={`ilosc-${id}`}
              className="pole mt-1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_14rem]">
        <div>
          <label htmlFor={`firma-${id}`} className="block text-sm font-semibold">Nazwa firmy (do faktury)</label>
          <input
            id={`firma-${id}`}
            name="company"
            required
            minLength={2}
            maxLength={256}
            autoComplete="organization"
            className="pole mt-1 w-full"
          />
        </div>
        <div>
          <label htmlFor={`nip-${id}`} className="block text-sm font-semibold">NIP</label>
          <input
            id={`nip-${id}`}
            name="nip"
            required
            inputMode="numeric"
            maxLength={16}
            aria-invalid={nipError ? true : undefined}
            aria-describedby={nipError ? `nip-blad-${id}` : undefined}
            onChange={() => nipError && setNipError(null)}
            onBlur={(e) => setNipError(e.currentTarget.value && !normalizeNip(e.currentTarget.value) ? BLAD_NIP : null)}
            className="pole mt-1 w-full"
          />
          {nipError && (
            <p id={`nip-blad-${id}`} className="mt-1 text-sm font-semibold text-blad">{nipError}</p>
          )}
        </div>
      </div>
      <label className="mt-4 flex gap-3 text-sm">
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
      <p className="mt-4 text-sm text-tusz-2">
        Do zapłaty: <strong className="text-tusz">{formatGrosze(gross * quantity)} brutto</strong>. Adres do faktury i metodę płatności
        podasz na następnej stronie (Stripe).
      </p>
      <button type="submit" className="btn btn-glowny mt-4" disabled={sending}>
        {sending ? 'Przekierowuję…' : 'Zamawiam z obowiązkiem zapłaty'}
      </button>
      {error && (
        <p role="alert" className="mt-4 rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">{error}</p>
      )}
    </form>
  )
}
