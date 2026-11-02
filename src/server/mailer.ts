// Wysylka maili z biuro@ przez n8n (workflow "Safety First - Mail ze strony", id nj1IkBe3DMqHJ8Us).
// Worker buduje tresc, n8n wysyla przez SMTP LH.pl. Sekrety Workera: N8N_MAIL_WEBHOOK_URL i N8N_MAIL_SECRET
// (ten sam sekret jest w warunku webhooka w n8n; zapytania bez niego n8n przyjmuje bez wysylki).
export type Mail = { to: string; subject: string; html: string; text: string; bcc?: string; replyTo?: string }

export function mailerConfigured(): boolean {
  return Boolean(process.env.N8N_MAIL_WEBHOOK_URL && process.env.N8N_MAIL_SECRET)
}

// true tylko gdy serwer SMTP przyjal wiadomosc (n8n zwraca wynik wysylki z messageId).
export async function sendMail(mail: Mail): Promise<boolean> {
  const url = process.env.N8N_MAIL_WEBHOOK_URL
  const secret = process.env.N8N_MAIL_SECRET
  if (!url || !secret) return false
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sf-secret': secret },
      body: JSON.stringify(mail),
    })
    if (!response.ok) {
      console.error('mailer: n8n odpowiedzial', response.status, await response.text())
      return false
    }
    const result = (await response.json().catch(() => ({}))) as { messageId?: string; accepted?: string[] }
    if (!result.messageId || !result.accepted?.length) {
      console.error('mailer: wiadomosc nieprzyjeta', JSON.stringify(result).slice(0, 300))
      return false
    }
    return true
  } catch (e) {
    console.error('mailer: blad polaczenia z n8n', e)
    return false
  }
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

// Prosty szablon: akapity HTML i ten sam tekst bez znacznikow (wersja tekstowa maila).
export function layout(paragraphs: string[]): { html: string; text: string } {
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1d2b3e;max-width:640px">${paragraphs
    .map((p) => `<p style="margin:0 0 14px">${p}</p>`)
    .join('')}</div>`
  const text = paragraphs
    .map((p) =>
      p
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, (_, href: string, label: string) => (label === href ? href : `${label} (${href})`))
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'"),
    )
    .join('\n\n')
  return { html, text }
}
