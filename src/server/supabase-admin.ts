// Zapytania REST do Supabase kluczem serwisowym (omija RLS). Tylko po stronie serwera: sklep (orders, order_items).
// Sekret SUPABASE_SERVICE_ROLE_KEY (sb_secret_... albo stary service_role JWT) wylacznie jako sekret Workera.
export function adminConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function adminRest(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY')
  return fetch(`${url}/rest/v1/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      apikey: key,
      // Nowe klucze sb_secret_ nie sa JWT, wiec nie wysylamy ich jako Bearer.
      ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}
