import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('dokumentacja-bhp')

export const Route = createFileRoute('/dokumentacja-bhp')({
  head: () => serviceHead(service, '/dokumentacja-bhp'),
  component: DokumentacjaBhp,
})

function DokumentacjaBhp() {
  return <ServicePage service={service} />
}
