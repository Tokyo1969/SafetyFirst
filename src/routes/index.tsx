import { Link, createFileRoute } from '@tanstack/react-router'
import { ProtocolCard } from '../components/ProtocolCard'
import { CheckIcon, CheckList, ConsultationSection, SectionHeading, Steps } from '../components/blocks'
import { PRICE_FROM, formatPln } from '../data/pricing'
import { SERVICES } from '../data/services'
import { site } from '../config/site'
import photoUrl from '../assets/natalia-krysztofiak.jpg'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Safety First – obsługa BHP i ochrona środowiska dla firm' },
      {
        name: 'description',
        content: `Stała obsługa BHP od ${PRICE_FROM} zł netto miesięcznie, szkolenia i ochrona środowiska dla firm z Opolszczyzny. Wszystko w rękach jednego specjalisty.`,
      },
    ],
  }),
  component: Home,
})

const BHP = [
  'Szkolenia wstępne i okresowe',
  'Ocena ryzyka zawodowego',
  'Instrukcje stanowiskowe',
  'Kontrole stanowisk pracy',
  'Powypadkowe zespoły i dokumentacja',
]
const OS = [
  'Odpady i ewidencja BDO',
  'Opłaty środowiskowe',
  'Raporty KOBiZE',
  'Pozwolenia i zgłoszenia',
  'Audyty środowiskowe',
]
const STEPS = [
  'Rozmawiamy o Twojej firmie i stanowiskach pracy.',
  'Dostajesz wycenę i zakres obsługi na piśmie.',
  'Sprawdzamy dokumentację i stanowiska, robimy braki.',
  'Prowadzimy szkolenia i kontrole w ustalonym rytmie.',
  'Pilnujemy terminów, więc nie musisz o nich pamiętać.',
]

function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-znak-jasny/70 blur-3xl" />
        <div className="kontener relative grid items-center gap-14 pt-12 pb-16 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
          <div>
            <h1>BHP i ochrona środowiska dla firm z Opolszczyzny</h1>
            <p className="mt-6 max-w-[54ch] text-lg text-tusz-2 md:text-xl">
              Dokumentację, szkolenia, kontrole i raporty prowadzi jeden specjalista. Ty zajmujesz się firmą,
              a my pilnujemy przepisów i terminów.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#konsultacja" className="btn btn-glowny">Umów bezpłatną konsultację</a>
              <Link to="/obsluga-bhp" className="btn btn-obrys">Zobacz ceny obsługi BHP</Link>
            </div>
            <ul className="mt-10 flex flex-col gap-3 text-[0.9375rem] sm:flex-row sm:flex-wrap sm:gap-x-6">
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-5 shrink-0" />
                <span>Abonament od <strong>{formatPln(PRICE_FROM)} zł</strong> netto miesięcznie</span>
              </li>
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-5 shrink-0" />
                <span>Dojazd do 20 km od Opola w cenie</span>
              </li>
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-5 shrink-0" />
                <span>Dokumenty podpisuje jedna osoba</span>
              </li>
            </ul>
          </div>
          <ProtocolCard />
        </div>
      </section>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <SectionHeading
            title="W czym pomagamy"
            lead="Jedna osoba ogarnia oba obszary, więc nie musisz szukać osobnych firm do BHP i do spraw środowiskowych."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-panel)] border border-linia p-6 sm:p-8">
              <h3>BHP</h3>
              <div className="mt-6"><CheckList items={BHP} /></div>
              <div className="mt-8 border-t border-linia pt-6">
                <Link to="/obsluga-bhp" className="link">Zakres i ceny stałej obsługi BHP</Link>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SERVICES.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/${s.slug}` as '/'}
                        className="inline-block rounded-full bg-mgla px-4 py-2 text-[0.9375rem] font-medium hover:bg-znak-jasny hover:text-znak-ciemny"
                      >
                        {s.navLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-[var(--radius-panel)] bg-znak-jasny p-6 sm:p-8">
              <h3>Ochrona środowiska</h3>
              <div className="mt-6"><CheckList items={OS} /></div>
              <p className="mt-8 border-t border-znak/20 pt-6 text-tusz-2">
                Zapytaj o sprawy środowiskowe w formularzu konsultacji. Wycenę przygotujemy indywidualnie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener">
          <SectionHeading title="Jak wygląda współpraca" />
          <Steps steps={STEPS} />
        </div>
      </section>

      <section className="sekcja bg-papier">
        <div className="kontener grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div className="relative mx-auto w-full max-w-[18rem] md:mx-0 md:w-72">
            <img
              src={photoUrl}
              alt={`${site.person.name}, ${site.person.role}`}
              width={984}
              height={984}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover object-[50%_15%]"
            />
            <div aria-hidden="true" className="tasma absolute -bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 rotate-2 rounded-sm" />
          </div>
          <div>
            <h2>Kto się Tobą zajmie</h2>
            <p className="mt-5 max-w-[60ch] text-lg">
              Od 2022 roku koordynuję obsługę BHP i ochrony środowiska w firmach różnej wielkości. Wszystkie
              dokumenty podpisuję osobiście, więc wiesz, kto za nie odpowiada.
            </p>
            <p className="mt-5">
              <strong className="font-naglowek text-xl">{site.person.name}</strong>
              <span className="block text-tusz-2">{site.person.role}</span>
            </p>
          </div>
        </div>
      </section>

      <ConsultationSection
        title="Umów bezpłatną konsultację"
        lead="Opisz krótko firmę, a wrócimy z propozycją zakresu i ceny."
      />
    </main>
  )
}
