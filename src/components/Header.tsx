import { useEffect, useRef, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { site } from '../config/site'
import { SERVICES_MENU, type MenuGroup } from '../data/catalog'
import { Logo } from './Logo'
import { SoonBadge } from './blocks'

const navLink = 'rounded-full px-3 py-2 whitespace-nowrap text-tusz hover:bg-znak-jasny'
const navActive = { className: 'bg-znak-jasny text-znak-ciemny' }
const menuItem = 'block rounded-xl px-4 py-2.5'
const menuItemDesktop = 'block rounded-xl px-3 py-2'
const menuActive = { className: 'bg-papier text-znak-ciemny shadow-sm ring-1 ring-znak/30' }

// Strefy kolorystyczne grup menu: BHP zolta (tasma) i szara, OS biala z zielona ramka i zielona.
const TONE: Record<MenuGroup['tone'], { box: string; hover: string; dot: string }> = {
  bhp: { box: 'bg-tasma/10 border-tasma/45', hover: 'hover:bg-papier', dot: 'bg-tasma' },
  'bhp-doc': { box: 'bg-mgla border-linia', hover: 'hover:bg-papier', dot: 'bg-tusz-2' },
  os: { box: 'bg-papier border-znak/30', hover: 'hover:bg-znak-jasny/60', dot: 'bg-znak-negatyw' },
  'os-doc': { box: 'bg-znak-jasny border-znak/25', hover: 'hover:bg-papier', dot: 'bg-znak' },
}

const MAIN_LINKS: { to: string; label: string }[] = [
  { to: '/cennik', label: 'Cennik' },
  { to: '/dla-branz', label: 'Dla branż' },
  { to: '/o-nas', label: 'O nas' },
  { to: '/kontakt', label: 'Kontakt' },
]

// Informacja pod lista uslug w menu: pomoc we wdrozeniu ISO 45001 / 14001.
function IsoNote({ norma = '45001', className = 'mx-4' }: { norma?: '45001' | '14001'; className?: string }) {
  return (
    <p className={`${className} mt-3 border-t border-linia pt-3 text-[0.9375rem] text-tusz-2`}>
      Pomagamy we wdrożeniu systemu ISO {norma} i monitorujemy jego utrzymanie.{' '}
      <Link to="/wdrozenie-iso" hash={`iso-${norma}`} className="link font-semibold">
        Dowiedz się więcej
      </Link>
    </p>
  )
}

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

  const groupActive = (g: MenuGroup) => g.items.some((i) => i.to === pathname) || g.all?.to === pathname
  const serviceActive = SERVICES_MENU.some(groupActive)

  return (
    <header className="sticky top-0 z-40 border-b border-linia/70 bg-papier/90 backdrop-blur-md">
      <div className="kontener relative flex h-16 items-center justify-between gap-6 md:h-20">
        <Link to="/" className="shrink-0" aria-label={`${site.brand}, strona główna`}>
          <Logo />
        </Link>

        <nav aria-label="Główna" className="hidden items-center gap-1 font-naglowek text-[1.0625rem] font-semibold xl:flex">
          <div ref={servicesRef}>
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
              <div
                id="menu-uslugi"
                className="panel absolute inset-x-4 top-full mt-2 grid max-h-[calc(100dvh-6rem)] grid-cols-[1fr_1fr_2fr_1fr] gap-3 overflow-y-auto p-3 font-tekst text-[0.9375rem] md:inset-x-8"
              >
                {SERVICES_MENU.map((g) => (
                  <div key={g.title} className={`rounded-2xl border p-2 ${TONE[g.tone].box}`}>
                    <p className="px-3 pt-1 pb-2 font-naglowek text-sm font-semibold text-tusz-2">{g.title}</p>
                    <ul className={g.wide ? 'columns-2 gap-2' : ''}>
                      {g.items.map((i) => (
                        <li key={i.to} className="break-inside-avoid">
                          <Link to={i.to as '/'} className={`${menuItemDesktop} ${TONE[g.tone].hover}`} activeProps={menuActive}>
                            {i.label}
                            {i.soon && <SoonBadge />}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {g.all && (
                      <Link
                        to={g.all.to as '/'}
                        activeOptions={{ exact: true }}
                        className={`${menuItemDesktop} ${TONE[g.tone].hover} font-semibold text-znak`}
                        activeProps={menuActive}
                      >
                        {g.all.label}
                      </Link>
                    )}
                    {g.iso && <IsoNote norma={g.iso} className="mx-3" />}
                  </div>
                ))}
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
            {SERVICES_MENU.map((g) => (
              <details key={g.title} className="group" open={groupActive(g)}>
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 hover:bg-mgla">
                  <span className="inline-flex items-center gap-3">
                    <span className={`size-2.5 shrink-0 rounded-full ${TONE[g.tone].dot}`} aria-hidden="true" />
                    {g.title}
                  </span>
                  <Chevron />
                </summary>
                <ul className={`mb-2 ml-3 rounded-2xl border p-2 font-tekst text-base font-medium ${TONE[g.tone].box}`}>
                  {g.items.map((i) => (
                    <li key={i.to}>
                      <Link to={i.to as '/'} className={`${menuItem} ${TONE[g.tone].hover}`} activeProps={menuActive}>{i.label}{i.soon && <SoonBadge />}</Link>
                    </li>
                  ))}
                  {g.all && (
                    <li>
                      <Link to={g.all.to as '/'} activeOptions={{ exact: true }} className={`${menuItem} ${TONE[g.tone].hover} font-semibold text-znak`} activeProps={menuActive}>
                        {g.all.label}
                      </Link>
                    </li>
                  )}
                  {g.iso && <li><IsoNote norma={g.iso} /></li>}
                </ul>
              </details>
            ))}
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
