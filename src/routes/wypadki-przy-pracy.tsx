import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('wypadki-przy-pracy')

export const Route = createFileRoute('/wypadki-przy-pracy')({
  head: () => serviceHead(service, '/wypadki-przy-pracy'),
  component: WypadkiPrzyPracy,
})

function WypadkiPrzyPracy() {
  return <ServicePage service={service} />
}
