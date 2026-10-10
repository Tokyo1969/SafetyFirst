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
      <p className="mt-6">
        Formularz chroni przed spamem usługa Cloudflare Turnstile. Podczas wysyłki Cloudflare może otrzymać dane
        techniczne przeglądarki (m.in. adres IP) w celu odróżnienia człowieka od automatu.
      </p>
      <p className="mt-6">
        Za Twoją zgodą (baner na stronie) mierzymy ruch usługą Google Analytics 4 (Google Ireland Limited). Zapisuje
        ona pliki cookie i przekazuje do Google dane o korzystaniu ze strony, m.in. odwiedzone podstrony, przybliżoną
        lokalizację i dane techniczne przeglądarki. Bez zgody analityka nie zapisuje ciasteczek. Zgodę możesz
        w każdej chwili zmienić lub wycofać przyciskiem „Ustawienia cookies” w stopce strony.
      </p>
    </main>
  )
}
