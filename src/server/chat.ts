import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { buildSystemPrompt } from '../lib/chat-knowledge'
import { site } from '../config/site'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatInput = { messages: ChatMessage[]; sessionId?: string }
export type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; error: 'invalid' | 'limit' | 'not_configured' | 'failed' }

const MAX_MESSAGES = 12 // ostatnie wiadomosci rozmowy wysylane do modelu
const MAX_CHARS = 1000 // dlugosc jednej wiadomosci klienta
const MAX_TOKENS = 450 // dlugosc odpowiedzi
const MODEL_DEFAULT = 'gpt-4.1-mini'

// Prosty limit na adres IP (w pamieci instancji Workera, wiec tylko pomocniczy).
// Twarda ochrone kosztow daje miesieczny limit wydatkow w koncie OpenAI.
const LIMIT = 20
const OKNO_MS = 10 * 60 * 1000
const trafienia = new Map<string, number[]>()

function przekroczony(ip: string): boolean {
  const teraz = Date.now()
  const lista = (trafienia.get(ip) ?? []).filter((t) => teraz - t < OKNO_MS)
  lista.push(teraz)
  trafienia.set(ip, lista)
  if (trafienia.size > 5000) {
    for (const [k, v] of trafienia) if (teraz - v[v.length - 1] > OKNO_MS) trafienia.delete(k)
  }
  return lista.length > LIMIT
}

function oczysc(messages: unknown): ChatMessage[] | null {
  if (!Array.isArray(messages)) return null
  const out: ChatMessage[] = []
  for (const m of messages.slice(-MAX_MESSAGES)) {
    const role = (m as ChatMessage)?.role
    const content = (m as ChatMessage)?.content
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const tekst = content.trim().slice(0, MAX_CHARS)
    if (tekst) out.push({ role, content: tekst })
  }
  // API wymaga rozmowy zaczynajacej sie od wiadomosci klienta i konczacej sie na niej.
  while (out.length && out[0].role !== 'user') out.shift()
  if (!out.length || out[out.length - 1].role !== 'user') return null
  return out
}

// Zapis pary pytanie-odpowiedz do Supabase (do analiz, bez adresu IP). Blad zapisu nie psuje rozmowy.
// Rola anon moze tylko dodawac wiersze (RLS), odczyt przez klucz serwisowy lub panel Supabase.
async function zapiszRozmowe(sessionId: unknown, pytanie: string, odpowiedz: string): Promise<void> {
  if (!site.chat.saveConversations) return
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return
  const sesja = typeof sessionId === 'string' ? sessionId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64) : ''
  try {
    const response = await fetch(`${url}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        apikey: key,
        ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        session_id: sesja || 'brak',
        user_message: pytanie.slice(0, MAX_CHARS),
        assistant_reply: odpowiedz.slice(0, 4000),
      }),
    })
    if (!response.ok) console.error('chat: zapis rozmowy nie powiodl sie', response.status)
  } catch (e) {
    console.error('chat: blad zapisu rozmowy', e)
  }
}

export const askAssistant = createServerFn({ method: 'POST' })
  .inputValidator((data: ChatInput) => data)
  .handler(async ({ data }): Promise<ChatResult> => {
    const messages = oczysc(data?.messages)
    if (!messages) return { ok: false, error: 'invalid' }

    const ip = getRequestHeader('cf-connecting-ip') ?? getRequestHeader('x-forwarded-for') ?? 'nieznany'
    if (przekroczony(ip)) return { ok: false, error: 'limit' }

    // Tryb testowy bez wywolania API (tylko do sprawdzania wygladu: CHAT_MOCK=1 w .dev.vars).
    if (process.env.CHAT_MOCK === '1') {
      const test = 'To odpowiedź testowa. Szczegóły znajdziesz na stronie [Cennik](/cennik).'
      return { ok: true, reply: test }
    }

    const key = process.env.OPENAI_API_KEY
    if (!key) {
      console.error('chat: brak OPENAI_API_KEY')
      return { ok: false, error: 'not_configured' }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.CHAT_MODEL || MODEL_DEFAULT,
          max_tokens: MAX_TOKENS,
          // Prompt systemowy jest pierwsza wiadomoscia; OpenAI cache'uje stale poczatki promptu automatycznie.
          messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
        }),
      })
      if (!response.ok) {
        console.error('chat: OpenAI odpowiedzial', response.status, await response.text())
        return { ok: false, error: 'failed' }
      }
      const json = (await response.json()) as { choices?: { message?: { content?: string | null } }[] }
      const reply = (json.choices?.[0]?.message?.content ?? '').trim()
      if (!reply) {
        console.error('chat: OpenAI zwrocil pusta odpowiedz')
        return { ok: false, error: 'failed' }
      }
      await zapiszRozmowe(data.sessionId, messages[messages.length - 1].content, reply)
      return { ok: true, reply }
    } catch (e) {
      console.error('chat: blad polaczenia z OpenAI', e)
      return { ok: false, error: 'failed' }
    }
  })
