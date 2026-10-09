import { createFileRoute } from '@tanstack/react-router'
import { ServicePage } from '../components/ServicePage'
import { getService } from '../data/services'

const service = getService('szkolenia-bhp')

export const Route = createFileRoute('/szkolenia-bhp')({
  head: () => ({
    meta: [
      { title: service.metaTitle },
      { name: 'description', content: service.metaDescription },
    ],
  }),
  component: SzkoleniaBhp,
})

function SzkoleniaBhp() {
  return <ServicePage service={service} />
}
