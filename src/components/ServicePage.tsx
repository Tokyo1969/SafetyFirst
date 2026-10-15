import { Link } from '@tanstack/react-router'
import { CheckList, ConsultationSection, PageHero, SectionHeading, Steps } from './blocks'
import type { Service, ServiceDetails } from '../data/services'
import { relatedServices, servicePath } from '../data/catalog'
import { heroImage } from '../lib/hero'

export function ServicePage({ service }: { service: Service }) {
  const others = relatedServices(service)
  const isOs = service.section === 'os'
  const hub = isOs
    ? { to: '/ochrona-srodowiska', label: 'Ochrona środowiska', cta: 'Wszystkie usługi środowiskowe' }
    : { to: '/obsluga-bhp', label: 'Stała obsługa BHP', cta: 'Stała obsługa BHP' }
  return (
    <main>
      <PageHero
        crumb={service.navLabel}
        parent={isOs ? { label: hub.label, to: hub.to } : undefined}
        title={service.title}
        lead={service.lead}
        image={heroImage(service.slug)}
      >
        <a href="#konsultacja" className="btn btn-glowny">Zapytaj o wycenę</a>
        <Link to={hub.to as '/'} className="btn btn-obrys">{hub.cta}</Link>
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

      {service.details && <Details details={service.details} />}

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
              <Link to={hub.to as '/'} className="flex h-full items-center justify-between gap-4 rounded-2xl bg-papier p-5 font-naglowek text-lg font-semibold hover:bg-znak-jasny">
                {hub.label}
                <Arrow />
              </Link>
            </li>
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  to={servicePath(s) as '/'}
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

function Details({ details }: { details: ServiceDetails }) {
  const [lead, ...rest] = details.intro
  return (
    <section className="sekcja bg-papier">
      <div className="kontener">
        <SectionHeading title={details.heading} lead={lead} />
        {rest.map((p) => (
          <p key={p} className="-mt-4 mb-10 max-w-[44rem] md:mb-12">{p}</p>
        ))}
        <ol className="grid gap-5 lg:grid-cols-3">
          {details.items.map((item) => (
            <li key={item.title} className="rounded-[var(--radius-panel)] border border-linia bg-white p-6 sm:p-7">
              <h3>{item.title}</h3>
              <dl className="mt-5 grid gap-4">
                <div>
                  <dt className="font-naglowek font-semibold">Dla kogo</dt>
                  <dd className="mt-1 text-tusz-2">{item.forWhom}</dd>
                </div>
                <div>
                  <dt className="font-naglowek font-semibold">Zakres usługi</dt>
                  <dd className="mt-1 text-tusz-2">{item.scope}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-[var(--radius-panel)] bg-znak-jasny p-6 sm:p-8">
          <h3>Dlaczego Safety First?</h3>
          <p className="mt-3 max-w-[52rem]">{details.why}</p>
        </div>
      </div>
    </section>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-znak" aria-hidden="true">
      <path d="M4 10h11m-4-4.5L15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
