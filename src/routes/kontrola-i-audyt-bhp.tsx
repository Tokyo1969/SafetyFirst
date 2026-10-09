import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'

const service = getService('kontrola-i-audyt-bhp')

export const Route = createFileRoute('/kontrola-i-audyt-bhp')({
  head: () => ({
    meta: [
      { title: service.metaTitle },
      { name: 'description', content: service.metaDescription },
    ],
  }),
  component: KontrolaAudyt,
})

function KontrolaAudyt() {
  return <ServicePage service={service} />
}
