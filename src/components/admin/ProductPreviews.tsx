import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { PREVIEWS_BUCKET, adminClient, dbError, type ProductPreview } from '../../lib/admin'

// Podglady stron do sklepu (publiczny bucket product-previews). Obrazy bez tresci, ktorej klient nie powinien
// dostac za darmo, np. strona tytulowa i spis tresci. Numer strony = kolejnosc w sklepie.
export function ProductPreviews({ productId }: { productId: string }) {
  const [podglady, setPodglady] = useState<ProductPreview[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const wczytaj = useCallback(async () => {
    const { data, error } = await adminClient()
      .from('product_previews')
      .select('id,page_number,storage_path')
      .eq('product_id', productId)
      .order('page_number')
    if (error) return setError(dbError(error))
    setPodglady(data as ProductPreview[])
  }, [productId])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  const url = (path: string) => adminClient().storage.from(PREVIEWS_BUCKET).getPublicUrl(path).data.publicUrl

  async function wgraj(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const files = (new FormData(formEl).getAll('images') as File[]).filter((f) => f.size > 0)
    if (!files.length) return setError('Wybierz obrazy.')
    setError(null)
    setSending(true)
    const supabase = adminClient()
    let page = Math.max(0, ...(podglady ?? []).map((p) => p.page_number))
    try {
      for (const file of files) {
        page += 1
        const ext = (file.name.split('.').pop() ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
        const path = `${productId}/${page}-${crypto.randomUUID().slice(0, 8)}.${ext}`
        const up = await supabase.storage.from(PREVIEWS_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
        if (up.error) return setError(`Nie udało się wgrać ${file.name}: ${up.error.message}`)
        const { error } = await supabase.from('product_previews').insert({ product_id: productId, page_number: page, storage_path: path })
        if (error) {
          await supabase.storage.from(PREVIEWS_BUCKET).remove([path])
          return setError(dbError(error))
        }
      }
      formEl.reset()
    } finally {
      setSending(false)
      await wczytaj()
    }
  }

  async function usun(p: ProductPreview) {
    if (!window.confirm(`Usunąć podgląd strony ${p.page_number}?`)) return
    setError(null)
    const supabase = adminClient()
    const { error } = await supabase.from('product_previews').delete().eq('id', p.id)
    if (error) return setError(dbError(error))
    await supabase.storage.from(PREVIEWS_BUCKET).remove([p.storage_path])
    await wczytaj()
  }

  return (
    <section className="panel" aria-labelledby="podglady-h">
      <h2 id="podglady-h" className="text-xl">Podglądy</h2>
      <p className="mt-1 text-sm text-tusz-2">
        Obrazy widoczne publicznie, np. strona tytułowa i spis treści. Nie wgrywaj tu pełnej treści dokumentu.
      </p>
      <form className="mt-4 flex flex-wrap items-end gap-4" onSubmit={wgraj}>
        <div>
          <label htmlFor="pv-images" className="block text-sm font-semibold">Obrazy (PNG, JPG, WebP)</label>
          <input id="pv-images" name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple required className="mt-1 block text-sm" />
        </div>
        <button type="submit" className="btn btn-zielony" disabled={sending}>{sending ? 'Wgrywam…' : 'Dodaj podglądy'}</button>
      </form>
      {error && <p role="alert" className="mt-4 font-semibold text-blad">{error}</p>}
      {podglady && podglady.length === 0 && <p className="mt-4">Brak podglądów.</p>}
      {podglady && podglady.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {podglady.map((p) => (
            <li key={p.id} className="rounded-xl border border-linia bg-white p-2 text-sm">
              <img src={url(p.storage_path)} alt={`Podgląd strony ${p.page_number}`} className="aspect-[3/4] w-full rounded object-cover" loading="lazy" />
              <div className="mt-2 flex items-center justify-between">
                <span>Strona {p.page_number}</span>
                <button type="button" className="link text-blad" onClick={() => usun(p)}>Usuń</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
