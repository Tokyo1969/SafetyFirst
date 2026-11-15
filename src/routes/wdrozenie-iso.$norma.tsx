import { createFileRoute, notFound } from '@tanstack/react-router'
import { IsoNormaPage, ZAKLADKI, type Zakladka } from '../components/IsoNormaPage'
import { getIsoNorma } from '../data/iso'
import { breadcrumbLd, isoServiceLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/wdrozenie-iso/$norma')({
  // Zakladka w adresie (?zakladka=wniosek) pozwala linkowac prosto do wniosku; canonical zawsze bez parametru.
  validateSearch: (search: Record<string, unknown>): { zakladka?: Zakladka } =>
    ZAKLADKI.includes(search.zakladka as Zakladka) ? { zakladka: search.zakladka as Zakladka } : {},
  loader: ({ params }) => {
    const norma = getIsoNorma(params.norma)
    if (!norma) throw notFound()
    return norma
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const path = `/wdrozenie-iso/${loaderData.slug}`
    return pageHead({
      title: loaderData.metaTitle,
      description: loaderData.metaDescription,
      path,
      jsonLd: [
        isoServiceLd(`Wdrożenie i certyfikacja ${loaderData.code}`, loaderData.metaDescription, path),
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Wdrożenie ISO', path: '/wdrozenie-iso' },
          { name: loaderData.code, path },
        ]),
      ],
    })
  },
  component: NormaStrona,
})

function NormaStrona() {
  const norma = Route.useLoaderData()
  const { zakladka = 'czego-dotyczy' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <IsoNormaPage
      norma={norma}
      zakladka={zakladka}
      onZakladka={(z) => navigate({ search: { zakladka: z }, replace: true, resetScroll: false })}
    />
  )
}
