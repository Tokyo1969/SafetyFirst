import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('pakiety-dokumentacji-bhp')

export const Route = createFileRoute('/pakiety-dokumentacji-bhp')({
  head: () => serviceHead(service, '/pakiety-dokumentacji-bhp'),
  component: PakietyDokumentacji,
})

function PakietyDokumentacji() {
  return <ServicePage service={service} />
}
