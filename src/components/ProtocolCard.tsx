import { useState } from 'react'
import { site } from '../config/site'
import photoUrl from '../assets/natalia-krysztofiak.jpg'

const ITEMS = [
  'Instruktaż stanowiskowy pracowników',
  'Ocena ryzyka zawodowego',
  'Aktualne badania lekarskie',
  'Przegląd gaśnic i dróg ewakuacyjnych',
  'Dokumentacja BHP uporządkowana',
]

// Animacja "kontroli na zywo" jest w CSS (styles.css, sekcja .karta).
// Zmiana klucza montuje karte od nowa, wiec animacje startuja jeszcze raz.
export function ProtocolCard() {
  const [run, setRun] = useState(0)
  return (
    <div key={run} className="mx-auto w-full max-w-md">
      <figure className="karta relative lg:rotate-[1.5deg]">
        <div className="karta-tasma tasma absolute -top-2 left-1/2 z-10 h-5 w-32 -translate-x-1/2 -rotate-3 rounded-sm shadow-sm" aria-hidden="true" />
        <div className="karta-panel panel relative overflow-hidden">
          <figcaption className="bg-tusz px-6 pt-6 pb-4 text-papier">
            <span className="flex items-center justify-between gap-4">
              <span className="font-naglowek text-xl font-semibold">Karta kontroli BHP</span>
              <span className="rounded-full bg-tasma px-3 py-0.5 text-sm font-semibold text-tusz">przykład</span>
            </span>
            <span className="mt-3 flex items-center gap-3 text-sm text-papier/75" aria-hidden="true">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-papier/15">
                <span className="karta-postep block h-full" />
              </span>
              <span className="karta-licznik tabular-nums" />
            </span>
          </figcaption>
          <ul className="divide-y divide-linia px-6">
            {ITEMS.map((item, i) => (
              <li
                key={item}
                className="karta-wiersz -mx-3 flex items-center gap-4 rounded-lg px-3 py-3.5"
                style={{ ['--i' as string]: i }}
              >
                <svg className="tick size-7 shrink-0 text-znak-logo" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="21" height="21" rx="6" className="fill-znak-jasny" />
                  <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 border-t border-dashed border-linia bg-mgla/60 px-6 pt-4 pb-18 sm:pr-36 sm:pb-4">
            <img src={photoUrl} alt="" width={48} height={48} className="karta-zdjecie size-12 shrink-0 rounded-full object-cover object-[50%_20%]" />
            <p className="text-sm leading-snug text-tusz-2">
              Podpis: <strong className="karta-podpis inline-block font-naglowek text-lg font-semibold text-tusz">{site.person.name}</strong>
              <span className="block">{site.person.role}</span>
            </p>
          </div>
          <div className="karta-pieczec pointer-events-none absolute right-4 bottom-4" aria-hidden="true">
            <span className="block rounded-md border-[2.5px] border-znak bg-papier/40 px-2.5 py-1 text-center font-naglowek leading-none text-znak">
              <span className="block text-base font-bold tracking-wider">SPRAWDZONE</span>
              <span className="mt-0.5 block text-[0.625rem] font-semibold">5 z 5 punktów</span>
            </span>
          </div>
        </div>
      </figure>
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="karta-powtorz inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-tusz-2 hover:bg-znak-jasny hover:text-znak-ciemny"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
            <path d="M16 10a6 6 0 1 1-1.8-4.3M16 4v3.5h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sprawdź jeszcze raz
        </button>
      </div>
    </div>
  )
}
