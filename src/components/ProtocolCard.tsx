import { site } from '../config/site'
import photoUrl from '../assets/natalia-krysztofiak.jpg'

const ITEMS = [
  'Instruktaż stanowiskowy pracowników',
  'Ocena ryzyka zawodowego',
  'Aktualne badania lekarskie',
  'Przegląd gaśnic i dróg ewakuacyjnych',
  'Dokumentacja BHP uporządkowana',
]

export function ProtocolCard() {
  return (
    <figure className="relative mx-auto w-full max-w-md lg:rotate-[1.5deg]">
      {/* Kawalek tasmy przyklejony do karty */}
      <div className="tasma absolute -top-2 left-1/2 z-10 h-5 w-32 -translate-x-1/2 -rotate-3 rounded-sm shadow-sm" aria-hidden="true" />
      <div className="panel overflow-hidden">
        <figcaption className="flex items-center justify-between gap-4 bg-tusz px-6 pt-6 pb-4 text-papier">
          <span className="font-naglowek text-xl font-semibold">Karta kontroli BHP</span>
          <span className="rounded-full bg-tasma px-3 py-0.5 text-sm font-semibold text-tusz">przykład</span>
        </figcaption>
        <ul className="divide-y divide-linia px-6">
          {ITEMS.map((item, i) => (
            <li key={item} className="flex items-center gap-4 py-3.5" style={{ ['--i' as string]: i }}>
              <svg className="tick size-7 shrink-0 text-znak-logo" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="1.5" y="1.5" width="21" height="21" rx="6" className="fill-znak-jasny" />
                <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-dashed border-linia bg-mgla/60 px-6 py-4">
          <img src={photoUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover object-[50%_20%]" />
          <p className="text-sm leading-snug text-tusz-2">
            Podpis: <strong className="font-naglowek text-lg font-semibold text-tusz">{site.person.name}</strong>
            <span className="block">{site.person.role}</span>
          </p>
        </div>
      </div>
    </figure>
  )
}
