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

// Strony indeksowane (sitemap.xml). Polityka prywatnosci jest robocza (noindex).
export const SITEMAP_PATHS: readonly string[] = [
  '/',
  '/obsluga-bhp',
  ...SERVICES.map(servicePath),
  '/ochrona-srodowiska',
  ...OS_SERVICES.map(servicePath),
]
