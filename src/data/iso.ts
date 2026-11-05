// Strona /wdrozenie-iso: etapy wdrozenia systemow zarzadzania (tresc od Macieja, 4.11.2026).
// Blok ISO 14001 czeka na tresc (pole `gotowe: false` pokazuje komunikat zamiast etapow).

export type IsoEtap = { title: string; text?: string; punkty?: readonly { title: string; text: string }[] }
export type IsoLink = { label: string; href: string }

export type IsoBlok = {
  id: string
  heading: string
  gotowe: boolean
  intro?: string
  etapy: readonly IsoEtap[]
  kluczowe: readonly { title: string; text: string }[]
  zrodla?: readonly IsoLink[]
}

export const ISO_45001: IsoBlok = {
  id: 'iso-45001',
  heading: 'Etapy wdrożenia ISO 45001',
  gotowe: true,
  intro: 'Proces wdrożenia, oparty na cyklu Deminga (Plan, Do, Check, Act), składa się z kilku głównych kroków:',
  etapy: [
    {
      title: 'Audyt zerowy (wstępny)',
      punkty: [
        {
          title: 'Analiza stanu obecnego',
          text: 'Inwentaryzacja aktualnie stosowanych w firmie rozwiązań oraz procedur związanych z BHP.',
        },
        {
          title: 'Ocena luk (Gap Analysis)',
          text: 'Wskazanie rozbieżności pomiędzy istniejącym systemem a restrykcyjnymi wymaganiami normy ISO 45001.',
        },
      ],
    },
    {
      title: 'Planowanie i zaangażowanie kierownictwa (Plan)',
      punkty: [
        {
          title: 'Polityka BHP',
          text: 'Sformułowanie i ogłoszenie oficjalnej polityki oraz celów dotyczących bezpieczeństwa i higieny pracy.',
        },
        {
          title: 'Identyfikacja zagrożeń',
          text: 'Przeprowadzenie kompleksowej oceny ryzyka zawodowego na wszystkich stanowiskach.',
        },
        {
          title: 'Wymagania prawne',
          text: 'Określenie i analiza przepisów prawnych, które firma musi bezwzględnie spełniać.',
        },
        {
          title: 'Udział pracowników',
          text: 'Włączenie personelu oraz ich przedstawicieli w proces planowania (jest to jeden z fundamentów normy ISO 45001).',
        },
      ],
    },
    {
      title: 'Opracowanie dokumentacji i realizacja (Do)',
      punkty: [
        {
          title: 'Tworzenie procedur',
          text: 'Przygotowanie niezbędnej dokumentacji systemowej, w tym zasad reagowania na sytuacje awaryjne, instrukcji stanowiskowych oraz rejestrów.',
        },
        {
          title: 'Szkolenia i budowanie świadomości',
          text: 'Przeprowadzenie szkoleń dla pracowników, aby rozumieli nowe standardy oraz swoje role w systemie.',
        },
        {
          title: 'Uruchomienie procesów',
          text: 'Wprowadzenie procedur w życie i rozpoczęcie codziennego funkcjonowania zgodnie z nowo wyznaczonymi zasadami.',
        },
      ],
    },
    {
      title: 'Monitorowanie i ocena efektów (Check)',
      punkty: [
        {
          title: 'Audyty wewnętrzne',
          text: 'Regularne, niezależne kontrole sprawdzające, czy system działa efektywnie i jest zgodny z normą.',
        },
        {
          title: 'Przegląd zarządzania',
          text: 'Cykliczna ocena systemu dokonywana przez najwyższe kierownictwo w celu weryfikacji jego skuteczności.',
        },
        {
          title: 'Badanie incydentów',
          text: 'Analiza wszelkich wypadków, zdarzeń potencjalnie wypadkowych oraz niezgodności.',
        },
      ],
    },
    {
      title: 'Doskonalenie systemu (Act)',
      punkty: [
        { title: 'Działania korygujące', text: 'Natychmiastowe eliminowanie przyczyn wykrytych błędów i potknięć.' },
        {
          title: 'Ciągłe doskonalenie',
          text: 'Wprowadzanie poprawek mających na celu stałe podnoszenie poziomu bezpieczeństwa w firmie.',
        },
      ],
    },
  ],
  kluczowe: [
    {
      title: 'Czas trwania',
      text: 'Wdrożenie zajmuje zazwyczaj od kilku tygodni do kilku miesięcy, w zależności od wielkości i gotowości organizacji.',
    },
    {
      title: 'Certyfikat',
      text: 'Wydawany jest na okres 3 lat, przy czym co roku odbywają się audyty nadzoru.',
    },
    {
      title: 'Obowiązkowość',
      text: 'Wdrożenie ISO 45001 nie jest obowiązkowe prawem, ale często stanowi wymóg w przetargach lub przy współpracy z dużymi kontrahentami.',
    },
    {
      title: 'Integracja',
      text: 'Dzięki wspólnej strukturze (High Level Structure) normę łatwo połączyć z innymi systemami, takimi jak ISO 9001 czy ISO 14001.',
    },
  ],
  zrodla: [
    {
      label: 'Polskie Centrum Badań i Certyfikacji (PCBC)',
      href: 'https://www.pcbc.gov.pl/pl/uslugi/certyfikacja-systemow-zarzadzania/pn-iso-45001',
    },
    {
      label: 'ISO',
      href: 'https://www.iso.org.pl/uslugi-zarzadzania/wdrazanie-systemow/zarzadzanie-bhp/iso-45001/',
    },
  ],
}

export const ISO_14001: IsoBlok = {
  id: 'iso-14001',
  heading: 'Etapy wdrożenia ISO 14001',
  gotowe: true,
  intro:
    'Wdrożenie Systemu Zarządzania Środowiskowego (SZŚ) zgodnego z normą ISO 14001 opiera się na klasycznym cyklu Deminga. Z uwzględnieniem najnowszej aktualizacji normy (ISO 14001:2026) dzieli się na kilka kluczowych kroków:',
  etapy: [
    {
      title: 'Decyzja kierownictwa i audyt zerowy (analiza luk)',
      punkty: [
        { title: 'Podjęcie decyzji', text: 'Zaangażowanie najwyższego kierownictwa i określenie kontekstu organizacji.' },
        {
          title: 'Audyt wstępny',
          text: 'Ocena aktualnego stanu przedsiębiorstwa, infrastruktury i procedur pod kątem wymagań normy oraz przepisów prawa ochrony środowiska.',
        },
        {
          title: 'Powołanie zespołu',
          text: 'Wyznaczenie Pełnomocnika ds. Systemu Zarządzania Środowiskowego oraz zespołu wdrożeniowego.',
        },
      ],
    },
    {
      title: 'Planowanie (Plan)',
      punkty: [
        { title: 'Polityka środowiskowa', text: 'Sformułowanie deklaracji i celów środowiskowych firmy.' },
        {
          title: 'Identyfikacja aspektów',
          text: 'Wskazanie wszystkich obszarów, w których firma wpływa na środowisko (np. emisje, odpady, zużycie wody) z uwzględnieniem perspektywy cyklu życia produktu.',
        },
        { title: 'Analiza ryzyka', text: 'Ocena ryzyk i szans oraz zaplanowanie działań w sytuacjach awaryjnych.' },
      ],
    },
    {
      title: 'Wdrożenie i operacje (Do)',
      punkty: [
        {
          title: 'Opracowanie dokumentacji',
          text: 'Przygotowanie procedur, księgi systemu i instrukcji stanowiskowych dopasowanych do specyfiki firmy.',
        },
        {
          title: 'Szkolenia pracowników',
          text: 'Budowanie świadomości prośrodowiskowej w zespole oraz przeszkolenie osób odpowiedzialnych za konkretne procesy.',
        },
        {
          title: 'Nadzór operacyjny',
          text: 'Wprowadzenie procedur w codzienne życie firmy (np. zasady dla podwykonawców, kontrola zużycia zasobów).',
        },
      ],
    },
    {
      title: 'Sprawdzanie i ocena efektów (Check)',
      punkty: [
        { title: 'Monitoring i pomiary', text: 'Regularna kontrola wskaźników środowiskowych i stopnia realizacji celów.' },
        {
          title: 'Audyty wewnętrzne',
          text: 'Przeprowadzenie wewnętrznej kontroli mającej na celu wykrycie ewentualnych niezgodności z normą.',
        },
        {
          title: 'Przegląd zarządzania',
          text: 'Cykliczna ocena funkcjonowania systemu dokonywana przez najwyższe kierownictwo.',
        },
      ],
    },
    {
      title: 'Certyfikacja (Act)',
      punkty: [
        {
          title: 'Wybór jednostki',
          text: 'Zgłoszenie się do akredytowanej jednostki certyfikującej (np. DNV czy BSI).',
        },
        {
          title: 'Audyt certyfikujący',
          text: 'Dwuetapowy proces zewnętrzny (etap 1: przegląd dokumentów, etap 2: weryfikacja działań na miejscu w firmie).',
        },
        {
          title: 'Wydanie certyfikatu',
          text: 'Pozytywny wynik audytu oznacza przyznanie certyfikatu na okres 3 lat, z zastrzeżeniem corocznych audytów nadzoru.',
        },
      ],
    },
  ],
  kluczowe: [],
  zrodla: [
    {
      label: 'PKN: nowelizacja normy ISO 14001:2026',
      href: 'https://www.pkn.pl/informacje/2026/04/nowelizacja-normy-iso-140012026-kluczowe-zmiany',
    },
    { label: 'DNV', href: 'https://www.dnv.pl/news/2025/ba_iso-14001---fdis-version/' },
    {
      label: 'BSI',
      href: 'https://www.bsigroup.com/pl-PL/products-and-services/standards-services/iso-14001-key-changes-and-guidance/',
    },
  ],
}
