import { useEffect, useRef, useState, type ReactNode } from 'react'
import { site } from '../config/site'
import {
  DZIALANIA,
  ELEMENTY_ZINTEGROWANE,
  INNE_OKOLICZNOSCI,
  pustyWniosek,
  type TakNie,
  type WniosekDane,
} from '../data/iso-wniosek'
import { normalizeNip } from '../lib/shop'
import { zbudujWniosekPdf } from '../lib/iso-pdf'

type Bledy = Partial<Record<keyof WniosekDane, string>>
type Stan = 'edycja' | 'tworzenie' | 'gotowe' | 'blad'

const chip =
  'flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-linia px-4 py-2 has-checked:border-znak has-checked:bg-znak-jasny has-focus-visible:outline-3 has-focus-visible:outline-znak'

function plik(nazwa: string, norma: string): string {
  const slug = nazwa
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `zgloszenie-${norma.toLowerCase().replace(/\s+/g, '-')}${slug ? `-${slug}` : ''}.pdf`
}

function waliduj(d: WniosekDane): Bledy {
  const b: Bledy = {}
  const wymagane: [keyof WniosekDane, string][] = [
    ['nazwa', 'Podaj nazwę organizacji.'],
    ['adres', 'Podaj adres rejestrowy.'],
    ['osobaWypelniajaca', 'Podaj imię i nazwisko osoby wypełniającej.'],
    ['osobaKontaktowa', 'Podaj imię i nazwisko osoby kontaktowej.'],
    ['telefon', 'Podaj telefon do osoby kontaktowej.'],
  ]
  for (const [k, msg] of wymagane) if (!String(d[k]).trim()) b[k] = msg
  if (!d.nip.trim()) b.nip = 'Podaj NIP.'
  else if (!normalizeNip(d.nip)) b.nip = 'NIP jest nieprawidłowy. Sprawdź cyfry (10 cyfr).'
  if (!d.email.trim()) b.email = 'Podaj e-mail osoby kontaktowej.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) b.email = 'Adres e-mail wygląda na nieprawidłowy.'
  if (!d.certyfikat) b.certyfikat = 'Wybierz Tak albo Nie.'
  if (d.certyfikat === 'tak') {
    if (!d.jednostka.trim()) b.jednostka = 'Podaj jednostkę certyfikującą.'
    if (!d.waznoscDo) b.waznoscDo = 'Podaj datę ważności certyfikatu.'
    if (!d.niezgodnosci) b.niezgodnosci = 'Wybierz Tak albo Nie.'
  }
  if (!d.zintegrowany) b.zintegrowany = 'Wybierz Tak albo Nie.'
  if (!d.data) b.data = 'Podaj datę wypełnienia.'
  return b
}

export function IsoWniosek({ code }: { code: string }) {
  const [d, setD] = useState<WniosekDane>(() => pustyWniosek(code))
  const [bledy, setBledy] = useState<Bledy>({})
  const [stan, setStan] = useState<Stan>('edycja')
  const formRef = useRef<HTMLFormElement>(null)

  // Data dzisiejsza ustawiana po zaladowaniu, zeby nie rozjechac renderu serwera z przegladarka.
  useEffect(() => {
    const t = new Date()
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    setD((x) => (x.data ? x : { ...x, data: iso }))
  }, [])

  const ustaw = <K extends keyof WniosekDane>(k: K, v: WniosekDane[K]) => {
    setD((x) => ({ ...x, [k]: v }))
    setBledy((b) => (b[k] ? { ...b, [k]: undefined } : b))
  }
  const przelacz = (k: 'elementy' | 'dzialania' | 'inne', v: string) =>
    setD((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((e) => e !== v) : [...x[k], v] }))

  const naszaFirma = d.firmaWdrozeniowa === 'Safety First Consulting' && d.konsultant === 'Natalia Krysztofiak'
  const ustawNaszaFirma = (on: boolean) =>
    setD((x) => ({
      ...x,
      firmaWdrozeniowa: on ? 'Safety First Consulting' : '',
      konsultant: on ? 'Natalia Krysztofiak' : '',
    }))

  async function zapisz(e: React.FormEvent) {
    e.preventDefault()
    const b = waliduj(d)
    setBledy(b)
    const pierwszy = Object.keys(b)[0]
    if (pierwszy) {
      setStan('edycja')
      formRef.current?.querySelector<HTMLElement>(`#w-${pierwszy}`)?.focus()
      return
    }
    setStan('tworzenie')
    try {
      const pdf = await zbudujWniosekPdf(d)
      const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = plik(d.nazwa, code)
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setStan('gotowe')
    } catch {
      setStan('blad')
    }
  }

  const liczbaBledow = Object.values(bledy).filter(Boolean).length

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_19rem] lg:gap-12">
      <form ref={formRef} onSubmit={zapisz} noValidate className="grid gap-8">
        {liczbaBledow > 0 && (
          <p role="alert" className="rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">
            Uzupełnij zaznaczone pola ({liczbaBledow}), a potem pobierz zgłoszenie.
          </p>
        )}

        <Sekcja tytul="Dane organizacji">
          <Tekst id="nazwa" label="Nazwa organizacji" d={d} ustaw={ustaw} bledy={bledy} autoComplete="organization" szeroko />
          <Tekst id="nip" label="NIP" d={d} ustaw={ustaw} bledy={bledy} inputMode="numeric" />
          <Tekst id="adres" label="Adres rejestrowy" d={d} ustaw={ustaw} bledy={bledy} autoComplete="street-address" szeroko />
          <Tekst id="osobaWypelniajaca" label="Imię i nazwisko osoby wypełniającej" d={d} ustaw={ustaw} bledy={bledy} szeroko />
        </Sekcja>

        <Sekcja tytul="Osoba kontaktowa">
          <Tekst id="osobaKontaktowa" label="Imię i nazwisko" d={d} ustaw={ustaw} bledy={bledy} autoComplete="name" szeroko />
          <Tekst id="telefon" label="Telefon" d={d} ustaw={ustaw} bledy={bledy} type="tel" autoComplete="tel" />
          <Tekst id="email" label="E-mail" d={d} ustaw={ustaw} bledy={bledy} type="email" autoComplete="email" />
        </Sekcja>

        <Sekcja tytul="Wdrożenie systemu" opis="Pola opcjonalne.">
          <label className={`${chip} sm:col-span-2 w-fit`}>
            <input
              type="checkbox"
              checked={naszaFirma}
              onChange={(e) => ustawNaszaFirma(e.target.checked)}
              className="size-4 accent-znak"
            />
            Wdrożenie i konsultacje prowadzi Safety First
          </label>
          <Tekst id="firmaWdrozeniowa" label="Nazwa firmy wdrożeniowej" d={d} ustaw={ustaw} bledy={bledy} />
          <Tekst id="konsultant" label="Kto prowadził konsultacje w Państwa firmie" d={d} ustaw={ustaw} bledy={bledy} />
        </Sekcja>

        <Sekcja
          tytul="Zakres i wielkość organizacji"
          opis="Pola opcjonalne, ale pomagają przygotować wniosek i ustalić czas auditu."
        >
          <Tekst id="zakres" label="Zakres certyfikacji (czym zajmuje się firma)" d={d} ustaw={ustaw} bledy={bledy} szeroko />
          <Tekst id="pracownicy" label="Liczba pracowników" d={d} ustaw={ustaw} bledy={bledy} inputMode="numeric" />
          <Tekst id="lokalizacje" label="Liczba lokalizacji" d={d} ustaw={ustaw} bledy={bledy} inputMode="numeric" />
        </Sekcja>

        <Sekcja tytul="Dotychczasowa certyfikacja">
          <TakNieGrupa
            id="certyfikat"
            legenda="Czy organizacja posiada ważny certyfikat? (dotyczy wyłącznie nowych klientów)"
            wartosc={d.certyfikat}
            onChange={(v) => ustaw('certyfikat', v)}
            blad={bledy.certyfikat}
          />
          {d.certyfikat === 'tak' && (
            <>
              <Tekst id="jednostka" label="Nazwa jednostki certyfikującej" d={d} ustaw={ustaw} bledy={bledy} />
              <Tekst id="waznoscDo" label="Data ważności certyfikatu" d={d} ustaw={ustaw} bledy={bledy} type="date" />
              <TakNieGrupa
                id="niezgodnosci"
                legenda="Czy w ostatnim 3-letnim cyklu certyfikacji wystąpiły duże niezgodności? (dotyczy wyłącznie transferu z innej jednostki)"
                wartosc={d.niezgodnosci}
                onChange={(v) => ustaw('niezgodnosci', v)}
                blad={bledy.niezgodnosci}
              />
            </>
          )}
        </Sekcja>

        <Sekcja tytul="Zintegrowany system zarządzania">
          <TakNieGrupa
            id="zintegrowany"
            legenda="Czy certyfikacja ma być zintegrowana w ramach Zintegrowanego Systemu Zarządzania?"
            wartosc={d.zintegrowany}
            onChange={(v) => ustaw('zintegrowany', v)}
            blad={bledy.zintegrowany}
          />
          {d.zintegrowany === 'tak' && (
            <Zaznaczenia
              legenda="Które elementy systemu są zintegrowane?"
              opcje={ELEMENTY_ZINTEGROWANE}
              wybrane={d.elementy}
              onToggle={(v) => przelacz('elementy', v)}
            />
          )}
        </Sekcja>

        <Sekcja tytul="Działania w organizacji" opis="Zaznacz te, które występują u Państwa. Niezaznaczone zapiszemy w zgłoszeniu jako „Nie”.">
          <Zaznaczenia
            legenda="Czy występują u Państwa następujące działania?"
            opcje={DZIALANIA}
            wybrane={d.dzialania}
            onToggle={(v) => przelacz('dzialania', v)}
          />
          <Zaznaczenia
            legenda="Inne okoliczności wpływające na czas auditu"
            opcje={INNE_OKOLICZNOSCI}
            wybrane={d.inne}
            onToggle={(v) => przelacz('inne', v)}
          />
        </Sekcja>

        <Sekcja tytul="Data zgłoszenia">
          <Tekst id="data" label="Data wypełnienia zgłoszenia" d={d} ustaw={ustaw} bledy={bledy} type="date" />
        </Sekcja>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={stan === 'tworzenie'} className="btn btn-glowny disabled:opacity-60">
              {stan === 'tworzenie' ? 'Tworzymy PDF…' : 'Pobierz zgłoszenie jako PDF'}
            </button>
            <p className="text-[0.9375rem] text-tusz-2">Dane zostają w Twojej przeglądarce.</p>
          </div>

          {stan === 'gotowe' && (
            <div role="status" className="rounded-[var(--radius-panel)] border border-znak/40 bg-znak-jasny p-5">
              <p className="font-naglowek text-lg font-semibold text-znak-ciemny">Zgłoszenie zostało pobrane</p>
              <p className="mt-2 text-tusz-2">
                Sprawdź plik PDF i prześlij go do nas na{' '}
                <a
                  className="link"
                  href={`mailto:${site.emails.main}?subject=${encodeURIComponent(`Zgłoszenie ISO ${code}`)}`}
                >
                  {site.emails.main}
                </a>
                . Sprawdzimy, czy dane są kompletne, i na ich podstawie przygotujemy z Tobą oficjalny wniosek na dokumentach jednostki certyfikującej. Jeśli
                trzeba coś poprawić, zmień dane w formularzu i pobierz plik jeszcze raz.
              </p>
            </div>
          )}
          {stan === 'blad' && (
            <p role="alert" className="rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">
              Nie udało się utworzyć PDF. Spróbuj jeszcze raz. Jeśli błąd się powtarza, napisz na{' '}
              <a className="underline" href={`mailto:${site.emails.service}`}>{site.emails.service}</a>.
            </p>
          )}
        </div>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="panel border border-linia bg-white p-6">
          <h3 className="text-lg">Jak to działa</h3>
          <ol className="mt-4 grid gap-4 text-[0.9375rem]">
            {[
              'Wypełnij dane firmy i zaznacz, co dotyczy Twojej organizacji.',
              'Pobierz gotowe zgłoszenie jako PDF.',
              `Prześlij go na ${site.emails.main}. Na jego podstawie przygotujemy wniosek.`,
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tusz font-naglowek text-sm font-bold text-tasma">
                  {i + 1}
                </span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-linia pt-4 text-[0.9375rem] text-tusz-2">
            Zgłoszenie powstaje w Twojej przeglądarce. Nie wysyłamy wpisanych danych na serwer i nie zapisujemy ich, więc
            po zamknięciu strony znikną.
          </p>
        </div>
      </aside>
    </div>
  )
}

function Sekcja({ tytul, opis, children }: { tytul: string; opis?: string; children: ReactNode }) {
  return (
    <fieldset className="panel grid gap-5 border border-linia bg-white p-6 sm:grid-cols-2 sm:p-7">
      <legend className="sr-only">{tytul}</legend>
      <div className="sm:col-span-2">
        <h3 className="text-xl" aria-hidden="true">{tytul}</h3>
        {opis && <p className="mt-1 text-[0.9375rem] text-tusz-2">{opis}</p>}
      </div>
      {children}
    </fieldset>
  )
}

function Tekst({
  id,
  label,
  d,
  ustaw,
  bledy,
  type = 'text',
  szeroko = false,
  ...rest
}: {
  id: Exclude<keyof WniosekDane, 'elementy' | 'dzialania' | 'inne'>
  label: string
  d: WniosekDane
  ustaw: <K extends keyof WniosekDane>(k: K, v: WniosekDane[K]) => void
  bledy: Bledy
  type?: string
  szeroko?: boolean
  autoComplete?: string
  inputMode?: 'numeric' | 'text'
}) {
  const blad = bledy[id]
  return (
    <div className={szeroko ? 'sm:col-span-2' : ''}>
      <label className="etykieta" htmlFor={`w-${id}`}>{label}</label>
      <input
        id={`w-${id}`}
        type={type}
        value={d[id] as string}
        onChange={(e) => ustaw(id, e.target.value as WniosekDane[typeof id])}
        aria-invalid={blad ? true : undefined}
        aria-describedby={blad ? `w-${id}-blad` : undefined}
        className="pole"
        {...rest}
      />
      {blad && (
        <p id={`w-${id}-blad`} className="mt-1.5 text-[0.9375rem] font-semibold text-blad">{blad}</p>
      )}
    </div>
  )
}

function TakNieGrupa({
  id,
  legenda,
  wartosc,
  onChange,
  blad,
}: {
  id: string
  legenda: string
  wartosc: TakNie
  onChange: (v: TakNie) => void
  blad?: string
}) {
  return (
    <fieldset id={`w-${id}`} tabIndex={-1} className="sm:col-span-2" aria-describedby={blad ? `w-${id}-blad` : undefined}>
      <legend className="etykieta">{legenda}</legend>
      <div className="mt-2 flex gap-2">
        {(['tak', 'nie'] as const).map((v) => (
          <label key={v} className={chip}>
            <input
              type="radio"
              name={id}
              value={v}
              checked={wartosc === v}
              onChange={() => onChange(v)}
              className="size-4 accent-znak"
            />
            {v === 'tak' ? 'Tak' : 'Nie'}
          </label>
        ))}
      </div>
      {blad && <p id={`w-${id}-blad`} className="mt-1.5 text-[0.9375rem] font-semibold text-blad">{blad}</p>}
    </fieldset>
  )
}

function Zaznaczenia({
  legenda,
  opcje,
  wybrane,
  onToggle,
}: {
  legenda: string
  opcje: readonly string[]
  wybrane: string[]
  onToggle: (v: string) => void
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="etykieta">{legenda}</legend>
      <div className="mt-2 grid gap-2">
        {opcje.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-linia px-4 py-3 has-checked:border-znak has-checked:bg-znak-jasny has-focus-visible:outline-3 has-focus-visible:outline-znak"
          >
            <input
              type="checkbox"
              checked={wybrane.includes(o)}
              onChange={() => onToggle(o)}
              className="mt-0.5 size-5 shrink-0 accent-znak"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
