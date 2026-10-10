import { Link } from '@tanstack/react-router'
import { site } from '../config/site'
import { SERVICES } from '../data/services'
import { OS_SERVICES } from '../data/os-services'
import { servicePath } from '../data/catalog'
import { Logo } from './Logo'
import { OTWORZ_USTAWIENIA } from './CookieBanner'

const footLink = 'text-papier/85 underline-offset-4 hover:text-tasma hover:underline'

export function Footer() {
  const c = site.company
  return (
    <footer>
      <div className="tasma" aria-hidden="true" />
      <div className="bg-tusz text-papier">
        <div className="kontener grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo inverted />
            <p className="mt-5 max-w-[32ch] text-papier/75">
              Obsługa BHP i ochrony środowiska dla małych firm, {site.region}.
            </p>
          </div>
          <nav aria-label="Usługi">
            <p className="font-naglowek text-lg font-semibold">Usługi</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/obsluga-bhp" className={footLink}>Obsługa BHP</Link></li>
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link to={`/${s.slug}` as '/'} className={footLink}>{s.navLabel}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Firma">
            <p className="font-naglowek text-lg font-semibold">Firma</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/cennik" className={footLink}>Cennik</Link></li>
              <li><Link to="/dla-branz" className={footLink}>Dla branż</Link></li>
              <li><Link to="/o-nas" className={footLink}>O nas</Link></li>
              <li><Link to="/kontakt" className={footLink}>Kontakt</Link></li>
            </ul>
          </nav>
          <address className="not-italic">
            <p className="font-naglowek text-lg font-semibold">Kontakt</p>
            <ul className="mt-3 space-y-2">
              <li><a className={footLink} href={`mailto:${site.emails.main}`}>{site.emails.main}</a></li>
              <li><a className={footLink} href={site.phone.href}>{site.phone.display}</a></li>
            </ul>
          </address>
          <div>
            <p className="font-naglowek text-lg font-semibold">Dane firmy</p>
            <div className="mt-3 space-y-1 text-papier/85">
              <p>{c.name}</p>
              <p>{c.street}</p>
              <p>{c.postalCode} {c.city}</p>
              <p>NIP {c.nip}</p>
            </div>
          </div>
        </div>
        <nav aria-label="Ochrona środowiska" className="border-t border-papier/15">
          <div className="kontener py-8">
            <p className="font-naglowek text-lg font-semibold">
              <Link to="/ochrona-srodowiska" className="hover:text-tasma hover:underline">Ochrona środowiska</Link>
            </p>
            <ul className="mt-3 columns-1 gap-8 space-y-2 sm:columns-2 lg:columns-3">
              {OS_SERVICES.map((s) => (
                <li key={s.slug} className="break-inside-avoid">
                  <Link to={servicePath(s) as '/'} className={footLink}>{s.navLabel}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="border-t border-papier/15">
          <div className="kontener flex flex-col gap-2 py-6 text-sm text-papier/65 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} {site.brand}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <Link to="/polityka-prywatnosci" className={footLink}>Polityka prywatności</Link>
              {site.gaId ? (
                <button
                  type="button"
                  className={`${footLink} text-left`}
                  onClick={() => window.dispatchEvent(new Event(OTWORZ_USTAWIENIA))}
                >
                  Ustawienia cookies
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
