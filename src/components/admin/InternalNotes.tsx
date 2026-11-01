import { useEffect, useState, type FormEvent } from 'react'
import { adminClient, dbError } from '../../lib/admin'

// Notatki wewnetrzne produktu (product_internal, widoczne tylko dla admina): plik zrodlowy, odnosnik, uwagi.
type Notatki = { source_filename: string; source_ref: string; notes: string }

export function InternalNotes({ productId }: { productId: string }) {
  const [form, setForm] = useState<Notatki | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminClient()
      .from('product_internal')
      .select('source_filename,source_ref,notes')
      .eq('product_id', productId)
      .maybeSingle()
      .then(({ data }) =>
        setForm({ source_filename: data?.source_filename ?? '', source_ref: data?.source_ref ?? '', notes: data?.notes ?? '' }),
      )
  }, [productId])

  if (!form) return null

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form) return
    setInfo(null)
    setError(null)
    const { error } = await adminClient()
      .from('product_internal')
      .upsert({
        product_id: productId,
        source_filename: form.source_filename.trim() || null,
        source_ref: form.source_ref.trim() || null,
        notes: form.notes.trim() || null,
      })
    if (error) return setError(dbError(error))
    setInfo('Zapisano notatki.')
  }

  return (
    <form className="panel grid gap-4 md:grid-cols-2" onSubmit={zapisz} aria-labelledby="notatki-h">
      <h2 id="notatki-h" className="text-xl md:col-span-2">Notatki wewnętrzne</h2>
      <div>
        <label htmlFor="n-src" className="block text-sm font-semibold">Plik źródłowy</label>
        <input id="n-src" className="pole mt-1 w-full" value={form.source_filename} onChange={(e) => setForm({ ...form, source_filename: e.target.value })} />
      </div>
      <div>
        <label htmlFor="n-ref" className="block text-sm font-semibold">Odnośnik (np. folder, podstawa prawna)</label>
        <input id="n-ref" className="pole mt-1 w-full" value={form.source_ref} onChange={(e) => setForm({ ...form, source_ref: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="n-notes" className="block text-sm font-semibold">Uwagi</label>
        <textarea id="n-notes" rows={3} className="pole mt-1 w-full" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button type="submit" className="btn btn-obrys">Zapisz notatki</button>
        {info && <p role="status" className="font-semibold text-znak">{info}</p>}
        {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
      </div>
    </form>
  )
}
