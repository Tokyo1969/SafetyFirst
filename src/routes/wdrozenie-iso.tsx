import { createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero } from '../components/blocks'
import { ISO_14001, ISO_45001, type IsoBlok } from '../data/iso'
import { breadcrumbLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/wdrozenie-iso')({
  head: () =>
    pageHead({
      title: 'Wdrożenie ISO 45001 i ISO 14001 w firmie | Safety First',
      description:
        'Pomagamy we wdrożeniu systemu zarządzania BHP ISO 45001 i monitorujemy jego utrzymanie. Etapy wdrożenia, czas trwania, certyfikat i integracja z innymi normami.',
      path: '/wdrozenie-iso',
      jsonLd: [
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Wdrożenie ISO', path: '/wdrozenie-iso' },
        ]),
      ],
    }),
  component: WdrozenieIso,
})

function WdrozenieIso() {
  return (
    <main>
      <PageHero
        crumb="Wdrożenie ISO"
        title="Wdrożenie systemów zarządzania ISO"
        lead="Pomagamy firmom we wdrożeniu systemu zarządzania bezpieczeństwem i higieną pracy ISO 45001 oraz monitorujemy jego utrzymanie po certyfikacji."
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wdrożenie</a>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Blok blok={ISO_45001} />
          <Blok blok={ISO_14001} />
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o wdrożenie ISO"
        lead="Napisz, jak duża jest Twoja firma (liczba pracowników) i czy planujecie wdrożenie samodzielnie, czy z naszą pomocą. Wrócimy z propozycją zakresu."
        defaultServices={['Wdrożenie ISO']}
      />
    </main>
  )
}

function Blok({ blok }: { blok: IsoBlok }) {
  return (
    <div id={blok.id} className="scroll-mt-20">
      <h2>{blok.heading}</h2>
      {!blok.gotowe ? (
        <p className="mt-6 rounded-[var(--radius-panel)] border border-znak/30 bg-znak-jasny px-5 py-4 text-znak-ciemny">
          Opis etapów wdrożenia przygotowujemy. Napisz w formularzu na dole strony, jeśli to Cię interesuje.
        </p>
      ) : (
        <>
          {blok.intro && <p className="mt-4 text-tusz-2">{blok.intro}</p>}
          <ol className="mt-6 grid gap-5">
            {blok.etapy.map((e, i) => (
              <li key={e.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tusz font-naglowek font-bold text-tasma">
                  {i + 1}
                </span>
                <p>
                  <strong className="font-naglowek">{e.title}.</strong> {e.text}
                </p>
              </li>
            ))}
          </ol>

          <h3 className="mt-10">Kluczowe informacje o normie</h3>
          <dl className="mt-4 divide-y divide-linia overflow-hidden rounded-[var(--radius-panel)] border border-linia bg-white">
            {blok.kluczowe.map((k) => (
              <div key={k.title} className="px-5 py-4">
                <dt className="font-naglowek font-semibold">{k.title}</dt>
                <dd className="mt-1 text-tusz-2">{k.text}</dd>
              </div>
            ))}
          </dl>

          {blok.zrodla && (
            <p className="mt-6 text-[0.9375rem] text-tusz-2">
              Szczegółowy opis wymagań i struktury standardu znajdziesz na stronach:{' '}
              {blok.zrodla.map((z, i) => (
                <span key={z.href}>
                  {i > 0 && ' oraz '}
                  <a href={z.href} className="link" target="_blank" rel="noopener noreferrer">
                    {z.label}
                  </a>
                </span>
              ))}
              .
            </p>
          )}
        </>
      )}
    </div>
  )
}
