import { useCallback, useEffect, useState } from 'react'
import { adminClient, dbError } from '../../lib/admin'

// Sklad pakietu (bundle_items): dokumenty, ktore klient dostaje po zakupie pakietu.
type Pozycja = { item_id: string; sort_order: number; item: { title: string; sku: string } | null }
type Dokument = { id: string; title: string; sku: string }

export function BundleItems({ bundleId }: { bundleId: string }) {
  const [pozycje, setPozycje] = useState<Pozycja[] | null>(null)
  const [dokumenty, setDokumenty] = useState<Dokument[]>([])
  const [wybrany, setWybrany] = useState('')
  const [error, setError] = useState<string | null>(null)

  const wczytaj = useCallback(async () => {
    const supabase = adminClient()
    const [p, d] = await Promise.all([
      supabase
        .from('bundle_items')
        .select('item_id,sort_order,item:products!bundle_items_item_id_fkey(title,sku)')
        .eq('bundle_id', bundleId)
        .order('sort_order'),
      supabase.from('products').select('id,title,sku').eq('type', 'document').order('title'),
    ])
    if (p.error) return setError(dbError(p.error))
    setPozycje(p.data as unknown as Pozycja[])
    setDokumenty((d.data ?? []) as Dokument[])
  }, [bundleId])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  async function dodaj() {
    if (!wybrany) return
    setError(null)
    const sort = Math.max(0, ...(pozycje ?? []).map((p) => p.sort_order)) + 1
    const { error } = await adminClient().from('bundle_items').insert({ bundle_id: bundleId, item_id: wybrany, sort_order: sort })
    if (error) return setError(dbError(error))
    setWybrany('')
    await wczytaj()
  }

  async function usun(itemId: string) {
    setError(null)
    const { error } = await adminClient().from('bundle_items').delete().eq('bundle_id', bundleId).eq('item_id', itemId)
    if (error) return setError(dbError(error))
    await wczytaj()
  }

  const wolne = dokumenty.filter((d) => !pozycje?.some((p) => p.item_id === d.id))

  return (
    <section className="panel" aria-labelledby="pakiet-h">
      <h2 id="pakiet-h" className="text-xl">Skład pakietu</h2>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="b-item" className="block text-sm font-semibold">Dokument</label>
          <select id="b-item" className="pole mt-1" value={wybrany} onChange={(e) => setWybrany(e.target.value)}>
            <option value="">Wybierz dokument</option>
            {wolne.map((d) => (
              <option key={d.id} value={d.id}>{d.title} ({d.sku})</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-zielony" onClick={dodaj} disabled={!wybrany}>Dodaj do pakietu</button>
      </div>
      {error && <p role="alert" className="mt-4 font-semibold text-blad">{error}</p>}
      {pozycje && pozycje.length === 0 && <p className="mt-4">Pakiet jest pusty.</p>}
      {pozycje && pozycje.length > 0 && (
        <ul className="mt-4 divide-y divide-linia rounded-xl border border-linia">
          {pozycje.map((p) => (
            <li key={p.item_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>{p.item?.title} <span className="font-mono text-xs text-tusz-2">{p.item?.sku}</span></span>
              <button type="button" className="link text-blad" onClick={() => usun(p.item_id)}>Usuń</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
