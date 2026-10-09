import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('ocena-ryzyka-zawodowego')

export const Route = createFileRoute('/ocena-ryzyka-zawodowego')({
  head: () => serviceHead(service, '/ocena-ryzyka-zawodowego'),
  component: OcenaRyzyka,
})

function OcenaRyzyka() {
  return <ServicePage service={service} />
}
