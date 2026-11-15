import { Link, createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero } from '../components/blocks'
import { ISO_NORMY, type IsoNorma } from '../data/iso'
import { breadcrumbLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/wdrozenie-iso/')({
  head: () =>
    pageHead({
      title: 'Wdrożenie ISO 9001, ISO 14001 i ISO 45001 – pomoc i certyfikacja | Safety First',
      description:
        'Pomagamy we wdrożeniu systemów zarządzania ISO 9001 (jakość), ISO 14001 (środowisko) i ISO 45001 (BHP) i monitorujemy ich utrzymanie. Opis norm, droga do certyfikatu i wniosek o certyfikację online.',
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
        lead="Pomagamy firmom we wdrożeniu systemów zarządzania: jakością (ISO 9001), środowiskowego (ISO 14001) oraz bezpieczeństwem i higieną pracy (ISO 45001). Po certyfikacji monitorujemy ich utrzymanie."
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wdrożenie</a>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <ul className="grid gap-6">
            {ISO_NORMY.map((n) => (
              <li key={n.slug}>
                <NormaBlok norma={n} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o wdrożenie ISO"
        lead="Napisz, w jakiej branży działa firma (np. produkcja, budownictwo, usługi), ile ma pracowników, czy macie już inne normy (np. ISO 9001 lub ISO 14001) i czy planujecie wdrożenie samodzielnie, czy z pomocą konsultanta. Pomożemy dopasować plan działania do Twoich potrzeb."
        defaultServices={['ISO']}
      />
    </main>
  )
}

// Jeden pionowy blok normy: kod normy po lewej, krotki opis i link do podstrony po prawej.
function NormaBlok({ norma }: { norma: IsoNorma }) {
  const numer = norma.code.replace('ISO ', '')
  return (
    <article
      id={norma.slug}
      className="panel scroll-mt-20 grid overflow-hidden border border-linia bg-white md:grid-cols-[15rem_1fr]"
    >
      <div className="flex flex-col justify-center bg-tusz px-8 py-7 text-papier">
        <p className="font-naglowek text-lg font-semibold text-papier/80">ISO</p>
        <p className="font-naglowek text-5xl leading-none font-bold text-tasma">{numer}</p>
        <p className="mt-3 text-[0.9375rem] text-papier/80">{norma.area}</p>
      </div>
      <div className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <h2 className="text-2xl">{norma.listTitle}</h2>
        <p className="max-w-[62ch] text-tusz-2">{norma.listText}</p>
        <Link
          to="/wdrozenie-iso/$norma"
          params={{ norma: norma.slug }}
          className="btn btn-zielony"
          aria-label={`Dowiedz się więcej o ${norma.code} i złóż wniosek`}
        >
          Dowiedz się więcej i złóż wniosek
        </Link>
      </div>
    </article>
  )
}
