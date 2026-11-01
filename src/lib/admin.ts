// Panel /admin: klient Supabase w przegladarce (sesja admina) i wspolne pomocnicze funkcje.
// Uprawnienia pilnuje baza: RLS i polityki Storage pozwalaja na zapis tylko gdy is_admin() (profiles.role = 'admin').
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { site } from '../config/site'
import type { ProductType } from './shop'

let client: SupabaseClient | null = null

// Tworzony dopiero w przegladarce (useEffect), bo sesja jest w localStorage.
export function adminClient(): SupabaseClient {
  client ??= createClient(site.supabase.url, site.supabase.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sf-admin-auth' },
  })
  return client
}

export type ProductStatus = 'draft' | 'ready' | 'published'
export type Area = 'bhp' | 'os' | 'both'

export type AdminProduct = {
  id: string
  sku: string
  slug: string
  type: ProductType
  category_id: string | null
  area: Area
  title: string
  short_description: string | null
  long_description: string | null
  price_net_cents: number
  vat_rate: number
  edition: string | null
  language: string
  page_count: number | null
  status: ProductStatus
  is_visible: boolean
  sort_order: number
  updated_at: string
}

export type Category = { id: string; name: string; area: Area; is_active: boolean; sort_order: number }

export type ProductFile = {
  id: string
  version: number
  storage_path: string
  original_filename: string | null
  mime_type: string
  size_bytes: number | null
  sha256: string | null
  is_current: boolean
  change_note: string | null
  created_at: string
}

export type ProductPreview = { id: string; page_number: number; storage_path: string }

export const TYPE_LABELS: Record<ProductType, string> = {
  document: 'Dokument',
  bundle: 'Pakiet dokumentów',
  training_online: 'Szkolenie online',
  training_onsite: 'Szkolenie stacjonarne',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Szkic',
  ready: 'Gotowy',
  published: 'Opublikowany',
}

export const AREA_LABELS: Record<Area, string> = { bhp: 'BHP', os: 'Ochrona środowiska', both: 'BHP i OŚ' }

export const VAT_RATES = [23, 8, 5, 0] as const

export const SKU_FORMAT = /^[A-Z0-9]+(-[A-Z0-9]+)+$/

// Bucket prywatny z plikami do sprzedazy i publiczny z podgladami stron (polityki Storage tylko dla admina).
export const FILES_BUCKET = 'product-files'
export const PREVIEWS_BUCKET = 'product-previews'

const PL: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// "150", "150,5", "1 234,50" -> grosze; null gdy nie da sie odczytac.
export function parsePrice(text: string): number | null {
  const clean = text.replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  return Math.round(Number(clean) * 100)
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function formatSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Warsaw' }).format(
    new Date(iso),
  )
}

// Komunikaty bledow bazy po polsku (wyzwalacze i ograniczenia z migracji 20261031120000_shop_schema.sql).
export function dbError(error: { message?: string; code?: string } | null | undefined): string {
  const m = error?.message ?? ''
  if (m.includes('nie ma biezacego pliku')) return 'Dokumentu nie da się opublikować bez bieżącego pliku. Wgraj plik w sekcji „Pliki”.'
  if (m.includes('products_sku_format')) return 'SKU: wielkie litery i cyfry, co najmniej dwa człony z myślnikiem, np. BHP-INS-001.'
  if (m.includes('products_sku_key')) return 'Produkt o tym SKU już istnieje.'
  if (m.includes('products_slug_key')) return 'Produkt o tym adresie (slug) już istnieje.'
  if (m.includes('products_visible_requires_published')) return 'Widoczny może być tylko opublikowany produkt.'
  if (error?.code === '42501' || m.includes('row-level security')) return 'Brak uprawnień (konto nie ma roli admin).'
  return m || 'Nie udało się zapisać. Spróbuj jeszcze raz.'
}
