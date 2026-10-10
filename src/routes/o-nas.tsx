import { heroImage } from '../lib/hero'
import { createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero, SectionHeading, Steps } from '../components/blocks'
import { site } from '../config/site'
import { breadcrumbLd, organizationLd, pageHead } from '../lib/seo'
import photoUrl from '../assets/natalia-krysztofiak.jpg'

export const Route = createFileRoute('/o-nas')({
  head: () =>
    pageHead({
      title: 'O nas – Natalia Krysztofiak, BHP i ochrona środowiska | Safety First, Opole',
      description:
        'Safety First to obsługa BHP i ochrony środowiska dla firm z województwa opolskiego. Za dokumenty i kontrole odpowiada jedna osoba: Natalia Krysztofiak.',
      path: '/o-nas',
      jsonLd: [
        organizationLd(),
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'O nas', path: '/o-nas' },
        ]),
      ],
    }),
  component: ONas,
})

const WHY: [string, string][] = [
  ['Oszczędność czasu', 'Skupiasz się na prowadzeniu firmy, a kwestie BHP pozostają pod bieżącym nadzorem specjalisty.'],
  ['Przejrzyste koszty', 'Stały abonament pozwala przewidzieć koszty obsługi BHP.'],
  ['Praktyczne podejście', 'Nie ograniczamy się do dokumentacji. Zwracamy uwagę na rzeczywiste warunki wykonywania pracy.'],
  ['Indywidualne podejście', 'Zakres obsługi dopasowujemy do branży, liczby pracowników i poziomu zagrożeń.'],
  ['Bieżące wsparcie', 'Możesz skonsultować problem z BHP bez każdorazowego zamawiania osobnej usługi.'],
]

const STANDARD = [
  'Poznajemy firmę. Analizujemy działalność, stanowiska pracy i występujące zagrożenia.',
  'Porządkujemy BHP. Sprawdzamy dokumentację i wskazujemy obszary do uporządkowania.',
  'Ustalamy harmonogram. Określamy częstotliwość wizyt, kontroli i aktualizacji dokumentacji.',
  'Zapewniamy bieżące wsparcie. Możesz konsultować na bieżąco problemy z BHP.',
  'Monitorujemy terminy. Pomagamy pilnować terminów szkoleń, badań i wymaganych działań.',
]

function ONas() {
  return (
    <main>
      <PageHero
        image={heroImage('o-nas')}
        crumb="O nas"
        title="Za Twoje dokumenty odpowiada jedna osoba"
        lead={`Safety First to marka usług BHP i ochrony środowiska dla firm z Opolszczyzny. Wszystkie dokumenty podpisuje ${site.person.name}.`}
      >
        <a href="#konsultacja" className="btn btn-glowny">Umów bezpłatną konsultację</a>
      </PageHero>

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

      <section className="sekcja">
        <div className="kontener">
          <SectionHeading title="Dlaczego warto powierzyć nam BHP" />
          <dl className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            {WHY.map(([term, text]) => (
              <div key={term}>
                <dt className="font-naglowek text-xl font-semibold">{term}</dt>
                <dd className="mt-1 text-tusz-2">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="sekcja bg-papier">
        <div className="kontener">
          <SectionHeading title="Standard naszej współpracy" />
          <Steps steps={STANDARD} />
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener">
          <h2>Gdzie działamy</h2>
          <p className="mt-4 max-w-[62ch] text-lg">
            Obsługujemy firmy z całego województwa opolskiego, do 50 pracowników. Dojazd do 20 km od siedziby jest
            w cenie abonamentu, dalej doliczamy 0,80 zł netto za kilometr.
          </p>
        </div>
      </section>

      <ConsultationSection
        title="Umów bezpłatną konsultację"
        lead="Opisz krótko firmę, a wrócimy z propozycją zakresu i ceny."
      />
    </main>
  )
}
