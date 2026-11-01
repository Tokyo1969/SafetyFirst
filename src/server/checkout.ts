import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { site } from '../config/site'
import { isDigital, maxQuantity, unitGrossCents, type ShopProduct } from '../lib/shop'
import { adminConfigured, adminRest } from './supabase-admin'

export type CheckoutInput = { productId: string; quantity: number; email: string; consent: boolean }
export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: 'invalid' | 'disabled' | 'not_configured' | 'failed'; field?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PRODUCT_FIELDS = 'id,sku,type,title,short_description,price_net_cents,vat_rate'

// Klucz zgodny z trybem z site.payments.mode. W trybie testowym klucz live jest odrzucany.
function keyForMode(key: string | undefined): string | null {
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

// Produkty widoczne w sklepie (opublikowane i widoczne). Odczyt kluczem anon, zgodnie z RLS products_public_read.
export const listShopProducts = createServerFn({ method: 'GET' }).handler(async (): Promise<ShopProduct[]> => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const response = await fetch(
      `${url}/rest/v1/products?select=${PRODUCT_FIELDS}&status=eq.published&is_visible=eq.true&order=sort_order,title`,
      { headers: { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }) } },
    )
    if (!response.ok) {
      console.error('checkout: lista produktow', response.status, await response.text())
      return []
    }
    return ((await response.json()) as Record<string, unknown>[]).map(toProduct)
  } catch (e) {
    console.error('checkout: blad pobierania produktow', e)
    return []
  }
})

export const startCheckout = createServerFn({ method: 'POST' })
  .inputValidator((data: CheckoutInput) => data)
  .handler(async ({ data }): Promise<CheckoutResult> => {
    // Przed wlaczeniem dopuszczamy tylko tryb testowy (podglad ?platnosci=1), zeby nikt nie zaplacil naprawde.
    if (!site.payments.enabled && site.payments.mode !== 'test') return { ok: false, error: 'disabled' }

    const productId = typeof data.productId === 'string' ? data.productId : ''
    const email = typeof data.email === 'string' ? data.email.trim().slice(0, 160) : ''
    const quantity = Number.isInteger(data.quantity) ? data.quantity : 0
    if (!UUID.test(productId)) return { ok: false, error: 'invalid' }
    if (!EMAIL.test(email)) return { ok: false, error: 'invalid', field: 'email' }

    const key = keyForMode(process.env.STRIPE_SECRET_KEY)
    if (!key || !adminConfigured()) {
      console.error('checkout: brak STRIPE_SECRET_KEY (zgodnego z trybem', site.payments.mode, ') lub SUPABASE_SERVICE_ROLE_KEY')
      return { ok: false, error: 'not_configured' }
    }

    let orderId = ''
    try {
      const [productRes, settingsRes] = await Promise.all([
        adminRest(`products?select=${PRODUCT_FIELDS}&id=eq.${productId}&status=eq.published&is_visible=eq.true`),
        adminRest('app_settings?select=terms_version,currency'),
      ])
      if (!productRes.ok || !settingsRes.ok) {
        console.error('checkout: Supabase odpowiedzial', productRes.status, settingsRes.status)
        return { ok: false, error: 'failed' }
      }
      const rows = (await productRes.json()) as Record<string, unknown>[]
      const settings = ((await settingsRes.json()) as { terms_version: string; currency: string }[])[0]
      if (!rows.length || !settings) return { ok: false, error: 'invalid' }
      const product = toProduct(rows[0])

      if (quantity < 1 || quantity > maxQuantity(product.type)) return { ok: false, error: 'invalid', field: 'quantity' }
      const digital = isDigital(product.type)
      if (digital && data.consent !== true) return { ok: false, error: 'invalid', field: 'consent' }

      // Sumy zgodne z tym, co pobierze Stripe: brutto = cena brutto sztuki x liczba, VAT = brutto - netto.
      const unitGross = unitGrossCents(product.price_net_cents, product.vat_rate)
      const net = product.price_net_cents * quantity
      const gross = unitGross * quantity

      const orderRes = await adminRest('orders?select=id,order_number', {
        method: 'POST',
        prefer: 'return=representation',
        body: {
          buyer_email: email,
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
        body: {
          order_id: order.id,
          product_id: product.id,
          sku: product.sku,
          title: product.title,
          quantity,
          unit_net_cents: product.price_net_cents,
          vat_rate: product.vat_rate,
        },
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
        'line_items[0][quantity]': String(quantity),
        'line_items[0][price_data][currency]': settings.currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(unitGross),
        'line_items[0][price_data][product_data][name]': product.title,
        // Klienci to firmy: adres i NIP potrzebne do faktury (wystawiamy ja poza Stripe, docelowo Fakturownia i KSeF).
        billing_address_collection: 'required',
        'tax_id_collection[enabled]': 'true',
        // NIP wymagany (sprzedaz tylko firmom, decyzja 1.11.2026). Stripe pokazuje wtedy tez pole nazwy firmy.
        'tax_id_collection[required]': 'if_supported',
        success_url: `${base}/zamowienie?status=ok&nr=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${base}/zamowienie?status=anulowano`,
      })
      if (product.short_description) {
        params.set('line_items[0][price_data][product_data][description]', product.short_description.slice(0, 500))
      }
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
