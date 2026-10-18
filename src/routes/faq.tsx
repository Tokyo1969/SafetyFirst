import { Link, createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero, SectionHeading } from '../components/blocks'
import { FAQ_GROUPS } from '../data/faq'
import { breadcrumbLd, faqLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/faq')({
  head: () =>
    pageHead({
      title: 'Najczęstsze pytania o BHP i ochronę środowiska w firmie | Safety First',
      description:
        'Odpowiedzi na najczęstsze pytania firm: szkolenia i badania pracowników, ocena ryzyka, wypadki, odpady, BDO, ścieki i emisje. Krótko, od specjalisty.',
      path: '/faq',
      jsonLd: [
        faqLd(FAQ_GROUPS.flatMap((g) => g.items)),
        breadcrumbLd([
          { name: 'Strona główna', path: '/' },
          { name: 'Najczęstsze pytania', path: '/faq' },
        ]),
      ],
    }),
  component: Faq,
})

function Faq() {
  return (
    <main>
      <PageHero
        crumb="Najczęstsze pytania"
        title="Najczęstsze pytania o BHP i ochronę środowiska"
        lead="Krótkie odpowiedzi na pytania, które słyszymy od firm najczęściej. To ogólne informacje, a nie porada w Twojej sprawie. Jeśli potrzebujesz konkretów, umów bezpłatną konsultację."
      >
        <a href="#konsultacja" className="btn btn-glowny">Umów bezpłatną konsultację</a>
      </PageHero>

      {FAQ_GROUPS.map((group, i) => (
        <section key={group.id} id={group.id} className={`sekcja scroll-mt-20 ${i % 2 === 0 ? 'bg-papier' : 'bg-mgla'}`}>
          <div className="kontener max-w-4xl">
            <SectionHeading title={group.title} />
            <div className="space-y-3">
              {group.items.map((item) => (
                <details key={item.q} className="panel group border border-linia bg-papier p-5 open:shadow-md">
                  <summary className="cursor-pointer list-none font-naglowek text-lg font-semibold text-tusz marker:hidden">
                    {item.q}
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-tusz-2">{item.a}</p>
                  {item.to && (
                    <p className="mt-3">
                      <Link to={item.to as '/'} className="link font-semibold">Zobacz, jak pomagamy →</Link>
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      <ConsultationSection
        title="Nie znalazłeś odpowiedzi?"
        lead="Opisz swoją sytuację w kilku zdaniach. Odpowiemy w ciągu jednego dnia roboczego."
      />
    </main>
  )
}
