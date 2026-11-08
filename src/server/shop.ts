import { createServerFn } from '@tanstack/react-start'
import { site } from '../config/site'
import type { Area } from '../lib/admin'
import type { ShopProduct } from '../lib/shop'

// Katalog sklepu (/sklep, /sklep/<slug>, /koszyk). Odczyt kluczem anon, wiec RLS pilnuje widocznosci:
// produkty published + is_visible, kategorie tylko wlaczone (is_active). Decyzja 8.11.2026: w sklepie tylko
// dokumenty i pakiety, i tylko z wlaczonych kategorii (Natalia steruje widocznoscia wlaczajac kategorie w panelu).
export const SHOP_TYPES = ['document', 'bundle'] as const

export type CatalogCategory = { id: string; slug: string; name: string; area: Area; description: string | null; count: number }
export type CatalogProduct = ShopProduct & {
  slug: string
  category_id: string
  area: Area
  edition: string | null
  page_count: number | null
  doc_type: string | null
  preview: string | null
}
export type Catalog = { categories: CatalogCategory[]; products: CatalogProduct[] }
export type ProductDetails = CatalogProduct & {
  long_description: string | null
  language: string | null
  previews: string[]
  category: { slug: string; name: string }
  bundle: { title: string; slug: string | null }[]
}

const LIST_FIELDS =
  'id,sku,slug,type,title,short_description,price_net_cents,vat_rate,category_id,area,edition,page_count,doc_type,product_previews(page_number,storage_path)'

type PreviewRow = { page_number: number; storage_path: string }
type Row = Record<string, unknown> & { product_previews?: PreviewRow[] }

function config() {
  return { url: process.env.SUPABASE_URL || site.supabase.url, key: process.env.SUPABASE_ANON_KEY || site.supabase.anonKey }
}

async function anonRest<T>(path: string): Promise<T> {
  const { url, key } = config()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }) },
  })
  if (!response.ok) throw new Error(`Supabase ${response.status} ${await response.text()}`)
  return (await response.json()) as T
}

export function previewUrl(path: string): string {
  return `${config().url}/storage/v1/object/public/product-previews/${path.split('/').map(encodeURIComponent).join('/')}`
}

function sortedPreviews(row: Row): string[] {
  return [...(row.product_previews ?? [])].sort((a, b) => a.page_number - b.page_number).map((p) => previewUrl(p.storage_path))
}

function toCatalogProduct(row: Row): CatalogProduct {
  const { product_previews: _, ...rest } = row
  return {
    ...(rest as unknown as CatalogProduct),
    price_net_cents: Number(row.price_net_cents),
    vat_rate: Number(row.vat_rate),
    page_count: row.page_count == null ? null : Number(row.page_count),
    preview: sortedPreviews(row)[0] ?? null,
  }
}

const typeFilter = `type=in.(${SHOP_TYPES.join(',')})`
const shopFilter = `status=eq.published&is_visible=eq.true&${typeFilter}`

async function activeCategories(): Promise<Omit<CatalogCategory, 'count'>[]> {
  return anonRest('categories?select=id,slug,name,area,description&is_active=eq.true&order=sort_order,name')
}

export const getCatalog = createServerFn({ method: 'GET' }).handler(async (): Promise<Catalog> => {
  try {
    const [categories, rows] = await Promise.all([
      activeCategories(),
      anonRest<Row[]>(`products?select=${LIST_FIELDS}&${shopFilter}&category_id=not.is.null&order=sort_order,title`),
    ])
    const active = new Set(categories.map((c) => c.id))
    const products = rows.filter((r) => active.has(String(r.category_id))).map(toCatalogProduct)
    const counts = new Map<string, number>()
    for (const p of products) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1)
    return {
      categories: categories.filter((c) => counts.has(c.id)).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 })),
      products,
    }
  } catch (e) {
    console.error('shop: katalog', e)
    return { categories: [], products: [] }
  }
})

export const getShopProduct = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<ProductDetails | null> => {
    const slug = typeof data.slug === 'string' ? data.slug : ''
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null
    try {
      const rows = await anonRest<Row[]>(
        `products?select=${LIST_FIELDS},long_description,language,categories(slug,name,is_active),bundle_items!bundle_items_bundle_id_fkey(sort_order,item:products!bundle_items_item_id_fkey(title,slug,status,is_visible))&${shopFilter}&slug=eq.${slug}&limit=1`,
      )
      const row = rows[0]
      const category = row?.categories as { slug: string; name: string; is_active: boolean } | null | undefined
      if (!row || !category?.is_active) return null
      type BundleRow = { sort_order: number; item: { title: string; slug: string; status: string; is_visible: boolean } | null }
      const bundle = ((row.bundle_items as BundleRow[] | undefined) ?? [])
        .filter((b) => b.item)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((b) => ({
          title: b.item!.title,
          // Link tylko do skladnika, ktory sam jest w sklepie.
          slug: b.item!.status === 'published' && b.item!.is_visible ? b.item!.slug : null,
        }))
      const { categories: _c, bundle_items: _b, ...rest } = row
      return {
        ...toCatalogProduct(rest as Row),
        long_description: (row.long_description as string | null) ?? null,
        language: (row.language as string | null) ?? null,
        previews: sortedPreviews(row),
        category: { slug: category.slug, name: category.name },
        bundle,
      }
    } catch (e) {
      console.error('shop: produkt', slug, e)
      return null
    }
  })

// Aktualne dane produktow z koszyka (cena moze sie zmienic, produkt moze zniknac ze sklepu).
// null = blad odczytu: koszyk zostaje bez zmian (pusta lista oznaczalaby, ze nic nie jest juz dostepne).
export const getCartProducts = createServerFn({ method: 'POST' })
  .inputValidator((data: { ids: string[] }) => data)
  .handler(async ({ data }): Promise<CatalogProduct[] | null> => {
    const ids = (Array.isArray(data.ids) ? data.ids : []).filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 50)
    if (!ids.length) return []
    try {
      const [categories, rows] = await Promise.all([
        activeCategories(),
        anonRest<Row[]>(`products?select=${LIST_FIELDS}&${shopFilter}&id=in.(${ids.join(',')})`),
      ])
      const active = new Set(categories.map((c) => c.id))
      return rows.filter((r) => active.has(String(r.category_id))).map(toCatalogProduct)
    } catch (e) {
      console.error('shop: koszyk', e)
      return null
    }
  })
