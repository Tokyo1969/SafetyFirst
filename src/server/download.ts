import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { site } from '../config/site'
import { bearer, userFromToken } from './auth-admin'
import { adminConfigured, adminRest } from './supabase-admin'

// Pobieranie kupionego pliku z Konta (regulamin §6 ust. 2-3): POST /api/konto/pobierz { productId },
// naglowek Authorization: Bearer <token sesji Konta>. Sprawdza dostep (entitlements) i limit pobran, do PDF dodaje
// stopke z kupujacym, data i numerem zamowienia oraz metadane, zapisuje pobranie w download_log (polityka pkt 7).
// Pliki pozostaja w prywatnym buckecie product-files; przegladarka nie dostaje do nich linku.
// Spersonalizowany dokument z n8n (generated_documents, po order_item_id uprawnienia) ma pierwszenstwo:
// pobieramy go przez podpisany adres Storage. Bez takiego wpisu wydajemy biezacy plik z product_files.
export const DOWNLOAD_PATH = '/api/konto/pobierz'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Entitlement = {
  id: string
  order_item_id: string | null
  download_limit: number | null
  revoked_at: string | null
  order_items: {
    order_id: string
    orders: { order_number: string; paid_at: string | null; buyer_company: string | null; buyer_name: string | null; buyer_nip: string | null } | null
  } | null
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

// Standardowa czcionka PDF (Helvetica, WinAnsi) nie ma polskich liter, wiec stopke piszemy bez nich;
// pelne dane z polskimi znakami trafiaja do metadanych pliku.
const PL: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z', Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' }
function ascii(text: string): string {
  return text
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (c) => PL[c])
    .normalize('NFKD')
    .replace(/[^\x20-\x7e]/g, '')
}

export async function watermarkPdf(bytes: ArrayBuffer, label: string, meta: { buyer: string; order: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const text = ascii(label)
  for (const page of pdf.getPages()) {
    const box = page.getCropBox()
    const maxWidth = box.width - 48
    let size = 7
    while (size > 4 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5
    page.drawText(text, { x: box.x + 24, y: box.y + 12, size, font, color: rgb(0.42, 0.45, 0.5) })
  }
  pdf.setSubject(`Licencja dla: ${meta.buyer.replace(/\.$/, '')}. Zamówienie ${meta.order}. ${site.brand} (${site.domain})`)
  pdf.setKeywords([meta.order, meta.buyer, site.domain])
  pdf.setProducer(site.brand)
  pdf.setModificationDate(new Date())
  return pdf.save()
}

function dateWarsaw(iso: string | null): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(iso ? new Date(iso) : new Date())
}

function fileName(title: string, ext: string): string {
  return `${ascii(title).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'dokument'}.${ext}`
}

function storageHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }) }
}

function objectPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

function fetchDirect(path: string): Promise<Response> {
  return fetch(`${process.env.SUPABASE_URL}/storage/v1/object/product-files/${objectPath(path)}`, { headers: storageHeaders() })
}

// Podpisany adres (60 s) do pliku w product-files, pobierany od razu po stronie serwera.
async function fetchSigned(path: string): Promise<Response | null> {
  const signRes = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/sign/product-files/${objectPath(path)}`, {
    method: 'POST',
    headers: { ...storageHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 60 }),
  })
  if (!signRes.ok) {
    console.error('download: podpisany adres', signRes.status, await signRes.text())
    return null
  }
  const { signedURL } = (await signRes.json()) as { signedURL?: string }
  return signedURL ? fetch(`${process.env.SUPABASE_URL}/storage/v1${signedURL}`) : null
}

// Wpis z generated_documents dla pozycji zamowienia. Gdy ma product_id innego produktu (np. pozycja to pakiet,
// a pobierany jest dokument z pakietu), nie uzywamy go i wydajemy plik z product_files.
async function generatedDocument(orderItemId: string | null, productId: string): Promise<{ storage_path: string } | null> {
  if (!orderItemId) return null
  const res = await adminRest(`generated_documents?select=storage_path,product_id&order_item_id=eq.${orderItemId}&limit=1`)
  if (!res.ok) {
    console.error('download: generated_documents', res.status, await res.text())
    return null
  }
  const row = ((await res.json()) as { storage_path: string; product_id: string | null }[])[0]
  if (!row?.storage_path || (row.product_id && row.product_id !== productId)) return null
  return row
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
function mimeFromPath(path: string): string {
  return MIME[path.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream'
}

export async function handleDownload(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405)
  if (!adminConfigured()) return json({ error: 'not_configured' }, 500)
  const user = await userFromToken(bearer(request))
  if (!user) return json({ error: 'unauthorized' }, 401)
  const body = (await request.json().catch(() => ({}))) as { productId?: unknown }
  const productId = typeof body.productId === 'string' ? body.productId : ''
  if (!UUID.test(productId)) return json({ error: 'invalid' }, 400)

  try {
    const entRes = await adminRest(
      `entitlements?select=id,order_item_id,download_limit,revoked_at,order_items(order_id,orders(order_number,paid_at,buyer_company,buyer_name,buyer_nip))&user_id=eq.${user.id}&product_id=eq.${productId}`,
    )
    const ent = entRes.ok ? ((await entRes.json()) as Entitlement[])[0] : undefined
    if (!ent || ent.revoked_at) return json({ error: 'forbidden' }, 403)

    const [countRes, settingsRes, fileRes, productRes] = await Promise.all([
      adminRest(`download_log?select=id&user_id=eq.${user.id}&product_id=eq.${productId}&limit=1`, { prefer: 'count=exact' }),
      adminRest('app_settings?select=max_downloads_per_item'),
      adminRest(`product_files?select=id,storage_path,mime_type,version&product_id=eq.${productId}&is_current=eq.true`),
      adminRest(`products?select=title,edition&id=eq.${productId}`),
    ])
    const used = Number(countRes.headers.get('content-range')?.split('/')[1] ?? 0)
    const settings = settingsRes.ok ? ((await settingsRes.json()) as { max_downloads_per_item: number }[])[0] : undefined
    const limit = ent.download_limit ?? settings?.max_downloads_per_item ?? 10
    if (used >= limit) return json({ error: 'limit', used, limit }, 429)

    const current = fileRes.ok ? ((await fileRes.json()) as { id: string; storage_path: string; mime_type: string; version: number }[])[0] : undefined
    const product = productRes.ok ? ((await productRes.json()) as { title: string; edition: string | null }[])[0] : undefined
    const generated = await generatedDocument(ent.order_item_id, productId)
    const file = generated
      ? { id: current?.id ?? null, storage_path: generated.storage_path, mime_type: mimeFromPath(generated.storage_path) }
      : current
    if (!file || !product) return json({ error: 'no_file' }, 404)

    const objectRes = generated ? await fetchSigned(file.storage_path) : await fetchDirect(file.storage_path)
    if (!objectRes?.ok) {
      console.error('download: Storage odpowiedzial', objectRes?.status, objectRes ? await objectRes.text() : '(brak podpisanego adresu)')
      return json({ error: 'failed' }, 500)
    }
    let bytes: ArrayBuffer | Uint8Array = await objectRes.arrayBuffer()

    const order = ent.order_items?.orders
    const buyer = order?.buyer_company || order?.buyer_name || user.email
    const orderNumber = order?.order_number ?? ''
    const isPdf = file.mime_type === 'application/pdf' || file.storage_path.toLowerCase().endsWith('.pdf')
    if (isPdf) {
      const nip = order?.buyer_nip ? `, NIP ${order.buyer_nip.replace(/^PL/i, '')}` : ''
      const label = `Licencja dla: ${buyer}${nip} | Zamowienie ${orderNumber} z ${dateWarsaw(order?.paid_at ?? null)} | ${site.brand}, ${site.domain} | Kopiowanie i udostepnianie poza organizacja nabywcy zabronione`
      try {
        bytes = await watermarkPdf(bytes, label, { buyer, order: orderNumber })
      } catch (e) {
        // Bez stopki nie wydajemy pliku (ochrona praw autorskich, regulamin §6 ust. 3).
        console.error('download: znak wodny', productId, e)
        return json({ error: 'watermark' }, 500)
      }
    }

    const log = await adminRest('download_log', {
      method: 'POST',
      prefer: 'return=minimal',
      body: {
        user_id: user.id,
        product_id: productId,
        file_id: file.id,
        order_id: ent.order_items?.order_id ?? null,
        ip: request.headers.get('cf-connecting-ip'),
        user_agent: (request.headers.get('user-agent') ?? '').slice(0, 300),
      },
    })
    if (!log.ok) {
      console.error('download: dziennik pobran', log.status, await log.text())
      return json({ error: 'failed' }, 500)
    }

    const ext = file.storage_path.split('.').pop() ?? 'pdf'
    const name = fileName(`${product.title}${product.edition ? ` ${product.edition}` : ''}`, ext)
    // pdf-lib zwraca Uint8Array, Storage ArrayBuffer; oba sa poprawnym body odpowiedzi.
    return new Response(bytes as BodyInit, {
      headers: {
        'Content-Type': file.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
        'X-Downloads-Left': String(limit - used - 1),
      },
    })
  } catch (e) {
    console.error('download: blad', e)
    return json({ error: 'failed' }, 500)
  }
}
