import { createFileRoute } from '@tanstack/react-router'
import { PriceEstimator } from '../components/PriceEstimator'
import { ConsultationForm } from '../components/ConsultationForm'
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
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="max-w-[20ch] text-5xl md:text-6xl">Stała obsługa BHP dla firm do 50 pracowników</h1>
        <p className="mt-6 max-w-[60ch] text-xl">
          Jeden miesięczny abonament zamiast osobnych zleceń. Od {formatPln(PRICE_FROM)} zł netto miesięcznie.
        </p>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Co obejmuje abonament</h2>
        <dl className="mt-6 max-w-[70ch] divide-y divide-linia border-y border-linia">
          {SCOPE.map(([term, text]) => (
            <div key={term} className="grid gap-1 py-3 md:grid-cols-[14rem_1fr]">
              <dt className="font-naglowek text-xl font-semibold">{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Sprawdź cenę dla swojej firmy</h2>
        <div className="mt-6 max-w-3xl">
          <PriceEstimator />
        </div>
        <ul className="mt-6 max-w-[65ch] list-disc space-y-2 pl-6">
          <li>Dojazd do 20 km od Opola jest w abonamencie. Dalej doliczamy 0,80 zł netto za kilometr.</li>
          <li>Ceny są netto i orientacyjne, finalna wycena zależy od liczby stanowisk i ryzyk w firmie.</li>
        </ul>
      </section>

      <section id="konsultacja" className="mx-auto max-w-6xl scroll-mt-6 border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Umów bezpłatną konsultację</h2>
        <p className="mt-2 mb-8 max-w-[60ch]">Powiedz, czym zajmuje się firma, a wrócimy z konkretną ofertą.</p>
        <ConsultationForm defaultServices={['BHP']} />
      </section>
    </main>
  )
}
