import { createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero } from '../components/blocks'
import { site } from '../config/site'
import { breadcrumbLd, organizationLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/kontakt')({
  head: () =>
    pageHead({
      title: 'Kontakt – Safety First, BHP i ochrona środowiska, Opole',
      description: `Zadzwoń ${site.phone.display} albo napisz na ${site.emails.main}. Bezpłatna konsultacja BHP i ochrony środowiska dla firm z województwa opolskiego.`,
      path: '/kontakt',
      jsonLd: [
        organizationLd(),
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Kontakt', path: '/kontakt' },
        ]),
      ],
    }),
  component: Kontakt,
})

function Kontakt() {
  const c = site.company
  return (
    <main>
      <PageHero
        crumb="Kontakt"
        title="Porozmawiajmy o Twojej firmie"
        lead="Zadzwoń, napisz albo wypełnij formularz. Odpowiadamy w ciągu jednego dnia roboczego, a pierwsza konsultacja jest bezpłatna."
      />

      <section className="sekcja bg-papier">
        <div className="kontener grid gap-10 md:grid-cols-3 md:gap-12">
          <div>
            <h2 className="text-2xl">Telefon i e-mail</h2>
            <p className="mt-4">
              <a href={site.phone.href} className="font-naglowek text-2xl font-bold text-znak-ciemny hover:underline">
                {site.phone.display}
              </a>
            </p>
            <p className="mt-2">
              <a href={`mailto:${site.emails.main}`} className="link break-all">{site.emails.main}</a>
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Dane firmy</h2>
            <address className="mt-4 space-y-1 not-italic">
              <p>{c.name}</p>
              <p>{c.street}</p>
              <p>{c.postalCode} {c.city}</p>
              <p>NIP {c.nip}</p>
            </address>
          </div>
          <div>
            <h2 className="text-2xl">Obszar działania</h2>
            <p className="mt-4">
              Obsługujemy firmy z całego województwa opolskiego. Dojazd do 20 km od siedziby jest w cenie,
              dalej doliczamy 0,80 zł netto za kilometr.
            </p>
          </div>
        </div>
      </section>

      <ConsultationSection
        title="Napisz do nas"
        lead="Opisz krótko firmę i czego potrzebujesz. Wrócimy z propozycją zakresu i ceny."
      />
    </main>
  )
}
