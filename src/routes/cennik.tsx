import { heroImage } from '../lib/hero'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero, SectionHeading } from '../components/blocks'
import { BANDS, INDUSTRIES, ONE_OFF, PRICE_FROM, formatPln } from '../data/pricing'
import { getService } from '../data/services'
import { breadcrumbLd, pageHead } from '../lib/seo'

const TRAINING = getService('szkolenia-bhp')

export const Route = createFileRoute('/cennik')({
  head: () =>
    pageHead({
      title: 'Cennik usług BHP – abonament, szkolenia, usługi jednorazowe | Safety First',
      description: `Cennik BHP dla firm do 50 pracowników: abonament od ${PRICE_FROM} zł netto miesięcznie, szkolenia od 60 zł za osobę, audyt BHP od 550 zł. Ceny netto, orientacyjne.`,
      path: '/cennik',
      jsonLd: [
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Cennik', path: '/cennik' },
        ]),
      ],
    }),
  component: Cennik,
})

function Cennik() {
  return (
    <main>
      <PageHero
        image={heroImage('cennik')}
        crumb="Cennik"
        title="Cennik usług BHP"
        lead="Ceny są netto, w formule „od” i orientacyjne. Finalną wycenę podajemy po krótkiej rozmowie o Twojej firmie."
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wycenę</a>
        <Link to="/obsluga-bhp" className="btn btn-obrys">Sprawdź cenę abonamentu</Link>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <SectionHeading
            title="Stała obsługa BHP"
            lead="Miesięczny abonament dla firm do 50 pracowników. Cena zależy od branży i liczby osób."
          />
          <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-linia bg-white">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Abonament BHP: cena miesięczna netto według branży i liczby osób</caption>
              <thead>
                <tr className="border-b border-linia bg-mgla font-naglowek text-sm">
                  <th scope="col" className="px-4 py-3 font-semibold">Branża</th>
                  {BANDS.map((b) => (
                    <th key={b} scope="col" className="px-3 py-3 text-right font-semibold whitespace-nowrap">{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDUSTRIES.map((i) => (
                  <tr key={i.id} className="border-b border-linia last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium">{i.name}</th>
                    {i.prices.map((p, k) => (
                      <td key={k} className="px-3 py-3 text-right whitespace-nowrap">{formatPln(p)} zł</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-tusz-2">
            Ceny za miesiąc, netto. Przy kilku jednocześnie prowadzonych budowach lub stałym nadzorze BHP
            przygotowujemy indywidualną ofertę.{' '}
            <Link to="/obsluga-bhp" className="link">Zakres abonamentu i kalkulator</Link>
          </p>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2>Szkolenia BHP</h2>
            <dl className="mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-linia">
              {TRAINING.prices.map((p, i) => (
                <div key={p.name} className={`grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6 ${i % 2 ? 'bg-mgla/60' : ''}`}>
                  <dt>{p.name}</dt>
                  <dd className="font-naglowek text-lg font-bold whitespace-nowrap text-znak-ciemny">{p.price}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9375rem] text-tusz-2">{TRAINING.priceNote}</p>
            <p className="mt-3"><Link to="/szkolenia-bhp" className="link">Rodzaje szkoleń</Link></p>
          </div>
          <div>
            <h2>Usługi jednorazowe</h2>
            <dl className="mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-linia">
              {ONE_OFF.map((o, i) => (
                <div key={o.name} className={`grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6 ${i % 2 ? 'bg-mgla/60' : ''}`}>
                  <dt>
                    <Link to={`/${o.slug}` as '/'} className="hover:text-znak hover:underline">{o.name}</Link>
                  </dt>
                  <dd className="font-naglowek text-lg font-bold whitespace-nowrap text-znak-ciemny">{o.price}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9375rem] text-tusz-2">Dla firm bez stałej obsługi BHP.</p>
          </div>
        </div>
      </section>

      <section className="sekcja bg-papier">
        <div className="kontener grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2>Dojazd</h2>
            <p className="mt-4 text-lg">
              Obsługujemy firmy z całego województwa opolskiego. Dojazd do 20 km od siedziby jest wliczony w cenę,
              dalej doliczamy 0,80 zł netto za kilometr. Stałym klientom możemy ustalić indywidualną stawkę
              obejmującą dojazdy.
            </p>
          </div>
          <div>
            <h2>Ochrona środowiska</h2>
            <p className="mt-4 text-lg">
              Przy usługach środowiskowych cenę ustalamy po rozmowie o firmie. Orientacyjne ceny „od” są na
              stronach poszczególnych usług.
            </p>
            <p className="mt-4"><Link to="/ochrona-srodowiska" className="link">Zobacz usługi środowiskowe</Link></p>
          </div>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener">
          <p className="max-w-[70ch] text-tusz-2">
            Podane ceny są cenami netto i mają charakter orientacyjny. Ostateczna cena obsługi jest ustalana
            indywidualnie na podstawie zakresu usług, specyfiki przedsiębiorstwa oraz liczby lokalizacji.
            Abonamenty dotyczą przedsiębiorstw zatrudniających do 50 pracowników. Usługi wykraczające poza
            uzgodniony zakres obsługi są rozliczane odrębnie.
          </p>
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o wycenę"
        lead="Napisz, czym zajmuje się firma i ile osób zatrudnia. Wrócimy z konkretną ofertą."
      />
    </main>
  )
}
