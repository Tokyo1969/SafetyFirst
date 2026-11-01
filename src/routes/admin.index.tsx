import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { STATUS_LABELS, TYPE_LABELS, adminClient, dbError, type AdminProduct, type Category } from '../lib/admin'
import { formatGrosze, unitGrossCents, type ProductType } from '../lib/shop'

export const Route = createFileRoute('/admin/')({
  component: ListaProduktow,
})

type Wiersz = Pick<
  AdminProduct,
  'id' | 'sku' | 'title' | 'type' | 'status' | 'is_visible' | 'price_net_cents' | 'vat_rate' | 'category_id' | 'sort_order' | 'updated_at'
>

function ListaProduktow() {
  const [produkty, setProdukty] = useState<Wiersz[] | null>(null)
  const [kategorie, setKategorie] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [typ, setTyp] = useState<ProductType | ''>('')
  const [szukaj, setSzukaj] = useState('')

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

  const widoczne = useMemo(() => {
    const q = szukaj.trim().toLowerCase()
    return (produkty ?? []).filter(
      (p) => (!typ || p.type === typ) && (!q || p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    )
  }, [produkty, typ, szukaj])

  const nazwaKategorii = (id: string | null) => kategorie.find((k) => k.id === id)?.name ?? '–'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Produkty</h1>
        <Link to="/admin/produkt/$id" params={{ id: 'nowy' }} className="btn btn-glowny">Nowy produkt</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="f-szukaj" className="block text-sm font-semibold">Szukaj</label>
          <input id="f-szukaj" className="pole mt-1" value={szukaj} onChange={(e) => setSzukaj(e.target.value)} placeholder="Nazwa lub SKU" />
        </div>
        <div>
          <label htmlFor="f-typ" className="block text-sm font-semibold">Typ</label>
          <select id="f-typ" className="pole mt-1" value={typ} onChange={(e) => setTyp(e.target.value as ProductType | '')}>
            <option value="">Wszystkie</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 font-semibold text-blad">{error}</p>}
      {!produkty && !error && <p className="mt-6">Ładowanie…</p>}
      {produkty && widoczne.length === 0 && <p className="mt-6">Brak produktów.</p>}

      {widoczne.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-panel)] border border-linia bg-white">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-linia bg-mgla">
                <th scope="col" className="px-4 py-3">Nazwa</th>
                <th scope="col" className="px-3 py-3">SKU</th>
                <th scope="col" className="px-3 py-3">Typ</th>
                <th scope="col" className="px-3 py-3">Kategoria</th>
                <th scope="col" className="px-3 py-3 text-right">Netto</th>
                <th scope="col" className="px-3 py-3 text-right">Brutto</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">W sklepie</th>
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
                  <td className="px-3 py-3">{p.status === 'published' && p.is_visible ? 'Tak' : 'Nie'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
