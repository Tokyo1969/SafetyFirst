// Podstrony usług BHP. Ceny i zakres z "OFERTA HANDLOWA.md" oraz "oferta bhp.md" (Natalia Krysztofiak).
// Ceny netto, orientacyjne ("od").
export type ServicePrice = { name: string; price: string; note?: string }

export type Service = {
  slug: string
  navLabel: string
  title: string
  metaTitle: string
  metaDescription: string
  lead: string
  scope: readonly string[]
  scopeHeading: string
  prices: readonly ServicePrice[]
  priceNote?: string
  steps: readonly string[]
  formServices: readonly string[]
}

export const SERVICES: readonly Service[] = [
  {
    slug: 'szkolenia-bhp',
    navLabel: 'Szkolenia BHP',
    title: 'Szkolenia BHP dla pracowników i pracodawców',
    metaTitle: 'Szkolenia BHP w Opolu i województwie opolskim – Safety First',
    metaDescription:
      'Szkolenia wstępne i okresowe BHP dla pracowników biurowych, robotniczych, inżynieryjno-technicznych oraz pracodawców. Instruktaż ogólny od 60 zł netto za osobę.',
    lead: 'Szkolenia wstępne i okresowe dopasowane do stanowisk w Twojej firmie. Dokumentację szkoleń przygotowujemy i pilnujemy terminów, żeby żaden pracownik nie został bez ważnego szkolenia.',
    scopeHeading: 'Rodzaje szkoleń',
    scope: [
      'Szkolenia wstępne: instruktaż ogólny i instruktaż stanowiskowy',
      'Szkolenia okresowe dla pracowników administracyjno-biurowych',
      'Szkolenia okresowe dla pracowników na stanowiskach robotniczych',
      'Szkolenia okresowe dla pracowników inżynieryjno-technicznych',
      'Szkolenia dla pracodawców i osób kierujących pracownikami',
    ],
    prices: [
      { name: 'Instruktaż ogólny (szkolenie wstępne)', price: 'od 60 zł / os.' },
      { name: 'Okresowe: pracownicy administracyjno-biurowi', price: 'od 100 zł / os.' },
      { name: 'Okresowe: stanowiska robotnicze', price: 'od 130 zł / os.' },
      { name: 'Okresowe: pracownicy inżynieryjno-techniczni', price: 'od 180 zł / os.' },
      { name: 'Okresowe: pracodawcy i osoby kierujące', price: 'od 220 zł / os.' },
    ],
    priceNote: 'Ceny netto. Dla grup powyżej 5 pracowników wycena jest indywidualna.',
    steps: [
      'Ustalamy, kto i jakie szkolenie musi odbyć.',
      'Wybieramy termin i miejsce, u Ciebie w firmie lub u nas.',
      'Przeprowadzamy szkolenie dopasowane do stanowisk.',
      'Przygotowujemy dokumentację szkoleń i pilnujemy kolejnych terminów.',
    ],
    formServices: ['BHP', 'Szkolenia'],
  },
  {
    slug: 'ocena-ryzyka-zawodowego',
    navLabel: 'Ocena ryzyka zawodowego',
    title: 'Ocena ryzyka zawodowego na stanowiskach pracy',
    metaTitle: 'Ocena ryzyka zawodowego – Safety First, Opole',
    metaDescription:
      'Ocena ryzyka zawodowego dla stanowisk pracy w firmach z województwa opolskiego. Wycena od 450 zł netto za stanowisko, w abonamencie BHP bez dodatkowej opłaty.',
    lead: 'Sprawdzamy, jakie zagrożenia występują na Twoich stanowiskach pracy, i opisujemy, co zrobić, żeby je ograniczyć. Oceniamy to, co dzieje się w firmie, a nie tylko to, co da się opisać w dokumentach.',
    scopeHeading: 'Co obejmuje ocena',
    scope: [
      'Identyfikacja zagrożeń na stanowiskach pracy',
      'Określenie poziomu ryzyka i działań profilaktycznych',
      'Aktualizacja oceny po zmianach w organizacji pracy lub wyposażeniu',
      'Oceny wymagające osobnego podejścia: chemiczne, maszyny, prace szczególnie niebezpieczne, ergonomia',
      'Karty oceny ryzyka gotowe do podpisu i przekazania pracownikom',
    ],
    prices: [
      { name: 'Ocena ryzyka dla stanowiska', price: 'od 450 zł' },
      { name: 'Aktualizacja i bieżące utrzymanie oceny', price: 'w abonamencie BHP' },
    ],
    priceNote:
      'Ceny netto. Przy kilku podobnych stanowiskach cenę ustalamy indywidualnie po rozmowie o firmie.',
    steps: [
      'Poznajemy firmę i listę stanowisk.',
      'Oglądamy stanowiska i sposób wykonywania pracy.',
      'Przygotowujemy ocenę ryzyka i zalecenia.',
      'Omawiamy wyniki z Tobą i aktualizujemy ocenę, gdy coś się zmienia.',
    ],
    formServices: ['BHP'],
  },
  {
    slug: 'dokumentacja-bhp',
    navLabel: 'Dokumentacja BHP',
    title: 'Dokumentacja BHP dla małej firmy',
    metaTitle: 'Dokumentacja BHP, instrukcje i rejestry – Safety First, Opole',
    metaDescription:
      'Przygotowanie, uporządkowanie i aktualizacja dokumentacji BHP: instrukcje, rejestry, programy szkoleń. Instrukcja BHP od 150 zł netto, analiza dokumentacji od 250 zł.',
    lead: 'Porządkujemy dokumentację BHP tak, żeby odpowiadała Twojej działalności i była gotowa na kontrolę. Zaczynamy od przeglądu tego, co już masz.',
    scopeHeading: 'Dokumenty, którymi się zajmujemy',
    scope: [
      'Instrukcje BHP i instrukcje stanowiskowe',
      'Instrukcje bezpiecznej obsługi maszyn',
      'Instrukcje postępowania awaryjnego i procedury ewakuacji',
      'Regulaminy i procedury BHP',
      'Programy szkoleń i dokumentacja szkoleń',
      'Rejestry BHP',
      'Dokumentacja dotycząca środków ochrony indywidualnej i odzieży roboczej',
    ],
    prices: [
      { name: 'Analiza istniejącej dokumentacji', price: 'od 250 zł' },
      { name: 'Instrukcja BHP', price: 'od 150 zł' },
      { name: 'Aktualizacja i prowadzenie dokumentacji', price: 'w abonamencie BHP' },
    ],
    priceNote:
      'Ceny netto. Pojedyncze dokumenty wyceniamy osobno, a przy stałej obsłudze dokumentacja jest utrzymywana w ramach abonamentu.',
    steps: [
      'Przeglądamy dokumentację, którą już masz.',
      'Wskazujemy braki i rzeczy do aktualizacji.',
      'Przygotowujemy brakujące dokumenty i porządkujemy całość.',
      'Aktualizujemy dokumenty, gdy zmieniają się przepisy lub organizacja pracy.',
    ],
    formServices: ['BHP'],
  },
  {
    slug: 'kontrola-i-audyt-bhp',
    navLabel: 'Kontrola i audyt BHP',
    title: 'Kontrola warunków pracy i audyt BHP',
    metaTitle: 'Audyt BHP, kontrola stanowisk i przygotowanie do kontroli PIP – Safety First',
    metaDescription:
      'Kompleksowy audyt BHP od 550 zł netto, kontrola warunków pracy od 250 zł, przygotowanie do kontroli PIP od 500 zł. Opole i województwo opolskie.',
    lead: 'Przyjeżdżamy do firmy, sprawdzamy rzeczywiste warunki pracy i opisujemy, co trzeba poprawić. Pomagamy też przygotować się do kontroli organów nadzoru.',
    scopeHeading: 'W czym pomagamy',
    scope: [
      'Kompleksowy audyt stanu BHP',
      'Kontrola warunków pracy ze wskazaniem działań do poprawy',
      'Przygotowanie firmy do kontroli PIP',
      'Kontrola placu budowy',
      'Organizacja próby ewakuacyjnej',
      'Wsparcie pracodawcy w kontaktach z organami nadzoru',
    ],
    prices: [
      { name: 'Kompleksowy audyt BHP', price: 'od 550 zł' },
      { name: 'Kontrola warunków pracy, zalecenia ustne', price: 'od 250 zł' },
      { name: 'Kontrola warunków pracy z raportem', price: 'od 550 zł' },
      { name: 'Przygotowanie do kontroli PIP', price: 'od 500 zł' },
      { name: 'Kontrola placu budowy', price: 'od 300 zł' },
      { name: 'Organizacja próby ewakuacyjnej', price: 'od 400 zł' },
    ],
    priceNote:
      'Ceny netto, dla jednorazowych usług bez stałej obsługi BHP. Dojazd do 20 km jest wliczony, dalej 0,80 zł netto za kilometr.',
    steps: [
      'Ustalamy zakres i termin wizyty.',
      'Sprawdzamy stanowiska, dokumenty i organizację pracy na miejscu.',
      'Przekazujemy zalecenia ustnie albo w raporcie.',
      'Pomagamy wdrożyć poprawki przed kontrolą.',
    ],
    formServices: ['BHP'],
  },
]

export function getService(slug: string): Service {
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) throw new Error(`Brak usługi: ${slug}`)
  return service
}
