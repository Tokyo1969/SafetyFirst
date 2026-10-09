import { useState, type FormEvent } from 'react'
import { submitConsultation, type ConsultationResult } from '../server/consultation'
import { INDUSTRIES } from '../data/pricing'
import { site } from '../config/site'

const SERVICES = ['BHP', 'Ochrona środowiska', 'Szkolenia']
const EMPLOYEES = ['1–5', '6–10', '11–20', '21–30', '31–40', '41–50', 'powyżej 50']

const field =
  'mt-1 block w-full border border-tusz-2 bg-white px-3 py-2 font-tekst text-base text-tusz'
const label = 'block font-naglowek text-lg font-semibold'

export function ConsultationForm({ defaultServices = ['BHP'] }: { defaultServices?: string[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const text = (k: string) => String(form.get(k) ?? '')
    setState('sending')
    let result: ConsultationResult
    try {
      result = await submitConsultation({
        data: {
          name: text('name'),
          company: text('company'),
          email: text('email'),
          phone: text('phone'),
          industry: text('industry'),
          employees: text('employees'),
          positions: text('positions'),
          location: text('location'),
          services: form.getAll('services').map(String),
          message: text('message'),
          consent: form.get('consent') === 'on',
          website: text('website'),
        },
      })
    } catch {
      result = { ok: false, error: 'failed' }
    }
    if (result.ok) {
      setState('done')
      return
    }
    setState('idle')
    if (result.error === 'invalid') {
      setError(
        result.field === 'email'
          ? 'Wpisz poprawny adres e-mail.'
          : result.field === 'consent'
            ? 'Zaznacz zgodę na kontakt, żebyśmy mogli odpowiedzieć.'
            : 'Wpisz imię i nazwisko.',
      )
    } else {
      setError(
        `Nie udało się wysłać formularza. Napisz na ${site.emails.main} albo zadzwoń: ${site.phone.display}.`,
      )
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="border-l-8 border-zielen bg-white p-6">
        <p className="font-naglowek text-2xl font-bold">Dziękujemy, zgłoszenie dotarło.</p>
        <p className="mt-2">Odezwiemy się w ciągu jednego dnia roboczego.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" noValidate>
      <div>
        <label className={label} htmlFor="f-name">Imię i nazwisko</label>
        <input id="f-name" name="name" required autoComplete="name" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="f-company">Firma</label>
        <input id="f-company" name="company" autoComplete="organization" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="f-email">E-mail</label>
        <input id="f-email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="f-phone">Telefon</label>
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="f-industry">Branża</label>
        <select id="f-industry" name="industry" className={field} defaultValue="">
          <option value="">Wybierz</option>
          {INDUSTRIES.map((i) => (
            <option key={i.id} value={i.name}>{i.name}</option>
          ))}
          <option value="Inna">Inna</option>
        </select>
      </div>
      <div>
        <label className={label} htmlFor="f-employees">Liczba pracowników</label>
        <select id="f-employees" name="employees" className={field} defaultValue="">
          <option value="">Wybierz</option>
          {EMPLOYEES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="f-positions">Liczba stanowisk pracy</label>
        <input id="f-positions" name="positions" inputMode="numeric" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="f-location">Lokalizacja firmy</label>
        <input id="f-location" name="location" placeholder="np. Opole" className={field} />
      </div>
      <fieldset className="md:col-span-2">
        <legend className={label}>Czego potrzebujesz?</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input type="checkbox" name="services" value={s} defaultChecked={defaultServices.includes(s)} className="size-5 accent-znak" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="md:col-span-2">
        <label className={label} htmlFor="f-message">Wiadomość</label>
        <textarea id="f-message" name="message" rows={4} className={field} />
      </div>
      {/* Pole pulapka dla botow, ukryte przed ludzmi */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>Nie wypełniaj <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="md:col-span-2">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1.5 size-5 accent-znak" />
          <span>
            Zgadzam się na kontakt w sprawie zapytania. Dane przetwarzamy zgodnie z{' '}
            <a href="/polityka-prywatnosci" className="text-znak underline">polityką prywatności</a>.
          </span>
        </label>
      </div>
      {error && (
        <p role="alert" className="border-l-8 border-blad bg-white p-4 font-semibold text-blad md:col-span-2">
          {error}
        </p>
      )}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-znak px-6 py-3 font-naglowek text-xl font-semibold text-white hover:bg-znak-ciemny disabled:opacity-60"
        >
          {state === 'sending' ? 'Wysyłamy…' : 'Wyślij zgłoszenie'}
        </button>
      </div>
    </form>
  )
}
