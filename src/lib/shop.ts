// Wspolne zasady sklepu (strona /zamowienie i serwer). Produkty sa w Supabase (tabela products), nie w kodzie.
export type ProductType = 'document' | 'bundle' | 'training_online' | 'training_onsite'

export type ShopProduct = {
  id: string
  sku: string
  type: ProductType
  title: string
  short_description: string | null
  price_net_cents: number
  vat_rate: number // procent, np. 23
}

// Dokumenty i pakiety kupuje sie raz, szkolenia za uczestnika.
export function maxQuantity(type: ProductType): number {
  return type === 'training_online' || type === 'training_onsite' ? 50 : 1
}

// Tresci cyfrowe: przed platnoscia zgoda na dostarczenie przed uplywem terminu odstapienia (orders.digital_content_consent_at).
export function isDigital(type: ProductType): boolean {
  return type === 'document' || type === 'bundle' || type === 'training_online'
}

// Cena brutto jednej sztuki w groszach. Stripe pobiera brutto, w orders zapisujemy netto, VAT i brutto.
export function unitGrossCents(netCents: number, vatRate: number): number {
  return Math.round(netCents * (1 + vatRate / 100))
}

// Reczne formatowanie (jak formatPln w pricing.ts), zeby SSR i przegladarka dawaly identyczny wynik.
export function formatGrosze(grosze: number): string {
  const zl = Math.floor(grosze / 100)
  const gr = String(grosze % 100).padStart(2, '0')
  return `${String(zl).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${gr} zł`
}
