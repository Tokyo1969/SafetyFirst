import { useId } from 'react'
import { site } from '../config/site'

// Znak: zielony "znak bezpieczenstwa" z ptaszkiem i paskiem tasmy ostrzegawczej.
export function LogoMark({ className = 'size-10' }: { className?: string }) {
  // useId zawiera znaki, ktorych nie lubi url(#...) w SVG
  const id = 'logo' + useId().replace(/[^\w-]/g, '')
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}c`}>
          <rect width="40" height="40" rx="11" />
        </clipPath>
        <pattern id={`${id}t`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#FFC72C" />
          <rect width="4" height="8" fill="#0E2A2F" />
        </pattern>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="40" height="40" fill="#0F7B5A" />
        <rect y="33" width="40" height="7" fill={`url(#${id}t)`} />
      </g>
      <path d="M11 17.5l6 6 12-12.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-naglowek text-xl font-bold tracking-tight ${inverted ? 'text-papier' : 'text-tusz'}`}>
          {site.brand}
        </span>
        <span className={`mt-1 block text-[0.8125rem] font-medium ${inverted ? 'text-papier/70' : 'text-tusz-2'}`}>
          {site.tagline}
        </span>
      </span>
    </span>
  )
}
