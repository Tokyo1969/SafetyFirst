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
    name: 'Natalia Krysztofiak',
    nip: '9910339622',
    street: 'ul. Grudzicka 6',
    postalCode: '45-432',
    city: 'Opole',
  },
  phone: { display: '+48 515 318 876', href: 'tel:+48515318876' },
  emails: {
    main: 'biuro@safetyfirst.opole.pl',
    // Skrzynki tematyczne, widoczne w sekcji konsultacji (blocks.tsx), docelowo tez pod automatyzacje.
    bhp: 'bhp@safetyfirst.opole.pl',
    os: 'os@safetyfirst.opole.pl',
    training: 'szkolenia@safetyfirst.opole.pl',
    service: 'serwis@safetyfirst.opole.pl',
  },
  region: 'województwo opolskie',
  maxEmployees: 50,
} as const
