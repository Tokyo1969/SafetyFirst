import { createFileRoute } from '@tanstack/react-router'
import { PriceEstimator } from '../components/PriceEstimator'
import { CheckIcon, ConsultationSection, PageHero, SectionHeading } from '../components/blocks'
import { PRICE_FROM, formatPln } from '../data/pricing'

export const Route = createFileRoute('/obsluga-bhp')({
  head: () => ({
    meta: [
      { title: 'Stała obsługa BHP dla firm do 50 pracowników – Safety First, Opole' },
      {
        name: 'description',
        content: `Abonament BHP od ${PRICE_FROM} zł netto miesięcznie: szkolenia, dokumentacja, ocena ryzyka i kontrole stanowisk. Sprawdź cenę dla swojej branży.`,
      },
    ],
  }),
  component: ObslugaBhp,
})

const SCOPE: [string, string][] = [
  ['Bieżące doradztwo', 'Pomagamy przy organizacji stanowisk, zatrudnianiu nowych osób, zmianach w firmie i doborze środków ochrony.'],
  ['Dokumentacja BHP', 'Przygotowujemy, porządkujemy i aktualizujemy dokumentację odpowiednią do działalności firmy.'],
  ['Kontrole warunków pracy', 'Podczas wizyt sprawdzamy rzeczywiste warunki pracy i wskazujemy, co poprawić.'],
  ['Ocena ryzyka', 'Identyfikujemy zagrożenia na stanowiskach i określamy działania profilaktyczne.'],
  ['Szkolenia', 'Organizujemy i prowadzimy szkolenia BHP odpowiednie do stanowisk pracowników.'],
  ['Wsparcie powypadkowe', 'Pomagamy w prawidłowym postępowaniu po wypadku i przy dokumentacji.'],
  ['Kontrole organów nadzoru', 'Wspieramy pracodawcę w przygotowaniu do kontroli dotyczących BHP.'],
]

function ObslugaBhp() {
  return (
    <main>
      <PageHero
        crumb="Obsługa BHP"
        title="Stała obsługa BHP dla firm do 50 pracowników"
        lead={`Jeden miesięczny abonament zamiast osobnych zleceń. Od ${formatPln(PRICE_FROM)} zł netto miesięcznie.`}
      >
        <a href="#cena" className="btn btn-glowny">Sprawdź cenę dla swojej firmy</a>
        <a href="#konsultacja" className="btn btn-obrys">Umów konsultację</a>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <SectionHeading title="Co obejmuje abonament" />
          <dl className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            {SCOPE.map(([term, text]) => (
              <div key={term} className="flex gap-4">
                <CheckIcon className="mt-0.5 size-7 shrink-0" />
                <div>
                  <dt className="font-naglowek text-xl font-semibold">{term}</dt>
                  <dd className="mt-1 text-tusz-2">{text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="cena" className="sekcja scroll-mt-20">
        <div className="kontener">
          <SectionHeading title="Sprawdź cenę dla swojej firmy" />
          <PriceEstimator />
          <ul className="mt-8 grid gap-3 text-tusz-2 md:grid-cols-2 md:gap-8">
            <li>Dojazd do 20 km od Opola jest w abonamencie. Dalej doliczamy 0,80 zł netto za kilometr.</li>
            <li>Ceny są netto i orientacyjne, finalna wycena zależy od liczby stanowisk i ryzyk w firmie.</li>
          </ul>
        </div>
      </section>

      <ConsultationSection
        title="Umów bezpłatną konsultację"
        lead="Powiedz, czym zajmuje się firma, a wrócimy z konkretną ofertą."
        defaultServices={['BHP']}
      />
    </main>
  )
}
