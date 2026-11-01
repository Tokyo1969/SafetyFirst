import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { FILES_BUCKET, adminClient, dbError, formatDate, formatSize, sha256Hex, type ProductFile } from '../../lib/admin'

// Pliki dokumentu do sprzedazy (prywatny bucket product-files). Nowy plik = nowa wersja i od razu biezaca;
// starsze wersje zostaja do wgladu i mozna do nich wrocic. Jedna biezaca wersja pilnuje baza (single_current_file).
const ACCEPT = '.pdf,.docx,.doc,.xlsx,.xls,.zip'

export function ProductFiles({ productId }: { productId: string }) {
  const [pliki, setPliki] = useState<ProductFile[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const wczytaj = useCallback(async () => {
    const { data, error } = await adminClient()
      .from('product_files')
      .select('id,version,storage_path,original_filename,mime_type,size_bytes,sha256,is_current,change_note,created_at')
      .eq('product_id', productId)
      .order('version', { ascending: false })
    if (error) return setError(dbError(error))
    setPliki(data as ProductFile[])
  }, [productId])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  async function wgraj(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) return setError('Wybierz plik.')
    setError(null)
    setSending(true)
    try {
      const supabase = adminClient()
      const sha = await sha256Hex(file)
      if (pliki?.some((p) => p.sha256 === sha)) {
        setError('Ten sam plik jest już wgrany jako jedna z wersji.')
        return
      }
      const version = Math.max(0, ...(pliki ?? []).map((p) => p.version)) + 1
      const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '')
      const path = `${productId}/v${version}-${sha.slice(0, 8)}.${ext}`
      const up = await supabase.storage.from(FILES_BUCKET).upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
      if (up.error) return setError(`Nie udało się wgrać pliku: ${up.error.message}`)
      const { data: user } = await supabase.auth.getUser()
      const { error } = await supabase.from('product_files').insert({
        product_id: productId,
        version,
        storage_path: path,
        original_filename: file.name.slice(0, 200),
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        sha256: sha,
        is_current: true,
        change_note: String(form.get('note') ?? '').trim() || null,
        uploaded_by: user.user?.id ?? null,
      })
      if (error) {
        // Wiersz sie nie zapisal, wiec usuwamy osierocony plik ze Storage.
        await supabase.storage.from(FILES_BUCKET).remove([path])
        return setError(dbError(error))
      }
      formEl.reset()
      await wczytaj()
    } finally {
      setSending(false)
    }
  }

  async function ustawBiezaca(id: string) {
    setError(null)
    const { error } = await adminClient().from('product_files').update({ is_current: true }).eq('id', id)
    if (error) return setError(dbError(error))
    await wczytaj()
  }

  async function pobierz(path: string) {
    const { data, error } = await adminClient().storage.from(FILES_BUCKET).createSignedUrl(path, 60, { download: true })
    if (error || !data) return setError('Nie udało się przygotować pobrania.')
    window.location.assign(data.signedUrl)
  }

  return (
    <section className="panel" aria-labelledby="pliki-h">
      <h2 id="pliki-h" className="text-xl">Pliki</h2>
      <p className="mt-1 text-sm text-tusz-2">
        Plik, który dostaje klient po zakupie. Wgranie nowego pliku tworzy nową wersję i od razu ją ustawia jako bieżącą.
      </p>

      <form className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={wgraj}>
        <div>
          <label htmlFor="f-file" className="block text-sm font-semibold">Plik (PDF, DOCX, XLSX, ZIP)</label>
          <input id="f-file" name="file" type="file" accept={ACCEPT} required className="mt-1 block w-full text-sm" />
        </div>
        <div>
          <label htmlFor="f-note" className="block text-sm font-semibold">Co się zmieniło</label>
          <input id="f-note" name="note" className="pole mt-1 w-full" placeholder="Np. aktualizacja przepisów 2026" />
        </div>
        <button type="submit" className="btn btn-zielony" disabled={sending}>{sending ? 'Wgrywam…' : 'Wgraj wersję'}</button>
      </form>
      {error && <p role="alert" className="mt-4 font-semibold text-blad">{error}</p>}

      {pliki && pliki.length === 0 && <p className="mt-4">Brak plików. Bez bieżącego pliku dokumentu nie da się opublikować.</p>}
      {pliki && pliki.length > 0 && (
        <ul className="mt-4 divide-y divide-linia rounded-xl border border-linia">
          {pliki.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">
                  Wersja {p.version}
                  {p.is_current && <span className="ml-2 rounded bg-znak-jasny px-2 py-0.5 text-xs text-znak-ciemny">bieżąca</span>}
                </p>
                <p className="text-tusz-2">
                  {p.original_filename} · {formatSize(p.size_bytes)} · {formatDate(p.created_at)}
                  {p.change_note ? ` · ${p.change_note}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-obrys" onClick={() => pobierz(p.storage_path)}>Pobierz</button>
                {!p.is_current && (
                  <button type="button" className="btn btn-obrys" onClick={() => ustawBiezaca(p.id)}>Ustaw jako bieżącą</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
