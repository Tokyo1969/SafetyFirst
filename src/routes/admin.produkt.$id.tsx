import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { BundleItems } from '../components/admin/BundleItems'
import { InternalNotes } from '../components/admin/InternalNotes'
import { ProductFiles } from '../components/admin/ProductFiles'
import { ProductPreviews } from '../components/admin/ProductPreviews'
import {
  AREA_LABELS,
  SKU_FORMAT,
  STATUS_LABELS,
  TYPE_LABELS,
  VAT_RATES,
  adminClient,
  centsToInput,
  dbError,
  formatDate,
  parsePrice,
  slugify,
  type AdminProduct,
  type Area,
  type Category,
  type ProductStatus,
} from '../lib/admin'
import { formatGrosze, unitGrossCents, type ProductType } from '../lib/shop'

// Edycja produktu (id = uuid) albo nowy produkt (id = "nowy"). Pliki, podglady i sklad pakietu po pierwszym zapisie.
export const Route = createFileRoute('/admin/produkt/$id')({
  component: EdycjaProduktu,
})

type Formularz = {
  title: string
  sku: string
  slug: string
  type: ProductType
  area: Area
  category_id: string
  short_description: string
  long_description: string
  price: string
  vat_rate: string
  edition: string
  language: string
  page_count: string
  sort_order: string
  status: ProductStatus
  is_visible: boolean
}

const PUSTY: Formularz = {
  title: '',
  sku: '',
  slug: '',
  type: 'document',
  area: 'bhp',
  category_id: '',
  short_description: '',
  long_description: '',
  price: '',
  vat_rate: '23',
  edition: '',
  language: 'pl',
  page_count: '',
  sort_order: '0',
  status: 'draft',
  is_visible: false,
}

function zProduktu(p: AdminProduct): Formularz {
  return {
    title: p.title,
    sku: p.sku,
    slug: p.slug,
    type: p.type,
    area: p.area,
    category_id: p.category_id ?? '',
    short_description: p.short_description ?? '',
    long_description: p.long_description ?? '',
    price: centsToInput(p.price_net_cents),
    vat_rate: String(Number(p.vat_rate)),
    edition: p.edition ?? '',
    language: p.language,
    page_count: p.page_count == null ? '' : String(p.page_count),
    sort_order: String(p.sort_order),
    status: p.status,
    is_visible: p.is_visible,
  }
}

function EdycjaProduktu() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const nowy = id === 'nowy'
  const [form, setForm] = useState<Formularz | null>(nowy ? PUSTY : null)
  const [zapisany, setZapisany] = useState<AdminProduct | null>(null)
  const [kategorie, setKategorie] = useState<Category[]>([])
  const [slugReczny, setSlugReczny] = useState(!nowy)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const supabase = adminClient()
    supabase
      .from('categories')
      .select('id,name,area,is_active,sort_order')
      .order('sort_order')
      .then(({ data }) => setKategorie((data ?? []) as Category[]))
    if (nowy) {
      supabase
        .from('app_settings')
        .select('default_vat_rate')
        .maybeSingle()
        .then(({ data }) => {
          if (data) setForm((f) => (f ? { ...f, vat_rate: String(Number(data.default_vat_rate)) } : f))
        })
      return
    }
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return setError(error ? dbError(error) : 'Nie ma takiego produktu.')
        setZapisany(data as AdminProduct)
        setForm(zProduktu(data as AdminProduct))
      })
  }, [id, nowy])

  if (error && !form) return <p role="alert" className="font-semibold text-blad">{error}</p>
  if (!form) return <p>Ładowanie…</p>

  function ustaw<K extends keyof Formularz>(key: K, value: Formularz[K]) {
    setForm((f) => {
      if (!f) return f
      const next = { ...f, [key]: value }
      if (key === 'title' && !slugReczny) next.slug = slugify(String(value))
      if (key === 'status' && value !== 'published') next.is_visible = false
      return next
    })
  }

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form) return
    setError(null)
    setInfo(null)
    const cena = parsePrice(form.price)
    const sku = form.sku.trim().toUpperCase()
    if (form.title.trim().length < 3) return setError('Podaj nazwę produktu.')
    if (!SKU_FORMAT.test(sku)) return setError('SKU: wielkie litery i cyfry, co najmniej dwa człony z myślnikiem, np. BHP-INS-001.')
    if (!form.slug) return setError('Podaj adres (slug).')
    if (cena == null) return setError('Cena netto: liczba, np. 150 albo 149,99.')

    const payload = {
      title: form.title.trim(),
      sku,
      slug: slugify(form.slug),
      type: form.type,
      area: form.area,
      category_id: form.category_id || null,
      short_description: form.short_description.trim() || null,
      long_description: form.long_description.trim() || null,
      price_net_cents: cena,
      vat_rate: Number(form.vat_rate),
      edition: form.edition.trim() || null,
      language: form.language.trim() || 'pl',
      page_count: form.page_count ? Number(form.page_count) : null,
      sort_order: Number(form.sort_order) || 0,
      status: form.status,
      is_visible: form.status === 'published' && form.is_visible,
    }

    setSending(true)
    const supabase = adminClient()
    const { data, error } = nowy
      ? await supabase.from('products').insert(payload).select('*').single()
      : await supabase.from('products').update(payload).eq('id', id).select('*').single()
    setSending(false)
    if (error) return setError(dbError(error))
    if (nowy) {
      navigate({ to: '/admin/produkt/$id', params: { id: (data as AdminProduct).id }, replace: true })
      return
    }
    setZapisany(data as AdminProduct)
    setForm(zProduktu(data as AdminProduct))
    setInfo('Zapisano.')
  }

  const cena = parsePrice(form.price)
  const kategorieObszaru = kategorie.filter((k) => k.area === form.area || k.area === 'both' || form.area === 'both')

  return (
    <div className="grid gap-8">
      <div>
        <Link to="/admin" className="link text-sm">← Produkty</Link>
        <h1 className="mt-2 text-3xl">{nowy ? 'Nowy produkt' : form.title || 'Produkt'}</h1>
        {zapisany && (
          <p className="mt-1 text-sm text-tusz-2">
            Ostatnia zmiana: {formatDate(zapisany.updated_at)}.{' '}
            {zapisany.status === 'published' && zapisany.is_visible ? 'Widoczny w sklepie.' : 'Niewidoczny w sklepie.'}
          </p>
        )}
      </div>

      <form className="panel grid gap-6" onSubmit={zapisz}>
        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="mb-2 text-xl font-semibold">Dane produktu</legend>
          <Pole label="Nazwa" id="p-title" className="md:col-span-2">
            <input id="p-title" className="pole w-full" value={form.title} onChange={(e) => ustaw('title', e.target.value)} required />
          </Pole>
          <Pole label="Typ" id="p-type">
            <select id="p-type" className="pole w-full" value={form.type} onChange={(e) => ustaw('type', e.target.value as ProductType)}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Pole>
          <Pole label="Obszar" id="p-area">
            <select id="p-area" className="pole w-full" value={form.area} onChange={(e) => ustaw('area', e.target.value as Area)}>
              {Object.entries(AREA_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Pole>
          <Pole label="Kategoria" id="p-cat">
            <select id="p-cat" className="pole w-full" value={form.category_id} onChange={(e) => ustaw('category_id', e.target.value)}>
              <option value="">Bez kategorii</option>
              {kategorieObszaru.map((k) => (
                <option key={k.id} value={k.id}>{k.name}{k.is_active ? '' : ' (nieaktywna)'}</option>
              ))}
            </select>
          </Pole>
          <Pole label="SKU" id="p-sku" hint="Np. BHP-INS-001 (wielkie litery, cyfry, myślniki).">
            <input id="p-sku" className="pole w-full font-mono" value={form.sku} onChange={(e) => ustaw('sku', e.target.value.toUpperCase())} required />
          </Pole>
          <Pole label="Adres (slug)" id="p-slug" hint="Tworzy się z nazwy, można zmienić.">
            <input
              id="p-slug"
              className="pole w-full font-mono"
              value={form.slug}
              onChange={(e) => {
                setSlugReczny(true)
                ustaw('slug', e.target.value)
              }}
              required
            />
          </Pole>
          <Pole label="Krótki opis" id="p-short" className="md:col-span-2" hint="Widoczny w sklepie i na stronie płatności Stripe.">
            <textarea id="p-short" rows={2} className="pole w-full" value={form.short_description} onChange={(e) => ustaw('short_description', e.target.value)} />
          </Pole>
          <Pole label="Pełny opis" id="p-long" className="md:col-span-2">
            <textarea id="p-long" rows={6} className="pole w-full" value={form.long_description} onChange={(e) => ustaw('long_description', e.target.value)} />
          </Pole>
          {(form.type === 'document' || form.type === 'bundle') && (
            <>
              <Pole label="Wydanie" id="p-edition" hint="Np. 2026/1">
                <input id="p-edition" className="pole w-full" value={form.edition} onChange={(e) => ustaw('edition', e.target.value)} />
              </Pole>
              <Pole label="Liczba stron" id="p-pages">
                <input id="p-pages" type="number" min={1} className="pole w-full" value={form.page_count} onChange={(e) => ustaw('page_count', e.target.value)} />
              </Pole>
            </>
          )}
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-3">
          <legend className="mb-2 text-xl font-semibold">Cena</legend>
          <Pole label={form.type.startsWith('training_') ? 'Cena netto za osobę (zł)' : 'Cena netto (zł)'} id="p-price">
            <input id="p-price" inputMode="decimal" className="pole w-full" value={form.price} onChange={(e) => ustaw('price', e.target.value)} required />
          </Pole>
          <Pole label="VAT" id="p-vat">
            <select id="p-vat" className="pole w-full" value={form.vat_rate} onChange={(e) => ustaw('vat_rate', e.target.value)}>
              {VAT_RATES.map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
          </Pole>
          <div className="self-end pb-3 text-sm text-tusz-2">
            {cena != null && <>Brutto: <strong className="text-tusz">{formatGrosze(unitGrossCents(cena, Number(form.vat_rate)))}</strong></>}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-3">
          <legend className="mb-2 text-xl font-semibold">Publikacja</legend>
          <Pole label="Status" id="p-status" hint="Dokument można opublikować dopiero z bieżącym plikiem.">
            <select id="p-status" className="pole w-full" value={form.status} onChange={(e) => ustaw('status', e.target.value as ProductStatus)}>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Pole>
          <Pole label="Kolejność" id="p-sort" hint="Mniejsza liczba = wyżej w sklepie.">
            <input id="p-sort" type="number" className="pole w-full" value={form.sort_order} onChange={(e) => ustaw('sort_order', e.target.value)} />
          </Pole>
          <label className="flex items-center gap-3 self-end pb-3">
            <input type="checkbox" checked={form.is_visible} disabled={form.status !== 'published'} onChange={(e) => ustaw('is_visible', e.target.checked)} />
            <span>Widoczny w sklepie</span>
          </label>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-glowny" disabled={sending}>
            {sending ? 'Zapisuję…' : nowy ? 'Utwórz produkt' : 'Zapisz zmiany'}
          </button>
          {info && <p role="status" className="font-semibold text-znak">{info}</p>}
          {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
        </div>
        {nowy && <p className="text-sm text-tusz-2">Pliki, podglądy i skład pakietu dodasz po utworzeniu produktu.</p>}
      </form>

      {zapisany && (
        <>
          {zapisany.type === 'document' && <ProductFiles productId={zapisany.id} />}
          {zapisany.type === 'bundle' && <BundleItems bundleId={zapisany.id} />}
          <ProductPreviews productId={zapisany.id} />
          <InternalNotes productId={zapisany.id} />
        </>
      )}
    </div>
  )
}

function Pole({ label, id, hint, className = '', children }: { label: string; id: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-tusz-2">{hint}</p>}
    </div>
  )
}
