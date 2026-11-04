// Strona /wdrozenie-iso: etapy wdrozenia systemow zarzadzania (tresc od Macieja, 4.11.2026).
// Blok ISO 14001 czeka na tresc (pole `gotowe: false` pokazuje komunikat zamiast etapow).

export type IsoEtap = { title: string; text: string }
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
  intro: 'Proces wdrożenia i certyfikacji składa się z kilku głównych kroków:',
  etapy: [
    {
      title: 'Audyt zerowy (stan zerowy)',
      text: 'Analiza obecnego stanu BHP w firmie, przegląd dokumentacji oraz identyfikacja luk względem wymagań normy (GAP Analysis).',
    },
    {
      title: 'Opracowanie dokumentacji',
      text: 'Przygotowanie polityki BHP, procedur, instrukcji oraz rejestrów oceny ryzyka zawodowego.',
    },
    {
      title: 'Wdrożenie w praktyce',
      text: 'Wprowadzenie nowych zasad do codziennej działalności firmy oraz przeszkolenie pracowników.',
    },
    {
      title: 'Audyt wewnętrzny i Przegląd Zarządzania',
      text: 'Sprawdzenie skuteczności systemu przez firmę oraz ocena jego działania przez kadrę kierowniczą.',
    },
    {
      title: 'Certyfikacja',
      text: 'Zewnętrzny audyt przeprowadzany przez niezależną jednostkę certyfikującą, składający się z dwóch etapów.',
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
  gotowe: false,
  etapy: [],
  kluczowe: [],
}
