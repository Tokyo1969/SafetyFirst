import { Link } from '@tanstack/react-router'
import { CheckList, ConsultationSection, PageHero, SectionHeading, Steps } from './blocks'
import { SERVICES, type Service } from '../data/services'

export function ServicePage({ service }: { service: Service }) {
  const others = SERVICES.filter((s) => s.slug !== service.slug)
  return (
    <main>
      <PageHero crumb={service.navLabel} title={service.title} lead={service.lead}>
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wycenę</a>
        <Link to="/obsluga-bhp" className="btn btn-obrys">Stała obsługa BHP</Link>
      </PageHero>

      <section className="sekcja bg-papier">
        <div className="kontener grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2>{service.scopeHeading}</h2>
            <div className="mt-8"><CheckList items={service.scope} /></div>
          </div>
          <div>
            <h2>Cennik</h2>
            <dl className="mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-linia">
              {service.prices.map((p, i) => (
                <div
                  key={p.name}
                  className={`grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6 ${i % 2 ? 'bg-mgla/60' : ''}`}
                >
                  <dt>{p.name}</dt>
                  <dd className="font-naglowek text-lg font-bold whitespace-nowrap text-znak-ciemny">{p.price}</dd>
                </div>
              ))}
            </dl>
            {service.priceNote && <p className="mt-4 text-[0.9375rem] text-tusz-2">{service.priceNote}</p>}
          </div>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener">
          <SectionHeading title="Jak to wygląda" />
          <Steps steps={service.steps} />
        </div>
      </section>

      <ConsultationSection
        title="Zapytaj o wycenę"
        lead="Napisz, czym zajmuje się firma i ile osób zatrudnia. Wrócimy z konkretną ofertą."
        defaultServices={[...service.formServices]}
      />

      <section className="sekcja">
        <div className="kontener">
          <h2>Zobacz też</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li>
              <Link to="/obsluga-bhp" className="flex h-full items-center justify-between gap-4 rounded-2xl bg-papier p-5 font-naglowek text-lg font-semibold hover:bg-znak-jasny">
                Stała obsługa BHP
                <Arrow />
              </Link>
            </li>
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/${s.slug}` as '/'}
                  className="flex h-full items-center justify-between gap-4 rounded-2xl bg-papier p-5 font-naglowek text-lg font-semibold hover:bg-znak-jasny"
                >
                  {s.navLabel}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-znak" aria-hidden="true">
      <path d="M4 10h11m-4-4.5L15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
