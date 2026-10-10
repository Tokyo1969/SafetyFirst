import { heroImage } from '../lib/hero'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero, SectionHeading, Steps } from '../components/blocks'
import { OS_GROUPS, OS_SERVICES } from '../data/os-services'
import { servicePath } from '../data/catalog'
import { breadcrumbLd, pageHead } from '../lib/seo'

const TITLE = 'Ochrona środowiska dla firm – odpady, BDO, KOBiZE, opłaty | Safety First'
const DESCRIPTION =
  'Obsługa ochrony środowiska dla firm z Opolszczyzny: gospodarka odpadami, BDO, raporty KOBiZE, opłaty środowiskowe, woda i ścieki, kontrole WIOŚ. Wycena po rozmowie.'

export const Route = createFileRoute('/ochrona-srodowiska/')({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: '/ochrona-srodowiska',
      jsonLd: [
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Ochrona środowiska', path: '/ochrona-srodowiska' },
        ]),
      ],
    }),
  component: OchronaSrodowiska,
})

const STEPS = [
  'Rozmawiamy o firmie i o tym, co w niej powstaje: odpady, emisje, ścieki, opakowania.',
  'Ustalamy, jakie obowiązki środowiskowe Cię dotyczą.',
  'Przedstawiamy zakres i cenę na piśmie.',
  'Prowadzimy dokumenty i pilnujemy terminów.',
]

function OchronaSrodowiska() {
  return (
    <main>
      <PageHero
        image={heroImage('ochrona-srodowiska')}
        crumb="Ochrona środowiska"
        title="Ochrona środowiska dla firm z Opolszczyzny"
        lead="Odpady, BDO, raporty, opłaty i kontrole. Obowiązki środowiskowe firmy prowadzi jedna osoba, więc dokumenty są kompletne, a terminy pod kontrolą."
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wycenę</a>
        <Link to="/obsluga-bhp" className="btn btn-obrys">Stała obsługa BHP</Link>
      </PageHero>

      {OS_GROUPS.map((group, i) => (
        <section key={group} className={`sekcja ${i % 2 === 0 ? 'bg-papier' : ''}`}>
          <div className="kontener">
            <h2>{group}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OS_SERVICES.filter((s) => s.group === group).map((s) => (
                <li key={s.slug}>
                  <Link
                    to={servicePath(s) as '/'}
                    className="group flex h-full flex-col justify-between gap-4 rounded-[var(--radius-panel)] border border-linia bg-white p-6 hover:border-znak hover:bg-znak-jasny"
                  >
                    <span>
                      <span className="block font-naglowek text-xl font-semibold">{s.navLabel}</span>
                      <span className="mt-2 block text-tusz-2">{s.summary}</span>
                    </span>
                    <span className="link self-start text-[0.9375rem]">Zakres i ceny</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="sekcja">
        <div className="kontener">
          <SectionHeading
            title="Jak wygląda współpraca"
            lead="Ceny na podstronach są netto, w formule „od” i orientacyjne. Finalną wycenę ustalamy po rozmowie o firmie."
          />
          <Steps steps={STEPS} />
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o ochronę środowiska"
        lead="Napisz, czym zajmuje się firma i jakie odpady lub emisje u Was powstają. Wrócimy z propozycją zakresu i ceny."
        defaultServices={['Ochrona środowiska']}
      />
    </main>
  )
}
