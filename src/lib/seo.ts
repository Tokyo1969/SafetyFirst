// SEO: meta, canonical, Open Graph, JSON-LD. Domena z site.ts (po podpieciu domeny nic nie zmieniamy).
import { site } from '../config/site'
import type { Service } from '../data/services'

export const SITE_URL = `https://${site.domain}`
const ORG_ID = `${SITE_URL}/#organization`

export function absUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

type JsonLd = Record<string, unknown>

export function pageHead({
  title,
  description,
  path,
  jsonLd = [],
  noindex = false,
}: {
  title: string
  description: string
  path: string
  jsonLd?: JsonLd[]
  noindex?: boolean
}) {
  const url = absUrl(path)
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.brand },
      { property: 'og:locale', content: 'pl_PL' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: jsonLd.map((d) => ({
      type: 'application/ld+json',
      children: JSON.stringify(d).replace(/</g, '\\u003c'),
    })),
  }
}

export function organizationLd(): JsonLd {
  const c = site.company
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: site.brand,
    description: `${site.tagline} dla małych firm: dokumentacja, szkolenia, kontrole i raporty.`,
    url: `${SITE_URL}/`,
    telephone: site.phone.display,
    email: site.emails.main,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.street,
      postalCode: c.postalCode,
      addressLocality: c.city,
      addressCountry: 'PL',
    },
    areaServed: { '@type': 'AdministrativeArea', name: site.region },
    employee: { '@type': 'Person', name: site.person.name, jobTitle: site.person.role },
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  }
}

export function serviceLd(s: Service, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    serviceType: s.navLabel,
    description: s.metaDescription,
    url: absUrl(path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'AdministrativeArea', name: site.region },
  }
}

// Head podstrony uslugi (BHP lub OS) z okruszkami i danymi Service.
export function serviceHead(s: Service, path: string) {
  const crumbs =
    s.section === 'os'
      ? [
          { name: 'Strona główna', path: '/' },
          { name: 'Ochrona środowiska', path: '/ochrona-srodowiska' },
          { name: s.navLabel, path },
        ]
      : [
          { name: 'Strona główna', path: '/' },
          { name: s.navLabel, path },
        ]
  return pageHead({
    title: s.metaTitle,
    description: s.metaDescription,
    path,
    jsonLd: [serviceLd(s, path), breadcrumbLd(crumbs)],
  })
}
