import { createServerFn } from '@tanstack/react-start'
import { keyForMode } from './checkout'
import { ensureInvoice, invoiceBuyer, invoicingConfigured, type StripeCustomerDetails } from './fakturownia'
import { adminConfigured, adminRest } from './supabase-admin'

// Ponowienie faktury z panelu /admin dla oplaconego zamowienia bez faktury (np. gdy Fakturownia nie odpowiadala).
// Token Fakturowni jest tylko w Workerze, wiec to robi serwer. Uprawnienia: is_admin() z tokenem sesji panelu.
export type RetryInvoiceInput = { orderId: string; accessToken: string }
export type RetryInvoiceResult =
  | { ok: true; invoiceNumber: string | null }
  | { ok: false; error: 'forbidden' | 'not_configured' | 'invalid' | 'failed'; message?: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Supabase weryfikuje JWT sesji; is_admin() sprawdza role w profiles.
async function isAdmin(accessToken: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key || !accessToken) return false
  const response = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  })
  return response.ok && (await response.json()) === true
}

export const retryInvoice = createServerFn({ method: 'POST' })
  .inputValidator((data: RetryInvoiceInput) => data)
  .handler(async ({ data }): Promise<RetryInvoiceResult> => {
    const accessToken = typeof data.accessToken === 'string' ? data.accessToken : ''
    if (!(await isAdmin(accessToken))) return { ok: false, error: 'forbidden' }
    if (typeof data.orderId !== 'string' || !UUID.test(data.orderId)) return { ok: false, error: 'invalid' }

    const stripeKey = keyForMode(process.env.STRIPE_SECRET_KEY)
    if (!stripeKey || !adminConfigured() || !invoicingConfigured()) return { ok: false, error: 'not_configured' }

    try {
      const orderRes = await adminRest(
        `orders?select=status,stripe_checkout_session_id,fakturownia_invoice_id&id=eq.${data.orderId}`,
      )
      if (!orderRes.ok) return { ok: false, error: 'failed' }
      const order = ((await orderRes.json()) as {
        status: string
        stripe_checkout_session_id: string | null
        fakturownia_invoice_id: string | null
      }[])[0]
      if (!order) return { ok: false, error: 'invalid', message: 'Nie ma takiego zamówienia.' }
      if (order.status !== 'paid') return { ok: false, error: 'invalid', message: 'Fakturę wystawiamy tylko dla opłaconego zamówienia.' }
      if (order.fakturownia_invoice_id) return { ok: false, error: 'invalid', message: 'Zamówienie ma już fakturę.' }
      if (!order.stripe_checkout_session_id) return { ok: false, error: 'invalid', message: 'Brak sesji Stripe.' }

      // Dane nabywcy z sesji Stripe (osobne pola adresu, NIP, nazwa firmy), jak w webhooku.
      const sessionRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(order.stripe_checkout_session_id)}`,
        { headers: { Authorization: `Bearer ${stripeKey}` } },
      )
      if (!sessionRes.ok) {
        console.error('admin-invoice: Stripe odpowiedzial', sessionRes.status, await sessionRes.text())
        return { ok: false, error: 'failed' }
      }
      const session = (await sessionRes.json()) as { customer_details?: StripeCustomerDetails }

      if (!(await ensureInvoice(data.orderId, invoiceBuyer(session.customer_details)))) {
        return { ok: false, error: 'failed', message: 'Fakturownia odrzuciła fakturę. Szczegóły w logach Workera.' }
      }
      const doneRes = await adminRest(`orders?select=invoice_number&id=eq.${data.orderId}`)
      const done = doneRes.ok ? ((await doneRes.json()) as { invoice_number: string | null }[])[0] : undefined
      return { ok: true, invoiceNumber: done?.invoice_number ?? null }
    } catch (e) {
      console.error('admin-invoice: blad', e)
      return { ok: false, error: 'failed' }
    }
  })
