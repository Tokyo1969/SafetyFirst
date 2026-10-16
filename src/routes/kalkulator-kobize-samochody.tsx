import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const fuels = {
  benzyna: { label: 'Benzyna silnikowa', density: 0.755 },
  diesel: { label: 'Olej napędowy (diesel)', density: 0.84 },
  lpg: { label: 'LPG', density: 0.51 },
} as const

type Fuel = keyof typeof fuels

type FuelEntry = {
  id: number
  fuel: Fuel
  liters: string
  factor: string
  factorName: string
}

export const Route = createFileRoute('/kalkulator-kobize-samochody')({
  head: () => ({
    meta: [
      { title: 'Testowy kalkulator KOBiZE dla samochodów | Safety First' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KobizeCarsCalculator,
})

function KobizeCarsCalculator() {
  const [entries, setEntries] = useState<FuelEntry[]>([
    { id: 1, fuel: 'benzyna', liters: '', factor: '', factorName: '' },
  ])

  const updateEntry = (id: number, changes: Partial<FuelEntry>) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)),
    )
  }

  const totalMass = entries.reduce((total, entry) => {
    const liters = Number(entry.liters)
    return total + (Number.isFinite(liters) && liters > 0 ? (liters * fuels[entry.fuel].density) / 1000 : 0)
  }, 0)

  return (
    <main>
      <section className="bg-tusz py-16 text-papier md:py-24">
        <div className="kontener max-w-4xl">
          <p className="mb-5 inline-flex rounded-full bg-tasma px-4 py-1 font-naglowek text-sm font-bold text-tusz">
            Wersja testowa
          </p>
          <h1>KOBiZE dla floty samochodowej — kalkulator i instrukcja</h1>
          <p className="mt-6 max-w-3xl text-lg text-papier/80 md:text-xl">
            Przygotuj dane o paliwie, oszacuj jego masę i przejdź przez podstawowe etapy
            raportowania emisji z samochodów firmowych.
          </p>
          <p className="mt-8 rounded-2xl border border-papier/20 bg-papier/10 p-5 text-base">
            Ta strona nie jest podlinkowana z serwisu. To test przed ewentualnym udostępnieniem
            kalkulatora po zalogowaniu i opłaceniu dostępu — obecnie nie ma tu logowania,
            płatności ani blokady dostępu.
          </p>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener max-w-4xl">
          <div className="mb-10">
            <h2>Przelicz zużycie paliwa</h2>
            <p className="mt-4 max-w-3xl text-tusz-2">
              Wpisz roczne zużycie dla każdego rodzaju paliwa. Przelicznik wykorzystuje
              orientacyjne gęstości z poradnika. Wskaźnik emisji wpisz na podstawie aktualnych
              danych KOBiZE dla wybranej substancji.
            </p>
          </div>

          <div className="grid gap-5">
            {entries.map((entry, index) => {
              const liters = Number(entry.liters)
              const factor = Number(entry.factor)
              const mass =
                Number.isFinite(liters) && liters > 0
                  ? (liters * fuels[entry.fuel].density) / 1000
                  : 0
              const emissions =
                mass > 0 && entry.factor.trim() !== '' && Number.isFinite(factor) && factor >= 0
                  ? mass * factor
                  : null

              return (
                <fieldset key={entry.id} className="panel min-w-0 p-5 sm:p-7">
                  <legend className="px-2 font-naglowek text-lg font-semibold">
                    Rodzaj paliwa {index + 1}
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="font-naglowek font-semibold">
                      Rodzaj paliwa
                      <select
                        className="pole"
                        value={entry.fuel}
                        onChange={(event) => updateEntry(entry.id, { fuel: event.target.value as Fuel })}
                      >
                        {Object.entries(fuels).map(([value, fuel]) => (
                          <option key={value} value={value}>{fuel.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="font-naglowek font-semibold">
                      Zużycie w roku (litry)
                      <input
                        className="pole"
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={entry.liters}
                        onChange={(event) => updateEntry(entry.id, { liters: event.target.value })}
                        placeholder="np. 1250"
                      />
                    </label>
                    <label className="font-naglowek font-semibold">
                      Nazwa substancji (opcjonalnie)
                      <input
                        className="pole"
                        type="text"
                        value={entry.factorName}
                        onChange={(event) => updateEntry(entry.id, { factorName: event.target.value })}
                        placeholder="np. CO₂"
                      />
                    </label>
                    <label className="font-naglowek font-semibold">
                      Wskaźnik emisji (kg/Mg)
                      <input
                        className="pole"
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={entry.factor}
                        onChange={(event) => updateEntry(entry.id, { factor: event.target.value })}
                        placeholder="Wpisz aktualny wskaźnik"
                      />
                    </label>
                  </div>
                  <div className="mt-5 grid gap-2 rounded-xl bg-mgla p-4 sm:grid-cols-2">
                    <p>
                      Masa paliwa:{' '}
                      <strong>{formatNumber(mass)} Mg</strong>
                    </p>
                    <p>
                      {emissions !== null
                        ? <>Emisja{entry.factorName ? ` ${entry.factorName}` : ''}: <strong>{formatNumber(emissions)} kg</strong></>
                        : 'Emisja: podaj wskaźnik w kg/Mg, aby ją obliczyć.'}
                    </p>
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      className="link mt-4"
                      onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}
                    >
                      Usuń tę pozycję
                    </button>
                  )}
                </fieldset>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="btn btn-obrys"
              onClick={() =>
                setEntries((current) => [
                  ...current,
                  { id: Math.max(0, ...current.map((entry) => entry.id)) + 1, fuel: 'benzyna', liters: '', factor: '', factorName: '' },
                ])
              }
            >
              Dodaj rodzaj paliwa
            </button>
            <p className="rounded-xl bg-znak-jasny px-5 py-3 font-naglowek font-semibold">
              Łączna obliczona masa paliwa: {formatNumber(totalMass)} Mg
            </p>
          </div>

          <p className="mt-6 text-sm text-tusz-2">
            Gęstości użyte w kalkulatorze: benzyna 0,755 kg/l, olej napędowy 0,840 kg/l,
            LPG 0,510 kg/l. To wartości orientacyjne. Emisja = masa paliwa [Mg] × wskaźnik
            emisji [kg/Mg]. Wyniki nie są wysyłane ani zapisywane.
          </p>
        </div>
      </section>

      <section className="sekcja bg-papier">
        <div className="kontener max-w-4xl">
          <h2>Co przygotować przed raportowaniem?</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li className="rounded-2xl border border-linia p-5">
              <h3>Roczne zużycie paliwa</h3>
              <p className="mt-2 text-tusz-2">
                Zbierz faktury i zestawienia za poprzedni rok. Ustal ilości benzyny, oleju
                napędowego i LPG; nie mieszaj jednostek.
              </p>
            </li>
            <li className="rounded-2xl border border-linia p-5">
              <h3>Dane o pojazdach</h3>
              <p className="mt-2 text-tusz-2">
                Przygotuj typ pojazdu, jego kategorię oraz normę Euro. Sprawdź dane w dokumentach
                pojazdu lub właściwych rejestrach.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="sekcja">
        <div className="kontener max-w-4xl">
          <h2>Raport KOBiZE — podstawowa ścieżka</h2>
          <ol className="mt-8 grid gap-6">
            {[
              ['Zaloguj się do systemu', 'Skorzystaj z oficjalnego systemu KOBiZE i właściwego konta podmiotu.'],
              ['Wybierz rok i uzupełnij dane', 'Utwórz raport za właściwy rok sprawozdawczy i wskaż źródła emisji związane z pojazdami.'],
              ['Wprowadź paliwa i sprawdź wskaźniki', 'Wprowadź zużycie zgodnie z jednostkami wymaganymi przez formularz. Zweryfikuj wskaźniki dla roku i substancji.'],
              ['Sprawdź i zachowaj potwierdzenie', 'Użyj walidacji systemu przed wysłaniem. Po złożeniu pobierz UPP lub kopię raportu i przechowuj dokumentację.'],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-5 rounded-2xl bg-papier p-5 sm:p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tusz font-naglowek font-bold text-tasma">
                  {index + 1}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p className="mt-2 text-tusz-2">{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-2xl border-l-4 border-tasma bg-papier p-5 sm:p-6">
            <h3>Terminy i weryfikacja</h3>
            <p className="mt-2 text-tusz-2">
              Poradnik źródłowy wskazuje koniec lutego jako termin złożenia raportu za poprzedni
              rok oraz potrzebę zachowania zgodności z rozliczeniem opłat środowiskowych.
              Przed wysłaniem sprawdź aktualne terminy, instrukcje i wymagania w oficjalnych
              źródłach — mogą się zmieniać.
            </p>
          </div>
        </div>
      </section>

      <section className="sekcja bg-tusz text-papier">
        <div className="kontener max-w-4xl">
          <h2>Ważne informacje o wersji testowej</h2>
          <ul className="mt-6 grid gap-3 text-papier/85">
            <li>Kalkulator szacuje masę paliwa na podstawie orientacyjnej gęstości.</li>
            <li>Nie zawiera wbudowanych oficjalnych wskaźników emisji i nie weryfikuje ich poprawności.</li>
            <li>Nie zastępuje raportu w systemie KOBiZE, porady eksperta ani sprawdzenia aktualnych przepisów.</li>
            <li>Wartości wpisane na tej stronie nie są zapisywane ani przesyłane.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 6 }).format(value)
}
