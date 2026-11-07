// Wspolny wykaz podstron uslug (BHP + ochrona srodowiska): sciezki, powiazania, mapa strony.
import { SERVICES, type Service } from './services'
import { OS_SERVICES } from './os-services'

export const ALL_SERVICES: readonly Service[] = [...SERVICES, ...OS_SERVICES]

export function servicePath(s: Service): string {
  return s.section === 'os' ? `/ochrona-srodowiska/${s.slug}` : `/${s.slug}`
}

export function getOsService(slug: string): Service | undefined {
  return OS_SERVICES.find((s) => s.slug === slug)
}

// Podstrony polecane pod strona uslugi: BHP -> wszystkie pozostale, OS -> ta sama grupa, potem kolejne z listy.
export function relatedServices(s: Service): Service[] {
  if (s.section === 'bhp') return SERVICES.filter((x) => x.slug !== s.slug)
  const sameGroup = OS_SERVICES.filter((x) => x.slug !== s.slug && x.group === s.group)
  const idx = OS_SERVICES.findIndex((x) => x.slug === s.slug)
  const result = sameGroup.slice(0, 3)
  for (let i = 1; result.length < 3 && i < OS_SERVICES.length; i++) {
    const next = OS_SERVICES[(idx + i) % OS_SERVICES.length]
    if (!result.includes(next)) result.push(next)
  }
  return result
}

// Menu "Uslugi" w naglowku (uklad z 7.11.2026): 4 grupy. Uslugi OS = wszystkie z OS_SERVICES poza
// dokumentacja (OS_DOC_SLUGS), wiec nowa usluga OS sama trafia do menu.
export type MenuItem = { to: string; label: string; soon?: boolean }
export type MenuGroup = {
  title: string
  items: MenuItem[]
  all?: MenuItem // link "wszystkie" pod lista
  iso?: '45001' | '14001'
  wide?: boolean // dluga lista w dwoch kolumnach
  tone: 'bhp' | 'bhp-doc' | 'os' | 'os-doc' // strefa kolorystyczna w menu (klasy w Header.tsx)
}

const OS_DOC_SLUGS = [
  'dokumentacja-srodowiskowa',
  'obowiazki-prawne-srodowiskowe',
  'aspekty-srodowiskowe',
  'awarie-i-wycieki',
  'pozwolenia-wodnoprawne',
]

const osItem = (s: Service): MenuItem => ({ to: servicePath(s), label: s.navLabel, soon: s.soon })

export const SERVICES_MENU: readonly MenuGroup[] = [
  {
    title: 'Usługi BHP',
    items: [
      { to: '/obsluga-bhp', label: 'Stała obsługa BHP' },
      { to: '/szkolenia-bhp', label: 'Szkolenia BHP' },
      { to: '/konsultacje-bhp', label: 'Konsultacje BHP' },
      { to: '/wypadki-przy-pracy', label: 'Wypadki przy pracy' },
      { to: '/kontrola-i-audyt-bhp', label: 'Kontrola i audyt BHP' },
    ],
    iso: '45001',
    tone: 'bhp',
  },
  {
    title: 'Dokumentacja BHP',
    items: [
      { to: '/dokumentacja-bhp', label: 'Dokumentacja podstawowa' },
      { to: '/pakiety-dokumentacji-bhp', label: 'Pakiety dokumentacji' },
      { to: '/ocena-ryzyka-zawodowego', label: 'Ocena ryzyka zawodowego' },
    ],
    tone: 'bhp-doc',
  },
  {
    title: 'Usługi ochrony środowiska',
    items: OS_SERVICES.filter((s) => !OS_DOC_SLUGS.includes(s.slug)).map(osItem),
    all: { to: '/ochrona-srodowiska', label: 'Wszystkie usługi środowiskowe' },
    iso: '14001',
    wide: true,
    tone: 'os',
  },
  {
    title: 'Dokumentacja ochrony środowiska',
    items: OS_DOC_SLUGS.flatMap((slug) => {
      const s = getOsService(slug)
      return s ? [osItem(s)] : []
    }),
    tone: 'os-doc',
  },
]

// Wyrozniowane uslugi srodowiskowe (strona glowna).
export const FEATURED_OS: readonly Service[] = [
  'obsluga-bdo',
  'raporty-kobize',
  'oplaty-srodowiskowe',
  'gospodarka-odpadami',
  'audyt-srodowiskowy',
  'kontrola-wios',
].flatMap((slug) => getOsService(slug) ?? [])

// Strony indeksowane (sitemap.xml). Polityka prywatnosci jest robocza (noindex).
export const SITEMAP_PATHS: readonly string[] = [
  '/',
  '/obsluga-bhp',
  '/cennik',
  '/dla-branz',
  '/o-nas',
  '/faq',
  '/wdrozenie-iso',
  '/kontakt',
  ...SERVICES.map(servicePath),
  '/ochrona-srodowiska',
  ...OS_SERVICES.map(servicePath),
]
