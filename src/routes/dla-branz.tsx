import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckList, ConsultationSection, PageHero, SectionHeading } from '../components/blocks'
import { INDUSTRIES, PRICE_FROM, formatPln } from '../data/pricing'
import { breadcrumbLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/dla-branz')({
  head: () =>
    pageHead({
      title: 'Obsługa BHP dla branż: biura, gastronomia, produkcja, budownictwo | Safety First',
      description: `Stała obsługa BHP dopasowana do branży i liczby pracowników. Abonament od ${PRICE_FROM} zł netto miesięcznie. Biura, handel, gastronomia, transport, warsztaty, produkcja, budownictwo.`,
      path: '/dla-branz',
      jsonLd: [
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Dla branż', path: '/dla-branz' },
        ]),
      ],
    }),
  component: DlaBranz,
})

const FACTORS = [
  'liczba zatrudnionych osób',
  'rodzaj wykonywanej pracy',
  'liczba stanowisk',
  'poziom występujących zagrożeń',
  'liczba lokalizacji',
  'wymagana częstotliwość wizyt',
]

function DlaBranz() {
  return (
    <main>
      <PageHero
        crumb="Dla branż"
        title="Obsługa BHP dopasowana do branży"
        lead="Innych rozwiązań potrzebuje biuro rachunkowe, innych warsztat, a jeszcze innych firma budowlana. Wybierz swoją branżę i sprawdź, ile kosztuje stała obsługa."
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wycenę</a>
        <Link to="/cennik" className="btn btn-obrys">Cały cennik</Link>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <SectionHeading
            title="Wybierz swoją branżę"
            lead="Ceny abonamentu są netto, za miesiąc, dla firm do 50 pracowników."
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i) => (
              <li key={i.id}>
                <Link
                  to="/obsluga-bhp"
                  search={{ branza: i.id }}
                  hash="cena"
                  className="flex h-full flex-col justify-between gap-5 rounded-[var(--radius-panel)] border border-linia bg-white p-6 hover:border-znak hover:bg-znak-jasny"
                >
                  <span>
                    <span className="block font-naglowek text-xl font-semibold">{i.name}</span>
                    {i.note && <span className="mt-2 block text-[0.9375rem] text-tusz-2">{i.note}</span>}
                  </span>
                  <span>
                    <span className="block text-tusz-2">1–5 osób</span>
                    <span className="block font-naglowek text-2xl font-bold text-znak-ciemny">
                      od {formatPln(i.prices[0])} zł <span className="text-base font-semibold text-tusz">netto / mies.</span>
                    </span>
                    <span className="link mt-2 inline-block text-[0.9375rem]">Sprawdź cenę dla swojej firmy</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2>Od czego zależy cena</h2>
            <p className="mt-4 text-lg text-tusz-2">
              Każda firma jest inna, dlatego wysokość abonamentu ustalamy na podstawie:
            </p>
            <div className="mt-6"><CheckList items={FACTORS} /></div>
          </div>
          <div>
            <h2>Nie ma Twojej branży?</h2>
            <p className="mt-4 text-lg text-tusz-2">
              Opisz w formularzu, czym zajmuje się firma. Obsługujemy przedsiębiorstwa od jednoosobowych po
              zatrudniające do 50 pracowników i przygotujemy ofertę dopasowaną do Twojej działalności. Przy
              kilku lokalizacjach przygotowujemy indywidualny model obsługi.
            </p>
            <p className="mt-6"><Link to="/obsluga-bhp" className="link">Zakres stałej obsługi BHP</Link></p>
          </div>
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o wycenę"
        lead="Napisz, czym zajmuje się firma i ile osób zatrudnia. Wrócimy z konkretną ofertą."
        defaultServices={['BHP']}
      />
    </main>
  )
}
