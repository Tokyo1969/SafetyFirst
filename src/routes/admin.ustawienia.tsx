import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { VAT_RATES, adminClient, dbError, formatDate } from '../lib/admin'

// Ustawienia sprzedawcy (app_settings, jeden wiersz). Dane na fakturach bierze Fakturownia z wlasnego konta;
// tu sa dane do sklepu: wersja regulaminu zapisywana w zamowieniu, domyslny VAT nowych produktow, limity pobran.
export const Route = createFileRoute('/admin/ustawienia')({
  component: Ustawienia,
})

type Settings = {
  seller_name: string
  seller_nip: string
  seller_address: string
  seller_sales_office: string | null
  seller_email: string | null
  seller_phone: string | null
  seller_bank_account: string | null
  vat_payer: boolean
  default_vat_rate: number
  currency: string
  terms_version: string
  max_downloads_per_item: number
  signed_url_ttl_seconds: number
  updated_at: string
}

type Pole = { key: keyof Settings; label: string; hint?: string; type?: 'text' | 'email' | 'tel' | 'number'; required?: boolean; wide?: boolean }

const DANE: Pole[] = [
  { key: 'seller_name', label: 'Sprzedawca', required: true },
  { key: 'seller_nip', label: 'NIP', required: true },
  { key: 'seller_address', label: 'Adres siedziby', required: true, wide: true },
  { key: 'seller_sales_office', label: 'Adres biura sprzedaży', hint: 'Jeśli inny niż siedziba.', wide: true },
  { key: 'seller_email', label: 'E-mail', type: 'email' },
  { key: 'seller_phone', label: 'Telefon', type: 'tel' },
  { key: 'seller_bank_account', label: 'Numer konta', wide: true },
]

function Ustawienia() {
  const [form, setForm] = useState<Settings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    adminClient()
      .from('app_settings')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return setError(error ? dbError(error) : 'Brak wiersza ustawień w app_settings.')
        setForm({ ...(data as Settings), default_vat_rate: Number(data.default_vat_rate) })
      })
  }, [])

  if (!form) return error ? <p role="alert" className="font-semibold text-blad">{error}</p> : <p>Ładowanie…</p>

  function ustaw<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form) return
    setError(null)
    setInfo(null)
    const nip = form.seller_nip.replace(/[\s-]/g, '')
    if (!/^\d{10}$/.test(nip)) return setError('NIP: 10 cyfr.')
    if (!form.terms_version.trim()) return setError('Podaj wersję regulaminu.')
    const tekst = (v: string | null) => (v ?? '').trim() || null
    const { data, error } = await adminClient()
      .from('app_settings')
      .update({
        seller_name: form.seller_name.trim(),
        seller_nip: nip,
        seller_address: form.seller_address.trim(),
        seller_sales_office: tekst(form.seller_sales_office),
        seller_email: tekst(form.seller_email),
        seller_phone: tekst(form.seller_phone),
        seller_bank_account: tekst(form.seller_bank_account),
        vat_payer: form.vat_payer,
        default_vat_rate: form.default_vat_rate,
        currency: form.currency,
        terms_version: form.terms_version.trim(),
        max_downloads_per_item: Math.max(1, Math.round(form.max_downloads_per_item)),
        signed_url_ttl_seconds: Math.max(10, Math.round(form.signed_url_ttl_seconds)),
      })
      .eq('id', true)
      .select('*')
      .single()
    if (error) return setError(dbError(error))
    setForm({ ...(data as Settings), default_vat_rate: Number(data.default_vat_rate) })
    setInfo('Zapisano.')
  }

  return (
    <form className="grid gap-6" onSubmit={zapisz}>
      <div>
        <h1 className="text-3xl">Ustawienia sklepu</h1>
        <p className="mt-1 text-sm text-tusz-2">Ostatnia zmiana: {formatDate(form.updated_at)}.</p>
      </div>

      <fieldset className="panel grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-xl font-semibold">Dane sprzedawcy</legend>
        <p className="text-sm text-tusz-2 md:col-span-2">
          Dane na fakturach Fakturownia bierze z ustawień swojego konta. Przy zmianie danych firmy (np. po założeniu sp. z o.o.)
          popraw je też w Fakturowni i w <code>src/config/site.ts</code>.
        </p>
        {DANE.map((p) => (
          <div key={p.key} className={p.wide ? 'md:col-span-2' : ''}>
            <label htmlFor={`s-${p.key}`} className="block text-sm font-semibold">{p.label}</label>
            <input
              id={`s-${p.key}`}
              type={p.type ?? 'text'}
              required={p.required}
              className="pole mt-1 w-full"
              value={String(form[p.key] ?? '')}
              onChange={(e) => ustaw(p.key, e.target.value as never)}
            />
            {p.hint && <p className="mt-1 text-xs text-tusz-2">{p.hint}</p>}
          </div>
        ))}
      </fieldset>

      <fieldset className="panel grid gap-4 md:grid-cols-3">
        <legend className="mb-2 text-xl font-semibold">Sprzedaż</legend>
        <div>
          <label htmlFor="s-terms" className="block text-sm font-semibold">Wersja regulaminu</label>
          <input id="s-terms" className="pole mt-1 w-full" value={form.terms_version} onChange={(e) => ustaw('terms_version', e.target.value)} required />
          <p className="mt-1 text-xs text-tusz-2">Zapisywana w każdym zamówieniu. Zmień po publikacji nowego regulaminu.</p>
        </div>
        <div>
          <label htmlFor="s-vat" className="block text-sm font-semibold">Domyślny VAT nowych produktów</label>
          <select id="s-vat" className="pole mt-1 w-full" value={form.default_vat_rate} onChange={(e) => ustaw('default_vat_rate', Number(e.target.value))}>
            {VAT_RATES.map((v) => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s-currency" className="block text-sm font-semibold">Waluta</label>
          <select id="s-currency" className="pole mt-1 w-full" value={form.currency} onChange={(e) => ustaw('currency', e.target.value)}>
            <option value="PLN">PLN</option>
          </select>
        </div>
        <label className="flex items-center gap-3 md:col-span-3">
          <input type="checkbox" checked={form.vat_payer} onChange={(e) => ustaw('vat_payer', e.target.checked)} />
          <span>Czynny podatnik VAT</span>
        </label>
      </fieldset>

      <fieldset className="panel grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-xl font-semibold">Pobieranie plików</legend>
        <p className="text-sm text-tusz-2 md:col-span-2">Do wykorzystania przy pobieraniu dokumentów przez klientów (jeszcze niewłączone).</p>
        <div>
          <label htmlFor="s-downloads" className="block text-sm font-semibold">Limit pobrań na dokument</label>
          <input id="s-downloads" type="number" min={1} className="pole mt-1 w-full" value={form.max_downloads_per_item} onChange={(e) => ustaw('max_downloads_per_item', Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="s-ttl" className="block text-sm font-semibold">Ważność linku do pobrania (sekundy)</label>
          <input id="s-ttl" type="number" min={10} className="pole mt-1 w-full" value={form.signed_url_ttl_seconds} onChange={(e) => ustaw('signed_url_ttl_seconds', Number(e.target.value))} />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-glowny">Zapisz ustawienia</button>
        {info && <p role="status" className="font-semibold text-znak">{info}</p>}
        {error && <p role="alert" className="font-semibold text-blad">{error}</p>}
      </div>
    </form>
  )
}
