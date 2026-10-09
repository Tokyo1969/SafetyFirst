import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'

const service = getService('dokumentacja-bhp')

export const Route = createFileRoute('/dokumentacja-bhp')({
  head: () => ({
    meta: [
      { title: service.metaTitle },
      { name: 'description', content: service.metaDescription },
    ],
  }),
  component: DokumentacjaBhp,
})

function DokumentacjaBhp() {
  return <ServicePage service={service} />
}
