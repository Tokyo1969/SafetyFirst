import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ConsultationForm } from './ConsultationForm'
import { site } from '../config/site'

// Lista z ptaszkami (zakres uslug).
export function CheckList({ items, columns = false }: { items: readonly string[]; columns?: boolean }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 ${columns ? 'md:grid-cols-2' : ''}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function CheckIcon({ className = 'mt-0.5 size-6 shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" className="fill-znak-jasny" />
      <path d="M7 12.5l3.2 3.2L17 8.8" stroke="#0F7B5A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Kroki wspolpracy: prawdziwa sekwencja, wiec numerujemy.
export function Steps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="relative grid gap-6 lg:auto-cols-fr lg:grid-flow-col lg:gap-5">
      {steps.map((s, i) => (
        <li key={s} className="relative flex gap-4 lg:flex-col lg:gap-5">
          {/* linia laczaca kroki */}
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-12 bottom-[-1.5rem] left-[calc(1.375rem-1px)] w-0.5 bg-linia lg:top-[calc(1.375rem-1px)] lg:right-[-1.25rem] lg:bottom-auto lg:left-14 lg:h-0.5 lg:w-auto"
            />
          )}
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-tusz font-naglowek text-lg font-bold text-tasma">
            {i + 1}
          </span>
          <p className="pt-2 lg:pt-0">{s}</p>
        </li>
      ))}
    </ol>
  )
}

export function SectionHeading({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="mb-10 max-w-[44rem] md:mb-12">
      <h2>{title}</h2>
      {lead && <p className="mt-4 text-lg text-tusz-2">{lead}</p>}
    </div>
  )
}

// Sekcja z formularzem konsultacji, wspolna dla wszystkich stron.
export function ConsultationSection({
  title,
  lead,
  defaultServices,
}: {
  title: string
  lead: string
  defaultServices?: string[]
}) {
  return (
    <section id="konsultacja" className="sekcja scroll-mt-20 bg-tusz text-papier">
      <div className="kontener grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <h2>{title}</h2>
          <p className="mt-4 text-lg text-papier/80">{lead}</p>
          <ul className="mt-8 space-y-4">
            <li className="flex gap-3">
              <CheckIcon />
              <span>Odpowiadamy w ciągu jednego dnia roboczego.</span>
            </li>
            <li className="flex gap-3">
              <CheckIcon />
              <span>Konsultacja jest bezpłatna i do niczego nie zobowiązuje.</span>
            </li>
          </ul>
          <div className="mt-10 border-t border-papier/15 pt-6">
            <p className="text-papier/70">Wolisz porozmawiać?</p>
            <a href={site.phone.href} className="mt-1 inline-block font-naglowek text-2xl font-bold text-tasma hover:underline">
              {site.phone.display}
            </a>
            <p className="mt-1">
              <a href={`mailto:${site.emails.main}`} className="text-papier/85 underline underline-offset-4 hover:text-tasma">
                {site.emails.main}
              </a>
            </p>
          </div>
        </div>
        <div className="panel p-6 text-tusz sm:p-8">
          <ConsultationForm defaultServices={defaultServices} />
        </div>
      </div>
    </section>
  )
}

// Naglowek podstrony z okruszkami.
export function PageHero({
  crumb,
  title,
  lead,
  children,
}: {
  crumb: string
  title: string
  lead: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute -top-48 -right-32 size-[30rem] rounded-full bg-znak-jasny/70 blur-3xl" />
      <div className="kontener relative pt-8 pb-14 md:pt-12 md:pb-20">
        <nav aria-label="Okruszki" className="text-sm text-tusz-2">
          <Link to="/" className="hover:text-znak hover:underline">Strona główna</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span aria-current="page">{crumb}</span>
        </nav>
        <h1 className="mt-6 max-w-[20ch]">{title}</h1>
        <p className="mt-6 max-w-[58ch] text-lg text-tusz-2 md:text-xl">{lead}</p>
        {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
      </div>
    </section>
  )
}
