// Najczestsze pytania klientow i odpowiedzi Natalii Krysztofiak (dokument "Co dalej i czego potrzebujemy od Natalii").
// Tresc merytoryczna jest jej; w kodzie poprawiono tylko literowki, interpunkcje i szyk zdan.
// Dane zasilaja strone /faq (z danymi strukturalnymi FAQPage) oraz wiedze asystenta (chat-knowledge.ts).
// `to` = opcjonalny link do podstrony uslugi, ktora wyjasnia temat (tylko istniejace strony).

export type FaqItem = { q: string; a: string; to?: string }
export type FaqGroup = { id: 'bhp' | 'srodowisko'; title: string; items: FaqItem[] }

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'bhp',
    title: 'BHP',
    items: [
      {
        q: 'Czy muszę zapewnić pracownikom szkolenia BHP?',
        a: 'Tak. Pracownik musi odbyć szkolenie przed rozpoczęciem pracy, a później szkolenia okresowe.',
        to: '/szkolenia-bhp',
      },
      {
        q: 'Czy każdy pracownik musi mieć badania lekarskie?',
        a: 'Tak. Przed dopuszczeniem do pracy pracownik musi mieć aktualne orzeczenie lekarskie.',
      },
      {
        q: 'Czy potrzebuję oceny ryzyka zawodowego?',
        a: 'Tak. Ocena ryzyka jest obowiązkowa dla każdego stanowiska pracy.',
        to: '/ocena-ryzyka-zawodowego',
      },
      {
        q: 'Czy muszę zapewnić pracownikom odzież roboczą i środki ochrony?',
        a: 'Tak, jeśli wymagają tego warunki pracy lub ocena ryzyka.',
      },
      {
        q: 'Co zrobić po wypadku przy pracy?',
        a: 'Trzeba zabezpieczyć miejsce, udzielić pomocy i powołać zespół powypadkowy.',
        to: '/wypadki-przy-pracy',
      },
      {
        q: 'Czy muszę mieć apteczkę i wyznaczone osoby do pierwszej pomocy?',
        a: 'Tak, liczba apteczek i wyznaczonych osób zależą od rodzaju oraz wielkości zakładu.',
      },
      {
        q: 'Czy mogę sam prowadzić sprawy BHP w firmie?',
        a: 'W niektórych przypadkach tak, po spełnieniu określonych warunków i ukończeniu odpowiedniego szkolenia.',
        to: '/obsluga-bhp',
      },
      {
        q: 'Jak przygotować firmę do kontroli PIP?',
        a: 'Warto sprawdzić posiadaną dokumentację, szkolenia, badania, ocenę ryzyka i warunki na stanowiskach pracy.',
        to: '/kontrola-i-audyt-bhp',
      },
      {
        q: 'Skąd mam wiedzieć, czy ocena ryzyka zawodowego jest aktualna?',
        a: 'Powinna być aktualizowana po zmianach w zakładzie pracy, stosowanej technologii, organizacji pracy lub po wypadku.',
        to: '/ocena-ryzyka-zawodowego',
      },
      {
        q: 'Czy wszyscy pracownicy muszą mieć aktualne szkolenia BHP?',
        a: 'Tak, trzeba regularnie kontrolować i planować szkolenia z wyprzedzeniem.',
        to: '/szkolenia-bhp',
      },
      {
        q: 'Czy pracownicy muszą używać środków ochrony indywidualnej?',
        a: 'Tak. Jeśli są wymagane, pracodawca musi je zapewnić, a pracownik powinien ich używać.',
      },
      {
        q: 'Czy instrukcje BHP muszą być dostępne na wszystkich stanowiskach?',
        a: 'Tak, instrukcje muszą być napisane dla wszystkich stanowisk, dostępne i zrozumiałe dla pracowników.',
        to: '/dokumentacja-bhp',
      },
      {
        q: 'Czy zdarzenia potencjalnie wypadkowe muszą być zgłaszane?',
        a: 'Powinny być zgłaszane wewnętrznie w firmie, ponieważ pomagają zapobiegać wypadkom. Nie ma jednak obowiązku zgłaszania ich instytucjom państwowym.',
      },
      {
        q: 'Czy drogi ewakuacyjne mogą być tymczasowo zablokowane?',
        a: 'To absolutnie zabronione. Drogi ewakuacyjne muszą być zawsze drożne i poprawnie oznaczone.',
      },
      {
        q: 'Czy muszę sprawdzać, czy maszyny i urządzenia są sprawne technicznie, czy ten obowiązek należy do pracownika?',
        a: 'Obowiązek ten należy zarówno do pracodawcy, jak i do pracownika. Uszkodzony sprzęt należy wyłączać z użytkowania.',
      },
      {
        q: 'Czy zmiany organizacyjne muszą zostać ocenione pod kątem BHP?',
        a: 'Tak, każda zmiana stanowiska, procesu lub wyposażenia może wymagać aktualizacji oceny ryzyka.',
        to: '/ocena-ryzyka-zawodowego',
      },
    ],
  },
  {
    id: 'srodowisko',
    title: 'Ochrona środowiska',
    items: [
      {
        q: 'Czy moja firma musi prowadzić ewidencję odpadów?',
        a: 'To zależy od rodzaju i ilości wytwarzanych odpadów. Warto sprawdzić obowiązki firmy przed rozpoczęciem działalności. Jeśli już ją prowadzisz, skontaktuj się ze specjalistą albo sam zweryfikuj swoje obowiązki.',
        to: '/ochrona-srodowiska/ewidencja-odpadow',
      },
      {
        q: 'Czy muszę mieć umowę na odbiór odpadów?',
        a: 'Tak, jeśli firma wytwarza odpady wymagające przekazania uprawnionemu odbiorcy.',
        to: '/ochrona-srodowiska/gospodarka-odpadami',
      },
      {
        q: 'Czy muszę rejestrować firmę w BDO?',
        a: 'W wielu przypadkach tak. Zależy to od rodzaju prowadzonej działalności i wytwarzanych odpadów.',
        to: '/ochrona-srodowiska/obsluga-bdo',
      },
      {
        q: 'Czy mogę przekazać odpady dowolnej firmie?',
        a: 'Nie. Odpady należy przekazywać tylko podmiotom, które mają odpowiednie uprawnienia.',
        to: '/ochrona-srodowiska/gospodarka-odpadami',
      },
      {
        q: 'Czy muszę szkolić pracowników z ochrony środowiska?',
        a: 'Tak, jeśli ich praca ma wpływ na odpady, substancje chemiczne, emisje lub zużycie zasobów naturalnych.',
      },
      {
        q: 'Czy firma musi segregować odpady?',
        a: 'Tak. Odpady trzeba zbierać selektywnie i oznaczać zgodnie z ich rodzajem. W niektórych typach działalności niezbędne jest również nadanie im poprawnych kodów odpadów.',
        to: '/ochrona-srodowiska/klasyfikacja-odpadow',
      },
      {
        q: 'Czy mogę magazynować odpady na terenie firmy?',
        a: 'Tak, ale tylko w wyznaczonym i odpowiednio zabezpieczonym miejscu.',
      },
      {
        q: 'Czy muszę oznaczać miejsca magazynowania odpadów?',
        a: 'Tak. Oznaczenia pomagają zachować porządek, bezpieczeństwo i właściwą segregację.',
      },
      {
        q: 'Czy zużyte świetlówki, baterie i sprzęt elektroniczny to odpady niebezpieczne?',
        a: 'Często tak. Nie wolno wyrzucać ich do zwykłych pojemników.',
      },
      {
        q: 'Czy muszę kontrolować zużycie energii i wody?',
        a: 'Warto to robić regularnie. Pozwala ograniczać koszty i wpływ firmy na środowisko. Nie jest to jednak obowiązkiem dla mniejszych firm.',
      },
      {
        q: 'Czy muszę mieć procedurę na wypadek awarii środowiskowej?',
        a: 'Jeśli w firmie występuje ryzyko wycieku, emisji lub skażenia, taka procedura jest bardzo potrzebna.',
        to: '/ochrona-srodowiska/awarie-i-wycieki',
      },
      {
        q: 'Czy mogę odprowadzać ścieki przemysłowe do kanalizacji?',
        a: 'Tylko na zasadach określonych w umowie i przepisach. Nie każdy rodzaj ścieków może trafić do kanalizacji.',
        to: '/ochrona-srodowiska/gospodarka-wodno-sciekowa',
      },
      {
        q: 'Czy muszę prowadzić dokumentację dotyczącą substancji chemicznych i mieć karty charakterystyki?',
        a: 'Tak. Dokumentacja powinna obejmować między innymi karty charakterystyki i zasady bezpiecznego stosowania, a karty muszą być dostępne dla osób, które pracują z tymi substancjami.',
      },
      {
        q: 'Czy muszę znać wszystkie rodzaje wytwarzanych odpadów?',
        a: 'Tak. To podstawa prawidłowej ewidencji, segregacji i przekazywania odpadów.',
        to: '/ochrona-srodowiska/klasyfikacja-odpadow',
      },
      {
        q: 'Czy muszę kontrolować emisje do powietrza?',
        a: 'Jeśli działalność powoduje emisje, trzeba je monitorować i spełniać wymagane obowiązki.',
        to: '/ochrona-srodowiska/emisje-do-powietrza',
      },
      {
        q: 'Czy musimy mieć pozwolenia środowiskowe?',
        a: 'To zależy od skali i rodzaju działalności. Warto regularnie weryfikować, czy są aktualne.',
      },
    ],
  },
]
