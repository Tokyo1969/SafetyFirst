import { createFileRoute } from '@tanstack/react-router'
import { site } from '../config/site'

export const Route = createFileRoute('/polityka-prywatnosci')({
  head: () => ({ meta: [{ title: 'Polityka prywatności – Safety First' }] }),
  component: Privacy,
})

function Privacy() {
  const c = site.company
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl">Polityka prywatności</h1>
      <p className="mt-4 border-l-8 border-tasma bg-white p-4 font-semibold">
        Wersja robocza. Przed uruchomieniem strony wymaga sprawdzenia przez prawnika.
      </p>
      <p className="mt-6">
        Administratorem danych jest {c.name}, {c.street}, {c.postalCode} {c.city}, NIP {c.nip}. Dane z formularza
        (imię i nazwisko, e-mail, telefon i opis firmy) wykorzystujemy tylko do odpowiedzi na zapytanie.
        Kontakt w sprawie danych: {site.emails.main}.
      </p>
    </main>
  )
}
