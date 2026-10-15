// Podstrony ochrony srodowiska (/ochrona-srodowiska/<slug>).
// Zakres: "oferta bhp.md" (czesci 4-9, 10, 13). Ceny "od": dolne widelki z "100 propozycji.md",
// NIE sa jeszcze zatwierdzone przez Natalie (cennik OS nie wystepuje w jej ofercie handlowej).
// Przed startem strony zatwierdzic lub poprawic. Ceny netto, orientacyjne.
import type { Service } from './services'

const NOTE =
  'Ceny netto i orientacyjne. Ostateczną wycenę ustalamy po rozmowie o firmie, bo zależy od zakresu i liczby obowiązków.'

export const OS_GROUPS = [
  'Obsługa i audyty',
  'Odpady',
  'Powietrze i opłaty',
  'Woda i ścieki',
  'Produkty i opakowania',
  'Dokumentacja i kontrole',
] as const

export const OS_SERVICES: readonly Service[] = [
  // ---------- Obsługa i audyty ----------
  {
    section: 'os',
    group: 'Obsługa i audyty',
    slug: 'stala-obsluga-srodowiskowa',
    navLabel: 'Stała obsługa środowiskowa',
    summary: 'Jedna osoba pilnuje obowiązków środowiskowych firmy, dokumentów i terminów.',
    title: 'Stała obsługa środowiskowa firmy',
    metaTitle: 'Stała obsługa ochrony środowiska dla firm – outsourcing OŚ, Opole',
    metaDescription:
      'Outsourcing ochrony środowiska: przegląd obowiązków, rejestr wymagań prawnych, doradztwo i pilnowanie terminów. Firmy z Opola i województwa opolskiego.',
    lead: 'Obowiązki środowiskowe firmy, od odpadów po opłaty i sprawozdania, prowadzi jedna osoba. Wiesz, co trzeba zrobić i kiedy, a dokumenty są aktualne.',
    scopeHeading: 'Co obejmuje stała obsługa',
    scope: [
      'Outsourcing ochrony środowiska',
      'Przegląd obowiązków środowiskowych firmy',
      'Identyfikacja wymagań prawnych i prowadzenie rejestru obowiązków',
      'Doradztwo środowiskowe na bieżąco',
      'Analiza zgodności działalności z przepisami środowiskowymi',
      'Pilnowanie terminów sprawozdań i opłat',
    ],
    prices: [
      { name: 'Stała obsługa środowiskowa firmy', price: 'wycena indywidualna' },
      { name: 'Kompleksowa obsługa odpadowa', price: 'od 1 000 zł / mies.' },
      { name: 'Monitoring zmian prawa BHP i OŚ', price: 'od 100 zł / mies.' },
    ],
    priceNote: NOTE,
    steps: [
      'Rozmawiamy o firmie i tym, co w niej powstaje: odpady, emisje, ścieki, opakowania.',
      'Sprawdzamy, jakie obowiązki środowiskowe Cię dotyczą.',
      'Ustalamy zakres obsługi i miesięczną cenę na piśmie.',
      'Prowadzimy dokumenty i pilnujemy terminów.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Obsługa i audyty',
    slug: 'audyt-srodowiskowy',
    navLabel: 'Audyt środowiskowy',
    summary: 'Sprawdzamy, czy firma spełnia wymagania środowiskowe, i wskazujemy braki.',
    title: 'Audyt środowiskowy firmy',
    metaTitle: 'Audyt środowiskowy i zgodności prawnej – Safety First, Opole',
    metaDescription:
      'Audyt środowiskowy: przegląd obowiązków, analiza zgodności działalności z przepisami, lista braków do uzupełnienia. Analiza obowiązków od 1 000 zł netto.',
    lead: 'Sprawdzamy, czy firma robi wszystko, co wynika z przepisów środowiskowych, i opisujemy braki wraz z tym, jak je uzupełnić.',
    scopeHeading: 'Co sprawdzamy',
    scope: [
      'Audyt środowiskowy działalności firmy',
      'Przegląd obowiązków środowiskowych',
      'Analiza zgodności działalności z przepisami środowiskowymi',
      'Identyfikacja wymagań prawnych',
      'Wskazanie braków w dokumentach i ewidencjach',
      'Audyt firmy przed kontrolą WIOŚ',
    ],
    prices: [
      { name: 'Analiza obowiązków środowiskowych', price: 'od 1 000 zł' },
      { name: 'Kompleksowy audyt zgodności prawnej', price: 'od 2 000 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy zakres audytu i zbieramy dokumenty firmy.',
      'Sprawdzamy dokumenty i miejsca, w których powstają odpady, emisje i ścieki.',
      'Przekazujemy wyniki z listą braków i zaleceniami.',
      'Pomagamy uzupełnić braki.',
    ],
    details: {
      heading: 'Audyt, który pokazuje realny stan firmy',
      intro: [
        'Audyt środowiskowy to sprawdzenie, czy firma spełnia wymagania prawa ochrony środowiska. Pozwala znaleźć braki, zanim zrobi to kontrola, i jest ważną częścią badania (due diligence) przed zakupem nieruchomości komercyjnej lub zakładu.',
        'Przeprowadzimy rzetelny audyt, który pokaże realny stan Twojej firmy i plan dojścia do pełnej zgodności z przepisami.',
      ],
      items: [
        {
          title: 'Audyt zgodności z przepisami',
          forWhom:
            'Dla właścicieli i zarządów, którzy chcą mieć pewność, że firma działa zgodnie z aktualnymi przepisami środowiskowymi.',
          scope:
            'Sprawdzamy decyzje, pozwolenia i sprawozdania (BDO, KOBiZE, opłaty), a także to, jak w praktyce magazynowane są substancje chemiczne i odpady.',
        },
        {
          title: 'Audyt przed zakupem (due diligence)',
          forWhom: 'Dla inwestorów, którzy planują zakup działki, hali produkcyjnej lub całego przedsiębiorstwa.',
          scope:
            'Badamy historię środowiskową lokalizacji, ryzyko zanieczyszczenia gleby i wód gruntowych oraz szacujemy koszty dostosowania obiektu do planowanej działalności.',
        },
        {
          title: 'Raport z zaleceniami',
          forWhom: 'Dla kadry zarządzającej, która potrzebuje jasnych wskazówek, co zrobić.',
          scope:
            'Przygotowujemy poufny raport, który bez prawniczego żargonu opisuje uchybienia, ocenia ryzyko finansowe (możliwe kary) i zawiera harmonogram działań naprawczych.',
        },
      ],
      why: 'Nasz audyt to nie szukanie dziury w całym, tylko ochrona Twojej firmy. Wykrywamy błędy i pomagamy je usunąć na Twoich warunkach: dyskretnie, sprawnie i z naciskiem na praktyczne rozwiązania.',
    },
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Obsługa i audyty',
    slug: 'obowiazki-prawne-srodowiskowe',
    navLabel: 'Rejestr obowiązków prawnych',
    summary: 'Lista obowiązków środowiskowych firmy i bieżące informacje o zmianach przepisów.',
    title: 'Rejestr obowiązków prawnych i monitoring przepisów',
    metaTitle: 'Rejestr obowiązków środowiskowych i monitoring zmian prawa – Safety First',
    metaDescription:
      'Rejestr obowiązków prawnych z zakresu ochrony środowiska i BHP oraz monitoring zmian przepisów. Rejestr od 500 zł netto, monitoring od 100 zł miesięcznie.',
    lead: 'Przepisy się zmieniają, a firma musi wiedzieć, co jej dotyczy. Spisujemy obowiązki w jednym rejestrze i informujemy o zmianach, które mają znaczenie dla Twojej działalności.',
    scopeHeading: 'Co robimy',
    scope: [
      'Identyfikacja wymagań prawnych dotyczących firmy',
      'Prowadzenie rejestru obowiązków środowiskowych',
      'Monitoring zmian prawa BHP i ochrony środowiska',
      'Informowanie o zmianach przepisów, które dotyczą firmy',
      'Analiza zgodności działalności z przepisami',
    ],
    prices: [
      { name: 'Rejestr obowiązków prawnych', price: 'od 500 zł' },
      { name: 'Monitoring zmian prawa BHP i OŚ', price: 'od 100 zł / mies.' },
    ],
    priceNote: NOTE,
    steps: [
      'Poznajemy firmę i jej działalność.',
      'Ustalamy, jakie przepisy i obowiązki Cię dotyczą.',
      'Przygotowujemy rejestr z terminami.',
      'Aktualizujemy rejestr i informujemy o zmianach.',
    ],
    formServices: ['Ochrona środowiska'],
  },

  // ---------- Odpady ----------
  {
    section: 'os',
    group: 'Odpady',
    slug: 'gospodarka-odpadami',
    navLabel: 'Gospodarka odpadami',
    summary: 'Audyt, procedury, magazynowanie i koszty odpadów w firmie.',
    title: 'Gospodarka odpadami w firmie',
    metaTitle: 'Gospodarka odpadami: audyt, procedury, magazynowanie – Safety First, Opole',
    metaDescription:
      'Audyt gospodarki odpadami od 1 000 zł netto, instrukcje i procedury magazynowania odpadów od 500 zł, optymalizacja kosztów. Firmy z województwa opolskiego.',
    lead: 'Porządkujemy to, co dzieje się z odpadami w firmie: od powstania, przez magazynowanie, po przekazanie do odbioru. Dzięki temu dokumenty się zgadzają, a koszty są pod kontrolą.',
    scopeHeading: 'W czym pomagamy',
    scope: [
      'Audyt gospodarki odpadami',
      'Instrukcje i procedury gospodarki odpadami',
      'Procedury magazynowania odpadów',
      'Audyt miejsc magazynowania odpadów',
      'Optymalizacja kosztów zagospodarowania odpadów',
      'Pomoc w organizacji odbioru odpadów',
    ],
    prices: [
      { name: 'Audyt gospodarki odpadami', price: 'od 1 000 zł' },
      { name: 'Instrukcja gospodarki odpadami', price: 'od 500 zł' },
      { name: 'Procedura magazynowania odpadów', price: 'od 500 zł' },
      { name: 'Audyt magazynu odpadów', price: 'od 500 zł' },
      { name: 'Analiza kosztów gospodarki odpadami', price: 'od 1 000 zł' },
      { name: 'Kompleksowa obsługa odpadowa', price: 'od 1 000 zł / mies.' },
    ],
    priceNote: NOTE,
    steps: [
      'Sprawdzamy, jakie odpady powstają i gdzie są składowane.',
      'Oceniamy dokumenty, magazyn i sposób przekazywania odpadów.',
      'Przygotowujemy procedury i instrukcje albo wskazujemy poprawki.',
      'Prowadzimy dalszą obsługę, jeśli jej potrzebujesz.',
    ],
    details: {
      heading: 'Gospodarka odpadami bez ryzyka',
      intro: [
        'Prawidłowe zarządzanie odpadami to podstawa działania każdej firmy. Przepisy nakładają na wytwórców odpadów, np. budowlanych, medycznych, niebezpiecznych, zużytego sprzętu czy chemikaliów, obowiązki związane z ich segregacją, magazynowaniem i przekazywaniem uprawnionym odbiorcom. Niewłaściwe magazynowanie albo przekazanie odpadów firmie bez uprawnień grozi wysokimi karami, a nawet odpowiedzialnością karną.',
        'Projektujemy i wdrażamy bezpieczne i opłacalne zasady postępowania z odpadami, dopasowane do Twojej branży.',
      ],
      items: [
        {
          title: 'Procedury i instrukcje gospodarki odpadami',
          forWhom:
            'Dla zakładów produkcyjnych, warsztatów, firm budowlanych i innych firm, w których powstają odpady przemysłowe.',
          scope:
            'Przygotowujemy instrukcje postępowania z odpadami w firmie, doradzamy w oznakowaniu miejsc magazynowania i dobieramy właściwe kody odpadów.',
        },
        {
          title: 'Legalni odbiorcy i niższe koszty',
          forWhom: 'Dla firm, które szukają oszczędności, ale bez ryzyka nielegalnych rozwiązań.',
          scope:
            'Sprawdzamy decyzje i uprawnienia firm transportowych i instalacji przetwarzania odpadów, z którymi współpracujesz lub chcesz współpracować. Chroni Cię to przed współodpowiedzialnością za nielegalne postępowanie z odpadami.',
        },
        {
          title: 'Decyzje i zezwolenia',
          forWhom:
            'Dla firm, które rozwijają działalność albo potrzebują zezwoleń na wytwarzanie, zbieranie lub przetwarzanie odpadów.',
          scope:
            'Przygotowujemy wnioski o wydanie decyzji i reprezentujemy klienta przed organami ochrony środowiska.',
        },
      ],
      why: 'Zamieniamy skomplikowane przepisy o odpadach w proste zasady dla pracowników. Dzięki właściwej klasyfikacji i segregacji u źródła pomagamy obniżyć koszty odbioru odpadów.',
    },
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Odpady',
    slug: 'obsluga-bdo',
    navLabel: 'Obsługa BDO',
    summary: 'Wpis do BDO, aktualizacja danych i bieżąca obsługa rejestru.',
    title: 'Obsługa BDO: wpis, aktualizacja i bieżące prowadzenie',
    metaTitle: 'Obsługa BDO dla firm: wpis i aktualizacja – Safety First, Opole',
    metaDescription:
      'Wpis do BDO od 500 zł netto, aktualizacja danych od 300 zł, stała obsługa BDO od 300 zł miesięcznie. Opole i województwo opolskie.',
    lead: 'Rejestr BDO prowadzimy za Ciebie: od wpisu, przez aktualizację danych, po bieżące czynności. Ty nie musisz pamiętać o terminach.',
    scopeHeading: 'Co robimy w BDO',
    scope: [
      'Przygotowanie wpisu do BDO',
      'Aktualizacja danych w BDO',
      'Obsługa BDO na bieżąco',
      'Prowadzenie ewidencji odpadów',
      'Przygotowanie sprawozdań odpadowych',
    ],
    prices: [
      { name: 'Wpis do BDO', price: 'od 500 zł' },
      { name: 'Aktualizacja danych w BDO', price: 'od 300 zł' },
      { name: 'Stała obsługa BDO', price: 'od 300 zł / mies.' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, jakie obowiązki w BDO ma Twoja firma.',
      'Zbieramy potrzebne dane i dokumenty.',
      'Przygotowujemy wpis albo aktualizację.',
      'Prowadzimy dalszą obsługę rejestru, jeśli tego chcesz.',
    ],
    details: {
      heading: 'Kompleksowa obsługa BDO',
      intro: [
        'BDO (Baza Danych o Produktach i Opakowaniach oraz o Gospodarce Odpadami) to obowiązkowy rejestr elektroniczny dla firm, które wytwarzają odpady, wprowadzają na rynek produkty w opakowaniach, opony czy oleje. Prowadzenie takiej działalności bez wymaganego wpisu grozi administracyjną karą pieniężną od 5 000 zł do 1 000 000 zł.',
        'Zdejmujemy z Twoich barków formalności urzędowe i pilnujemy, żeby firma spełniała obowiązki wynikające z przepisów o odpadach.',
      ],
      items: [
        {
          title: 'Wpis do rejestru BDO',
          forWhom:
            'Dla nowych firm oraz takich, które zmieniają profil działalności i zaczynają podlegać przepisom o odpadach.',
          scope:
            'Analizujemy specyfikę Twojej działalności, klasyfikujemy odpady według katalogu, kompletujemy dokumenty i składamy wniosek do właściwego urzędu marszałkowskiego.',
        },
        {
          title: 'Aktualizacja danych w BDO',
          forWhom: 'Dla firm już zarejestrowanych, w których zaszły zmiany formalne lub w działalności.',
          scope:
            'Wniosek o zmianę wpisu trzeba złożyć w ciągu 30 dni od zmiany. Robimy to za Ciebie przy zmianie adresu, nazwy lub formy prawnej firmy, a także przy rozszerzeniu działalności o nowe kody odpadów.',
        },
        {
          title: 'Bieżące prowadzenie i ewidencja',
          forWhom:
            'Dla firm, które chcą oddać codzienną obsługę BDO w ręce specjalisty, oszczędzić czas i uniknąć błędów.',
          scope:
            'Wystawiamy i zatwierdzamy karty przekazania odpadów (KPO), prowadzimy karty ewidencji odpadów (KEO) oraz przygotowujemy i składamy roczne sprawozdanie o odpadach (do 15 marca za poprzedni rok).',
        },
      ],
      why: 'Działamy na terenie województwa opolskiego. Pilnujemy terminów i poprawności wpisów, dzięki czemu spokojnie przechodzisz kontrolę Inspekcji Ochrony Środowiska (WIOŚ) i możesz skupić się na rozwoju firmy.',
    },
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Odpady',
    slug: 'ewidencja-odpadow',
    navLabel: 'Ewidencja odpadów',
    summary: 'Prowadzenie i weryfikacja ewidencji oraz kart przekazania odpadów.',
    title: 'Ewidencja odpadów: prowadzenie i weryfikacja',
    metaTitle: 'Ewidencja odpadów – prowadzenie i weryfikacja, Safety First, Opole',
    metaDescription:
      'Prowadzenie ewidencji odpadów od 300 zł netto miesięcznie, weryfikacja ewidencji i kart przekazania odpadów od 500 zł. Firmy z województwa opolskiego.',
    lead: 'Ewidencja musi zgadzać się z kartami przekazania i ze sprawozdaniem. Prowadzimy ją za Ciebie albo sprawdzamy, czy to, co masz, jest kompletne.',
    scopeHeading: 'Zakres',
    scope: [
      'Prowadzenie ewidencji odpadów',
      'Weryfikacja ewidencji odpadów',
      'Analiza kart przekazania odpadów',
      'Analiza kart ewidencji odpadów',
    ],
    prices: [
      { name: 'Prowadzenie ewidencji odpadów', price: 'od 300 zł / mies.' },
      { name: 'Weryfikacja ewidencji odpadów', price: 'od 500 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Przeglądamy dotychczasowe karty i ewidencje.',
      'Wskazujemy rozbieżności i braki.',
      'Poprawiamy dokumenty albo przejmujemy ich prowadzenie.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Odpady',
    slug: 'klasyfikacja-odpadow',
    navLabel: 'Klasyfikacja i kody odpadów',
    summary: 'Pomoc w ustaleniu, jakim kodem opisać odpady powstające w firmie.',
    title: 'Klasyfikacja odpadów i dobór kodów',
    metaTitle: 'Klasyfikacja odpadów i kody odpadów – Safety First, Opole',
    metaDescription:
      'Klasyfikacja odpadów od 150 zł netto za kod, dobór kodów odpadów od 300 zł. Pomagamy firmom z województwa opolskiego prawidłowo opisać odpady.',
    lead: 'Prawidłowy kod odpadu to podstawa ewidencji, kart przekazania i sprawozdań. Ustalamy go razem z Tobą na podstawie tego, co faktycznie powstaje w firmie.',
    scopeHeading: 'Co robimy',
    scope: [
      'Klasyfikacja odpadów powstających w firmie',
      'Pomoc w ustalaniu kodów odpadów',
      'Dobór kodów dla całej działalności',
    ],
    prices: [
      { name: 'Klasyfikacja odpadów', price: 'od 150 zł / kod' },
      { name: 'Dobór kodów odpadów', price: 'od 300 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Opisujesz, jakie odpady powstają i w jakich procesach.',
      'Ustalamy kody i sprawdzamy, czy wymagają dodatkowych dokumentów.',
      'Przekazujemy zestawienie gotowe do użycia w ewidencji.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Odpady',
    slug: 'sprawozdania-odpadowe',
    navLabel: 'Sprawozdania odpadowe',
    summary: 'Przygotowanie sprawozdań odpadowych na podstawie ewidencji.',
    title: 'Sprawozdania odpadowe',
    metaTitle: 'Sprawozdania odpadowe dla firm – Safety First, Opole',
    metaDescription:
      'Przygotowanie sprawozdań odpadowych od 500 zł netto wraz z weryfikacją ewidencji i kart przekazania. Firmy z Opola i województwa opolskiego.',
    lead: 'Przygotowujemy sprawozdanie na podstawie ewidencji i sprawdzamy wcześniej, czy dane się zgadzają, żeby nie było poprawek po terminie.',
    scopeHeading: 'Zakres',
    scope: [
      'Przygotowanie sprawozdań odpadowych',
      'Weryfikacja ewidencji i kart przekazania przed sprawozdaniem',
      'Przygotowanie danych do sprawozdań',
      'Pilnowanie terminów sprawozdawczych',
    ],
    prices: [{ name: 'Sprawozdanie odpadowe', price: 'od 500 zł' }],
    priceNote: NOTE,
    steps: [
      'Zbieramy ewidencję i karty przekazania odpadów.',
      'Sprawdzamy dane i uzupełniamy braki.',
      'Przygotowujemy sprawozdanie.',
      'Pilnujemy terminu kolejnego sprawozdania.',
    ],
    formServices: ['Ochrona środowiska'],
  },

  // ---------- Powietrze i opłaty ----------
  {
    section: 'os',
    group: 'Powietrze i opłaty',
    slug: 'emisje-do-powietrza',
    navLabel: 'Emisje do powietrza',
    summary: 'Inwentaryzacja źródeł emisji, obliczenia i dokumentacja emisyjna.',
    title: 'Emisje do powietrza: inwentaryzacja i obliczenia',
    metaTitle: 'Emisje do powietrza: inwentaryzacja źródeł i obliczenia – Safety First, Opole',
    metaDescription:
      'Inwentaryzacja źródeł emisji od 1 000 zł netto, obliczanie emisji do powietrza od 500 zł, audyt emisji od 1 000 zł. Firmy z województwa opolskiego.',
    lead: 'Ustalamy, skąd w firmie biorą się emisje, obliczamy je i przygotowujemy dokumenty, które są potrzebne do raportów i opłat.',
    scopeHeading: 'Zakres',
    scope: [
      'Inwentaryzacja źródeł emisji',
      'Bilans emisji i obliczanie emisji do powietrza',
      'Analiza źródeł emisji',
      'Dokumentacja dotycząca emisji',
      'Wsparcie przy pozwoleniach emisyjnych',
      'Analiza obowiązków związanych z instalacjami',
    ],
    prices: [
      { name: 'Inwentaryzacja źródeł emisji', price: 'od 1 000 zł' },
      { name: 'Obliczenie emisji do powietrza', price: 'od 500 zł' },
      { name: 'Audyt emisji', price: 'od 1 000 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, jakie instalacje i urządzenia emitują zanieczyszczenia.',
      'Zbieramy dane o zużyciu paliw i surowców.',
      'Obliczamy emisje i przygotowujemy dokumentację.',
      'Przekazujemy wyniki z informacją, jakie obowiązki z nich wynikają.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Powietrze i opłaty',
    slug: 'raporty-kobize',
    navLabel: 'Raporty KOBiZE',
    summary: 'Przygotowanie i weryfikacja raportów do KOBiZE oraz bieżąca obsługa.',
    title: 'Raporty KOBiZE i obsługa bazy',
    metaTitle: 'Raporty KOBiZE: przygotowanie i obsługa – Safety First, Opole',
    metaDescription:
      'Obsługa KOBiZE od 500 zł netto rocznie, przygotowanie i weryfikacja raportów KOBiZE od 500 zł. Firmy z Opola i województwa opolskiego.',
    lead: 'Raport do KOBiZE przygotowujemy na podstawie danych o emisjach firmy, a jeśli masz już swój, sprawdzamy go przed wysłaniem.',
    scopeHeading: 'Zakres',
    scope: [
      'Obsługa KOBiZE',
      'Przygotowanie raportów KOBiZE',
      'Weryfikacja raportów KOBiZE',
      'Przygotowanie raportów środowiskowych',
    ],
    prices: [
      { name: 'Obsługa KOBiZE', price: 'od 500 zł / rok' },
      { name: 'Raport KOBiZE', price: 'od 500 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, czy i jakie raporty musi składać Twoja firma.',
      'Zbieramy dane i obliczamy emisje.',
      'Przygotowujemy raport do wysłania.',
      'Pilnujemy terminu kolejnego raportu.',
    ],
    details: {
      heading: 'Raporty KOBiZE od rejestracji po roczne rozliczenie',
      intro: [
        'Raport o emisjach do Krajowej bazy prowadzonej przez KOBiZE (Krajowy Ośrodek Bilansowania i Zarządzania Emisjami) składa niemal każda firma, która ma choćby jeden samochód służbowy, klimatyzację w biurze czy kocioł grzewczy. Raport za poprzedni rok trzeba złożyć do końca lutego. Za jego brak grozi grzywna, a zaległości zwykle wychodzą przy kontroli WIOŚ.',
        'Przeprowadzimy Cię przez cały proces: od założenia konta po coroczne rozliczenie emisji.',
      ],
      items: [
        {
          title: 'Rejestracja w Krajowej bazie KOBiZE',
          forWhom:
            'Dla firm, które jeszcze nie założyły konta, a korzystają z samochodów, kotłowni lub urządzeń chłodniczych.',
          scope:
            'Zakładamy konto w bazie, poprawnie przypisujemy instalacje i urządzenia oraz pomagamy przejść weryfikację.',
        },
        {
          title: 'Wyliczenie wielkości emisji',
          forWhom: 'Dla firm, które co roku muszą raportować emisje z instalacji i urządzeń.',
          scope:
            'Analizujemy faktury za paliwo do samochodów, zużycie gazu, węgla i innych paliw oraz karty serwisowe klimatyzacji. Na tej podstawie, według oficjalnych wskaźników, wyliczamy ilość wyemitowanych gazów i pyłów.',
        },
        {
          title: 'Przygotowanie i wysłanie raportu rocznego',
          forWhom: 'Dla firm, które chcą mieć pewność, że raport nie zawiera błędów w obliczeniach.',
          scope:
            'Wprowadzamy dane do bazy, przygotowujemy raport, sprawdzamy jego poprawność i wysyłamy go w terminie.',
        },
      ],
      why: 'Dokładnie wyliczamy emisje, a te same dane służą później do naliczenia opłat środowiskowych. Unikasz błędów w obliczeniach i masz porządek w rejestrach państwowych.',
    },
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Powietrze i opłaty',
    slug: 'oplaty-srodowiskowe',
    navLabel: 'Opłaty środowiskowe',
    summary: 'Naliczanie opłat za korzystanie ze środowiska i przygotowanie wykazów.',
    title: 'Opłaty za korzystanie ze środowiska',
    metaTitle: 'Opłaty środowiskowe: naliczanie i wykazy – Safety First, Opole',
    metaDescription:
      'Naliczanie opłat środowiskowych od 500 zł netto, obsługa opłat od 300 zł miesięcznie. Pomagamy firmom z województwa opolskiego.',
    lead: 'Naliczamy opłaty, przygotowujemy wykazy i pilnujemy terminów, żebyś nie płacił za późno ani za dużo.',
    scopeHeading: 'Zakres',
    scope: [
      'Naliczanie opłat za korzystanie ze środowiska',
      'Przygotowanie wykazów opłatowych',
      'Bieżąca obsługa opłat środowiskowych',
      'Naliczanie opłat związanych z poborem wód i odprowadzaniem ścieków',
    ],
    prices: [
      { name: 'Naliczanie opłat środowiskowych', price: 'od 500 zł' },
      { name: 'Obsługa opłat środowiskowych', price: 'od 300 zł / mies.' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, za co firma ponosi opłaty.',
      'Zbieramy dane i naliczamy opłaty.',
      'Przygotowujemy wykaz do złożenia.',
      'Pilnujemy kolejnych terminów.',
    ],
    details: {
      heading: 'Rozliczenie opłat za korzystanie ze środowiska',
      intro: [
        'Opłaty za korzystanie ze środowiska to ustawowy obowiązek firm, których działalność wpływa na środowisko. Dotyczy to m.in. spalin z samochodów firmowych, kotłowni, poboru wód i odprowadzania ścieków. Wykaz za poprzedni rok składa się do urzędu marszałkowskiego, a opłatę wnosi na jego rachunek do 31 marca. Niezłożenie wykazu albo zaniżenie opłat kończy się koniecznością zapłaty zaległości z odsetkami.',
        'Przeanalizujemy Twoje dokumenty i prawidłowo rozliczymy opłaty środowiskowe firmy.',
      ],
      items: [
        {
          title: 'Ustalenie, za co firma płaci',
          forWhom: 'Dla firm, które nie wiedzą, które obszary ich działalności podlegają opłatom.',
          scope:
            'Sprawdzamy samochody, ogrzewanie i procesy technologiczne i wskazujemy, z czego trzeba się rozliczyć.',
        },
        {
          title: 'Naliczenie opłat i przygotowanie wykazów',
          forWhom: 'Dla firm, które chcą zapłacić tyle, ile trzeba: bez nadpłat i bez zaległości.',
          scope:
            'Obliczamy należne kwoty według aktualnych stawek ogłaszanych przez ministra właściwego do spraw klimatu i przygotowujemy wykazy zawierające informacje i dane o zakresie korzystania ze środowiska.',
        },
        {
          title: 'Kontakt z urzędem marszałkowskim',
          forWhom: 'Dla przedsiębiorców, którzy nie chcą tracić czasu na sprawy urzędowe.',
          scope:
            'Składamy wykazy do właściwego urzędu marszałkowskiego (np. w Opolu) i wyjaśniamy sprawy, gdy urząd ma pytania.',
        },
      ],
      why: 'Jeśli roczna opłata nie przekracza 800 zł, nie trzeba jej wnosić, ale gdy przekracza 100 zł, wykaz i tak trzeba złożyć. Pilnujemy tego obowiązku, żeby nie zaskoczyło Cię wezwanie z urzędu.',
    },
    formServices: ['Ochrona środowiska'],
  },

  // ---------- Woda i ścieki ----------
  {
    section: 'os',
    group: 'Woda i ścieki',
    slug: 'gospodarka-wodno-sciekowa',
    navLabel: 'Gospodarka wodno-ściekowa',
    summary: 'Analiza zużycia wody, odprowadzania ścieków i możliwości obniżenia kosztów.',
    title: 'Gospodarka wodno-ściekowa w firmie',
    metaTitle: 'Gospodarka wodno-ściekowa: audyt i analiza zużycia wody – Safety First',
    metaDescription:
      'Audyt gospodarki wodnej od 1 000 zł netto, analiza zużycia wody od 500 zł, ewidencja poboru wód i odprowadzania ścieków. Województwo opolskie.',
    lead: 'Sprawdzamy, ile wody firma pobiera i jakie ścieki odprowadza, prowadzimy ewidencje i szukamy miejsc, w których da się obniżyć koszty.',
    scopeHeading: 'Zakres',
    scope: [
      'Analiza zużycia wody',
      'Analiza odprowadzania ścieków',
      'Ewidencja poboru wód',
      'Ewidencja odprowadzania ścieków',
      'Audyt gospodarki wodnej',
      'Analiza możliwości redukcji kosztów zużycia wody',
    ],
    prices: [
      { name: 'Audyt gospodarki wodnej', price: 'od 1 000 zł' },
      { name: 'Analiza zużycia wody', price: 'od 500 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Zbieramy dane o poborze wody i odprowadzaniu ścieków.',
      'Analizujemy zużycie i obowiązki firmy.',
      'Przygotowujemy ewidencje i wskazujemy możliwe oszczędności.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Woda i ścieki',
    slug: 'pozwolenia-wodnoprawne',
    navLabel: 'Dokumentacja wodnoprawna',
    summary: 'Dokumentacja i wsparcie przy pozwoleniach wodnoprawnych.',
    title: 'Dokumentacja wodnoprawna i pozwolenia',
    metaTitle: 'Dokumentacja wodnoprawna i pozwolenia wodnoprawne – Safety First, Opole',
    metaDescription:
      'Przygotowanie dokumentacji wodnoprawnej od 1 500 zł netto i wsparcie przy pozwoleniach wodnoprawnych dla firm z województwa opolskiego.',
    lead: 'Jeśli Twoja działalność wymaga pozwolenia wodnoprawnego, przygotujemy dokumentację i poprowadzimy Cię przez formalności.',
    scopeHeading: 'Zakres',
    scope: [
      'Przygotowanie dokumentacji wodnoprawnej',
      'Wsparcie przy pozwoleniach wodnoprawnych',
      'Naliczanie opłat środowiskowych związanych z wodą',
    ],
    prices: [{ name: 'Dokumentacja wodnoprawna', price: 'od 1 500 zł' }],
    priceNote: NOTE,
    steps: [
      'Sprawdzamy, czy firma potrzebuje pozwolenia.',
      'Zbieramy dane o poborze wód i odprowadzaniu ścieków.',
      'Przygotowujemy dokumentację.',
      'Wspieramy Cię w kontakcie z urzędem.',
    ],
    formServices: ['Ochrona środowiska'],
  },

  // ---------- Produkty i opakowania ----------
  {
    section: 'os',
    group: 'Produkty i opakowania',
    slug: 'opakowania-i-produkty',
    navLabel: 'Opakowania i produkty',
    summary: 'Ewidencja i rozliczanie opakowań oraz obowiązki producentów i wprowadzających.',
    title: 'Opakowania i obowiązki produktowe',
    metaTitle: 'Opakowania i obowiązki produktowe: ewidencja, sprawozdania – Safety First',
    metaDescription:
      'Ewidencja opakowań od 500 zł netto, sprawozdawczość opakowaniowa od 500 zł, audyt obowiązków produktowych od 1 000 zł. Firmy z województwa opolskiego.',
    lead: 'Jeśli wprowadzasz na rynek produkty w opakowaniach, masz obowiązki ewidencyjne i sprawozdawcze. Sprawdzamy je i przygotowujemy dane do sprawozdań.',
    scopeHeading: 'Zakres',
    scope: [
      'Ewidencja opakowań',
      'Rozliczanie opakowań',
      'Sprawozdawczość dotycząca opakowań',
      'Obowiązki przedsiębiorców wprowadzających produkty',
      'Analiza obowiązków produktowych',
      'Rozszerzona odpowiedzialność producenta',
      'Przygotowanie danych do sprawozdań',
    ],
    prices: [
      { name: 'Ewidencja opakowań', price: 'od 500 zł' },
      { name: 'Sprawozdawczość opakowaniowa', price: 'od 500 zł' },
      { name: 'Audyt obowiązków produktowych', price: 'od 1 000 zł' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, jakie produkty i opakowania wprowadza firma.',
      'Sprawdzamy, jakie obowiązki z tego wynikają.',
      'Przygotowujemy ewidencję i dane do sprawozdań.',
      'Pilnujemy terminów.',
    ],
    formServices: ['Ochrona środowiska'],
  },

  // ---------- Dokumentacja i kontrole ----------
  {
    section: 'os',
    group: 'Dokumentacja i kontrole',
    slug: 'dokumentacja-srodowiskowa',
    navLabel: 'Dokumentacja środowiskowa',
    summary: 'Procedury, instrukcje, rejestry i sprawozdania środowiskowe firmy.',
    title: 'Dokumentacja środowiskowa firmy',
    metaTitle: 'Dokumentacja środowiskowa: procedury, rejestry, instrukcje – Safety First',
    metaDescription:
      'Procedury, instrukcje gospodarki odpadami, rejestry i raporty środowiskowe dla firm z Opola i województwa opolskiego. Instrukcja gospodarki odpadami od 500 zł netto.',
    lead: 'Przygotowujemy dokumenty, o które pytają kontrolerzy: procedury, instrukcje, rejestry i sprawozdania, dopasowane do tego, co robi Twoja firma.',
    scopeHeading: 'Dokumenty, które przygotowujemy',
    scope: [
      'Procedury środowiskowe',
      'Instrukcje gospodarki odpadami i magazynowania odpadów',
      'Procedury postępowania z odpadami',
      'Rejestry środowiskowe i ewidencja odpadów',
      'Dokumentacja BDO, KOBiZE i opłat środowiskowych',
      'Sprawozdania i raporty środowiskowe',
      'Dokumentacja do pozwoleń środowiskowych',
    ],
    prices: [
      { name: 'Instrukcja gospodarki odpadami', price: 'od 500 zł' },
      { name: 'Procedura magazynowania odpadów', price: 'od 500 zł' },
      { name: 'Rejestr aspektów środowiskowych', price: 'od 500 zł' },
      { name: 'Dokumentacja do pozwoleń środowiskowych', price: 'wycena indywidualna' },
    ],
    priceNote: NOTE,
    steps: [
      'Sprawdzamy, jakie dokumenty firma ma, a jakich brakuje.',
      'Ustalamy, co przygotować, i wyceniamy zakres.',
      'Przygotowujemy dokumenty gotowe do podpisu.',
      'Aktualizujemy je, gdy zmienia się działalność lub przepisy.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Dokumentacja i kontrole',
    slug: 'aspekty-srodowiskowe',
    navLabel: 'Aspekty środowiskowe',
    summary: 'Analiza i rejestr aspektów środowiskowych, także jako start do ISO 14001.',
    title: 'Aspekty środowiskowe: analiza i rejestr',
    metaTitle: 'Aspekty środowiskowe: analiza, ocena i rejestr – Safety First, Opole',
    metaDescription:
      'Analiza aspektów środowiskowych od 1 000 zł netto, rejestr aspektów od 500 zł, przygotowanie firmy do ISO 14001. Województwo opolskie.',
    lead: 'Opisujemy, jak działalność firmy wpływa na środowisko, oceniamy te wpływy i zapisujemy je w rejestrze. To podstawa także przy wdrożeniu ISO 14001.',
    scopeHeading: 'Zakres',
    scope: [
      'Analiza aspektów środowiskowych',
      'Ocena aspektów środowiskowych',
      'Rejestr aspektów środowiskowych',
      'Przygotowanie firmy do certyfikacji ISO 14001',
    ],
    prices: [
      { name: 'Analiza aspektów środowiskowych', price: 'od 1 000 zł' },
      { name: 'Rejestr aspektów środowiskowych', price: 'od 500 zł' },
      { name: 'Przygotowanie do ISO 14001', price: 'wycena indywidualna' },
    ],
    priceNote: NOTE,
    steps: [
      'Poznajemy procesy w firmie.',
      'Wskazujemy aspekty środowiskowe i oceniamy ich znaczenie.',
      'Przygotowujemy rejestr.',
      'Aktualizujemy go przy zmianach w działalności.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Dokumentacja i kontrole',
    slug: 'awarie-i-wycieki',
    navLabel: 'Awarie i wycieki',
    summary: 'Procedury i plany awaryjne na wypadek wycieku lub skażenia środowiska.',
    title: 'Procedury na wypadek awarii i wycieku substancji',
    metaTitle: 'Procedury reagowania na awarie środowiskowe i wycieki – Safety First, Opole',
    metaDescription:
      'Procedury reagowania na awarie środowiskowe, plany awaryjne i instrukcje postępowania przy wycieku substancji lub skażeniu środowiska. Województwo opolskie.',
    lead: 'Gdy coś wycieknie, liczy się to, czy pracownicy wiedzą, co robić. Przygotowujemy procedury i instrukcje, które są proste do zastosowania na miejscu.',
    scopeHeading: 'Zakres',
    scope: [
      'Procedury reagowania na awarie środowiskowe',
      'Plany awaryjne',
      'Instrukcje postępowania w przypadku wycieku substancji',
      'Instrukcje postępowania w przypadku skażenia środowiska',
    ],
    prices: [
      { name: 'Procedura reagowania na awarie', price: 'wycena indywidualna' },
      { name: 'Instrukcja postępowania przy wycieku', price: 'wycena indywidualna' },
    ],
    priceNote: NOTE,
    steps: [
      'Ustalamy, jakie substancje i instalacje mogą spowodować awarię.',
      'Opisujemy możliwe scenariusze.',
      'Przygotowujemy procedury i instrukcje.',
      'Omawiamy je z osobami, które będą z nich korzystać.',
    ],
    formServices: ['Ochrona środowiska'],
  },
  {
    section: 'os',
    group: 'Dokumentacja i kontrole',
    slug: 'kontrola-wios',
    navLabel: 'Kontrola WIOŚ',
    summary: 'Przygotowanie firmy do kontroli WIOŚ i wsparcie w jej trakcie.',
    title: 'Przygotowanie do kontroli WIOŚ',
    metaTitle: 'Kontrola WIOŚ: przygotowanie i wsparcie – Safety First, Opole',
    metaDescription:
      'Przygotowanie przedsiębiorstwa do kontroli WIOŚ, audyt przed kontrolą i wsparcie podczas czynności kontrolnych. Opole i województwo opolskie.',
    lead: 'Sprawdzamy dokumenty i obowiązki firmy przed kontrolą Inspekcji Ochrony Środowiska i jesteśmy przy Tobie, kiedy kontrola się odbywa.',
    scopeHeading: 'W czym pomagamy',
    scope: [
      'Przygotowanie przedsiębiorstwa do kontroli WIOŚ',
      'Audyt firmy przed kontrolą',
      'Wsparcie podczas kontroli WIOŚ',
      'Uzupełnienie braków w dokumentach i ewidencjach',
    ],
    prices: [{ name: 'Przygotowanie do kontroli WIOŚ', price: 'wycena indywidualna' }],
    priceNote: NOTE,
    steps: [
      'Ustalamy, jakich obszarów może dotyczyć kontrola.',
      'Sprawdzamy dokumenty i miejsca, w których powstają odpady, emisje i ścieki.',
      'Uzupełniamy braki.',
      'Wspieramy Cię w trakcie kontroli.',
    ],
    details: {
      heading: 'Wsparcie przed, w trakcie i po kontroli',
      intro: [
        'Zapowiedziana lub niespodziewana wizyta inspektorów Wojewódzkiego Inspektoratu Ochrony Środowiska (WIOŚ) to jeden z najbardziej stresujących momentów dla przedsiębiorcy. Inspektorzy mogą wejść na teren firmy, żądać dokumentów i pobierać próbki. Brak przygotowania, błędy w dokumentach lub niewłaściwe zachowanie podczas kontroli mogą skończyć się mandatem, karą pieniężną, a w skrajnych przypadkach wstrzymaniem działalności.',
        'Pomagamy przed kontrolą, w jej trakcie i po niej, żeby ograniczyć jej skutki dla firmy.',
      ],
      items: [
        {
          title: 'Pomoc w trakcie kontroli',
          forWhom:
            'Dla firm, które dostały zawiadomienie o kontroli albo u których inspektorzy właśnie rozpoczęli czynności.',
          scope:
            'Możemy uczestniczyć w kontroli jako Twój pełnomocnik. Pilnujemy, żeby przebiegała zgodnie z procedurami, i pomagamy odpowiadać na pytania inspektorów.',
        },
        {
          title: 'Sprawdzenie protokołu kontroli',
          forWhom: 'Dla firm, u których kontrola się zakończyła i które otrzymały protokół z ustaleniami.',
          scope:
            'Sprawdzamy protokół pod kątem błędów formalnych i nadinterpretacji faktów. Pomagamy przygotować uzasadnione zastrzeżenia do protokołu.',
        },
        {
          title: 'Zalecenia pokontrolne i odwołania',
          forWhom:
            'Dla firm, które otrzymały decyzję o karze, mandat albo zarządzenie pokontrolne nakazujące usunięcie uchybień.',
          scope:
            'Przygotowujemy odwołania od decyzji WIOŚ do Głównego Inspektora Ochrony Środowiska i pomagamy sprawnie wdrożyć działania naprawcze, żeby zamknąć sprawę bez dalszych sankcji.',
        },
      ],
      why: 'Znamy procedury kontroli i przepisy ochrony środowiska, więc wiemy, jak rozmawiać z inspektorami. Pilnujemy, żeby kary nie były nakładane bez podstaw, i pomagamy Twojej firmie wyjść z kontroli z obronną ręką.',
    },
    formServices: ['Ochrona środowiska'],
  },
]
