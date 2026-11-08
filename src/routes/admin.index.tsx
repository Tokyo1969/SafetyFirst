import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { STATUS_LABELS, TYPE_LABELS, adminClient, dbError, type AdminProduct, type Category, type ProductStatus } from '../lib/admin'
import { formatGrosze, unitGrossCents, type ProductType } from '../lib/shop'

export const Route = createFileRoute('/admin/')({
  component: ListaProduktow,
})

type Wiersz = Pick<
  AdminProduct,
  'id' | 'sku' | 'title' | 'type' | 'status' | 'is_visible' | 'price_net_cents' | 'vat_rate' | 'category_id' | 'sort_order' | 'updated_at'
>

type Kolumna = 'title' | 'sku' | 'type' | 'category' | 'price' | 'status' | 'shop' | 'updated'
type Sort = { kol: Kolumna; rosnaco: boolean }
type Filtry = { szukaj: string; typ: ProductType | ''; status: ProductStatus | ''; kategoria: string; sklep: '' | 'tak' | 'nie' }

const KOLEJNOSC_STATUSU: Record<ProductStatus, number> = { draft: 0, ready: 1, published: 2 }
const BEZ_KATEGORII = '__brak'
const PUSTE: Filtry = { szukaj: '', typ: '', status: '', kategoria: '', sklep: '' }
// Filtry i sortowanie zapamietane w tej karcie przegladarki (powrot z edycji produktu nie kasuje wyboru).
const PAMIEC = 'sf-admin-produkty'

const wSklepie = (p: Wiersz) => p.status === 'published' && p.is_visible

function wczytaj(): { filtry: Filtry; sort: Sort | null } {
  try {
    const zapis = JSON.parse(sessionStorage.getItem(PAMIEC) ?? 'null') as { filtry?: Partial<Filtry>; sort?: Sort | null } | null
    return { filtry: { ...PUSTE, ...zapis?.filtry }, sort: zapis?.sort ?? null }
  } catch {
    return { filtry: PUSTE, sort: null }
  }
}

function ListaProduktow() {
  const [produkty, setProdukty] = useState<Wiersz[] | null>(null)
  const [kategorie, setKategorie] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtry, setFiltry] = useState<Filtry>(PUSTE)
  const [sort, setSort] = useState<Sort | null>(null)
  const [wczytane, setWczytane] = useState(false)

  useEffect(() => {
    const zapis = wczytaj()
    setFiltry(zapis.filtry)
    setSort(zapis.sort)
    setWczytane(true)
  }, [])

  useEffect(() => {
    if (!wczytane) return
    try {
      sessionStorage.setItem(PAMIEC, JSON.stringify({ filtry, sort }))
    } catch {
      // brak pamieci przegladarki: filtry dzialaja, tylko sie nie zapamietuja
    }
  }, [filtry, sort, wczytane])

  useEffect(() => {
    const supabase = adminClient()
    Promise.all([
      supabase
        .from('products')
        .select('id,sku,title,type,status,is_visible,price_net_cents,vat_rate,category_id,sort_order,updated_at')
        .order('sort_order')
        .order('title'),
      supabase.from('categories').select('id,name,area,is_active,sort_order').order('sort_order'),
    ]).then(([p, k]) => {
      if (p.error) return setError(dbError(p.error))
      setProdukty(p.data as Wiersz[])
      setKategorie((k.data ?? []) as Category[])
    })
  }, [])

  const nazwaKategorii = (id: string | null) => kategorie.find((k) => k.id === id)?.name ?? '–'
  const ustaw = <K extends keyof Filtry>(k: K, v: Filtry[K]) => setFiltry((f) => ({ ...f, [k]: v }))

  const widoczne = useMemo(() => {
    const q = filtry.szukaj.trim().toLowerCase()
    const lista = (produkty ?? []).filter(
      (p) =>
        (!filtry.typ || p.type === filtry.typ) &&
        (!filtry.status || p.status === filtry.status) &&
        (!filtry.kategoria || (filtry.kategoria === BEZ_KATEGORII ? !p.category_id : p.category_id === filtry.kategoria)) &&
        (!filtry.sklep || wSklepie(p) === (filtry.sklep === 'tak')) &&
        (!q || p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    )
    if (!sort) return lista // domyslnie jak w bazie: sort_order, potem nazwa
    // Produkty bez kategorii zawsze na koncu listy przy sortowaniu po kategorii rosnaco.
    const kat = (id: string | null) => kategorie.find((k) => k.id === id)?.name ?? '￿'
    const klucz = (p: Wiersz): string | number => {
      switch (sort.kol) {
        case 'title':
          return p.title
        case 'sku':
          return p.sku
        case 'type':
          return TYPE_LABELS[p.type]
        case 'category':
          return kat(p.category_id)
        case 'price':
          return p.price_net_cents
        case 'status':
          return KOLEJNOSC_STATUSU[p.status]
        case 'shop':
          return wSklepie(p) ? 1 : 0
        case 'updated':
          return p.updated_at
      }
    }
    const kierunek = sort.rosnaco ? 1 : -1
    return [...lista].sort((a, b) => {
      const x = klucz(a)
      const y = klucz(b)
      const wynik =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'pl', { numeric: true })
      return wynik * kierunek || a.title.localeCompare(b.title, 'pl')
    })
  }, [produkty, kategorie, filtry, sort])

  const filtrAktywny = Object.values(filtry).some(Boolean)

  // Klik: rosnaco, drugi klik: malejaco, trzeci: domyslna kolejnosc.
  function sortuj(kol: Kolumna) {
    setSort((s) => (s?.kol === kol ? (s.rosnaco ? { kol, rosnaco: false } : null) : { kol, rosnaco: true }))
  }

  const naglowek = (kol: Kolumna, etykieta: string, className = 'px-3 py-3') => (
    <th scope="col" className={className} aria-sort={sort?.kol === kol ? (sort.rosnaco ? 'ascending' : 'descending') : undefined}>
      <button
        type="button"
        onClick={() => sortuj(kol)}
        className="inline-flex items-center gap-1 font-semibold whitespace-nowrap hover:text-znak"
        title="Sortuj: kliknij ponownie, żeby odwrócić, trzeci raz przywraca domyślną kolejność"
      >
        {etykieta}
        <span aria-hidden="true" className={sort?.kol === kol ? 'text-znak' : 'text-tusz-2/50'}>
          {sort?.kol === kol ? (sort.rosnaco ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Produkty</h1>
        <Link to="/admin/produkt/$id" params={{ id: 'nowy' }} className="btn btn-glowny">Nowy produkt</Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="f-szukaj" className="block text-sm font-semibold">Szukaj</label>
          <input
            id="f-szukaj"
            className="pole mt-1"
            value={filtry.szukaj}
            onChange={(e) => ustaw('szukaj', e.target.value)}
            placeholder="Nazwa lub SKU"
          />
        </div>
        <div>
          <label htmlFor="f-typ" className="block text-sm font-semibold">Typ</label>
          <select id="f-typ" className="pole mt-1" value={filtry.typ} onChange={(e) => ustaw('typ', e.target.value as ProductType | '')}>
            <option value="">Wszystkie</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="block text-sm font-semibold">Status</label>
          <select
            id="f-status"
            className="pole mt-1"
            value={filtry.status}
            onChange={(e) => ustaw('status', e.target.value as ProductStatus | '')}
          >
            <option value="">Wszystkie</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-kategoria" className="block text-sm font-semibold">Kategoria</label>
          <select id="f-kategoria" className="pole mt-1" value={filtry.kategoria} onChange={(e) => ustaw('kategoria', e.target.value)}>
            <option value="">Wszystkie</option>
            {kategorie.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
                {k.is_active ? '' : ' (wyłączona)'}
              </option>
            ))}
            <option value={BEZ_KATEGORII}>Bez kategorii</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-sklep" className="block text-sm font-semibold">W sklepie</label>
          <select
            id="f-sklep"
            className="pole mt-1"
            value={filtry.sklep}
            onChange={(e) => ustaw('sklep', e.target.value as Filtry['sklep'])}
          >
            <option value="">Wszystkie</option>
            <option value="tak">Tak</option>
            <option value="nie">Nie</option>
          </select>
        </div>
        {filtrAktywny && (
          <button type="button" onClick={() => setFiltry(PUSTE)} className="link mb-3 text-sm font-semibold">
            Wyczyść filtry
          </button>
        )}
      </div>

      {produkty && (
        <p className="mt-4 text-sm text-tusz-2" aria-live="polite">
          {filtrAktywny ? `Pokazano ${widoczne.length} z ${produkty.length} produktów.` : `Produktów: ${produkty.length}.`}
        </p>
      )}

      {error && <p role="alert" className="mt-6 font-semibold text-blad">{error}</p>}
      {!produkty && !error && <p className="mt-6">Ładowanie…</p>}
      {produkty && widoczne.length === 0 && <p className="mt-6">Brak produktów.</p>}

      {widoczne.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-panel)] border border-linia bg-white">
          <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-linia bg-mgla">
                {naglowek('title', 'Nazwa', 'px-4 py-3')}
                {naglowek('sku', 'SKU')}
                {naglowek('type', 'Typ')}
                {naglowek('category', 'Kategoria')}
                {naglowek('price', 'Netto', 'px-3 py-3 text-right')}
                <th scope="col" className="px-3 py-3 text-right">Brutto</th>
                {naglowek('status', 'Status')}
                {naglowek('shop', 'W sklepie')}
                {naglowek('updated', 'Zmieniono')}
              </tr>
            </thead>
            <tbody>
              {widoczne.map((p) => (
                <tr key={p.id} className="border-b border-linia last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    <Link to="/admin/produkt/$id" params={{ id: p.id }} className="link">{p.title}</Link>
                  </th>
                  <td className="px-3 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-3 py-3">{TYPE_LABELS[p.type]}</td>
                  <td className="px-3 py-3">{nazwaKategorii(p.category_id)}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">{formatGrosze(p.price_net_cents)}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {formatGrosze(unitGrossCents(p.price_net_cents, Number(p.vat_rate)))}
                  </td>
                  <td className="px-3 py-3">{STATUS_LABELS[p.status]}</td>
                  <td className="px-3 py-3">{wSklepie(p) ? 'Tak' : 'Nie'}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-tusz-2">
                    {new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeZone: 'Europe/Warsaw' }).format(new Date(p.updated_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
