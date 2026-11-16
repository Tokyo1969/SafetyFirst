import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { CheckIcon, ConsultationSection, PageHero } from './blocks'
import { IsoWniosek } from './IsoWniosek'
import { DROGA_CERTYFIKACJI, type IsoEtap, type IsoLink, type IsoNorma } from '../data/iso'

export const ZAKLADKI = ['czego-dotyczy', 'wdrozenie', 'zgloszenie'] as const
export type Zakladka = (typeof ZAKLADKI)[number]

const ETYKIETY: Record<Zakladka, { pelna: string; krotka: string }> = {
  'czego-dotyczy': { pelna: 'Czego dotyczy norma', krotka: 'Czego dotyczy' },
  wdrozenie: { pelna: 'Instrukcja i wdrożenie', krotka: 'Instrukcja i wdrożenie' },
  zgloszenie: { pelna: 'Wypełnij zgłoszenie', krotka: 'Wypełnij zgłoszenie' },
}

export function IsoNormaPage({
  norma,
  zakladka,
  onZakladka,
}: {
  norma: IsoNorma
  zakladka: Zakladka
  onZakladka: (z: Zakladka) => void
}) {
  const pasek = useRef<HTMLDivElement>(null)

  const wybierz = (z: Zakladka, przewin = false) => {
    onZakladka(z)
    if (przewin) requestAnimationFrame(() => pasek.current?.scrollIntoView({ block: 'start' }))
  }

  const klawisz = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const ostatni = ZAKLADKI.length - 1
    const cel = e.key === 'ArrowRight' ? (i + 1) % ZAKLADKI.length
      : e.key === 'ArrowLeft' ? (i + ostatni) % ZAKLADKI.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? ostatni
      : -1
    if (cel < 0) return
    e.preventDefault()
    onZakladka(ZAKLADKI[cel])
    document.getElementById(`tab-${ZAKLADKI[cel]}`)?.focus()
  }

  return (
    <main>
      <PageHero
        crumb={norma.code}
        parent={{ label: 'Wdrożenie ISO', to: '/wdrozenie-iso' }}
        title={norma.h1}
        lead={norma.lead}
      >
        <button type="button" className="btn btn-glowny" onClick={() => wybierz('zgloszenie', true)}>
          Wypełnij zgłoszenie
        </button>
        <a href="#konsultacja" className="btn btn-obrys">Zapytaj o wdrożenie</a>
      </PageHero>

      <section className="bg-papier pb-16 md:pb-24">
        <div className="kontener">
          <div
            ref={pasek}
            id="zakladki"
            role="tablist"
            aria-label={`${norma.code}: podział strony`}
            className="grid scroll-mt-20 grid-cols-3 gap-2 rounded-[var(--radius-panel)] border border-linia bg-white p-2"
          >
            {ZAKLADKI.map((z, i) => {
              const aktywna = z === zakladka
              return (
                <button
                  key={z}
                  id={`tab-${z}`}
                  type="button"
                  role="tab"
                  aria-selected={aktywna}
                  aria-controls={`panel-${z}`}
                  tabIndex={aktywna ? 0 : -1}
                  onClick={() => onZakladka(z)}
                  onKeyDown={(e) => klawisz(e, i)}
                  className={`flex min-h-14 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-2 py-3 text-center font-naglowek text-[0.9375rem] leading-tight font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-znak sm:px-4 sm:text-lg ${
                    aktywna ? 'bg-tusz text-papier' : 'text-tusz hover:bg-znak-jasny'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`hidden size-7 shrink-0 place-items-center rounded-full text-sm font-bold sm:grid ${
                      aktywna ? 'bg-tasma text-tusz' : 'bg-mgla text-tusz-2'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {ETYKIETY[z].pelna}
                </button>
              )
            })}
          </div>

          {/* Wszystkie panele zostaja w DOM (ukryte), zeby wpisane dane zgloszenia nie znikaly przy zmianie zakladki. */}
          <div className="mt-8 md:mt-10">
            <div id="panel-czego-dotyczy" role="tabpanel" aria-labelledby="tab-czego-dotyczy" hidden={zakladka !== 'czego-dotyczy'}>
              <CoToJest norma={norma} wybierz={wybierz} />
            </div>
            <div id="panel-wdrozenie" role="tabpanel" aria-labelledby="tab-wdrozenie" hidden={zakladka !== 'wdrozenie'}>
              <Wdrozenie norma={norma} wybierz={wybierz} />
            </div>
            <div id="panel-zgloszenie" role="tabpanel" aria-labelledby="tab-zgloszenie" hidden={zakladka !== 'zgloszenie'}>
              <h2>Zgłoszenie do certyfikacji {norma.code}</h2>
              <p className="mt-3 mb-8 max-w-[62ch] text-lg text-tusz-2">
                Wypełnij dane organizacji i pobierz zgłoszenie jako PDF. Certyfikację przeprowadza niezależna jednostka
                certyfikująca, a my nadzorujemy cały proces. Na podstawie zgłoszenia przygotujemy z Tobą oficjalny
                wniosek na dokumentach jednostki.
              </p>
              <IsoWniosek code={norma.code} />
            </div>
          </div>
        </div>
      </section>

      <ConsultationSection
        title={`Masz pytania o ${norma.code}?`}
        lead="Napisz, w jakiej branży działa firma, ile ma pracowników i czy macie już inne normy. Pomożemy dopasować plan działania, od auditu wstępnego po przygotowanie do certyfikacji."
        defaultServices={['ISO']}
      />
    </main>
  )
}

type Wybierz = (z: Zakladka, przewin?: boolean) => void

function CoToJest({ norma, wybierz }: { norma: IsoNorma; wybierz: Wybierz }) {
  const c = norma.czego
  return (
    <div className="grid gap-12">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <h2>Czego dotyczy {norma.code}</h2>
          <div className="mt-5 grid max-w-[66ch] gap-4 text-lg text-tusz-2">
            {c.akapity.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </div>
        </div>
        {c.edycja && (
          <aside className="panel self-start border border-znak/40 border-l-[6px] border-l-znak bg-znak-jasny p-6">
            <h3 className="text-xl text-znak-ciemny">{c.edycja.title}</h3>
            <p className="mt-3 text-tusz-2">{c.edycja.text}</p>
            <Zrodla zrodla={c.edycja.zrodla} className="mt-4" />
          </aside>
        )}
      </div>

      {c.filary && (
        <div>
          <h3 className="text-2xl">Na czym opiera się norma</h3>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {c.filary.map((f) => (
              <li key={f.title} className="border-l-4 border-znak-logo bg-white py-1 pr-4 pl-5">
                <p className="font-naglowek text-lg font-semibold">{f.title}</p>
                <p className="mt-1 text-tusz-2">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(c.korzysci || c.dlaKogo) && (
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {c.korzysci && (
            <div>
              <h3 className="text-2xl">Co zyskuje firma</h3>
              <ul className="mt-5 grid gap-4">
                {c.korzysci.map((k) => (
                  <li key={k.title} className="flex gap-3">
                    <CheckIcon />
                    <span>
                      <strong className="font-semibold">{k.title}.</strong> <span className="text-tusz-2">{k.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.dlaKogo && (
            <div className="panel self-start border border-linia bg-white p-6">
              <h3 className="text-xl">Warto o niej pomyśleć, gdy</h3>
              <ul className="mt-4 grid gap-3">
                {c.dlaKogo.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-znak" />
                    <span className="text-tusz-2">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {c.integracja && (
        <div className="panel border border-linia bg-white p-6 sm:p-8">
          <h3 className="text-xl">Jedna norma czy kilka?</h3>
          <p className="mt-3 max-w-[70ch] text-tusz-2">{c.integracja}</p>
        </div>
      )}

      <Dalej
        tekst="Zobacz, jak przygotować firmę do certyfikacji."
        przyciski={[
          { label: 'Instrukcja i wdrożenie', onClick: () => wybierz('wdrozenie', true) },
          { label: 'Wypełnij zgłoszenie', onClick: () => wybierz('zgloszenie', true), glowny: true },
        ]}
      />
    </div>
  )
}

function Wdrozenie({ norma, wybierz }: { norma: IsoNorma; wybierz: Wybierz }) {
  const w = norma.wdrozenie
  return (
    <div className="grid gap-14">
      <div>
        <h2>Jak wdrożyć {norma.code}</h2>
        {w.intro && <p className="mt-4 max-w-[66ch] text-lg text-tusz-2">{w.intro}</p>}
        <EtapyLista etapy={w.etapy} />
      </div>

      {w.wymagania && (
        <div>
          <h3 className="text-2xl">Czego wymaga norma</h3>
          <p className="mt-3 max-w-[66ch] text-tusz-2">
            Wymagania są ułożone w kilka obszarów. Podobny układ mają ISO 14001 i ISO 45001, dlatego łatwo je połączyć.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {w.wymagania.map((r) => (
              <li key={r.title} className="panel border border-linia bg-white p-5">
                <p className="font-naglowek text-lg font-semibold">{r.title}</p>
                <p className="mt-1.5 text-tusz-2">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-2xl">Droga do certyfikatu</h3>
        <p className="mt-3 max-w-[66ch] text-tusz-2">
          Certyfikację przeprowadza niezależna jednostka certyfikująca, a Safety First nadzoruje ten proces po stronie firmy. Tak wygląda typowy przebieg.
        </p>
        <EtapyLista etapy={DROGA_CERTYFIKACJI.map((s) => ({ title: s.title, text: s.text }))} />
        <p className="mt-6 text-[0.9375rem] text-tusz-2">
          Dokładny przebieg, terminy i koszty ustala wybrana jednostka certyfikująca.
        </p>
      </div>

      {w.kluczowe.length > 0 && (
        <div>
          <h3 className="text-2xl">Warto wiedzieć</h3>
          <dl className="mt-5 divide-y divide-linia overflow-hidden rounded-[var(--radius-panel)] border border-linia bg-white">
            {w.kluczowe.map((k) => (
              <div key={k.title} className="px-5 py-4 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="font-naglowek font-semibold">{k.title}</dt>
                <dd className="mt-1 text-tusz-2 sm:mt-0">{k.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {w.zrodla && (
        <p className="text-[0.9375rem] text-tusz-2">
          Więcej informacji: <Zrodla zrodla={w.zrodla} inline />
        </p>
      )}

      <Dalej
        tekst="Gotowy na certyfikację? Wypełnij zgłoszenie."
        przyciski={[{ label: 'Wypełnij zgłoszenie', onClick: () => wybierz('zgloszenie', true), glowny: true }]}
      />
    </div>
  )
}

// Prawdziwa sekwencja, wiec numerujemy.
function EtapyLista({ etapy }: { etapy: readonly IsoEtap[] }) {
  return (
    <ol className="mt-6 grid max-w-[60rem] gap-6">
      {etapy.map((e, i) => (
        <li key={e.title} className="relative flex gap-4">
          {i < etapy.length - 1 && (
            <span aria-hidden="true" className="absolute top-12 bottom-[-1.5rem] left-[1.25rem] w-0.5 bg-linia" />
          )}
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-tusz font-naglowek font-bold text-tasma">
            {i + 1}
          </span>
          <div className="pt-1.5">
            <p className="font-naglowek text-lg font-semibold">{e.title}</p>
            {e.text && <p className="mt-1 text-tusz-2">{e.text}</p>}
            {e.punkty && (
              <ul className="mt-2 grid gap-2 text-tusz-2">
                {e.punkty.map((p) => (
                  <li key={p.title} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-znak" />
                    <span>
                      <strong className="font-semibold text-tusz">{p.title}:</strong> {p.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Zrodla({ zrodla, className = '', inline = false }: { zrodla: readonly IsoLink[]; className?: string; inline?: boolean }) {
  const lista = zrodla.map((z, i) => (
    <span key={z.href}>
      {i > 0 && ', '}
      <a href={z.href} className="link" target="_blank" rel="noopener noreferrer">
        {z.label}
      </a>
    </span>
  ))
  if (inline) return <>{lista}.</>
  return (
    <p className={`text-[0.9375rem] text-tusz-2 ${className}`}>
      Źródła: {lista}.
    </p>
  )
}

function Dalej({
  tekst,
  przyciski,
}: {
  tekst: ReactNode
  przyciski: { label: string; onClick: () => void; glowny?: boolean }[]
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-linia pt-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-naglowek text-xl font-semibold">{tekst}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {przyciski.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={p.onClick}
            className={`btn ${p.glowny ? 'btn-glowny' : 'btn-obrys'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
