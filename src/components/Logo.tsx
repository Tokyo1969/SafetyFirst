import logoUrl from '../assets/logo-poziome.svg?url'
import logoNegatywUrl from '../assets/logo-poziome-negatyw.svg?url'
import { site } from '../config/site'

// Oryginaly (wszystkie wersje logo) leza w src/files, tu uzywamy kopii bez metadanych.
export function Logo({ inverted = false, className = 'h-10 w-auto md:h-14' }: { inverted?: boolean; className?: string }) {
  return (
    <img
      src={inverted ? logoNegatywUrl : logoUrl}
      alt={`${site.brand} – ${site.tagline}`}
      width={727}
      height={160}
      className={className}
    />
  )
}
