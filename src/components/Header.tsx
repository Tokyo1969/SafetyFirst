import { useEffect, useRef, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { site } from '../config/site'
import { SERVICES } from '../data/services'
import { FEATURED_OS, servicePath } from '../data/catalog'
import { Logo } from './Logo'

const navLink = 'rounded-full px-3 py-2 whitespace-nowrap text-tusz hover:bg-znak-jasny'
const navActive = { className: 'bg-znak-jasny text-znak-ciemny' }
const menuItem = 'block rounded-xl px-4 py-2.5 hover:bg-mgla'
const menuActive = { className: 'bg-znak-jasny text-znak-ciemny' }

const MAIN_LINKS: { to: string; label: string }[] = [
  { to: '/cennik', label: 'Cennik' },
  { to: '/dla-branz', label: 'Dla branż' },
  { to: '/o-nas', label: 'O nas' },
  { to: '/kontakt', label: 'Kontakt' },
]

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)

  // Zamykamy menu po przejsciu na inna strone
  useEffect(() => {
    setMenuOpen(false)
    setServicesOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!servicesOpen && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false)
        setMenuOpen(false)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [servicesOpen, menuOpen])

  const serviceActive =
    pathname === '/obsluga-bhp' ||
    pathname.startsWith('/ochrona-srodowiska') ||
    SERVICES.some((s) => pathname === `/${s.slug}`)

  return (
    <header className="sticky top-0 z-40 border-b border-linia/70 bg-papier/90 backdrop-blur-md">
      <div className="kontener flex h-16 items-center justify-between gap-6 md:h-20">
        <Link to="/" className="shrink-0" aria-label={`${site.brand}, strona główna`}>
          <Logo />
        </Link>

        <nav aria-label="Główna" className="hidden items-center gap-1 font-naglowek text-[1.0625rem] font-semibold xl:flex">
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-controls="menu-uslugi"
              onClick={() => setServicesOpen((v) => !v)}
              className={`${navLink} inline-flex items-center gap-1 ${serviceActive ? 'bg-znak-jasny text-znak-ciemny' : ''}`}
            >
              Usługi
              <svg viewBox="0 0 20 20" className={`size-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {servicesOpen && (
              <div id="menu-uslugi" className="panel absolute top-full left-0 mt-2 grid w-[40rem] grid-cols-2 gap-6 p-4 font-tekst text-base">
                <div>
                  <p className="px-4 pt-1 pb-2 font-naglowek text-sm font-semibold text-tusz-2">BHP</p>
                  <ul>
                    <li>
                      <Link to="/obsluga-bhp" className={`${menuItem} font-semibold`} activeProps={menuActive}>
                        Stała obsługa BHP
                      </Link>
                    </li>
                    {SERVICES.map((s) => (
                      <li key={s.slug}>
                        <Link to={`/${s.slug}` as '/'} className={menuItem} activeProps={menuActive}>
                          {s.navLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="px-4 pt-1 pb-2 font-naglowek text-sm font-semibold text-tusz-2">Ochrona środowiska</p>
                  <ul>
                    {FEATURED_OS.map((s) => (
                      <li key={s.slug}>
                        <Link to={servicePath(s) as '/'} className={menuItem} activeProps={menuActive}>
                          {s.navLabel}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/ochrona-srodowiska"
                        activeOptions={{ exact: true }}
                        className={`${menuItem} font-semibold text-znak`}
                        activeProps={menuActive}
                      >
                        Wszystkie usługi środowiskowe
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          {MAIN_LINKS.map((l) => (
            <Link key={l.to} to={l.to as '/'} className={navLink} activeProps={navActive}>
              {l.label}
            </Link>
          ))}
          <a
            href={site.phone.href}
            className={`${navLink} ml-1 inline-flex items-center gap-2`}
            aria-label={`Zadzwoń: ${site.phone.display}`}
          >
            <PhoneIcon />
            <span className="hidden 2xl:inline">{site.phone.display}</span>
          </a>
          <a href="/#konsultacja" className="btn btn-glowny ml-1 min-h-11 px-5 whitespace-nowrap">
            Bezpłatna konsultacja
          </a>
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          <a href={site.phone.href} className="grid size-11 place-items-center rounded-full bg-znak-jasny text-znak-ciemny" aria-label={`Zadzwoń: ${site.phone.display}`}>
            <PhoneIcon />
          </a>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-mobilne"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-full bg-tusz text-papier"
          >
            <span className="sr-only">{menuOpen ? 'Zamknij menu' : 'Otwórz menu'}</span>
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="menu-mobilne" aria-label="Menu mobilne" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-linia bg-papier xl:hidden">
          <div className="kontener flex flex-col gap-1 py-4 font-naglowek text-lg font-semibold">
            <details className="group" open={pathname === '/obsluga-bhp' || SERVICES.some((s) => pathname === `/${s.slug}`)}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 hover:bg-mgla">
                Usługi BHP
                <Chevron />
              </summary>
              <ul className="pb-2 pl-3 font-tekst text-base font-medium">
                <li><Link to="/obsluga-bhp" className={menuItem} activeProps={menuActive}>Stała obsługa BHP</Link></li>
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/${s.slug}` as '/'} className={menuItem} activeProps={menuActive}>{s.navLabel}</Link>
                  </li>
                ))}
              </ul>
            </details>
            <details className="group" open={pathname.startsWith('/ochrona-srodowiska')}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 hover:bg-mgla">
                Ochrona środowiska
                <Chevron />
              </summary>
              <ul className="pb-2 pl-3 font-tekst text-base font-medium">
                {FEATURED_OS.map((s) => (
                  <li key={s.slug}>
                    <Link to={servicePath(s) as '/'} className={menuItem} activeProps={menuActive}>{s.navLabel}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/ochrona-srodowiska" activeOptions={{ exact: true }} className={`${menuItem} font-semibold text-znak`} activeProps={menuActive}>
                    Wszystkie usługi środowiskowe
                  </Link>
                </li>
              </ul>
            </details>
            {MAIN_LINKS.map((l) => (
              <Link key={l.to} to={l.to as '/'} className="block rounded-xl px-4 py-3 hover:bg-mgla" activeProps={navActive}>
                {l.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a href="/#konsultacja" onClick={() => setMenuOpen(false)} className="btn btn-glowny">
                Bezpłatna konsultacja
              </a>
              <a href={site.phone.href} className="btn btn-obrys">
                {site.phone.display}
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 transition-transform group-open:rotate-180" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="none" aria-hidden="true">
      <path
        d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
