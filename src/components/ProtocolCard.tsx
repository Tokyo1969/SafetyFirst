import { site } from '../config/site'

const ITEMS = [
  'Instruktaż stanowiskowy pracowników',
  'Ocena ryzyka zawodowego',
  'Aktualne badania lekarskie',
  'Przegląd gaśnic i dróg ewakuacyjnych',
  'Dokumentacja BHP uporządkowana',
]

export function ProtocolCard() {
  return (
    <figure className="border-2 border-tusz bg-white">
      <figcaption className="flex items-center justify-between bg-tusz px-5 py-2 font-naglowek text-lg font-semibold text-papier">
        <span>Karta kontroli BHP</span>
        <span className="text-tasma">przykład</span>
      </figcaption>
      <ul className="divide-y divide-linia px-5">
        {ITEMS.map((item, i) => (
          <li key={item} className="flex items-center gap-4 py-3" style={{ ['--i' as string]: i }}>
            <svg className="tick size-7 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="1.5" y="1.5" width="21" height="21" stroke="currentColor" strokeWidth="1.5" className="text-tusz-2" />
              <path d="M5.5 12.5l4 4 9-10" stroke="#1F7A4D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="border-t-2 border-tusz px-5 py-3 text-sm text-tusz-2">
        Podpis: <strong className="text-tusz">{site.person.name}</strong>, {site.person.role}
      </p>
    </figure>
  )
}
