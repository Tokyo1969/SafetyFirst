// Dane firmy i kontaktowe w jednym miejscu.
// Po zalozeniu sp. z o.o. zmieniamy tylko ten plik (stopka, polityka prywatnosci, formularz).
export const site = {
  brand: 'Safety First',
  domain: 'safetyfirst.opole.pl',
  tagline: 'BHP i ochrona środowiska',
  person: {
    name: 'Natalia Krysztofiak',
    role: 'Główny Specjalista ds. BHP i Ochrony Środowiska',
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
    // Skrzynka na skroty rozmow z asystentem (nie jest pokazywana na stronie).
    chatLog: 'info@safetyfirst.opole.pl',
  },
  // Supabase w przegladarce (panel /admin). Te same wartosci co SUPABASE_URL i SUPABASE_ANON_KEY w wrangler.jsonc;
  // klucz publishable jest publiczny z zalozenia, dostep pilnuje RLS (zapis tylko dla is_admin()).
  supabase: {
    url: 'https://rcizhcktflczrtadifwd.supabase.co',
    anonKey: 'sb_publishable_FFj4g4XoQmM6a8sBn1zW2A_sg7jKQ4b',
  },
  // Dokumenty prawne sklepu (tresc w src/content). Przy nowej wersji regulaminu: nowy PDF w public/dokumenty,
  // zmiana regulaminPdf i wersji w panelu (Ustawienia > Wersja regulaminu), bo wersja trafia do kazdego zamowienia.
  legal: {
    regulaminPath: '/regulamin',
    regulaminPdf: '/dokumenty/regulamin-2026-11-08.pdf',
    privacyPath: '/polityka-prywatnosci',
    withdrawalPath: '/odstapienie-od-umowy',
    // Adres do korespondencji (biuro sprzedazy i szkolen), regulamin §1 ust. 2.
    salesOffice: 'ul. Łangowskiego 4A, 45-031 Opole',
  },
  // Klucz witryny Cloudflare Turnstile (publiczny z zalozenia). Pusty = formularz bez widgetu.
  // Sekret TURNSTILE_SECRET_KEY ustawiamy tylko jako sekret Workera (wrangler secret / panel).
  turnstileSiteKey: '0x4AAAAAAFTBeyBlLr7YGEbb',
  // Najwazniejsze linki zewnetrzne (stopka, kolumna Kontakt).
  usefulLinks: [
    { label: 'KOBiZE', url: 'https://www.kobize.pl/' },
    { label: 'BDO', url: 'https://rejestr-bdo.mos.gov.pl/Registry/Index' },
    { label: 'WIOŚ Opole', url: 'https://www.gov.pl/web/wios-opole/wojewodzki-inspektorat-ochrony-srodowiska-w-opolu' },
    { label: 'PIP Opole', url: 'https://opole.pip.gov.pl/' },
    { label: 'Urząd Marszałkowski Woj. Opolskiego', url: 'https://www.opolskie.pl/' },
    { label: 'GIOŚ', url: 'https://www.gov.pl/web/gios' },
    { label: 'CIOP-PIB', url: 'https://www.ciop.pl/' },
  ],
  // Wykonawca strony (link w stopce).
  builder: { name: 'NexXsite', url: 'https://nexxsite.pl' },
  // Google Analytics 4 (ID pomiaru, publiczny). Pusty = bez analityki.
  gaId: 'G-XDCZRXJ50V',
  // Asystent AI na stronie (okienko czatu). Wlaczyc (true) po ustawieniu sekretu OPENAI_API_KEY w Workerze.
  // Podglad na zywo przed wlaczeniem: dopisz ?asystent=1 do adresu strony.
  // saveConversations: zapis rozmow do bazy (tabela chat_messages) do analiz, decyzja Natalii z 17.10.2026.
  // Wymaga migracji 20261017000000_chat_messages.sql, informacji w oknie czatu i akapitu w polityce prywatnosci.
  // Skrot rozmow na info@ wysyla n8n (workflow "Safety First - Skrot rozmow z asystentem na info@").
  chat: { enabled: true, saveConversations: true },
  // Platnosci online i sklep (/sklep, /sklep/<slug>, /koszyk; Stripe Checkout, powrot na /zamowienie).
  // WYLACZONE do czasu regulaminu sklepu i dokumentow. Podglad przed wlaczeniem: /sklep?platnosci=1 (zapamietany w karcie).
  // Po wlaczeniu: link Sklep i koszyk w naglowku, indeksowanie /sklep (dopisac do SITEMAP_PATHS i produkty do sitemap).
  // mode 'test': serwer przyjmuje tylko klucz testowy (sk_test_/rk_test_), webhook pomija zdarzenia z trybu live.
  // Produkty, ceny netto i stawki VAT sa w Supabase (products, app_settings), zamowienia w orders/order_items.
  // Sekrety STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET i SUPABASE_SERVICE_ROLE_KEY tylko jako sekrety Workera.
  // fakturowniaDomain: subdomena konta Fakturowni (<domena>.fakturownia.pl). Pusta = bez automatycznych faktur.
  // Tryb test wystawia proforma, live faktury VAT (src/server/fakturownia.ts). Sekret FAKTUROWNIA_API_TOKEN w Workerze.
  payments: { enabled: false, mode: 'test' as 'test' | 'live', fakturowniaDomain: 'safetyfirst' as string },
  region: 'województwo opolskie',
  // Dane lokalne do schematu LocalBusiness (src/lib/seo.ts, organizationLd). Pole puste = pomijane w schemacie.
  // Nazwa, adres i telefon (NAP) maja byc IDENTYCZNE jak w Profilu Firmy w Google (zob. tez company i phone).
  local: {
    // Nazwa i adres dokladnie jak w Profilu Firmy w Google (13.11.2026). Siedziba prawna (company) zostaje w dokumentach.
    name: 'Safety First Consulting',
    address: { street: 'ul. Łangowskiego 4A', postalCode: '45-031', city: 'Opole' },
    // Adres wizytowki w Mapach Google (wariant cid, stabilny).
    mapUrl: 'https://maps.google.com/?cid=1820024980223681314',
    // Dodatkowe profile firmowe (LinkedIn, Facebook): pelne adresy URL.
    sameAs: ['https://www.facebook.com/groups/965714223096324'] as string[],
    // Wspolrzedne z wizytowki.
    geo: { lat: 50.6708162, lng: 17.92274 } as { lat: number; lng: number } | null,
    // Godziny jak w wizytowce: pn-pt 9:00-17:00.
    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
    ] as { days: string[]; opens: string; closes: string }[],
  },
  maxEmployees: 50,
} as const
