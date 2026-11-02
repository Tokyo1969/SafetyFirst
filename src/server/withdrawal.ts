import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { site } from '../config/site'
import { escapeHtml, layout, sendMail } from './mailer'
import { adminConfigured, adminRest } from './supabase-admin'

// Odstapienie od umowy online (regulamin §8 ust. 4 i 6): zapis oswiadczenia ze znacznikiem czasu (withdrawals)
// i potwierdzenie z jego trescia, data i godzina na e-mail Klienta (kopia na biuro@).
// Oswiadczenie przyjmujemy zawsze, takze gdy numer zamowienia lub e-mail sie nie zgadza (order_id = null):
// ocene, czy prawo odstapienia przysluguje, robi Natalia w panelu.
export type WithdrawalInput = { orderNumber: string; name: string; email: string; website: string }
export type WithdrawalResult =
  | { ok: true; createdAt: string; mailSent: boolean }
  | { ok: false; error: 'invalid' | 'limit' | 'not_configured' | 'failed'; field?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Prosty limit na adres IP (w pamieci instancji Workera, jak w czacie).
const LIMIT = 5
const OKNO_MS = 60 * 60 * 1000
const trafienia = new Map<string, number[]>()

function przekroczony(ip: string): boolean {
  const teraz = Date.now()
  const lista = (trafienia.get(ip) ?? []).filter((t) => teraz - t < OKNO_MS)
  lista.push(teraz)
  trafienia.set(ip, lista)
  return lista.length > LIMIT
}

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function data(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeStyle: 'medium', timeZone: 'Europe/Warsaw' }).format(new Date(iso))
}

export const submitWithdrawal = createServerFn({ method: 'POST' })
  .inputValidator((data: WithdrawalInput) => data)
  .handler(async ({ data: input }): Promise<WithdrawalResult> => {
    const orderNumber = clean(input.orderNumber, 40).toUpperCase()
    const name = clean(input.name, 200)
    const email = clean(input.email, 200)
    // Boty wypelniaja ukryte pole: udajemy sukces bez zapisu.
    if (clean(input.website, 200) !== '') return { ok: true, createdAt: new Date().toISOString(), mailSent: false }
    if (orderNumber.length < 3) return { ok: false, error: 'invalid', field: 'orderNumber' }
    if (name.length < 2) return { ok: false, error: 'invalid', field: 'name' }
    if (!EMAIL.test(email)) return { ok: false, error: 'invalid', field: 'email' }
    if (przekroczony(getRequestHeader('cf-connecting-ip') ?? 'brak')) return { ok: false, error: 'limit' }
    if (!adminConfigured()) return { ok: false, error: 'not_configured' }

    const statement = `Odstępuję od umowy sprzedaży zawartej w ramach zamówienia ${orderNumber}.`
    try {
      const orderRes = await adminRest(
        `orders?select=id,buyer_email&order_number=eq.${encodeURIComponent(orderNumber)}`,
      )
      const order = orderRes.ok ? ((await orderRes.json()) as { id: string; buyer_email: string }[])[0] : undefined
      const orderId = order && order.buyer_email.toLowerCase() === email.toLowerCase() ? order.id : null

      const insert = await adminRest('withdrawals?select=id,created_at', {
        method: 'POST',
        prefer: 'return=representation',
        body: { order_id: orderId, order_number: orderNumber, buyer_name: name, email, statement },
      })
      if (!insert.ok) {
        console.error('withdrawal: zapis', insert.status, await insert.text())
        return { ok: false, error: 'failed' }
      }
      const row = ((await insert.json()) as { id: string; created_at: string }[])[0]

      const e = escapeHtml
      const c = site.company
      const { html, text } = layout([
        'Dzień dobry,',
        `potwierdzamy otrzymanie oświadczenia o odstąpieniu od umowy, złożonego online <strong>${e(data(row.created_at))}</strong>.`,
        `<strong>Treść oświadczenia</strong><br>${e(statement)}<br>Imię i nazwisko lub firma: ${e(name)}<br>E-mail: ${e(email)}`,
        `Adresat: ${e(c.name)}, ${e(c.street)}, ${e(c.postalCode)} ${e(c.city)}, NIP ${e(c.nip)}.`,
        'Sprawdzimy zamówienie i odpowiemy na ten adres. Jeśli odstąpienie przysługuje, zwrócimy płatność niezwłocznie, nie później niż w ciągu 14 dni, tą samą metodą płatności (§8 Regulaminu).',
        `Pozdrawiamy<br>${e(site.brand)}`,
      ])
      const mailSent = await sendMail({
        to: email,
        bcc: site.emails.main,
        replyTo: site.emails.main,
        subject: `Potwierdzenie odstąpienia od umowy (${orderNumber}) – ${site.brand}`,
        html,
        text,
      })
      if (mailSent) {
        await adminRest(`withdrawals?id=eq.${row.id}`, {
          method: 'PATCH',
          prefer: 'return=minimal',
          body: { confirmation_sent_at: new Date().toISOString() },
        }).catch(() => undefined)
      }
      return { ok: true, createdAt: row.created_at, mailSent }
    } catch (e) {
      console.error('withdrawal: blad', e)
      return { ok: false, error: 'failed' }
    }
  })
