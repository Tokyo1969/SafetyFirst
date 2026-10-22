import { Link, createFileRoute } from '@tanstack/react-router'
import { ConsultationSection, PageHero, SectionHeading } from '../components/blocks'
import { FAQ_AS_OF, FAQ_DISCLAIMER, FAQ_GROUPS } from '../data/faq'
import { breadcrumbLd, faqLd, pageHead } from '../lib/seo'

export const Route = createFileRoute('/faq')({
  head: () =>
    pageHead({
      title: 'Najczęstsze pytania o BHP i ochronę środowiska w firmie | Safety First',
      description:
        'Odpowiedzi na najczęstsze pytania firm: szkolenia i badania pracowników, ocena ryzyka, wypadki, odpady, BDO, ścieki i emisje, z podstawą prawną i możliwymi konsekwencjami.',
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
        lead="Krótkie odpowiedzi na pytania, które słyszymy od firm najczęściej, z podstawą prawną i możliwymi konsekwencjami. To ogólne informacje, a nie porada w Twojej sprawie. Jeśli potrzebujesz konkretów, umów bezpłatną konsultację."
      >
        <a href="#konsultacja" className="btn btn-glowny">Umów bezpłatną konsultację</a>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener max-w-4xl">
          <p className="text-tusz-2">
            <strong>Stan prawny na {FAQ_AS_OF}</strong> {FAQ_DISCLAIMER}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {FAQ_GROUPS.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-block rounded-full bg-mgla px-4 py-2 text-[0.9375rem] font-medium hover:bg-znak-jasny hover:text-znak-ciemny"
                >
                  {g.title} ({g.items.length})
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {FAQ_GROUPS.map((group, i) => (
        <section key={group.id} id={group.id} className={`sekcja scroll-mt-20 ${i % 2 === 0 ? 'bg-mgla' : 'bg-papier'}`}>
          <div className="kontener max-w-4xl">
            <SectionHeading title={group.title} />
            <div className="space-y-3">
              {group.items.map((item) => (
                <details key={item.q} className="panel group border border-linia bg-papier p-5 open:shadow-md">
                  <summary className="cursor-pointer list-none font-naglowek text-lg font-semibold text-tusz marker:hidden">
                    {item.q}
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-tusz-2">{item.a}</p>
                  <dl className="mt-4 max-w-[62ch] space-y-3 border-t border-linia pt-4 text-[0.9375rem]">
                    <div>
                      <dt className="font-semibold text-tusz">Podstawa prawna</dt>
                      <dd className="mt-1 text-tusz-2">{item.basis}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-tusz">Możliwe konsekwencje niezgodności</dt>
                      <dd className="mt-1 text-tusz-2">{item.consequences}</dd>
                    </div>
                  </dl>
                  {item.to && (
                    <p className="mt-4">
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
