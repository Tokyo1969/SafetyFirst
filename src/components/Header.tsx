import { Link } from '@tanstack/react-router'
import { site } from '../config/site'
import { SERVICES } from '../data/services'

export function Header() {
  return (
    <header>
      <div className="tasma" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4">
        <Link to="/" className="font-naglowek text-2xl font-bold leading-none text-tusz no-underline">
          {site.brand}
          <span className="block text-sm font-medium text-tusz-2">{site.tagline}</span>
        </Link>
        <nav aria-label="Główna" className="flex flex-wrap items-center gap-x-6 gap-y-2 font-naglowek text-lg font-semibold">
          <Link to="/obsluga-bhp" className="text-tusz hover:text-znak" activeProps={{ className: 'text-znak underline underline-offset-4' }}>
            Obsługa BHP
          </Link>
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/${s.slug}` as '/'}
              className="text-tusz hover:text-znak"
              activeProps={{ className: 'text-znak underline underline-offset-4' }}
            >
              {s.navLabel}
            </Link>
          ))}
          <a href={site.phone.href} className="text-tusz hover:text-znak">
            {site.phone.display}
          </a>
          <a href="/#konsultacja" className="bg-znak px-4 py-2 text-white hover:bg-znak-ciemny">
            Bezpłatna konsultacja
          </a>
        </nav>
      </div>
    </header>
  )
}
