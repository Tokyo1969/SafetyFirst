import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AREA_LABELS, adminClient, dbError, slugify, type Area } from '../lib/admin'

// Kategorie produktow. Zamiast usuwania: wylaczenie (is_active), zeby nie gubic przypisan produktow.
export const Route = createFileRoute('/admin/kategorie')({
  component: Kategorie,
})

type Kategoria = {
  id: string
  parent_id: string | null
  area: Area
  slug: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
}

type Formularz = { name: string; slug: string; area: Area; parent_id: string; description: string; sort_order: string; is_active: boolean }

const PUSTY: Formularz = { name: '', slug: '', area: 'bhp', parent_id: '', description: '', sort_order: '0', is_active: true }

function Kategorie() {
  const [lista, setLista] = useState<Kategoria[] | null>(null)
  const [liczby, setLiczby] = useState<Record<string, number>>({})
  const [edytowana, setEdytowana] = useState<string | null>(null) // id albo "nowa"
  const [form, setForm] = useState<Formularz>(PUSTY)
  const [error, setError] = useState<string | null>(null)

  const wczytaj = useCallback(async () => {
    const supabase = adminClient()
    const [k, p] = await Promise.all([
      supabase.from('categories').select('id,parent_id,area,slug,name,description,sort_order,is_active').order('sort_order').order('name'),
      supabase.from('products').select('category_id'),
    ])
    if (k.error) return setError(dbError(k.error))
    setLista(k.data as Kategoria[])
    const count: Record<string, number> = {}
    for (const row of (p.data ?? []) as { category_id: string | null }[]) {
      if (row.category_id) count[row.category_id] = (count[row.category_id] ?? 0) + 1
    }
    setLiczby(count)
  }, [])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  function edytuj(k: Kategoria | null) {
    setError(null)
    setEdytowana(k ? k.id : 'nowa')
    setForm(
      k
        ? {
            name: k.name,
            slug: k.slug,
            area: k.area,
            parent_id: k.parent_id ?? '',
            description: k.description ?? '',
            sort_order: String(k.sort_order),
            is_active: k.is_active,
          }
        : PUSTY,
    )
  }

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (form.name.trim().length < 2) return setError('Podaj nazwę kategorii.')
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      area: form.area,
      parent_id: form.parent_id || null,
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    }
    const supabase = adminClient()
    const { error } =
      edytowana === 'nowa'
        ? await supabase.from('categories').insert(payload)
        : await supabase.from('categories').update(payload).eq('id', edytowana as string)
    if (error) return setError(error.message.includes('categories_slug_key') ? 'Kategoria o tym adresie już istnieje.' : dbError(error))
    setEdytowana(null)
    await wczytaj()
  }

  const nazwa = (id: string | null) => lista?.find((k) => k.id === id)?.name

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Kategorie</h1>
        <button type="button" className="btn btn-glowny" onClick={() => edytuj(null)}>Nowa kategoria</button>
      </div>

      {edytowana && (
        <form className="panel grid gap-4 md:grid-cols-2" onSubmit={zapisz}>
          <h2 className="text-xl md:col-span-2">{edytowana === 'nowa' ? 'Nowa kategoria' : 'Edycja kategorii'}</h2>
          <div>
            <label htmlFor="k-name" className="block text-sm font-semibold">Nazwa</label>
            <input
              id="k-name"
              className="pole mt-1 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: edytowana === 'nowa' ? slugify(e.target.value) : form.slug })}
              required
            />
          </div>
          <div>
            <label htmlFor="k-slug" className="block text-sm font-semibold">Adres (slug)</label>
            <input id="k-slug" className="pole mt-1 w-full font-mono" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label htmlFor="k-area" className="block text-sm font-semibold">Obszar</label>
            <select id="k-area" className="pole mt-1 w-full" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as Area })}>
              {Object.entries(AREA_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="k-parent" className="block text-sm font-semibold">Kategoria nadrzędna</label>
            <select id="k-parent" className="pole mt-1 w-full" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
              <option value="">Brak</option>
              {(lista ?? [])
                .filter((k) => k.id !== edytowana)
                .map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="k-desc" className="block text-sm font-semibold">Opis</label>
            <textarea id="k-desc" rows={2} className="pole mt-1 w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="k-sort" className="block text-sm font-semibold">Kolejność</label>
            <input id="k-sort" type="number" className="pole mt-1 w-full" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 self-end pb-3">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Aktywna (widoczna w sklepie)</span>
          </label>
          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <button type="submit" className="btn btn-glowny">Zapisz</button>
            <button type="button" className="btn btn-obrys" onClick={() => setEdytowana(null)}>Anuluj</button>
            {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
          </div>
        </form>
      )}

      {!lista && !error && <p>Ładowanie…</p>}
      {lista && (
        <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-linia bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-linia bg-mgla">
                <th scope="col" className="px-4 py-3">Nazwa</th>
                <th scope="col" className="px-3 py-3">Obszar</th>
                <th scope="col" className="px-3 py-3">Nadrzędna</th>
                <th scope="col" className="px-3 py-3 text-right">Produkty</th>
                <th scope="col" className="px-3 py-3 text-right">Kolejność</th>
                <th scope="col" className="px-3 py-3">Aktywna</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((k) => (
                <tr key={k.id} className="border-b border-linia last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    <button type="button" className="link text-left" onClick={() => edytuj(k)}>{k.name}</button>
                    <span className="ml-2 font-mono text-xs text-tusz-2">{k.slug}</span>
                  </th>
                  <td className="px-3 py-3">{AREA_LABELS[k.area]}</td>
                  <td className="px-3 py-3">{nazwa(k.parent_id) ?? '–'}</td>
                  <td className="px-3 py-3 text-right">{liczby[k.id] ?? 0}</td>
                  <td className="px-3 py-3 text-right">{k.sort_order}</td>
                  <td className="px-3 py-3">{k.is_active ? 'Tak' : 'Nie'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
