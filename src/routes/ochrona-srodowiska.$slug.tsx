import { createFileRoute, notFound } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getOsService } from '../data/catalog'
import { serviceHead } from '../lib/seo'

export const Route = createFileRoute('/ochrona-srodowiska/$slug')({
  loader: ({ params }) => {
    const service = getOsService(params.slug)
    if (!service) throw notFound()
    return service
  },
  head: ({ loaderData, params }) =>
    loaderData ? serviceHead(loaderData, `/ochrona-srodowiska/${params.slug}`) : {},
  component: OsService,
})

function OsService() {
  return <ServicePage service={Route.useLoaderData()} />
}
