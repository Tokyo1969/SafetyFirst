import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { PageHero } from '../components/blocks'
import { site } from '../config/site'
import { formatGrosze, isDigital, maxQuantity, unitGrossCents, type ShopProduct } from '../lib/shop'
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
        lead="Zapłać kartą, BLIK-iem lub przelewem online. Płatność obsługuje Stripe, fakturę VAT wystawiamy na dane z formularza płatności."
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

const BLAD_OGOLNY = 'Płatności są chwilowo niedostępne. Napisz do nas przez formularz kontaktowy.'

function ProductCard({ product }: { product: ShopProduct }) {
  const [quantity, setQuantity] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const gross = unitGrossCents(product.price_net_cents, product.vat_rate)
  const max = maxQuantity(product.type)
  const digital = isDigital(product.type)
  const perPerson = product.type === 'training_online' || product.type === 'training_onsite'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    setSending(true)
    try {
      const result = await startCheckout({
        data: {
          productId: product.id,
          quantity,
          email: String(form.get('email') ?? ''),
          consent: form.get('consent') === 'on',
        },
      })
      if (result.ok) {
        window.location.assign(result.url)
        return
      }
      setError(
        result.field === 'email'
          ? 'Podaj poprawny adres e-mail.'
          : result.field === 'consent'
            ? 'Zaznacz zgodę na dostarczenie treści cyfrowej.'
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
      {digital && (
        // Tresc zgody do przegladu prawnika razem z regulaminem sklepu.
        <label className="mt-4 flex gap-3 text-sm">
          <input type="checkbox" name="consent" required className="mt-1" />
          <span>
            Zgadzam się na dostarczenie treści cyfrowej przed upływem terminu na odstąpienie od umowy i przyjmuję do
            wiadomości, że tracę wtedy prawo odstąpienia.
          </span>
        </label>
      )}
      <button type="submit" className="btn btn-glowny mt-6" disabled={sending}>
        {sending ? 'Przekierowuję…' : `Zapłać ${formatGrosze(gross * quantity)}`}
      </button>
      {error && (
        <p role="alert" className="mt-4 rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">{error}</p>
      )}
    </form>
  )
}
