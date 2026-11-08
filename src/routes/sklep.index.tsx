import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { PageHero } from '../components/blocks'
import { ProductTile, ShopSoon } from '../components/shop'
import { site } from '../config/site'
import type { Area } from '../lib/admin'
import { useShopEnabled } from '../lib/cart'
import { pageHead } from '../lib/seo'
import { getCatalog, type CatalogCategory } from '../server/shop'

type Search = { kategoria?: string; q?: string }

const PAGE = 24
const AREA_GROUPS: { area: Area; title: string }[] = [
  { area: 'bhp', title: 'Dokumenty BHP' },
  { area: 'os', title: 'Ochrona środowiska' },
  { area: 'both', title: 'BHP i ochrona środowiska' },
]

// Sklep z dokumentami (decyzja 8.11.2026: na start tylko dokumenty i pakiety, tylko z wlaczonych kategorii).
// Do wlaczenia site.payments.enabled widoczny tylko w podgladzie (?platnosci=1), noindex i poza sitemap.
export const Route = createFileRoute('/sklep/')({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search.kategoria === 'string' && /^[a-z0-9-]{1,120}$/.test(search.kategoria) ? { kategoria: search.kategoria } : {}),
    ...(typeof search.q === 'string' && search.q.trim() ? { q: search.q.slice(0, 80) } : {}),
  }),
  loader: () => getCatalog(),
  head: () =>
    pageHead({
      title: 'Sklep z dokumentami BHP i ochrony środowiska – Safety First',
      description:
        'Gotowe wzory dokumentów BHP i ochrony środowiska do pobrania: karty, instrukcje, procedury, rejestry i pakiety. Faktura VAT, pobieranie od razu po zapłacie.',
      path: '/sklep',
      noindex: !site.payments.enabled,
    }),
  component: Sklep,
})

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
}

function Sklep() {
  const enabled = useShopEnabled()
  const { categories, products } = Route.useLoaderData()
  const { kategoria, q } = Route.useSearch()
  const navigate = useNavigate({ from: '/sklep/' })
  const [query, setQuery] = useState(q ?? '')
  const [limit, setLimit] = useState(PAGE)

  const current = categories.find((c) => c.slug === kategoria)
  const visible = useMemo(() => {
    const words = normalize(q ?? '').split(/\s+/).filter(Boolean)
    return products.filter((p) => {
      if (current && p.category_id !== current.id) return false
      if (!words.length) return true
      const text = normalize(`${p.title} ${p.short_description ?? ''} ${p.doc_type ?? ''} ${p.sku}`)
      return words.every((w) => text.includes(w))
    })
  }, [products, current, q])

  function setSearch(next: Search) {
    setLimit(PAGE)
    void navigate({ search: (s) => ({ ...s, ...next }), replace: true, resetScroll: false })
  }

  return (
    <main>
      <PageHero
        crumb="Sklep"
        title="Dokumenty do pobrania"
        lead="Gotowe wzory dokumentów BHP i ochrony środowiska przygotowane przez specjalistę. Płacisz online, pobierasz od razu po zapłacie w zakładce Moje zakupy, fakturę VAT dostajesz e-mailem."
      />
      <section className="sekcja bg-papier">
        <div className="kontener">
          {!enabled ? (
            <div className="max-w-2xl">
              <ShopSoon />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
              <aside aria-label="Kategorie" className="hidden lg:block">
                <CategoryNav categories={categories} current={current?.slug} total={products.length} onPick={setSearch} />
              </aside>
              <div>
                <form
                  role="search"
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSearch({ q: query.trim() || undefined })
                  }}
                >
                  <div className="flex-1">
                    <label htmlFor="sklep-szukaj" className="block text-sm font-semibold">Szukaj dokumentu</label>
                    <input
                      id="sklep-szukaj"
                      type="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        if (!e.target.value) setSearch({ q: undefined })
                      }}
                      placeholder="np. karta szkolenia, apteczka, instrukcja"
                      className="pole mt-1 w-full"
                    />
                  </div>
                  <div className="lg:hidden">
                    <label htmlFor="sklep-kategoria" className="block text-sm font-semibold">Kategoria</label>
                    <select
                      id="sklep-kategoria"
                      className="pole mt-1 w-full"
                      value={current?.slug ?? ''}
                      onChange={(e) => setSearch({ kategoria: e.target.value || undefined })}
                    >
                      <option value="">Wszystkie ({products.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name} ({c.count})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-glowny">Szukaj</button>
                </form>

                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-2xl">{current?.name ?? 'Wszystkie dokumenty'}</h2>
                  <p className="text-sm text-tusz-2" aria-live="polite">
                    {visible.length === 1 ? '1 dokument' : `Dokumentów: ${visible.length}`}
                    {q ? ` dla „${q}”` : ''}
                  </p>
                </div>
                {current?.description && <p className="mt-2 max-w-3xl text-tusz-2">{current.description}</p>}

                {visible.length === 0 ? (
                  <div className="mt-6 rounded-2xl bg-mgla p-6">
                    <p className="font-semibold">Nie znaleźliśmy dokumentu{q ? ` dla „${q}”` : ' w tej kategorii'}.</p>
                    <p className="mt-2">
                      Spróbuj innego słowa albo{' '}
                      <button type="button" className="link font-semibold" onClick={() => { setQuery(''); setSearch({ q: undefined, kategoria: undefined }) }}>
                        pokaż wszystkie dokumenty
                      </button>
                      . Nie ma tego, czego szukasz?{' '}
                      <Link to="/kontakt" hash="konsultacja" className="link">Napisz do nas</Link>, przygotujemy dokument dla Twojej firmy.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {visible.slice(0, limit).map((p) => (
                        <li key={p.id}>
                          <ProductTile product={p} />
                        </li>
                      ))}
                    </ul>
                    {visible.length > limit && (
                      <div className="mt-8 text-center">
                        <button type="button" className="btn btn-obrys" onClick={() => setLimit((l) => l + PAGE)}>
                          Pokaż więcej ({visible.length - limit})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function CategoryNav({
  categories,
  current,
  total,
  onPick,
}: {
  categories: CatalogCategory[]
  current?: string
  total: number
  onPick: (s: Search) => void
}) {
  const item = (active: boolean) =>
    `flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left ${active ? 'bg-znak-jasny font-semibold text-znak-ciemny' : 'hover:bg-mgla'}`
  return (
    <nav className="sticky top-28 grid gap-5">
      <button type="button" className={item(!current)} aria-current={!current ? 'page' : undefined} onClick={() => onPick({ kategoria: undefined })}>
        <span>Wszystkie dokumenty</span>
        <span className="text-sm text-tusz-2">{total}</span>
      </button>
      {AREA_GROUPS.map(({ area, title }) => {
        const list = categories.filter((c) => c.area === area)
        if (!list.length) return null
        return (
          <div key={area}>
            <p className="px-3 pb-1 font-naglowek text-base font-bold text-znak">{title}</p>
            <ul>
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={item(c.slug === current)}
                    aria-current={c.slug === current ? 'page' : undefined}
                    onClick={() => onPick({ kategoria: c.slug })}
                  >
                    <span>{c.name}</span>
                    <span className="text-sm text-tusz-2">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
