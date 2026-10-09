import { createServerFn } from '@tanstack/react-start'

export type ConsultationInput = {
  name: string
  company: string
  email: string
  phone: string
  industry: string
  employees: string
  positions: string
  location: string
  services: string[]
  message: string
  consent: boolean
  website: string // pole puapka (honeypot), musi zostac puste
}

export type ConsultationResult =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'not_configured' | 'failed'; field?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export const submitConsultation = createServerFn({ method: 'POST' })
  .inputValidator((data: ConsultationInput) => data)
  .handler(async ({ data }): Promise<ConsultationResult> => {
    // Boty wypelniaja ukryte pole. Udajemy sukces, nic nie zapisujac.
    if (clean(data.website, 200) !== '') return { ok: true }

    const row = {
      name: clean(data.name, 120),
      company: clean(data.company, 160),
      email: clean(data.email, 160),
      phone: clean(data.phone, 40),
      industry: clean(data.industry, 120),
      employees: clean(data.employees, 40),
      positions: clean(data.positions, 20),
      location: clean(data.location, 120),
      services: Array.isArray(data.services)
        ? data.services.map((s) => clean(s, 40)).filter(Boolean).slice(0, 5)
        : [],
      message: clean(data.message, 2000),
      consent: data.consent === true,
    }

    if (row.name.length < 2) return { ok: false, error: 'invalid', field: 'name' }
    if (!EMAIL.test(row.email)) return { ok: false, error: 'invalid', field: 'email' }
    if (!row.consent) return { ok: false, error: 'invalid', field: 'consent' }

    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) return { ok: false, error: 'not_configured' }

    try {
      const response = await fetch(`${url}/rest/v1/consultation_requests`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
      })
      return response.ok ? { ok: true } : { ok: false, error: 'failed' }
    } catch {
      return { ok: false, error: 'failed' }
    }
  })
