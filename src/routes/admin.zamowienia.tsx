import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { site } from '../config/site'
import { adminClient, dbError, formatDate } from '../lib/admin'
import { formatGrosze } from '../lib/shop'
import { retryInvoice } from '../server/admin-invoice'

// Zamowienia ze sklepu: status, kupujacy, faktura, link do platnosci w Stripe, ponowienie faktury.
export const Route = createFileRoute('/admin/zamowienia')({
  component: Zamowienia,
})

type Status = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'

type Zamowienie = {
  id: string
  order_number: string
  status: Status
  buyer_email: string
  buyer_name: string | null
  buyer_company: string | null
  buyer_nip: string | null
  buyer_address: string | null
  total_net_cents: number
  total_gross_cents: number
  stripe_payment_intent_id: string | null
  invoice_number: string | null
  invoice_pdf_url: string | null
  paid_at: string | null
  created_at: string
  order_items: { title: string; sku: string; quantity: number }[]
}

const STATUS: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Oczekuje', className: 'bg-tasma/30' },
  paid: { label: 'Opłacone', className: 'bg-znak-jasny text-znak-ciemny' },
  failed: { label: 'Nieudane', className: 'bg-blad/10 text-blad' },
  refunded: { label: 'Zwrócone', className: 'bg-mgla' },
  cancelled: { label: 'Anulowane', className: 'bg-mgla text-tusz-2' },
}

// Panel Stripe: w trybie testowym adresy maja prefiks /test.
const STRIPE_DASHBOARD = `https://dashboard.stripe.com${site.payments.mode === 'test' ? '/test' : ''}`

function Zamowienia() {
  const [lista, setLista] = useState<Zamowienie[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtr, setFiltr] = useState<Status | ''>('')
  const [wTrakcie, setWTrakcie] = useState<string | null>(null)
  const [komunikat, setKomunikat] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  const wczytaj = useCallback(async () => {
    const { data, error } = await adminClient()
      .from('orders')
      .select(
        'id,order_number,status,buyer_email,buyer_name,buyer_company,buyer_nip,buyer_address,total_net_cents,total_gross_cents,stripe_payment_intent_id,invoice_number,invoice_pdf_url,paid_at,created_at,order_items(title,sku,quantity)',
      )
      .order('created_at', { ascending: false })
      .limit(300)
    if (error) return setError(dbError(error))
    setLista(data as Zamowienie[])
  }, [])

  useEffect(() => {
    wczytaj()
  }, [wczytaj])

  const widoczne = useMemo(() => (lista ?? []).filter((z) => !filtr || z.status === filtr), [lista, filtr])
  const suma = widoczne.filter((z) => z.status === 'paid').reduce((s, z) => s + z.total_gross_cents, 0)

  async function wystawFakture(z: Zamowienie) {
    setKomunikat(null)
    setWTrakcie(z.id)
    try {
      const { data } = await adminClient().auth.getSession()
      const result = await retryInvoice({ data: { orderId: z.id, accessToken: data.session?.access_token ?? '' } })
      if (result.ok) {
        setKomunikat({ id: z.id, ok: true, text: `Wystawiono ${result.invoiceNumber ?? 'fakturę'} i wysłano na ${z.buyer_email}.` })
        await wczytaj()
      } else {
        setKomunikat({
          id: z.id,
          ok: false,
          text:
            result.message ??
            (result.error === 'forbidden'
              ? 'Brak uprawnień. Zaloguj się ponownie.'
              : result.error === 'not_configured'
                ? 'Faktury nie są skonfigurowane w Workerze.'
                : 'Nie udało się wystawić faktury.'),
        })
      }
    } catch {
      setKomunikat({ id: z.id, ok: false, text: 'Nie udało się wystawić faktury.' })
    } finally {
      setWTrakcie(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Zamówienia</h1>
        <div>
          <label htmlFor="z-status" className="block text-sm font-semibold">Status</label>
          <select id="z-status" className="pole mt-1" value={filtr} onChange={(e) => setFiltr(e.target.value as Status | '')}>
            <option value="">Wszystkie</option>
            {Object.entries(STATUS).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      {site.payments.mode === 'test' && <p className="mt-2 text-sm text-tusz-2">Tryb testowy: zamówienia z płatności testowych, faktury proforma.</p>}

      {error && <p role="alert" className="mt-6 font-semibold text-blad">{error}</p>}
      {!lista && !error && <p className="mt-6">Ładowanie…</p>}
      {lista && widoczne.length === 0 && <p className="mt-6">Brak zamówień.</p>}
      {widoczne.length > 0 && (
        <p className="mt-6 text-sm text-tusz-2">
          {widoczne.length} zamówień, opłacone razem: <strong className="text-tusz">{formatGrosze(suma)}</strong> brutto.
        </p>
      )}

      <ul className="mt-4 grid gap-4">
        {widoczne.map((z) => (
          <li key={z.id} className="panel text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">
                  {z.order_number}
                  <span className={`ml-3 rounded px-2 py-0.5 text-xs font-semibold ${STATUS[z.status].className}`}>{STATUS[z.status].label}</span>
                </p>
                <p className="text-tusz-2">
                  Złożone {formatDate(z.created_at)}
                  {z.paid_at ? ` · opłacone ${formatDate(z.paid_at)}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{formatGrosze(z.total_gross_cents)}</p>
                <p className="text-tusz-2">{formatGrosze(z.total_net_cents)} netto</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-semibold">Kupujący</p>
                <p>{z.buyer_company ?? z.buyer_name ?? '–'}</p>
                {z.buyer_company && z.buyer_name && z.buyer_name !== z.buyer_company && <p>{z.buyer_name}</p>}
                {z.buyer_nip && <p>NIP {z.buyer_nip}</p>}
                {z.buyer_address && <p className="text-tusz-2">{z.buyer_address}</p>}
                <p><a href={`mailto:${z.buyer_email}`} className="link">{z.buyer_email}</a></p>
              </div>
              <div>
                <p className="font-semibold">Pozycje</p>
                <ul>
                  {z.order_items.map((i) => (
                    <li key={i.sku + i.title}>{i.title} × {i.quantity}</li>
                  ))}
                </ul>
              </div>
              <div className="grid content-start gap-2">
                <p className="font-semibold">Faktura i płatność</p>
                {z.invoice_pdf_url ? (
                  <a href={z.invoice_pdf_url} target="_blank" rel="noreferrer" className="link">{z.invoice_number ?? 'Faktura'} (PDF)</a>
                ) : z.status === 'paid' ? (
                  <button type="button" className="btn btn-zielony justify-self-start" disabled={wTrakcie === z.id} onClick={() => wystawFakture(z)}>
                    {wTrakcie === z.id ? 'Wystawiam…' : 'Wystaw fakturę'}
                  </button>
                ) : (
                  <p className="text-tusz-2">Brak faktury</p>
                )}
                {z.stripe_payment_intent_id && (
                  <a href={`${STRIPE_DASHBOARD}/payments/${z.stripe_payment_intent_id}`} target="_blank" rel="noreferrer" className="link">
                    Płatność w Stripe
                  </a>
                )}
                {komunikat?.id === z.id && (
                  <p role={komunikat.ok ? 'status' : 'alert'} className={`font-semibold ${komunikat.ok ? 'text-znak' : 'text-blad'}`}>
                    {komunikat.text}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
