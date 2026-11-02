// Supabase Auth po stronie serwera (klucz serwisowy): konta klientow zakladane przez sklep, link logowania
// i sprawdzanie sesji z naglowka Authorization. Publiczna rejestracja w Supabase jest wylaczona.
import { adminRest } from './supabase-admin'

function authHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return {
    apikey: key,
    ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
    'Content-Type': 'application/json',
  }
}

export type SessionUser = { id: string; email: string }

// Uzytkownik z tokenu sesji (konto klienta lub panel). null = brak lub wygasla sesja.
export async function userFromToken(accessToken: string): Promise<SessionUser | null> {
  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY
  if (!url || !anon || !accessToken) return null
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${accessToken}` } })
  if (!response.ok) return null
  const user = (await response.json()) as { id?: string; email?: string }
  return user.id ? { id: user.id, email: user.email ?? '' } : null
}

// Czy token sesji nalezy do admina (is_admin() w Supabase sprawdza role w profiles). Server functions panelu.
export async function isAdminToken(accessToken: string): Promise<boolean> {
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

export function bearer(request: Request): string {
  const header = request.headers.get('authorization') ?? ''
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
}

async function findUserId(email: string): Promise<string | null> {
  // Supabase Auth zapisuje adresy malymi literami (profil dostaje adres z auth.users).
  const res = await adminRest(`profiles?select=id&email=eq.${encodeURIComponent(email.trim().toLowerCase())}&limit=1`)
  if (!res.ok) return null
  return ((await res.json()) as { id: string }[])[0]?.id ?? null
}

// Konto dla adresu e-mail: istniejace albo nowe (potwierdzone, bez hasla). Profil tworzy wyzwalacz handle_new_user.
export async function findOrCreateUser(email: string, fullName?: string | null): Promise<string | null> {
  const existing = await findUserId(email)
  if (existing) return existing
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, email_confirm: true, user_metadata: fullName ? { full_name: fullName } : {} }),
  })
  if (response.ok) return ((await response.json()) as { id: string }).id
  const body = await response.text()
  // Konto istnieje, ale bez profilu z tym adresem (np. zmiana adresu): szukamy jeszcze raz.
  if (response.status === 422 && body.includes('email_exists')) return findUserId(email)
  console.error('auth-admin: zakladanie konta', response.status, body)
  return null
}

// Jednorazowy token logowania (magic link) do wlasnego linku /konto?token_hash=... (bez poczty Supabase
// i bez listy dozwolonych przekierowan). Waznosc wg ustawienia "Email OTP expiration" w Supabase (domyslnie 1 h).
export async function loginTokenHash(email: string): Promise<string | null> {
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ type: 'magiclink', email }),
  })
  if (!response.ok) {
    console.error('auth-admin: link logowania', response.status, await response.text())
    return null
  }
  const data = (await response.json()) as { hashed_token?: string; properties?: { hashed_token?: string } }
  return data.hashed_token ?? data.properties?.hashed_token ?? null
}
