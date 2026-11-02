import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { site } from '../config/site'
import { findOrCreateUser, loginTokenHash } from './auth-admin'
import { escapeHtml, layout, mailerConfigured, sendMail } from './mailer'
import { adminConfigured } from './supabase-admin'

// Link logowania do Konta (regulamin §2 ust. 2: konto samodzielnie albo po zakupie, logowanie haslem lub linkiem).
// Konto dla nowego adresu zaklada serwer (publiczna rejestracja w Supabase jest wylaczona). Link wysylamy sami
// z biuro@ przez n8n, token weryfikuje strona /konto (supabase.auth.verifyOtp).
export type LoginLinkInput = { email: string; website: string }
export type LoginLinkResult = { ok: true } | { ok: false; error: 'invalid' | 'limit' | 'not_configured' | 'failed' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Limity w pamieci instancji Workera: na adres IP i na adres e-mail (zeby nie zasypac czyjejs skrzynki).
const OKNO_MS = 60 * 60 * 1000
const trafienia = new Map<string, number[]>()
function przekroczony(key: string, limit: number): boolean {
  const teraz = Date.now()
  const lista = (trafienia.get(key) ?? []).filter((t) => teraz - t < OKNO_MS)
  lista.push(teraz)
  trafienia.set(key, lista)
  if (trafienia.size > 5000) {
    for (const [k, v] of trafienia) if (teraz - v[v.length - 1] > OKNO_MS) trafienia.delete(k)
  }
  return lista.length > limit
}

export const requestLoginLink = createServerFn({ method: 'POST' })
  .inputValidator((data: LoginLinkInput) => data)
  .handler(async ({ data }): Promise<LoginLinkResult> => {
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase().slice(0, 200) : ''
    if (typeof data.website === 'string' && data.website.trim() !== '') return { ok: true }
    if (!EMAIL.test(email)) return { ok: false, error: 'invalid' }
    if (przekroczony(`ip:${getRequestHeader('cf-connecting-ip') ?? 'brak'}`, 10) || przekroczony(`mail:${email}`, 3)) {
      return { ok: false, error: 'limit' }
    }
    if (!adminConfigured() || !mailerConfigured()) return { ok: false, error: 'not_configured' }

    try {
      if (!(await findOrCreateUser(email))) return { ok: false, error: 'failed' }
      const token = await loginTokenHash(email)
      if (!token) return { ok: false, error: 'failed' }
      const link = `https://${site.domain}/konto?token_hash=${encodeURIComponent(token)}`
      const { html, text } = layout([
        'Dzień dobry,',
        `oto link do logowania do Konta w sklepie ${escapeHtml(site.brand)}. Link działa jednorazowo i wygasa po godzinie:`,
        `<a href="${link}">${link}</a>`,
        'W Koncie możesz ustawić hasło, żeby następnym razem logować się bez linku.',
        'Jeśli to nie Ty prosisz o link, zignoruj tę wiadomość.',
        `Pozdrawiamy<br>${escapeHtml(site.brand)}`,
      ])
      const sent = await sendMail({ to: email, subject: `Logowanie do Konta – ${site.brand}`, html, text })
      return sent ? { ok: true } : { ok: false, error: 'failed' }
    } catch (e) {
      console.error('account: link logowania', e)
      return { ok: false, error: 'failed' }
    }
  })
