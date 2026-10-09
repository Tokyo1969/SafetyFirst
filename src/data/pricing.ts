// Ceny abonamentu BHP (netto, zl / miesiac) z oferty handlowej Natalii Krysztofiak.
// Zrodlo: "OFERTA HANDLOWA.md". Ceny maja charakter orientacyjny ("od").
export const BANDS = [
  '1–5 osób',
  '6–10 osób',
  '11–20 osób',
  '21–30 osób',
  '31–40 osób',
  '41–50 osób',
] as const

export type Industry = {
  id: string
  name: string
  prices: readonly [number, number, number, number, number, number]
  note?: string
}

export const INDUSTRIES: readonly Industry[] = [
  { id: 'biura', name: 'Biura, IT, kancelarie, usługi', prices: [199, 249, 349, 449, 549, 649] },
  { id: 'handel', name: 'Handel, sklepy, salony, usługi', prices: [249, 329, 449, 549, 649, 749] },
  { id: 'opieka', name: 'Opieka, edukacja, przedszkola', prices: [249, 349, 449, 549, 649, 749] },
  { id: 'gastronomia', name: 'Gastronomia, hotele, catering', prices: [299, 399, 549, 699, 849, 999] },
  { id: 'sprzatanie', name: 'Firmy sprzątające', prices: [299, 399, 549, 699, 849, 999] },
  { id: 'transport', name: 'Transport', prices: [349, 499, 699, 899, 1049, 1199] },
  { id: 'rolnictwo', name: 'Rolnictwo, gospodarka komunalna', prices: [349, 499, 699, 899, 1049, 1199] },
  { id: 'warsztaty', name: 'Warsztaty, mechanika, serwisy', prices: [399, 599, 799, 999, 1199, 1399] },
  { id: 'produkcja', name: 'Produkcja', prices: [499, 699, 999, 1299, 1499, 1699] },
  {
    id: 'budownictwo',
    name: 'Budownictwo, remonty, instalacje',
    prices: [599, 799, 1099, 1399, 1599, 1799],
    note: 'Przy kilku jednocześnie prowadzonych budowach lub stałym nadzorze BHP przygotowujemy indywidualną ofertę.',
  },
]

export function priceFor(industryId: string, bandIndex: number): number | null {
  const industry = INDUSTRIES.find((i) => i.id === industryId)
  return industry?.prices[bandIndex] ?? null
}

export const PRICE_FROM = Math.min(...INDUSTRIES.flatMap((i) => [...i.prices]))

// Reczne formatowanie, zeby SSR i przegladarka dawaly identyczny wynik.
export function formatPln(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
