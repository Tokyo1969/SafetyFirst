import { Link } from '@tanstack/react-router'
import { site } from '../config/site'

export function Footer() {
  const c = site.company
  return (
    <footer className="mt-24">
      <div className="tasma" aria-hidden="true" />
      <div className="bg-tusz text-papier">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <div>
            <p className="font-naglowek text-2xl font-bold">{site.brand}</p>
            <p className="mt-1 text-papier/80">{site.tagline}, {site.region}</p>
          </div>
          <address className="not-italic">
            <p className="font-naglowek text-lg font-semibold">Kontakt</p>
            <p><a className="text-papier underline" href={`mailto:${site.emails.main}`}>{site.emails.main}</a></p>
            <p><a className="text-papier underline" href={site.phone.href}>{site.phone.display}</a></p>
          </address>
          <div>
            <p className="font-naglowek text-lg font-semibold">Dane firmy</p>
            <p>{c.name}</p>
            <p>{c.street}, {c.postalCode} {c.city}</p>
            <p>NIP {c.nip}</p>
            <p className="mt-3"><Link to="/polityka-prywatnosci" className="text-papier underline">Polityka prywatności</Link></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
