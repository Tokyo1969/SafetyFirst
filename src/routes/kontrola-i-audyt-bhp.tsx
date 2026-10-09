import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'
import { serviceHead } from '../lib/seo'

const service = getService('kontrola-i-audyt-bhp')

export const Route = createFileRoute('/kontrola-i-audyt-bhp')({
  head: () => serviceHead(service, '/kontrola-i-audyt-bhp'),
  component: KontrolaAudyt,
})

function KontrolaAudyt() {
  return <ServicePage service={service} />
}
