import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('konsultacje-bhp')

export const Route = createFileRoute('/konsultacje-bhp')({
  head: () => serviceHead(service, '/konsultacje-bhp'),
  component: KonsultacjeBhp,
})

function KonsultacjeBhp() {
  return <ServicePage service={service} />
}
