import { Link, createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { site } from '../config/site'
import { pageHead } from '../lib/seo'
import { submitWithdrawal } from '../server/withdrawal'

// Funkcja odstapienia od umowy online (regulamin §8 ust. 4 i 6, dyrektywa 2023/2673): link "Odstap od umowy tutaj"
// w stopce prowadzi tutaj, oswiadczenie zatwierdza przycisk "Potwierdz odstapienie od umowy".
export const Route = createFileRoute('/odstapienie-od-umowy')({
  head: () =>
    pageHead({
      title: 'Odstąpienie od umowy – Safety First',
      description: 'Złóż online oświadczenie o odstąpieniu od umowy zawartej w sklepie Safety First.',
      path: '/odstapienie-od-umowy',
      noindex: true,
    }),
  component: Odstapienie,
})

function Odstapienie() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ createdAt: string; mailSent: boolean; email: string } | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const text = (k: string) => String(form.get(k) ?? '')
    setError(null)
    setSending(true)
    try {
      const result = await submitWithdrawal({
        data: { orderNumber: text('orderNumber'), name: text('name'), email: text('email'), website: text('website') },
      })
      if (result.ok) {
        setDone({ createdAt: result.createdAt, mailSent: result.mailSent, email: text('email') })
        return
      }
      setError(
        result.field === 'orderNumber'
          ? 'Podaj numer zamówienia, np. SF-2026-000123.'
          : result.field === 'name'
            ? 'Podaj imię i nazwisko lub nazwę firmy.'
            : result.field === 'email'
              ? 'Podaj poprawny adres e-mail.'
              : result.error === 'limit'
                ? 'Za dużo prób w krótkim czasie. Spróbuj za godzinę albo napisz na ' + site.emails.main + '.'
                : 'Nie udało się zapisać oświadczenia. Wyślij je e-mailem na ' + site.emails.main + '.',
      )
    } catch {
      setError('Nie udało się zapisać oświadczenia. Wyślij je e-mailem na ' + site.emails.main + '.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="kontener max-w-2xl py-16 md:py-24">
      <h1>Odstąp od umowy tutaj</h1>
      <p className="mt-6 text-lg text-tusz-2">
        Formularz dotyczy zamówień ze sklepu Safety First. Prawo odstąpienia i jego wyjątki opisuje §8{' '}
        <Link to="/regulamin" className="link">Regulaminu</Link>. Oświadczenie możesz też wysłać e-mailem na {site.emails.main}{' '}
        albo pisemnie na adres: {site.company.name}, {site.legal.salesOffice}.
      </p>

      {done ? (
        <div role="status" className="mt-10 rounded-2xl bg-znak-jasny p-6">
          <p className="font-semibold">Oświadczenie o odstąpieniu od umowy zostało złożone.</p>
          <p className="mt-2">
            Data i godzina złożenia:{' '}
            {new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long', timeStyle: 'medium', timeZone: 'Europe/Warsaw' }).format(new Date(done.createdAt))}.
          </p>
          <p className="mt-2">
            {done.mailSent
              ? `Potwierdzenie z treścią oświadczenia wysłaliśmy na ${done.email}.`
              : `Oświadczenie zapisaliśmy, ale nie udało się wysłać potwierdzenia e-mailem. Wyślemy je ręcznie na ${done.email}.`}
          </p>
        </div>
      ) : (
        <form className="panel mt-10 grid gap-5" onSubmit={onSubmit}>
          <p className="font-semibold">Oświadczam, że odstępuję od umowy sprzedaży zawartej w ramach zamówienia:</p>
          <div>
            <label htmlFor="w-order" className="block text-sm font-semibold">Numer zamówienia</label>
            <input id="w-order" name="orderNumber" required placeholder="SF-2026-000123" className="pole mt-1 w-full" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="w-name" className="block text-sm font-semibold">Imię i nazwisko lub nazwa firmy</label>
            <input id="w-name" name="name" required autoComplete="name" className="pole mt-1 w-full" />
          </div>
          <div>
            <label htmlFor="w-email" className="block text-sm font-semibold">E-mail podany w zamówieniu</label>
            <input id="w-email" name="email" type="email" required autoComplete="email" className="pole mt-1 w-full" />
            <p className="mt-1 text-xs text-tusz-2">Na ten adres wyślemy potwierdzenie z treścią oświadczenia, datą i godziną.</p>
          </div>
          {/* Pole pulapka dla botow (ukryte). */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="w-website">Strona</label>
            <input id="w-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <button type="submit" className="btn btn-glowny justify-self-start" disabled={sending}>
            {sending ? 'Zapisuję…' : 'Potwierdź odstąpienie od umowy'}
          </button>
          {error && <p role="alert" className="rounded-xl border-l-4 border-blad bg-blad/8 p-4 font-semibold text-blad">{error}</p>}
          <p className="text-sm text-tusz-2">
            Dane z formularza przetwarzamy, żeby obsłużyć odstąpienie, zgodnie z{' '}
            <Link to="/polityka-prywatnosci" className="link">Polityką prywatności</Link>.
          </p>
        </form>
      )}
    </main>
  )
}
