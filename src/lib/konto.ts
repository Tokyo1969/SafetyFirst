// Konto klienta (/konto): klient Supabase w przegladarce z osobna sesja niz panel /admin.
// Logowanie haslem albo jednorazowym linkiem (token_hash z maila, src/server/account.ts). RLS: klient widzi
// tylko swoje zamowienia, uprawnienia, pobrania i profil.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { site } from '../config/site'

let client: SupabaseClient | null = null

export function kontoClient(): SupabaseClient {
  client ??= createClient(site.supabase.url, site.supabase.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sf-konto-auth', detectSessionInUrl: false },
  })
  return client
}
