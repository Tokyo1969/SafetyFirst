import { Link } from '@tanstack/react-router'
import { ConsultationForm } from './ConsultationForm'
import { SERVICES, type Service } from '../data/services'

export function ServicePage({ service }: { service: Service }) {
  const others = SERVICES.filter((s) => s.slug !== service.slug)
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="max-w-[22ch] text-5xl md:text-6xl">{service.title}</h1>
        <p className="mt-6 max-w-[60ch] text-xl">{service.lead}</p>
        <div className="mt-8 flex flex-wrap gap-4 font-naglowek text-xl font-semibold">
          <a href="#konsultacja" className="bg-znak px-6 py-3 text-white hover:bg-znak-ciemny">
            Zapytaj o wycenę
          </a>
          <Link to="/obsluga-bhp" className="border-2 border-tusz px-6 py-3 text-tusz hover:bg-tusz hover:text-papier">
            Stała obsługa BHP
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">{service.scopeHeading}</h2>
        <ul className="mt-6 max-w-[70ch] divide-y divide-linia border-y border-linia">
          {service.scope.map((item) => (
            <li key={item} className="py-3">{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Cennik</h2>
        <dl className="mt-6 max-w-[70ch] divide-y divide-linia border-y border-linia">
          {service.prices.map((p) => (
            <div key={p.name} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-6">
              <dt>{p.name}</dt>
              <dd className="font-naglowek text-xl font-bold">{p.price}</dd>
            </div>
          ))}
        </dl>
        {service.priceNote && <p className="mt-4 max-w-[65ch] text-tusz-2">{service.priceNote}</p>}
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Jak to wygląda</h2>
        <ol className="mt-6 max-w-[65ch] list-decimal space-y-3 pl-6 marker:font-naglowek marker:font-bold">
          {service.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </section>

      <section id="konsultacja" className="mx-auto max-w-6xl scroll-mt-6 border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Zapytaj o wycenę</h2>
        <p className="mt-2 mb-8 max-w-[60ch]">
          Napisz, czym zajmuje się firma i ile osób zatrudnia. Wrócimy z konkretną ofertą.
        </p>
        <ConsultationForm defaultServices={[...service.formServices]} />
      </section>

      <section className="mx-auto max-w-6xl border-t-2 border-tusz px-5 py-14">
        <h2 className="text-3xl">Zobacz też</h2>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-naglowek text-xl font-semibold">
          {others.map((s) => (
            <li key={s.slug}>
              <Link to={`/${s.slug}` as '/'} className="text-znak underline underline-offset-4">
                {s.navLabel}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
