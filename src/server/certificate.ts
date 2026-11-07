import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { adminConfigured, adminRest } from './supabase-admin'

// Weryfikacja certyfikatu / dokumentu po numerze (doc_id z generated_documents, np. SF-D56D91F9B53C), strona
// /weryfikacja-certyfikatu. Odczyt kluczem serwisowym (RLS generated_documents bez polityk), na zewnatrz tylko
// numer, nazwa dokumentu, firma nabywcy, data wystawienia i status. Bez e-maila, NIP i imienia i nazwiska.
// Wazny: zamowienie oplacone i dostep do dokumentu nie zostal cofniety (entitlements.revoked_at).
export type CertificateInput = { docId: string }
export type CertificateData = { docId: string; title: string; company: string | null; issuedAt: string; version: number | null }
export type CertificateResult =
  | { ok: true; found: false }
  | { ok: true; found: true; valid: boolean; reason?: string; certificate: CertificateData }
  | { ok: false; error: 'invalid' | 'limit' | 'not_configured' | 'failed' }

const DOC_ID = /^[A-Z0-9][A-Z0-9-]{3,39}$/

const LIMIT = 30
const OKNO_MS = 10 * 60 * 1000
const trafienia = new Map<string, number[]>()
function przekroczony(ip: string): boolean {
  const teraz = Date.now()
  const lista = (trafienia.get(ip) ?? []).filter((t) => teraz - t < OKNO_MS)
  lista.push(teraz)
  trafienia.set(ip, lista)
  return lista.length > LIMIT
}

type Row = {
  doc_id: string
  created_at: string
  source_version: number | null
  product_id: string | null
  order_item_id: string
  user_id: string | null
  orders: { status: string; buyer_company: string | null; user_id: string | null } | null
  order_items: { title: string } | null
  products: { title: string; edition: string | null } | null
}

export function normalizeDocId(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export const verifyCertificate = createServerFn({ method: 'POST' })
  .inputValidator((data: CertificateInput) => data)
  .handler(async ({ data }): Promise<CertificateResult> => {
    const docId = normalizeDocId(typeof data.docId === 'string' ? data.docId : '')
    if (!DOC_ID.test(docId)) return { ok: false, error: 'invalid' }
    if (przekroczony(getRequestHeader('cf-connecting-ip') ?? 'brak')) return { ok: false, error: 'limit' }
    if (!adminConfigured()) return { ok: false, error: 'not_configured' }

    try {
      const res = await adminRest(
        `generated_documents?select=doc_id,created_at,source_version,product_id,order_item_id,user_id,orders(status,buyer_company,user_id),order_items(title),products(title,edition)&doc_id=eq.${encodeURIComponent(docId)}&limit=1`,
      )
      if (!res.ok) {
        console.error('certificate: Supabase odpowiedzial', res.status, await res.text())
        return { ok: false, error: 'failed' }
      }
      const row = ((await res.json()) as Row[])[0]
      if (!row) return { ok: true, found: false }

      const title = row.products
        ? `${row.products.title}${row.products.edition ? ` (${row.products.edition})` : ''}`
        : (row.order_items?.title ?? 'Dokument')
      const certificate: CertificateData = {
        docId: row.doc_id,
        title,
        company: row.orders?.buyer_company ?? null,
        issuedAt: row.created_at,
        version: row.source_version,
      }

      const status = row.orders?.status
      if (status !== 'paid') {
        const reason = status === 'refunded' ? 'Zamówienie zostało zwrócone.' : 'Zamówienie nie zostało opłacone lub zostało anulowane.'
        return { ok: true, found: true, valid: false, reason, certificate }
      }

      // Cofniety dostep do tego dokumentu z tej pozycji zamowienia = dokument niewazny.
      const userId = row.user_id ?? row.orders?.user_id
      if (userId && row.product_id) {
        const entRes = await adminRest(
          `entitlements?select=revoked_at&user_id=eq.${userId}&product_id=eq.${row.product_id}&order_item_id=eq.${row.order_item_id}`,
        )
        if (!entRes.ok) {
          console.error('certificate: entitlements', entRes.status, await entRes.text())
          return { ok: false, error: 'failed' }
        }
        const ents = (await entRes.json()) as { revoked_at: string | null }[]
        if (ents.length && ents.every((e) => e.revoked_at)) {
          return { ok: true, found: true, valid: false, reason: 'Licencja na ten dokument została cofnięta.', certificate }
        }
      }
      return { ok: true, found: true, valid: true, certificate }
    } catch (e) {
      console.error('certificate: blad', e)
      return { ok: false, error: 'failed' }
    }
  })
