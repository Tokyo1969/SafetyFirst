# Safety First (safetyfirst.opole.pl)

Strona usług BHP i ochrony środowiska. Usługę prowadzi Natalia Krysztofiak (wszystkie dokumenty podpisuje ona, "Safety First" to tylko marka). Technicznie odpowiada Maciej Dominik (NexXsite).

## Stack i decyzje
- TanStack Start (React 19, Vite) z SSR na Cloudflare Workers (`@cloudflare/vite-plugin` przed `tanstackStart()`). LH.pl zostaje tylko dla domeny i poczty. Nie ruszać rekordów MX.
- Tailwind v4 (`src/styles.css`, tokeny w `@theme`, klasy `.kontener .sekcja .btn .panel .pole .link`), font self-hosted (fontsource): IBM Plex Sans Variable (naglowki i tekst, wagi 100-700, bez kursywy).
- Supabase: osobny projekt `rcizhcktflczrtadifwd` (sprawdzić, czy region UE). Formularz zapisuje przez REST z anon key, RLS: anon tylko INSERT.
- Zmienne: SUPABASE_URL i SUPABASE_ANON_KEY (klucz publishable, publiczny z założenia) są w `wrangler.jsonc` (`vars`), bo wrangler deploy kasuje zmienne ustawione tylko w panelu. Lokalnie `.dev.vars`. Zob. `.env.example`.
- Importy względne (brak aliasu ścieżek).
- n8n (n8n.nexxsite.pl): workflow "Safety First - Zgloszenie z formularza na biuro@" (id sGtFiIJ96HQUzw10), wywoływany triggerem w Supabase (pg_net), wysyła mail z biuro@ na biuro@ (credential "SMTP SafetyFirst Biuro": host mail-serwer501253.lh.pl, port 587 BEZ SSL/TLS, bo SSL na LH.pl powoduje timeout). Dalej: akceptacja wpisów blogowych.

## Struktura
- `src/config/site.ts` – jedyne źródło danych firmy i kontaktu (po założeniu sp. z o.o. zmieniamy tylko ten plik).
- `src/data/pricing.ts` – cennik abonamentu BHP z oferty Natalii.
- `src/data/services.ts` – podstrony usług BHP (treść i ceny z oferty, 7 stron). Nowa usługa BHP = nowy wpis + plik trasy w `src/routes/` (wzór: `szkolenia-bhp.tsx`).
- `src/data/os-services.ts` – 18 podstron ochrony środowiska (`/ochrona-srodowiska/<slug>`, jedna trasa dynamiczna `ochrona-srodowiska.$slug.tsx` + lista `ochrona-srodowiska.index.tsx`). Nowa usługa OŚ = tylko nowy wpis w tym pliku.
- `src/data/catalog.ts` – wspólny wykaz usług (ścieżki, powiązane strony, `SITEMAP_PATHS`).
- `src/lib/seo.ts` – meta, canonical, Open Graph i JSON-LD (Organization, Service, BreadcrumbList). Każda trasa używa `pageHead()` lub `serviceHead()`. `sitemap.xml` generuje trasa `sitemap[.]xml.ts`, `robots.txt` jest w `public/`.
- `src/server/consultation.ts` – server function formularza.
- `supabase/migrations/` – migracje (zastosowane w Supabase, region eu-central-1).

## Zasady
- Ceny zawsze "od", netto, orientacyjne. Ceny BHP pochodzą z oferty Natalii (potwierdzone). Ceny OŚ to dolne widełki z "100 propozycji.md" i NIE są jeszcze zatwierdzone przez Natalię (komentarz w `os-services.ts`); część pozycji OŚ ma "wycena indywidualna". Nawigacja tylko do istniejących stron (bez martwych linków).
- Doświadczenie Natalii bez pracodawców i dat. Zdjęcie Natalii: `src/assets/natalia-krysztofiak.jpg` (z `src/files/...-mini.jpg`).
- Adresy e-mail: główny biuro@ (stopka, polityka, formularz). Skrzynki tematyczne bhp@ (serwis BHP), os@ (ochrona środowiska), szkolenia@ i serwis@ (błędy na stronie) są widoczne tylko w sekcji konsultacji pod "Wolisz porozmawiać?" i docelowo pod automatyzacje.
- Design: kolory z logo, znaki bezpieczenstwa, tasma ostrzegawcza, "karta kontroli" w hero, zaokraglone panele, menu mobilne ponizej `lg`. Kolory: tusz #1D2B3E (granat z logo), znak-logo #2E8B3E (zielen z logo, tylko ikony i akcenty), znak #237033 (przyciski i linki, kontrast AA), znak-negatyw #5FC26E (na ciemnym), mgla #F3F5F7 (tlo), tasma #FFC72C (glowne CTA). Wspolne bloki stron w `src/components/blocks.tsx`.
- Logo: oryginaly wszystkich wersji w `src/files/`, na stronie kopie bez metadanych C2PA w `src/assets/` (komponent `Logo`), favicon `public/favicon.svg` (znak).

## Do zrobienia
- Podpiąć domenę.
- Treści podstron BHP i OŚ oraz ceny OŚ do zatwierdzenia przez Natalię. Brakuje jeszcze: cennik, szkolenia (strona zbiorcza), o nas, dla branż, kontakt.
- Po podpięciu domeny: sprawdzić canonical/sitemap (`site.domain`), zgłosić sitemapę w Google Search Console, rozważyć obraz Open Graph (`og:image`).
- Blogi (3 osobne w Soro, Brand DNA po akceptacji kierunku), SEO, schema.
- Polityka prywatności i regulamin do sprawdzenia przez prawnika. Certyfikaty i kwalifikacje do uzupełnienia.
