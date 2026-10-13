import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { askAssistant, type ChatMessage } from '../server/chat'
import { site } from '../config/site'

const KLUCZ = 'sf-czat'
const MAX_PYTAN = 15 // limit pytan w jednej sesji przegladarki
const PODPOWIEDZI = [
  'Ile kosztuje stała obsługa BHP?',
  'Jakie szkolenia BHP robicie?',
  'Czym jest BDO i kogo dotyczy?',
  'Jak wygląda pierwsza konsultacja?',
]
const POWITANIE =
  'Cześć! Jestem asystentem Safety First. Odpowiadam na pytania o usługi BHP i ochrony środowiska oraz o ceny. Nie zastępuję rozmowy z Natalią, ale pomogę znaleźć właściwą usługę.'

const BLEDY: Record<string, string> = {
  limit: 'Zadajesz pytania bardzo szybko. Odczekaj kilka minut albo zadzwoń.',
  invalid: 'Nie udało się przetworzyć wiadomości. Spróbuj ją skrócić.',
}

// Odpowiedz asystenta: tylko linki do wlasnych stron, telefonu i maila oraz krotkie listy.
function wiersz(tekst: string): ReactNode[] {
  const wynik: ReactNode[] = []
  const re = /\[([^\]]+)\]\(((?:\/|tel:|mailto:)[^)\s]*)\)/g
  let ostatni = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(tekst))) {
    if (m.index > ostatni) wynik.push(tekst.slice(ostatni, m.index).replace(/\*\*/g, ''))
    wynik.push(
      <a key={m.index} href={m[2]} className="link">
        {m[1]}
      </a>,
    )
    ostatni = m.index + m[0].length
  }
  if (ostatni < tekst.length) wynik.push(tekst.slice(ostatni).replace(/\*\*/g, ''))
  return wynik
}

function Tresc({ tekst }: { tekst: string }) {
  const bloki: ReactNode[] = []
  let lista: string[] = []
  const zamknijListe = () => {
    if (!lista.length) return
    bloki.push(
      <ul key={`l${bloki.length}`} className="ml-5 list-disc space-y-1">
        {lista.map((l, i) => (
          <li key={i}>{wiersz(l)}</li>
        ))}
      </ul>,
    )
    lista = []
  }
  for (const linia of tekst.split('\n')) {
    const punkt = linia.match(/^\s*[-*•]\s+(.*)$/)
    if (punkt) {
      lista.push(punkt[1])
      continue
    }
    zamknijListe()
    if (linia.trim()) bloki.push(<p key={`p${bloki.length}`}>{wiersz(linia.trim())}</p>)
  }
  zamknijListe()
  return <div className="space-y-2">{bloki}</div>
}

function Ikona({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8.5 9.5h7M8.5 12.5h4" />
    </svg>
  )
}

// Asystent informacyjny: okienko rozmowy w prawym dolnym rogu. Odpowiada na podstawie tresci strony.
export function ChatWidget() {
  const [aktywny, setAktywny] = useState(false)
  const [otwarty, setOtwarty] = useState(false)
  const [wiadomosci, setWiadomosci] = useState<ChatMessage[]>([])
  const [tekst, setTekst] = useState('')
  const [czeka, setCzeka] = useState(false)
  const [blad, setBlad] = useState<string | null>(null)
  const [odczytane, setOdczytane] = useState(false)
  const lista = useRef<HTMLDivElement>(null)
  const pole = useRef<HTMLInputElement>(null)

  // Widoczny po wlaczeniu w site.chat.enabled. Do testow na zywo: dopisz ?asystent=1 do adresu.
  useEffect(() => {
    const podglad = new URLSearchParams(window.location.search).has('asystent')
    setAktywny(site.chat.enabled || podglad)
    try {
      const zapis = sessionStorage.getItem(KLUCZ)
      if (zapis) setWiadomosci(JSON.parse(zapis) as ChatMessage[])
    } catch {
      // brak dostepu do pamieci przegladarki: rozmowa trwa do przeladowania strony
    }
    setOdczytane(true)
  }, [])

  useEffect(() => {
    // Zapis dopiero po odczycie, zeby pusta lista nie nadpisala zapamietanej rozmowy.
    if (odczytane) {
      try {
        sessionStorage.setItem(KLUCZ, JSON.stringify(wiadomosci))
      } catch {
        // jw.
      }
    }
    lista.current?.scrollTo({ top: lista.current.scrollHeight })
  }, [wiadomosci, czeka, otwarty, odczytane])

  useEffect(() => {
    if (otwarty) pole.current?.focus()
  }, [otwarty])

  if (!aktywny) return null

  const zadane = wiadomosci.filter((m) => m.role === 'user').length

  const wyslij = async (pytanie: string) => {
    const t = pytanie.trim()
    if (!t || czeka) return
    if (zadane >= MAX_PYTAN) {
      setBlad(`Limit pytań w tej rozmowie został wykorzystany. Zadzwoń: ${site.phone.display}.`)
      return
    }
    const nowe: ChatMessage[] = [...wiadomosci, { role: 'user', content: t.slice(0, 1000) }]
    setWiadomosci(nowe)
    setTekst('')
    setBlad(null)
    setCzeka(true)
    try {
      const wynik = await askAssistant({ data: { messages: nowe } })
      if (wynik.ok) {
        setWiadomosci([...nowe, { role: 'assistant', content: wynik.reply }])
      } else {
        setBlad(
          BLEDY[wynik.error] ??
            `Asystent jest chwilowo niedostępny. Zadzwoń ${site.phone.display} albo napisz na ${site.emails.main}.`,
        )
      }
    } catch {
      setBlad(`Nie udało się połączyć. Zadzwoń ${site.phone.display} albo napisz na ${site.emails.main}.`)
    } finally {
      setCzeka(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void wyslij(tekst)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {otwarty ? (
        <section
          aria-label="Asystent Safety First"
          onKeyDown={(e) => e.key === 'Escape' && setOtwarty(false)}
          className="panel flex h-[min(34rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden border border-linia bg-papier shadow-2xl"
        >
          <header className="flex items-start justify-between gap-3 bg-tusz px-4 py-3 text-papier">
            <div>
              <p className="font-naglowek text-base font-semibold">Asystent Safety First</p>
              <p className="text-sm text-papier/75">Odpowiada automat (AI), całą dobę</p>
            </div>
            <button
              type="button"
              onClick={() => setOtwarty(false)}
              aria-label="Zamknij okno asystenta"
              className="grid size-9 shrink-0 place-items-center rounded-full text-papier hover:bg-papier/15"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div ref={lista} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-mgla px-4 py-4 text-[0.9375rem] leading-relaxed">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-papier px-3.5 py-2.5 text-tusz shadow-sm">{POWITANIE}</div>
            {wiadomosci.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {PODPOWIEDZI.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void wyslij(p)}
                    className="rounded-full border border-znak/40 bg-papier px-3 py-1.5 text-left text-sm text-znak-ciemny hover:bg-znak-jasny"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            {wiadomosci.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-tusz px-3.5 py-2.5 text-papier">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-papier px-3.5 py-2.5 text-tusz shadow-sm">
                  <Tresc tekst={m.content} />
                </div>
              ),
            )}
            {czeka && (
              <div className="w-fit rounded-2xl rounded-tl-sm bg-papier px-3.5 py-2.5 text-tusz-2 shadow-sm" aria-label="Asystent pisze">
                Piszę odpowiedź…
              </div>
            )}
            {blad && (
              <p role="alert" className="rounded-xl border border-blad/40 bg-papier px-3 py-2 text-sm text-blad">
                {blad}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-linia bg-papier p-3">
            <div className="flex gap-2">
              <label htmlFor="czat-pytanie" className="sr-only">Twoje pytanie</label>
              <input
                id="czat-pytanie"
                ref={pole}
                value={tekst}
                onChange={(e) => setTekst(e.target.value)}
                maxLength={1000}
                autoComplete="off"
                placeholder="Zadaj pytanie…"
                className="pole min-w-0 flex-1"
              />
              <button type="submit" disabled={czeka || !tekst.trim()} className="btn btn-zielony shrink-0 disabled:opacity-50">
                Wyślij
              </button>
            </div>
            <p className="mt-2 text-xs leading-snug text-tusz-2">
              Asystent AI może się mylić, a ceny są orientacyjne (netto, „od”). Nie podawaj tu danych osobowych.
              Wolisz człowieka? <a href={site.phone.href} className="link">{site.phone.display}</a> lub{' '}
              <a href="/kontakt#konsultacja" className="link">formularz</a>.
            </p>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOtwarty(true)}
          className="btn btn-glowny gap-2 shadow-xl"
          aria-label="Otwórz asystenta: zapytaj o usługi i ceny"
        >
          <Ikona />
          <span className="hidden sm:inline">Zapytaj asystenta</span>
        </button>
      )}
    </div>
  )
}
