import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { site } from '../config/site'
import { isDigital, maxQuantity, normalizeNip, unitGrossCents, type ShopProduct } from '../lib/shop'
import { adminConfigured, adminRest } from './supabase-admin'

export type CheckoutItem = { productId: string; quantity: number }
export type CheckoutInput = {
  items: CheckoutItem[]
  email: string
  company: string
  nip: string
  consent: boolean
  terms: boolean
}
export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: 'invalid' | 'disabled' | 'not_configured' | 'failed'; field?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PRODUCT_FIELDS = 'id,sku,type,title,short_description,price_net_cents,vat_rate'
const MAX_ITEMS = 50

// Klucz zgodny z trybem z site.payments.mode. W trybie testowym klucz live jest odrzucany.
export function keyForMode(key: string | undefined): string | null {
  if (!key) return null
  const test = key.startsWith('sk_test_') || key.startsWith('rk_test_')
  const live = key.startsWith('sk_live_') || key.startsWith('rk_live_')
  if (site.payments.mode === 'test') return test ? key : null
  return live ? key : null
}

// Adres powrotu z Checkout. Lokalnie host z naglowka, poza tym zawsze nasza domena (bez zaufania do naglowka Host).
function origin(): string {
  const host = getRequestHeader('host') ?? ''
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`
  return `https://${site.domain}`
}

function toProduct(row: Record<string, unknown>): ShopProduct {
  return { ...(row as ShopProduct), vat_rate: Number(row.vat_rate), price_net_cents: Number(row.price_net_cents) }
}

export const startCheckout = createServerFn({ method: 'POST' })
  .inputValidator((data: CheckoutInput) => data)
  .handler(async ({ data }): Promise<CheckoutResult> => {
    // Przed wlaczeniem dopuszczamy tylko tryb testowy (podglad ?platnosci=1), zeby nikt nie zaplacil naprawde.
    if (!site.payments.enabled && site.payments.mode !== 'test') return { ok: false, error: 'disabled' }

    // Koszyk: kazdy produkt raz (powtorzenia sumujemy), najwyzej MAX_ITEMS pozycji.
    const wanted = new Map<string, number>()
    for (const item of Array.isArray(data.items) ? data.items : []) {
      const id = typeof item?.productId === 'string' ? item.productId : ''
      const qty = Number.isInteger(item?.quantity) ? item.quantity : 0
      if (!UUID.test(id) || qty < 1) return { ok: false, error: 'invalid', field: 'items' }
      wanted.set(id, (wanted.get(id) ?? 0) + qty)
    }
    if (!wanted.size || wanted.size > MAX_ITEMS) return { ok: false, error: 'invalid', field: 'items' }
    const email = typeof data.email === 'string' ? data.email.trim().slice(0, 160) : ''
    if (!EMAIL.test(email)) return { ok: false, error: 'invalid', field: 'email' }
    // Nazwa firmy i NIP do faktury podawane u nas (regulamin §4 ust. 1), NIP z suma kontrolna. Stripe zbiera tylko adres.
    const company = typeof data.company === 'string' ? data.company.trim().replace(/\s+/g, ' ').slice(0, 256) : ''
    if (company.length < 2) return { ok: false, error: 'invalid', field: 'company' }
    const nip = normalizeNip(typeof data.nip === 'string' ? data.nip : '')
    if (!nip) return { ok: false, error: 'invalid', field: 'nip' }
    // Akceptacja Regulaminu i Polityki prywatnosci (regulamin §4 ust. 1); wersja regulaminu trafia do zamowienia.
    if (data.terms !== true) return { ok: false, error: 'invalid', field: 'terms' }

    const key = keyForMode(process.env.STRIPE_SECRET_KEY)
    if (!key || !adminConfigured()) {
      console.error('checkout: brak STRIPE_SECRET_KEY (zgodnego z trybem', site.payments.mode, ') lub SUPABASE_SERVICE_ROLE_KEY')
      return { ok: false, error: 'not_configured' }
    }

    let orderId = ''
    try {
      const [productRes, settingsRes] = await Promise.all([
        adminRest(
          `products?select=${PRODUCT_FIELDS},categories(is_active)&id=in.(${[...wanted.keys()].join(',')})&status=eq.published&is_visible=eq.true`,
        ),
        adminRest('app_settings?select=terms_version,currency'),
      ])
      if (!productRes.ok || !settingsRes.ok) {
        console.error('checkout: Supabase odpowiedzial', productRes.status, settingsRes.status)
        return { ok: false, error: 'failed' }
      }
      const rows = (await productRes.json()) as (Record<string, unknown> & { categories?: { is_active: boolean } | null })[]
      const settings = ((await settingsRes.json()) as { terms_version: string; currency: string }[])[0]
      if (!settings) return { ok: false, error: 'failed' }
      // Produkt bez kategorii albo z wylaczonej kategorii nie jest w sklepie (decyzja 8.11.2026).
      const byId = new Map(rows.filter((r) => r.categories?.is_active).map((r) => [String(r.id), toProduct(r)]))
      // Kolejnosc pozycji jak w koszyku. Brak ktoregokolwiek produktu = odmowa (koszyk odswiezy dane).
      const lines: { product: ShopProduct; quantity: number; unitGross: number }[] = []
      for (const [id, quantity] of wanted) {
        const product = byId.get(id)
        if (!product) return { ok: false, error: 'invalid', field: 'unavailable' }
        if (quantity > maxQuantity(product.type)) return { ok: false, error: 'invalid', field: 'quantity' }
        lines.push({ product, quantity, unitGross: unitGrossCents(product.price_net_cents, product.vat_rate) })
      }
      const digital = lines.some((l) => isDigital(l.product.type))
      if (digital && data.consent !== true) return { ok: false, error: 'invalid', field: 'consent' }

      // Sumy zgodne z tym, co pobierze Stripe: brutto = suma (cena brutto sztuki x liczba), VAT = brutto - netto.
      const net = lines.reduce((sum, l) => sum + l.product.price_net_cents * l.quantity, 0)
      const gross = lines.reduce((sum, l) => sum + l.unitGross * l.quantity, 0)

      const orderRes = await adminRest('orders?select=id,order_number', {
        method: 'POST',
        prefer: 'return=representation',
        body: {
          buyer_email: email,
          buyer_company: company,
          buyer_nip: nip,
          status: 'pending',
          total_net_cents: net,
          total_vat_cents: gross - net,
          total_gross_cents: gross,
          currency: settings.currency,
          terms_version: settings.terms_version,
          digital_content_consent_at: digital ? new Date().toISOString() : null,
        },
      })
      if (!orderRes.ok) {
        console.error('checkout: zapis zamowienia', orderRes.status, await orderRes.text())
        return { ok: false, error: 'failed' }
      }
      const order = ((await orderRes.json()) as { id: string; order_number: string }[])[0]
      orderId = order.id

      const itemRes = await adminRest('order_items', {
        method: 'POST',
        prefer: 'return=minimal',
        body: lines.map(({ product, quantity }) => ({
          order_id: order.id,
          product_id: product.id,
          sku: product.sku,
          title: product.title,
          quantity,
          unit_net_cents: product.price_net_cents,
          vat_rate: product.vat_rate,
        })),
      })
      if (!itemRes.ok) throw new Error(`zapis pozycji: ${itemRes.status} ${await itemRes.text()}`)

      const base = origin()
      const params = new URLSearchParams({
        mode: 'payment',
        locale: 'pl',
        customer_email: email,
        client_reference_id: order.id,
        'metadata[order_id]': order.id,
        'metadata[order_number]': order.order_number,
        'payment_intent_data[description]': `Zamówienie ${order.order_number}`,
        'payment_intent_data[metadata][order_id]': order.id,
        // Adres do faktury ze Stripe (fakture wystawia Fakturownia). Nazwa firmy i NIP sa juz w zamowieniu (nasz formularz,
        // walidacja sumy kontrolnej), wiec Stripe o NIP nie pyta (bez tax_id_collection).
        billing_address_collection: 'required',
        success_url: `${base}/zamowienie?status=ok&nr=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${base}/koszyk?anulowano=1`,
      })
      lines.forEach(({ product, quantity, unitGross }, i) => {
        params.set(`line_items[${i}][quantity]`, String(quantity))
        params.set(`line_items[${i}][price_data][currency]`, settings.currency.toLowerCase())
        params.set(`line_items[${i}][price_data][unit_amount]`, String(unitGross))
        params.set(`line_items[${i}][price_data][product_data][name]`, product.title.slice(0, 250))
        if (product.short_description) {
          params.set(`line_items[${i}][price_data][product_data][description]`, product.short_description.slice(0, 500))
        }
      })
      // Bez payment_method_types: metody (karta, BLIK, Przelewy24) wlaczamy w panelu Stripe (dynamic payment methods).

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': `checkout-${order.id}`,
        },
        body: params,
      })
      if (!response.ok) throw new Error(`Stripe ${response.status} ${await response.text()}`)
      const session = (await response.json()) as { id: string; url?: string }
      if (!session.url) throw new Error('Stripe nie zwrocil adresu sesji')

      const linkRes = await adminRest(`orders?id=eq.${order.id}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: { stripe_checkout_session_id: session.id },
      })
      if (!linkRes.ok) throw new Error(`powiazanie sesji: ${linkRes.status} ${await linkRes.text()}`)
      return { ok: true, url: session.url }
    } catch (e) {
      console.error('checkout: blad', e)
      // Zamowienie bez sesji Stripe nie zostanie oplacone, oznaczamy je jako anulowane.
      if (orderId) {
        await adminRest(`orders?id=eq.${orderId}&status=eq.pending`, {
          method: 'PATCH',
          prefer: 'return=minimal',
          body: { status: 'cancelled' },
        }).catch(() => undefined)
      }
      return { ok: false, error: 'failed' }
    }
  })
