import { createFileRoute } from '@tanstack/react-router'
import { site } from '../config/site'
import { pageHead } from '../lib/seo'

export const Route = createFileRoute('/polityka-prywatnosci')({
  head: () =>
    pageHead({
      title: 'Polityka prywatności – Safety First',
      description: 'Polityka prywatności serwisu Safety First.',
      path: '/polityka-prywatnosci',
      noindex: true,
    }),
  component: Privacy,
})

function Privacy() {
  const c = site.company
  return (
    <main className="kontener max-w-3xl py-16 md:py-24">
      <h1>Polityka prywatności</h1>
      <p className="mt-6 rounded-xl border-l-4 border-tasma bg-papier p-4 font-semibold">
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
