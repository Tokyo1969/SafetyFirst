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
      title: 'Audit zerowy (wstępny)',
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
          title: 'Audity wewnętrzne',
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
      text: 'Wydawany jest na okres 3 lat, przy czym co roku odbywają się audity nadzoru.',
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
      title: 'Decyzja kierownictwa i audit zerowy (analiza luk)',
      punkty: [
        { title: 'Podjęcie decyzji', text: 'Zaangażowanie najwyższego kierownictwa i określenie kontekstu organizacji.' },
        {
          title: 'Audit wstępny',
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
          title: 'Audity wewnętrzne',
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
          title: 'Audit certyfikujący',
          text: 'Dwuetapowy proces zewnętrzny (etap 1: przegląd dokumentów, etap 2: weryfikacja działań na miejscu w firmie).',
        },
        {
          title: 'Wydanie certyfikatu',
          text: 'Pozytywny wynik auditu oznacza przyznanie certyfikatu na okres 3 lat, z zastrzeżeniem corocznych auditów nadzoru.',
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

// ---------------------------------------------------------------------------
// Podstrony norm: /wdrozenie-iso/<slug> (zakladki: Czego dotyczy, Instrukcja i wdrozenie, Wypelnij zgloszenie).
// ISO 9001: tresc nowa (15.11.2026, wydanie 2026). ISO 14001 i 45001: tresc Natalii z blokow powyzej + krótki opis.
// Pisownia na stronach ISO: audit, auditor (decyzja Natalii 13.11.2026).
// ---------------------------------------------------------------------------

export type IsoNormaSlug = 'iso-9001' | 'iso-14001' | 'iso-45001'

export type IsoNorma = {
  slug: IsoNormaSlug
  code: string // np. "ISO 9001"
  area: string // dziedzina, np. "Zarządzanie jakością"
  // lista na /wdrozenie-iso
  listTitle: string
  listText: string
  // podstrona
  metaTitle: string
  metaDescription: string
  h1: string
  lead: string
  czego: {
    akapity: readonly string[]
    edycja?: { title: string; text: string; zrodla: readonly IsoLink[] }
    filary?: readonly { title: string; text: string }[]
    korzysci?: readonly { title: string; text: string }[]
    dlaKogo?: readonly string[]
    integracja?: string
  }
  wdrozenie: {
    intro: string
    etapy: readonly IsoEtap[]
    kluczowe: readonly { title: string; text: string }[]
    wymagania?: readonly { title: string; text: string }[]
    zrodla?: readonly IsoLink[]
  }
}

// Przebieg certyfikacji jest wspolny dla trzech norm (jednostka certyfikujaca: audit etap 1 i 2, nadzór, recertyfikacja).
export const DROGA_CERTYFIKACJI: readonly { title: string; text: string }[] = [
  {
    title: 'Rozmowa wstępna i zgłoszenie',
    text: 'Zgłaszasz zamiar certyfikacji. Jednostka certyfikująca zbiera dane o firmie (zakres, liczba pracowników, lokalizacje, inne certyfikaty) i na tej podstawie ustala czas auditu oraz ofertę. Dane do tego wniosku zbieramy ze zgłoszenia w zakładce „Wypełnij zgłoszenie”: na jego podstawie przygotowujemy z Tobą wniosek na dokumentach jednostki.',
  },
  {
    title: 'Audit wstępny (opcjonalnie)',
    text: 'Próbna ocena gotowości. Pokazuje luki, zanim zacznie się właściwa certyfikacja.',
  },
  {
    title: 'Audit certyfikacyjny, etap 1',
    text: 'Auditor analizuje gotowość firmy: opis systemu zarządzania, dokumentację i zakres, a potem uzgadnia plan etapu 2.',
  },
  {
    title: 'Audit certyfikacyjny, etap 2',
    text: 'Ocena wdrożenia w firmie. Auditor sprawdza na miejscu, czy procesy działają tak, jak opisano, i zgodnie z normą.',
  },
  {
    title: 'Raport i decyzja',
    text: 'Auditor przekazuje raport. Jeśli są niezgodności, firma je koryguje, czasem potwierdza to dodatkowy audit. Potem zapada decyzja o certyfikacji.',
  },
  {
    title: 'Certyfikat',
    text: 'Dostajesz certyfikat ważny maksymalnie trzy lata oraz prawo do używania znaku certyfikacji.',
  },
  {
    title: 'Audity nadzoru i recertyfikacja',
    text: 'Co roku jednostka sprawdza, czy system nadal działa (audity nadzoru). Po trzech latach audit recertyfikacyjny przedłuża certyfikat o kolejny cykl.',
  },
]

const ISO_9001_NORMA: IsoNorma = {
  slug: 'iso-9001',
  code: 'ISO 9001',
  area: 'Zarządzanie jakością',
  listTitle: 'System zarządzania jakością',
  listText:
    'Jak zorganizować pracę firmy, żeby produkt lub usługa były powtarzalnie dobre, a klienci i kontrahenci mieli powód, by Ci ufać. Norma dla firm każdej wielkości i branży.',
  metaTitle: 'ISO 9001: certyfikacja i wdrożenie systemu jakości, zgłoszenie online | Safety First',
  metaDescription:
    'ISO 9001:2026 w pigułce: czego dotyczy norma, jak przygotować firmę i jak wygląda droga do certyfikatu. Wypełnij zgłoszenie online i pobierz je jako PDF.',
  h1: 'ISO 9001',
  lead: 'System zarządzania jakością w firmie. Dowiedz się, czego wymaga norma, jak przygotować firmę do certyfikacji i wypełnij zgłoszenie online.',
  czego: {
    akapity: [
      'ISO 9001 to międzynarodowa norma, która określa wymagania wobec systemu zarządzania jakością. Nie mówi, jak ma wyglądać Twój produkt czy usługa. Mówi, jak zorganizować pracę firmy, żeby jej wynik był powtarzalny, spełniał oczekiwania klientów i wymagania przepisów oraz żeby firma uczyła się na własnych błędach.',
      'Norma jest uniwersalna. Stosują ją firmy produkcyjne, usługowe, handlowe i budowlane, od kilkuosobowych zespołów po duże organizacje. Nie jest obowiązkowa z mocy prawa, ale często pojawia się jako wymóg w przetargach i przy współpracy z większymi kontrahentami.',
    ],
    edycja: {
      title: 'Obowiązuje wydanie ISO 9001:2026',
      text: 'Nowe wydanie opublikowano 16 września 2026 r. i zastąpiło ono edycję z 2015 roku. Zmiany są ewolucyjne: zostaje układ dziesięciu rozdziałów, podejście procesowe, cykl Plan-Do-Check-Act i myślenie oparte na ryzyku, a norma wyraźniej uwzględnia m.in. wpływ zmian klimatu. Firmy z certyfikatem ISO 9001:2015 mają czas na przejście na nowe wydanie do 30 września 2029 r. Nowe wdrożenia przygotowujemy od razu pod wydanie 2026, a szczegóły certyfikacji i przejścia ustala jednostka certyfikująca.',
      zrodla: [
        { label: 'ISO: ISO 9001:2026', href: 'https://www.iso.org/quality-management/iso-9001-2026' },
        {
          label: 'LRQA: publikacja i okres przejściowy',
          href: 'https://www.lrqa.com/pl-pl/najnowsze-informacje/iso-9001-2026-juz-opublikowana/',
        },
      ],
    },
    filary: [
      {
        title: 'Klient w centrum',
        text: 'Firma rozpoznaje potrzeby i oczekiwania klientów, a potem sprawdza, czy je spełnia.',
      },
      {
        title: 'Podejście procesowe',
        text: 'Praca jest opisana jako powiązane procesy: każdy ma właściciela, wynik i wskaźnik, po którym widać, czy działa.',
      },
      {
        title: 'Myślenie oparte na ryzyku',
        text: 'Firma z góry ustala, co może pójść nie tak i jakie widzi szanse, i planuje reakcję, zanim problem dotrze do klienta.',
      },
      {
        title: 'Ciągłe doskonalenie',
        text: 'Błędy, reklamacje i wyniki auditów są podstawą do poprawek, a nie tylko wpisem w rejestrze.',
      },
    ],
    korzysci: [
      { title: 'Uporządkowane procesy', text: 'Wiadomo, kto za co odpowiada, więc jest mniej błędów i poprawek.' },
      {
        title: 'Zaufanie klientów i kontrahentów',
        text: 'Certyfikat to niezależne potwierdzenie, że system działa. Bywa warunkiem udziału w przetargu.',
      },
      { title: 'Lepsze decyzje', text: 'Opierasz je na wskaźnikach, reklamacjach i wynikach auditów, a nie na domysłach.' },
      { title: 'Mniejsze ryzyko', text: 'Problemy wychodzą na jaw u Ciebie, a nie dopiero u klienta.' },
      {
        title: 'Spójność przy rozwoju',
        text: 'Nowe osoby wchodzą w opisane zasady i nie muszą zgadywać, jak „u nas się to robi”.',
      },
    ],
    dlaKogo: [
      'klienci lub przetargi wymagają certyfikatu ISO 9001,',
      'firma rośnie, a wiedza o tym, jak pracować, jest w głowach pojedynczych osób,',
      'powtarzają się reklamacje, poprawki albo opóźnienia, a nie wiadomo, gdzie jest przyczyna.',
    ],
    integracja:
      'ISO 9001, ISO 14001 i ISO 45001 mają wspólną strukturę, więc można je połączyć w jeden zintegrowany system zarządzania: z jedną polityką, wspólnymi auditami wewnętrznymi i przeglądem zarządzania. Zintegrowany system oznacza mniej papierów, a przy certyfikacji może skrócić czas auditu.',
  },
  wdrozenie: {
    intro:
      'Wdrożenie ISO 9001 to kilka etapów. Poniżej kolejność, którą stosujemy. Przy małych firmach część kroków da się połączyć.',
    etapy: [
      {
        title: 'Decyzja kierownictwa i zakres systemu',
        text: 'Najwyższe kierownictwo decyduje o wdrożeniu, wyznacza osobę odpowiedzialną za system i określa zakres: które lokalizacje, wyroby i usługi obejmie certyfikat. Spisujemy też strony zainteresowane (klienci, urzędy, dostawcy) i to, czego oczekują od firmy.',
      },
      {
        title: 'Audit wstępny (analiza luk)',
        text: 'Porównujemy to, jak firma pracuje dziś, z wymaganiami normy. Wynikiem jest lista braków i plan: co trzeba opracować, a co wystarczy tylko opisać, bo już działa.',
      },
      {
        title: 'Polityka jakości, cele i ryzyka',
        text: 'Kierownictwo ustala politykę jakości i mierzalne cele. Firma identyfikuje ryzyka i szanse związane z procesami i planuje, jak na nie reagować.',
      },
      {
        title: 'Mapa procesów i dokumentacja',
        text: 'Opisujemy kluczowe procesy: kto za nie odpowiada, co jest wejściem i wynikiem oraz jak mierzymy skuteczność. Dokumentacja ma być tak szczupła, jak to możliwe. Norma wymaga informacji, które firma faktycznie potrzebuje do sterowania procesami, a nie stosu papierów.',
      },
      {
        title: 'Wdrożenie w codziennej pracy i szkolenia',
        text: 'Zasady wchodzą do praktyki. Pracownicy poznają politykę, swoje role i wpływ na jakość, a firma zaczyna zbierać zapisy, które dowodzą, że system działa.',
      },
      {
        title: 'Audit wewnętrzny i przegląd zarządzania',
        text: 'Przed auditem certyfikacyjnym firma sprawdza system sama: przeprowadza audit wewnętrzny i przegląd zarządzania przez kierownictwo. Wykryte niezgodności trzeba udokumentować i skorygować.',
      },
      {
        title: 'Gotowość do certyfikacji',
        text: 'Sprawdzamy kompletność zapisów, domykamy otwarte niezgodności i ustalamy z jednostką certyfikującą termin auditu.',
      },
    ],
    kluczowe: [
      {
        title: 'Czas wdrożenia',
        text: 'Zwykle od kilku tygodni do kilku miesięcy, zależnie od wielkości firmy i tego, co już jest uporządkowane.',
      },
      {
        title: 'Certyfikat',
        text: 'Ważny maksymalnie trzy lata, z corocznymi auditami nadzoru.',
      },
      {
        title: 'Koszt certyfikacji',
        text: 'Ustala go jednostka certyfikująca na podstawie danych o firmie: liczby pracowników, lokalizacji, zakresu i zintegrowanych systemów.',
      },
    ],
    wymagania: [
      {
        title: 'Kontekst organizacji',
        text: 'Zrozumienie otoczenia firmy, oczekiwań stron zainteresowanych i określenie zakresu systemu.',
      },
      {
        title: 'Przywództwo',
        text: 'Kierownictwo odpowiada za system, ustala politykę jakości, przydziela role i dba o orientację na klienta.',
      },
      {
        title: 'Planowanie',
        text: 'Ryzyka i szanse, cele jakościowe oraz plan ich osiągnięcia.',
      },
      {
        title: 'Wsparcie',
        text: 'Zasoby, kompetencje i świadomość pracowników, komunikacja oraz informacja udokumentowana.',
      },
      {
        title: 'Działania operacyjne',
        text: 'Planowanie i realizacja produktów i usług: wymagania klientów, projektowanie i rozwój, nadzór nad dostawcami, kontrola wyników niezgodnych z wymaganiami.',
      },
      {
        title: 'Ocena wyników',
        text: 'Monitorowanie i pomiary, zadowolenie klientów, audit wewnętrzny i przegląd zarządzania.',
      },
      {
        title: 'Doskonalenie',
        text: 'Postępowanie z niezgodnościami, działania korygujące i ciągłe doskonalenie systemu.',
      },
    ],
    zrodla: [
      { label: 'ISO: ISO 9001:2026', href: 'https://www.iso.org/quality-management/iso-9001-2026' },
    ],
  },
}

const ISO_14001_NORMA: IsoNorma = {
  slug: 'iso-14001',
  code: 'ISO 14001',
  area: 'Zarządzanie środowiskowe',
  listTitle: 'System zarządzania środowiskowego',
  listText:
    'Jak panować nad odpadami, emisjami, zużyciem wody i energii oraz wymaganiami prawa ochrony środowiska i systematycznie zmniejszać wpływ firmy na środowisko.',
  metaTitle: 'ISO 14001: wdrożenie systemu środowiskowego, zgłoszenie online | Safety First',
  metaDescription:
    'ISO 14001: czego dotyczy norma, etapy wdrożenia systemu zarządzania środowiskowego i droga do certyfikatu. Wypełnij zgłoszenie online i pobierz je jako PDF.',
  h1: 'ISO 14001',
  lead: 'System zarządzania środowiskowego w firmie. Dowiedz się, jak wygląda wdrożenie i certyfikacja, i wypełnij zgłoszenie online.',
  czego: {
    akapity: [
      'ISO 14001 to międzynarodowa norma, która określa wymagania wobec systemu zarządzania środowiskowego. Pomaga firmie ustalić, jak jej działalność wpływa na środowisko (odpady, emisje, zużycie wody i energii), spełniać wymagania prawa ochrony środowiska i planowo ograniczać ten wpływ.',
      'Norma jest uniwersalna i nie jest obowiązkowa z mocy prawa. Często wymagają jej klienci i przetargi, a dla firm z kontrolami środowiskowymi jest sposobem na uporządkowanie obowiązków w jednym systemie.',
    ],
    integracja:
      'ISO 14001 ma wspólną strukturę z ISO 9001 i ISO 45001, więc można je połączyć w jeden zintegrowany system zarządzania i certyfikować wspólnie.',
  },
  wdrozenie: {
    intro: ISO_14001.intro ?? '',
    etapy: ISO_14001.etapy,
    kluczowe: ISO_14001.kluczowe,
    zrodla: ISO_14001.zrodla,
  },
}

const ISO_45001_NORMA: IsoNorma = {
  slug: 'iso-45001',
  code: 'ISO 45001',
  area: 'Bezpieczeństwo i higiena pracy',
  listTitle: 'System zarządzania BHP',
  listText:
    'Jak identyfikować zagrożenia, ograniczać ryzyko wypadków i chorób zawodowych oraz angażować pracowników w bezpieczną pracę. Norma, o którą pytają duzi kontrahenci.',
  metaTitle: 'ISO 45001: wdrożenie systemu zarządzania BHP, zgłoszenie online | Safety First',
  metaDescription:
    'ISO 45001: czego dotyczy norma, etapy wdrożenia systemu zarządzania BHP i droga do certyfikatu. Wypełnij zgłoszenie online i pobierz je jako PDF.',
  h1: 'ISO 45001',
  lead: 'System zarządzania bezpieczeństwem i higieną pracy. Dowiedz się, jak wygląda wdrożenie i certyfikacja, i wypełnij zgłoszenie online.',
  czego: {
    akapity: [
      'ISO 45001 to międzynarodowa norma, która określa wymagania wobec systemu zarządzania bezpieczeństwem i higieną pracy. Pomaga firmie systematycznie rozpoznawać zagrożenia, oceniać ryzyko zawodowe, ograniczać liczbę wypadków i chorób zawodowych oraz angażować pracowników w poprawę bezpieczeństwa.',
      'Wdrożenie nie jest obowiązkowe z mocy prawa, ale często stanowi wymóg w przetargach lub przy współpracy z dużymi kontrahentami. System buduje się na przepisach BHP, których firma i tak musi przestrzegać, i porządkuje je w jeden system.',
    ],
    integracja:
      'ISO 45001 ma wspólną strukturę z ISO 9001 i ISO 14001, więc można je połączyć w jeden zintegrowany system zarządzania i certyfikować wspólnie.',
  },
  wdrozenie: {
    intro: ISO_45001.intro ?? '',
    etapy: ISO_45001.etapy,
    kluczowe: ISO_45001.kluczowe,
    zrodla: ISO_45001.zrodla,
  },
}

export const ISO_NORMY: readonly IsoNorma[] = [ISO_9001_NORMA, ISO_14001_NORMA, ISO_45001_NORMA]

export function getIsoNorma(slug: string): IsoNorma | undefined {
  return ISO_NORMY.find((n) => n.slug === slug)
}
