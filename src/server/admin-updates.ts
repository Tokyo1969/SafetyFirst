import { createServerFn } from '@tanstack/react-start'
import { site } from '../config/site'
import { isAdminToken } from './auth-admin'
import { escapeHtml, layout, mailerConfigured, sendMail } from './mailer'
import { adminConfigured, adminRest } from './supabase-admin'

// Powiadomienie o aktualizacji dokumentu (regulamin §6 ust. 5): po wgraniu nowej wersji admin wysyla mail do
// klientow z dostepem kupionym w ciagu ostatnich 12 miesiecy. Kazdy dostaje osobna wiadomosc (bez ujawniania adresow).
// Nowa wersja jest od razu w Koncie (pobieranie zawsze daje biezacy plik). Raz na wersje (product_files.update_notified_at).
export type NotifyUpdateInput = { productId: string; accessToken: string }
export type NotifyUpdateResult =
  | { ok: true; sent: number; failed: number }
  | { ok: false; error: 'forbidden' | 'invalid' | 'not_configured' | 'failed'; message?: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const notifyProductUpdate = createServerFn({ method: 'POST' })
  .inputValidator((data: NotifyUpdateInput) => data)
  .handler(async ({ data }): Promise<NotifyUpdateResult> => {
    if (!(await isAdminToken(typeof data.accessToken === 'string' ? data.accessToken : ''))) return { ok: false, error: 'forbidden' }
    if (typeof data.productId !== 'string' || !UUID.test(data.productId)) return { ok: false, error: 'invalid' }
    if (!adminConfigured() || !mailerConfigured()) return { ok: false, error: 'not_configured' }

    try {
      const [fileRes, productRes] = await Promise.all([
        adminRest(`product_files?select=id,version,change_note,update_notified_at&product_id=eq.${data.productId}&is_current=eq.true`),
        adminRest(`products?select=title,edition&id=eq.${data.productId}`),
      ])
      const file = fileRes.ok
        ? ((await fileRes.json()) as { id: string; version: number; change_note: string | null; update_notified_at: string | null }[])[0]
        : undefined
      const product = productRes.ok ? ((await productRes.json()) as { title: string; edition: string | null }[])[0] : undefined
      if (!file || !product) return { ok: false, error: 'invalid', message: 'Brak bieżącego pliku.' }
      if (file.version < 2) return { ok: false, error: 'invalid', message: 'To pierwsza wersja, nie ma czego ogłaszać.' }
      if (file.update_notified_at) return { ok: false, error: 'invalid', message: 'Powiadomienie o tej wersji zostało już wysłane.' }

      const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      const entRes = await adminRest(
        `entitlements?select=user_id,profiles(email)&product_id=eq.${data.productId}&revoked_at=is.null&granted_at=gte.${encodeURIComponent(since)}`,
      )
      if (!entRes.ok) return { ok: false, error: 'failed' }
      const emails = [
        ...new Set(
          ((await entRes.json()) as { profiles: { email: string | null } | null }[]).map((e) => e.profiles?.email).filter((x): x is string => !!x),
        ),
      ]

      const base = `https://${site.domain}`
      const e = escapeHtml
      const { html, text } = layout([
        'Dzień dobry,',
        `zaktualizowaliśmy dokument <strong>${e(product.title)}</strong>${product.edition ? ` (wydanie ${e(product.edition)})` : ''}.${file.change_note ? ` Zmiana: ${e(file.change_note)}.` : ''}`,
        `Nowa wersja jest już w Koncie, w zakładce „Moje zakupy”: <a href="${base}/konto">${base}/konto</a>. Aktualizacja jest bezpłatna (§6 ust. 5 Regulaminu).`,
        `Pozdrawiamy<br>${e(site.brand)}`,
      ])
      let sent = 0
      let failed = 0
      for (const to of emails) {
        if (await sendMail({ to, subject: `Aktualizacja dokumentu: ${product.title} – ${site.brand}`, html, text })) sent++
        else failed++
      }
      await adminRest(`product_files?id=eq.${file.id}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: { update_notified_at: new Date().toISOString() },
      })
      return { ok: true, sent, failed }
    } catch (err) {
      console.error('admin-updates: blad', err)
      return { ok: false, error: 'failed' }
    }
  })
