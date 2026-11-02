import { site } from '../config/site'
import { DIGITAL_CONSENT_TEXT, formatGrosze, unitGrossCents } from '../lib/shop'
import { escapeHtml, layout, mailerConfigured, sendMail } from './mailer'
import { adminRest } from './supabase-admin'

// Potwierdzenie zamowienia na trwalym nosniku (regulamin §4 ust. 4) po oplaceniu: numer, produkty, ceny,
// regulamin (link do PDF), informacja o utracie prawa odstapienia przy tresciach cyfrowych, odstapienie online.
// Wysylane raz (orders.confirmation_sent_at). Zwraca false przy bledzie, webhook odpowie 500 i Stripe ponowi.

type OrderForMail = {
  order_number: string
  status: string
  buyer_email: string
  buyer_name: string | null
  buyer_company: string | null
  buyer_nip: string | null
  buyer_address: string | null
  total_net_cents: number
  total_vat_cents: number
  total_gross_cents: number
  digital_content_consent_at: string | null
  terms_version: string | null
  paid_at: string | null
  confirmation_sent_at: string | null
  order_items: { title: string; quantity: number; unit_net_cents: number; vat_rate: number | string }[]
}

function data(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Warsaw' }).format(new Date(iso))
}

export function confirmationMail(o: OrderForMail): { subject: string; html: string; text: string } {
  const base = `https://${site.domain}`
  const c = site.company
  const e = escapeHtml
  const pozycje = o.order_items
    .map((i) => {
      const gross = unitGrossCents(i.unit_net_cents, Number(i.vat_rate)) * i.quantity
      return `${e(i.title)} × ${i.quantity}: ${formatGrosze(i.unit_net_cents * i.quantity)} netto, VAT ${Number(i.vat_rate)}%, ${formatGrosze(gross)} brutto`
    })
    .join('<br>')
  const nabywca = [o.buyer_company ?? o.buyer_name, o.buyer_nip ? `NIP ${o.buyer_nip}` : '', o.buyer_address]
    .filter(Boolean)
    .map((x) => e(String(x)))
    .join('<br>')

  const { html, text } = layout([
    'Dzień dobry,',
    `dziękujemy za zamówienie <strong>${e(o.order_number)}</strong>. Płatność przyjęliśmy ${e(data(o.paid_at))}.`,
    `<strong>Zamówione produkty</strong><br>${pozycje}`,
    `<strong>Razem:</strong> ${formatGrosze(o.total_net_cents)} netto + ${formatGrosze(o.total_vat_cents)} VAT = <strong>${formatGrosze(o.total_gross_cents)} brutto</strong>`,
    `<strong>Nabywca</strong><br>${nabywca}`,
    `<strong>Sprzedawca</strong><br>${e(c.name)}, ${e(c.street)}, ${e(c.postalCode)} ${e(c.city)}, NIP ${e(c.nip)}<br>Biuro: ${e(site.legal.salesOffice)}`,
    ...(o.digital_content_consent_at
      ? [
          `<strong>Treści cyfrowe i prawo odstąpienia</strong><br>Przed płatnością (${e(data(o.digital_content_consent_at))}) złożono oświadczenie: „${e(DIGITAL_CONSENT_TEXT)}” Z chwilą rozpoczęcia dostarczania treści cyfrowych prawo odstąpienia od umowy wygasa (§8 ust. 2 Regulaminu). Do tego czasu przedsiębiorca na prawach konsumenta może odstąpić od umowy online: <a href="${base}${site.legal.withdrawalPath}">${base}${site.legal.withdrawalPath}</a>, e-mailem na ${e(site.emails.main)} lub pisemnie. Wzór formularza odstąpienia jest w Załączniku nr 1 do Regulaminu.`,
        ]
      : []),
    `<strong>Dostęp do zakupów</strong><br>Zakupione dokumenty pobierzesz w Koncie, w zakładce „Moje zakupy”: <a href="${base}/konto">${base}/konto</a>. Konto założyliśmy na adres ${e(o.buyer_email)}. Zaloguj się linkiem, który wyślemy na ten adres, a potem możesz ustawić hasło. Limit pobrań i zasady aktualizacji opisuje §6 Regulaminu. Fakturę VAT wyślemy w osobnej wiadomości.`,
    `<strong>Regulamin</strong> (wersja ${e(o.terms_version ?? '')}), obowiązujący w chwili złożenia zamówienia: <a href="${base}${site.legal.regulaminPdf}">${base}${site.legal.regulaminPdf}</a> (PDF). Dane przetwarzamy zgodnie z Polityką prywatności: <a href="${base}${site.legal.privacyPath}">${base}${site.legal.privacyPath}</a>.`,
    `W razie pytań odpowiedz na tę wiadomość lub zadzwoń: ${e(site.phone.display)}.<br>Pozdrawiamy<br>${e(site.brand)}`,
  ])
  return { subject: `Potwierdzenie zamówienia ${o.order_number} – ${site.brand}`, html, text }
}

export async function ensureOrderConfirmation(orderId: string): Promise<boolean> {
  if (!mailerConfigured()) return true
  const res = await adminRest(
    `orders?select=order_number,status,buyer_email,buyer_name,buyer_company,buyer_nip,buyer_address,total_net_cents,total_vat_cents,total_gross_cents,digital_content_consent_at,terms_version,paid_at,confirmation_sent_at,order_items(title,quantity,unit_net_cents,vat_rate)&id=eq.${orderId}`,
  )
  if (!res.ok) {
    console.error('order-confirmation: Supabase odpowiedzial', res.status, await res.text())
    return false
  }
  const order = ((await res.json()) as OrderForMail[])[0]
  if (!order || order.status !== 'paid' || order.confirmation_sent_at) return true

  const mail = confirmationMail(order)
  if (!(await sendMail({ to: order.buyer_email, bcc: site.emails.main, ...mail }))) return false

  const saved = await adminRest(`orders?id=eq.${orderId}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: { confirmation_sent_at: new Date().toISOString() },
  })
  if (!saved.ok) console.error('order-confirmation: zapis znacznika', saved.status, await saved.text())
  return true
}
