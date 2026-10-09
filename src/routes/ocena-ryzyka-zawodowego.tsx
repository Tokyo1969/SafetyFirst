import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'

const service = getService('ocena-ryzyka-zawodowego')

export const Route = createFileRoute('/ocena-ryzyka-zawodowego')({
  head: () => ({
    meta: [
      { title: service.metaTitle },
      { name: 'description', content: service.metaDescription },
    ],
  }),
  component: OcenaRyzyka,
})

function OcenaRyzyka() {
  return <ServicePage service={service} />
}
