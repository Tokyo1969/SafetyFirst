import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckIcon } from '../components/blocks'
import { AddToCart, DocPlaceholder, Price, ShopSoon, docTypeLabel } from '../components/shop'
import { site } from '../config/site'
import { useShopEnabled } from '../lib/cart'
import { pageHead } from '../lib/seo'
import { getShopProduct } from '../server/shop'

// Karta produktu w sklepie. Do wlaczenia site.payments.enabled noindex i widoczna tylko w podgladzie (?platnosci=1).
export const Route = createFileRoute('/sklep/$slug')({
  loader: async ({ params }) => {
    const product = await getShopProduct({ data: { slug: params.slug } })
    if (!product) throw notFound()
    return product
  },
  head: ({ loaderData }) =>
    pageHead({
      title: loaderData ? `${loaderData.title} – wzór do pobrania | Safety First` : 'Sklep – Safety First',
      description: (loaderData?.short_description ?? 'Gotowy wzór dokumentu do pobrania po zapłacie online.').slice(0, 160),
      path: loaderData ? `/sklep/${loaderData.slug}` : '/sklep',
      noindex: !site.payments.enabled,
    }),
  notFoundComponent: () => (
    <main className="sekcja bg-papier">
      <div className="kontener max-w-2xl">
        <h1 className="text-3xl">Nie ma takiego dokumentu</h1>
        <p className="mt-4">Dokument mógł zostać wycofany ze sklepu albo adres jest niepełny.</p>
        <Link to="/sklep" className="btn btn-glowny mt-6">Wszystkie dokumenty</Link>
      </div>
    </main>
  ),
  component: Produkt,
})

const LANGUAGES: Record<string, string> = { pl: 'polski', en: 'angielski', de: 'niemiecki', uk: 'ukraiński' }

// Zgodnie z regulaminem: §2 ust. 2 (konto), §6 ust. 2 (10 pobran), §6 ust. 5 (aktualizacje 12 mies.), §7 (licencja).
const WHAT_YOU_GET = [
  'Plik do pobrania od razu po zaksięgowaniu płatności, w zakładce Moje zakupy (konto zakładamy automatycznie na e-mail z zamówienia).',
  'Do 10 pobrań każdego pliku, na prośbę zwiększamy limit.',
  'Bezpłatna nowa wersja, jeśli w ciągu 12 miesięcy od zakupu zaktualizujemy dokument z powodu zmiany przepisów.',
  'Licencja na użytek wewnętrzny Twojej firmy: drukowanie, kopie dla pracowników, uzupełnianie własnymi danymi.',
  'Faktura VAT e-mailem.',
]

function Produkt() {
  const p = Route.useLoaderData()
  const enabled = useShopEnabled()
  const [page, setPage] = useState(0)
  const preview = p.previews[page]

  const facts: [string, string][] = [
    ['Rodzaj', docTypeLabel(p)],
    ...(p.page_count ? ([['Liczba stron', String(p.page_count)]] as [string, string][]) : []),
    ...(p.edition ? ([['Wydanie', p.edition]] as [string, string][]) : []),
    ...(p.language ? ([['Język', LANGUAGES[p.language] ?? p.language]] as [string, string][]) : []),
    ['Kod', p.sku],
  ]

  return (
    <main>
      <section className="sekcja bg-papier pt-8 md:pt-12">
        <div className="kontener">
          <nav aria-label="Okruszki" className="text-sm text-tusz-2">
            <Link to="/" className="hover:text-znak hover:underline">Strona główna</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <Link to="/sklep" className="hover:text-znak hover:underline">Sklep</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <Link to="/sklep" search={{ kategoria: p.category.slug }} className="hover:text-znak hover:underline">
              {p.category.name}
            </Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{p.title}</span>
          </nav>

          {!enabled ? (
            <div className="mt-8 max-w-2xl">
              <ShopSoon />
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div>
                <div className="overflow-hidden rounded-[var(--radius-panel)] border border-linia bg-mgla">
                  {preview ? (
                    <img
                      src={preview}
                      alt={`Podgląd dokumentu „${p.title}”, strona ${page + 1}`}
                      className="h-auto max-h-[80vh] w-full object-contain object-top"
                    />
                  ) : (
                    <div className="aspect-[3/4]">
                      <DocPlaceholder />
                    </div>
                  )}
                </div>
                {p.previews.length > 1 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Strony podglądu">
                    {p.previews.map((src, i) => (
                      <li key={src}>
                        <button
                          type="button"
                          onClick={() => setPage(i)}
                          aria-label={`Pokaż stronę ${i + 1}`}
                          aria-pressed={i === page}
                          className={`block w-16 overflow-hidden rounded-lg border-2 ${i === page ? 'border-znak' : 'border-linia hover:border-tusz-2'}`}
                        >
                          <img src={src} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover object-top" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {preview && (
                  <p className="mt-3 text-sm text-tusz-2">Podgląd poglądowy. Pełny plik dostajesz po zapłacie.</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide text-tusz-2 uppercase">{docTypeLabel(p)}</p>
                <h1 className="mt-2 text-3xl md:text-4xl">{p.title}</h1>
                {p.short_description && <p className="mt-4 text-lg text-tusz-2">{p.short_description}</p>}

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-mgla p-5">
                  <Price net={p.price_net_cents} vat={p.vat_rate} size="lg" />
                  <AddToCart id={p.id} className="min-w-44" />
                </div>
                <p className="mt-3 text-sm text-tusz-2">Sprzedaż tylko dla firm: do zamówienia potrzebny jest NIP.</p>

                {p.long_description && (
                  <div className="mt-8">
                    <h2 className="text-xl">Opis</h2>
                    <div className="mt-3 whitespace-pre-line">{p.long_description}</div>
                  </div>
                )}

                {p.bundle.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl">W pakiecie ({p.bundle.length})</h2>
                    <ul className="mt-3 grid gap-2">
                      {p.bundle.map((b) => (
                        <li key={b.title} className="flex gap-3">
                          <CheckIcon className="mt-0.5 size-5 shrink-0" />
                          {b.slug ? (
                            <Link to="/sklep/$slug" params={{ slug: b.slug }} className="link">{b.title}</Link>
                          ) : (
                            <span>{b.title}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-linia pt-6 text-sm">
                  {facts.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="font-semibold text-tusz-2">{k}</dt>
                      <dd className={k === 'Kod' ? 'font-mono' : ''}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 rounded-2xl border border-znak/25 bg-znak-jasny p-5">
                  <h2 className="text-lg">Co dostajesz</h2>
                  <ul className="mt-3 grid gap-2">
                    {WHAT_YOU_GET.map((t) => (
                      <li key={t} className="flex gap-3">
                        <CheckIcon className="mt-0.5 size-5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
