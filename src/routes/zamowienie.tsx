import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PageHero } from '../components/blocks'
import { cart } from '../lib/cart'
import { pageHead } from '../lib/seo'

type Search = { status?: 'ok' | 'anulowano'; nr?: string }

// Powrot ze Stripe Checkout (success_url). Zamowienie sklada sie w koszyku (/koszyk), anulowana platnosc wraca
// do /koszyk?anulowano=1 (status=anulowano zostaje dla sesji zalozonych przed 8.11.2026).
export const Route = createFileRoute('/zamowienie')({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(search.status === 'ok' || search.status === 'anulowano' ? { status: search.status } : {}),
    ...(typeof search.nr === 'string' && /^SF-\d{4}-\d{6}$/.test(search.nr) ? { nr: search.nr } : {}),
  }),
  head: () =>
    pageHead({
      title: 'Zamówienie – Safety First',
      description: 'Potwierdzenie zamówienia w sklepie Safety First.',
      path: '/zamowienie',
      noindex: true,
    }),
  component: Zamowienie,
})

function Zamowienie() {
  const { status, nr } = Route.useSearch()

  // Po oplaceniu koszyk jest juz zamowieniem.
  useEffect(() => {
    if (status === 'ok') cart.clear()
  }, [status])

  return (
    <main>
      <PageHero
        crumb="Zamówienie"
        title={status === 'ok' ? 'Dziękujemy za zamówienie' : 'Zamówienie'}
        lead={status === 'ok' ? 'Potwierdzenie i fakturę wyślemy e-mailem.' : 'Sklep z dokumentami Safety First.'}
      />
      <section className="sekcja bg-papier">
        <div className="kontener max-w-3xl">
          {status === 'ok' ? (
            <div role="status" className="rounded-2xl bg-znak-jasny p-6">
              <p className="text-lg font-semibold">{nr ? `Zamówienie ${nr} zostało przyjęte.` : 'Zamówienie zostało przyjęte.'}</p>
              <p className="mt-3">
                Po zaksięgowaniu płatności wyślemy e-mail z potwierdzeniem i fakturą. Pliki pobierzesz w zakładce{' '}
                <Link to="/konto" className="link font-semibold">Moje zakupy</Link>, zalogujesz się linkiem z e-maila.
              </p>
              <p className="mt-3 text-sm text-tusz-2">
                Płatność BLIK-iem lub przelewem może się przetwarzać kilka minut. Potwierdzenie przyjdzie wtedy osobno.
              </p>
            </div>
          ) : status === 'anulowano' ? (
            <div role="status" className="panel">
              <p className="font-semibold">Płatność została przerwana, nic nie pobraliśmy.</p>
              <Link to="/koszyk" className="btn btn-glowny mt-4">Wróć do koszyka</Link>
            </div>
          ) : (
            <div className="panel">
              <p>Zamówienie złożysz w koszyku, po wybraniu dokumentów w sklepie.</p>
              <Link to="/sklep" className="btn btn-glowny mt-4">Przejdź do sklepu</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
