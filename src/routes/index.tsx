import { Link, createFileRoute } from '@tanstack/react-router'
import { ProtocolCard } from '../components/ProtocolCard'
import { ConsultationForm } from '../components/ConsultationForm'
import { PRICE_FROM, formatPln } from '../data/pricing'
import { SERVICES } from '../data/services'
import { site } from '../config/site'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Safety First – obsługa BHP i ochrona środowiska dla małych firm, Opole' },
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
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <h1 className="text-5xl md:text-6xl">BHP i ochrona środowiska dla małych firm z Opolszczyzny</h1>
          <p className="mt-6 max-w-[60ch] text-xl">
            Dokumentację, szkolenia, kontrole i raporty prowadzi jeden specjalista. Ty zajmujesz się firmą,
            a my pilnujemy przepisów i terminów.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 font-naglowek text-xl font-semibold">
            <a href="#konsultacja" className="bg-znak px-6 py-3 text-white hover:bg-znak-ciemny">
              Umów bezpłatną konsultację
            </a>
            <Link to="/obsluga-bhp" className="border-2 border-tusz px-6 py-3 text-tusz hover:bg-tusz hover:text-papier">
              Zobacz ceny obsługi BHP
            </Link>
          </div>
          <p className="mt-6 font-naglowek text-xl font-semibold text-tusz-2">
            Abonament BHP od {formatPln(PRICE_FROM)} zł netto miesięcznie
          </p>
        </div>
        <ProtocolCard />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 border-t-2 border-tusz px-5 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">BHP</h2>
          <ul className="mt-4 divide-y divide-linia border-y border-linia">
            {BHP.map((x) => <li key={x} className="py-2">{x}</li>)}
          </ul>
          <p className="mt-4"><Link to="/obsluga-bhp" className="font-semibold text-znak underline">Zakres i ceny obsługi BHP</Link></p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to={`/${s.slug}` as '/'} className="font-semibold text-znak underline">{s.navLabel}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl">Ochrona środowiska</h2>
          <ul className="mt-4 divide-y divide-linia border-y border-linia">
            {OS.map((x) => <li key={x} className="py-2">{x}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Jak wygląda współpraca</h2>
        <ol className="mt-6 max-w-[65ch] list-decimal space-y-3 pl-6 marker:font-naglowek marker:font-bold">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Kto się Tobą zajmie</h2>
        <p className="mt-4 max-w-[65ch]">
          Od 2022 roku koordynuję obsługę BHP i ochrony środowiska w firmach różnej wielkości. Wszystkie
          dokumenty podpisuję osobiście, więc wiesz, kto za nie odpowiada. Nazywam się {site.person.name},
          jestem {site.person.role}.
        </p>
      </section>

      <section id="konsultacja" className="mx-auto max-w-6xl scroll-mt-6 border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Umów bezpłatną konsultację</h2>
        <p className="mt-2 mb-8 max-w-[60ch]">Opisz krótko firmę, a wrócimy z propozycją zakresu i ceny.</p>
        <ConsultationForm />
      </section>
    </main>
  )
}
