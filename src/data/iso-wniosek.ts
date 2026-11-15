// Wniosek o certyfikacje systemu zarzadzania (zakladka "Zloz wniosek" na /wdrozenie-iso/<norma>).
// Zakres pol wg wniosku jednostki certyfikujacej (plik od Macieja, 15.11.2026). Bez numerow punktow normy,
// bo numeracja moze sie roznic miedzy wydaniami; opisy sa po polsku, pisownia ISO: audit/auditor.
// Dane zostaja w przegladarce: PDF powstaje na urzadzeniu uzytkownika (src/lib/iso-pdf.ts).

export type TakNie = '' | 'tak' | 'nie'

export type WniosekDane = {
  norma: string
  nazwa: string
  nip: string
  adres: string
  osobaWypelniajaca: string
  osobaKontaktowa: string
  telefon: string
  email: string
  firmaWdrozeniowa: string
  konsultant: string
  zakres: string
  pracownicy: string
  lokalizacje: string
  certyfikat: TakNie
  jednostka: string
  waznoscDo: string
  niezgodnosci: TakNie
  zintegrowany: TakNie
  elementy: string[]
  dzialania: string[]
  inne: string[]
  data: string
}

export const ELEMENTY_ZINTEGROWANE = [
  'Przegląd zarządzania',
  'Audity wewnętrzne i auditorzy',
  'Polityka',
  'Cele i programy',
  'Opisy procesów',
  'Zintegrowany zbiór dokumentów systemu zarządzania',
  'Zarządzanie dokumentacją',
  'Zarządzanie działaniami korygującymi i doskonaleniem',
  'Identyfikacja wymagań prawnych',
  'Zintegrowana odpowiedzialność kierownictwa',
] as const

export const DZIALANIA = [
  'Planowanie i nadzór operacyjny',
  'Projektowanie i rozwój',
  'Nadzór nad procesami, produktami i usługami dostarczanymi z zewnątrz',
  'Sterowanie produkcją i realizacją usług, w tym walidacja procesów specjalnych',
  'Identyfikacja i identyfikowalność',
  'Własność klienta i zewnętrznego dostawcy',
  'Zasoby do monitorowania i pomiarów',
] as const

export const INNE_OKOLICZNOSCI = [
  'Bardzo mały oddział w stosunku do liczby personelu (np. wyłącznie biuro, bez pracy poza nim)',
  'Wysoki poziom automatyzacji: procesy kontrolują maszyny lub oprogramowanie',
  'Część personelu pracuje poza lokalizacją (handlowcy, kierowcy, personel wykonujący usługi)',
] as const

export function pustyWniosek(norma: string): WniosekDane {
  return {
    norma,
    nazwa: '',
    nip: '',
    adres: '',
    osobaWypelniajaca: '',
    osobaKontaktowa: '',
    telefon: '',
    email: '',
    firmaWdrozeniowa: '',
    konsultant: '',
    zakres: '',
    pracownicy: '',
    lokalizacje: '',
    certyfikat: '',
    jednostka: '',
    waznoscDo: '',
    niezgodnosci: '',
    zintegrowany: '',
    elementy: [],
    dzialania: [],
    inne: [],
    data: '',
  }
}
