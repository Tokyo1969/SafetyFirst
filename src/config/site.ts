// Dane firmy i kontaktowe w jednym miejscu.
// Po zalozeniu sp. z o.o. zmieniamy tylko ten plik (stopka, polityka prywatnosci, formularz).
export const site = {
  brand: 'Safety First',
  domain: 'safetyfirst.opole.pl',
  tagline: 'BHP i ochrona środowiska',
  person: {
    name: 'Natalia Krysztofiak',
    role: 'specjalista ds. BHP i Ochrony Środowiska',
  },
  // Dane tymczasowe do czasu zalozenia sp. z o.o.
  company: {
    name: '',
    nip: '',
    street: '',
    postalCode: '',
    city: '',
  },
  phone: { display: '+48 123 456 789', href: 'tel:+48123456789' },
  emails: {
    main: 'biuro@safetyfirst.opole.pl',
    // Skrzynki tematyczne, widoczne w sekcji konsultacji (blocks.tsx), docelowo tez pod automatyzacje.
    bhp: 'bhp@safetyfirst.opole.pl',
    os: 'os@safetyfirst.opole.pl',
    training: 'szkolenia@safetyfirst.opole.pl',
    service: 'serwis@safetyfirst.opole.pl',
  },
  // Klucz witryny Cloudflare Turnstile (publiczny z zalozenia). Pusty = formularz bez widgetu.
  // Sekret TURNSTILE_SECRET_KEY ustawiamy tylko jako sekret Workera (wrangler secret / panel).
  turnstileSiteKey: '0x4AAAAAAFTBeyBlLr7YGEbb',
  // Wykonawca strony (link w stopce).
  builder: { name: 'NexXsite', url: 'https://nexxsite.pl' },
  // Google Analytics 4 (ID pomiaru, publiczny). Pusty = bez analityki.
  gaId: 'G-XDCZRXJ50V',
  region: 'województwo opolskie',
  maxEmployees: 50,
} as const
