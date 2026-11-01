import { site } from '../config/site'
import { ensureInvoice } from './fakturownia'
import { adminConfigured, adminRest } from './supabase-admin'

// Webhook Stripe: aktualizuje zamowienie w orders (zalozone w src/server/checkout.ts ze statusem pending).
// Przejscia tylko z pending, wiec ponowione zdarzenia niczego nie psuja. Zrodlem prawdy o platnosci jest Stripe.
export const STRIPE_WEBHOOK_PATH = '/api/stripe/webhook'

const TOLERANCE_S = 300

type StripeEvent = {
  id: string
  type: string
  livemode: boolean
  data: { object: CheckoutSession }
}

type Address = { line1?: string | null; line2?: string | null; postal_code?: string | null; city?: string | null; country?: string | null }

type CheckoutSession = {
  id: string
  client_reference_id?: string | null
  payment_status: string
  amount_total: number | null
  payment_intent?: string | null
  metadata?: Record<string, string>
  customer_details?: {
    email?: string | null
    name?: string | null
    business_name?: string | null
    address?: Address | null
    tax_ids?: { type: string; value: string }[] | null
  } | null
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Weryfikacja naglowka Stripe-Signature (t=...,v1=...) bez SDK: HMAC-SHA256 z "t.payload".
async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').map((p) => p.split('='))
  const t = parts.find(([k]) => k === 't')?.[1]
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!t || !signatures.length) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)))
  return signatures.some((s) => sameString(s, expected))
}

function text(body: string, status: number): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

// Dane do faktury z formularza Stripe Checkout. Puste pola pomijamy, zeby nie kasowac zapisanych wczesniej.
function buyer(s: CheckoutSession): Record<string, string> {
  const d = s.customer_details
  const a = d?.address
  const address = a
    ? [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(' '), a.country].filter(Boolean).join(', ')
    : ''
  const fields = {
    buyer_email: d?.email,
    buyer_name: d?.name,
    buyer_company: d?.business_name,
    buyer_nip: d?.tax_ids?.[0]?.value,
    buyer_address: address,
  }
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v)) as Record<string, string>
}

// Zmiana zamowienia tylko ze statusem pending i ta sama sesja. Zwraca odpowiedz bledu albo null.
async function updatePending(orderId: string, sessionId: string, body: Record<string, unknown>): Promise<Response | null> {
  const response = await adminRest(
    `orders?id=eq.${orderId}&stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}&status=eq.pending`,
    { method: 'PATCH', prefer: 'return=minimal', body },
  )
  if (response.ok) return null
  console.error('stripe-webhook: Supabase odpowiedzial', response.status, await response.text())
  return text('Storage failed', 500)
}

async function markPaid(orderId: string, s: CheckoutSession): Promise<Response> {
  // Kwota ze Stripe musi sie zgadzac z zamowieniem, inaczej zostawiamy pending do recznego sprawdzenia.
  const orderRes = await adminRest(`orders?select=total_gross_cents&id=eq.${orderId}`)
  if (!orderRes.ok) return text('Storage failed', 500)
  const order = ((await orderRes.json()) as { total_gross_cents: number }[])[0]
  if (!order) return text('Unknown order', 200)
  if (order.total_gross_cents !== s.amount_total) {
    console.error('stripe-webhook: kwota sie nie zgadza', orderId, order.total_gross_cents, s.amount_total)
    return text('Amount mismatch', 200)
  }
  const failed = await updatePending(orderId, s.id, {
    ...buyer(s),
    status: 'paid',
    paid_at: new Date().toISOString(),
    stripe_payment_intent_id: s.payment_intent ?? null,
  })
  if (failed) return failed

  // Faktura takze przy ponowionym zdarzeniu, jesli wczesniej sie nie udala (ensureInvoice pomija zamowienia z faktura).
  const d = s.customer_details
  const invoiced = await ensureInvoice(orderId, {
    email: d?.email,
    name: d?.name,
    businessName: d?.business_name,
    taxId: d?.tax_ids?.[0]?.value,
    street: [d?.address?.line1, d?.address?.line2].filter(Boolean).join(' '),
    postCode: d?.address?.postal_code,
    city: d?.address?.city,
    country: d?.address?.country,
  })
  return invoiced ? text('OK', 200) : text('Invoice failed', 500)
}

export async function handleStripeWebhook(request: Request): Promise<Response> {
  if (request.method !== 'POST') return text('Method Not Allowed', 405)

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !adminConfigured()) {
    console.error('stripe-webhook: brak STRIPE_WEBHOOK_SECRET lub SUPABASE_SERVICE_ROLE_KEY')
    return text('Not configured', 500)
  }

  const payload = await request.text()
  const header = request.headers.get('stripe-signature') ?? ''
  if (!(await verifySignature(payload, header, secret))) return text('Invalid signature', 400)

  const event = JSON.parse(payload) as StripeEvent
  if (!event.type.startsWith('checkout.session.')) return text('Ignored', 200)
  // W trybie testowym nie ruszamy zamowien zdarzeniami z trybu live (i odwrotnie).
  if (event.livemode !== (site.payments.mode === 'live')) return text('Ignored (mode)', 200)

  const s = event.data.object
  const orderId = s.metadata?.order_id ?? s.client_reference_id ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return text('No order', 200)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // BLIK i Przelewy24 moga zakonczyc sesje przed potwierdzeniem platnosci (payment_status unpaid).
        if (s.payment_status === 'paid' || s.payment_status === 'no_payment_required') return await markPaid(orderId, s)
        return (await updatePending(orderId, s.id, buyer(s))) ?? text('OK (pending)', 200)
      case 'checkout.session.async_payment_succeeded':
        return await markPaid(orderId, s)
      case 'checkout.session.async_payment_failed':
        return (await updatePending(orderId, s.id, { status: 'failed' })) ?? text('OK', 200)
      case 'checkout.session.expired':
        return (await updatePending(orderId, s.id, { status: 'cancelled' })) ?? text('OK', 200)
      default:
        return text('Ignored', 200)
    }
  } catch (e) {
    console.error('stripe-webhook: blad polaczenia z Supabase', e)
    return text('Storage failed', 500)
  }
}
