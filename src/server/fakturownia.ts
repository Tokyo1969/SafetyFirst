import { site } from '../config/site'
import { adminRest } from './supabase-admin'

// Faktura w Fakturowni po oplaceniu zamowienia (wywoluje webhook Stripe). API: github.com/fakturownia/API
// Tryb testowy platnosci = proforma (bez numeracji VAT i bez KSeF), tryb live = faktura VAT.
// Wysylka do KSeF zgodnie z ustawieniem konta Fakturowni (Ustawienia > KSeF > Automatyczna wysylka), nie z kodu.
// Sekret FAKTUROWNIA_API_TOKEN tylko jako sekret Workera. Bez tokenu lub domeny faktury sa pomijane.

export type InvoiceBuyer = {
  email?: string | null
  name?: string | null
  businessName?: string | null
  taxId?: string | null
  street?: string | null
  postCode?: string | null
  city?: string | null
  country?: string | null
}

type OrderForInvoice = {
  id: string
  order_number: string
  status: string
  buyer_email: string
  fakturownia_invoice_id: string | null
  order_items: {
    title: string
    quantity: number
    unit_net_cents: number
    vat_rate: number | string
    products: { type: string } | null
  }[]
}

export function invoicingConfigured(): boolean {
  return Boolean(site.payments.fakturowniaDomain && process.env.FAKTUROWNIA_API_TOKEN)
}

// Data w strefie Europe/Warsaw (RRRR-MM-DD), bo faktura ma polska date sprzedazy.
function warsawDate(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(date)
}

// NIP polskiej firmy bez prefiksu PL i separatorow; numery UE zostawiamy z prefiksem (Fakturownia rozpozna nip_ue).
function taxNo(value: string, country: string): string {
  const clean = value.replace(/[\s-]/g, '').toUpperCase()
  return country === 'PL' && clean.startsWith('PL') ? clean.slice(2) : clean
}

// Wystawia fakture dla oplaconego zamowienia bez faktury. Zwraca false przy bledzie (webhook odpowie 500 i Stripe ponowi).
// Duplikaty blokuje oid = numer zamowienia z oid_unique.
export async function ensureInvoice(orderId: string, buyer: InvoiceBuyer): Promise<boolean> {
  if (!invoicingConfigured()) return true
  const domain = site.payments.fakturowniaDomain
  const token = process.env.FAKTUROWNIA_API_TOKEN as string

  const orderRes = await adminRest(
    `orders?select=id,order_number,status,buyer_email,fakturownia_invoice_id,order_items(title,quantity,unit_net_cents,vat_rate,products(type))&id=eq.${orderId}`,
  )
  if (!orderRes.ok) return false
  const order = ((await orderRes.json()) as OrderForInvoice[])[0]
  if (!order || order.status !== 'paid' || order.fakturownia_invoice_id) return true

  const country = (buyer.country ?? 'PL').toUpperCase()
  const today = warsawDate(new Date())
  const positions = order.order_items.map((item) => {
    const rate = Number(item.vat_rate)
    // Brutto pozycji jak w Stripe (cena brutto sztuki x liczba), zeby faktura zgadzala sie z platnoscia.
    const gross = Math.round(item.unit_net_cents * (1 + rate / 100)) * item.quantity
    // Szkolenia liczymy na osoby, dokumenty i pakiety w sztukach.
    const unit = item.products?.type?.startsWith('training_') ? 'os.' : 'szt.'
    return { name: item.title.slice(0, 256), quantity: item.quantity, quantity_unit: unit, tax: rate, total_price_gross: gross / 100 }
  })
  const paid = positions.reduce((sum, p) => sum + p.total_price_gross, 0)

  const response = await fetch(`https://${domain}.fakturownia.pl/invoices.json`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_token: token,
      invoice: {
        kind: site.payments.mode === 'live' ? 'vat' : 'proforma',
        number: null,
        sell_date: today,
        issue_date: today,
        payment_to: today,
        payment_type: 'Płatność online (Stripe)',
        status: 'paid',
        paid: paid.toFixed(2),
        oid: order.order_number,
        oid_unique: 'yes',
        buyer_company: true,
        buyer_name: (buyer.businessName || buyer.name || '').slice(0, 256),
        buyer_tax_no: buyer.taxId ? taxNo(buyer.taxId, country) : '',
        buyer_street: buyer.street ?? '',
        buyer_post_code: buyer.postCode ?? '',
        buyer_city: buyer.city ?? '',
        buyer_country: country,
        buyer_email: buyer.email || order.buyer_email,
        description: `Zamówienie ${order.order_number}`,
        positions,
      },
    }),
  })
  if (!response.ok) {
    console.error('fakturownia: tworzenie faktury', order.order_number, response.status, await response.text())
    return false
  }
  const invoice = (await response.json()) as { id: number; number: string; token: string }

  const saveRes = await adminRest(`orders?id=eq.${order.id}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: {
      fakturownia_invoice_id: String(invoice.id),
      invoice_number: invoice.number,
      invoice_pdf_url: `https://${domain}.fakturownia.pl/invoice/${invoice.token}.pdf`,
    },
  })
  if (!saveRes.ok) {
    console.error('fakturownia: zapis numeru faktury', order.order_number, saveRes.status, await saveRes.text())
    return false
  }

  // Faktura z PDF na e-mail kupujacego (jednoczesnie potwierdzenie zamowienia). Blad wysylki nie cofa faktury.
  const mail = await fetch(
    `https://${domain}.fakturownia.pl/invoices/${invoice.id}/send_by_email.json?api_token=${encodeURIComponent(token)}&email_pdf=true`,
    { method: 'POST', headers: { Accept: 'application/json' } },
  ).catch((e) => {
    console.error('fakturownia: wysylka e-mail', order.order_number, e)
    return null
  })
  if (mail && !mail.ok) console.error('fakturownia: wysylka e-mail', order.order_number, mail.status, await mail.text())
  return true
}
