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
- `src/data/services.ts` – podstrony usług BHP (treść i ceny z oferty). Nowa usługa = nowy wpis + plik trasy w `src/routes/`.
- `src/server/consultation.ts` – server function formularza.
- `supabase/migrations/` – migracje (zastosowane w Supabase, region eu-central-1).

## Zasady
- Ceny zawsze "od", netto, orientacyjne. Nawigacja tylko do istniejących stron (bez martwych linków).
- Doświadczenie Natalii bez pracodawców i dat. Zdjęcie Natalii: `src/assets/natalia-krysztofiak.jpg` (z `src/files/...-mini.jpg`).
- Widoczny adres e-mail: tylko biuro@. Pozostałe skrzynki (bhp@, os@, szkolenia@, serwis@) zarezerwowane pod automatyzacje.
- Design: kolory z logo, znaki bezpieczenstwa, tasma ostrzegawcza, "karta kontroli" w hero, zaokraglone panele, menu mobilne ponizej `lg`. Kolory: tusz #1D2B3E (granat z logo), znak-logo #2E8B3E (zielen z logo, tylko ikony i akcenty), znak #237033 (przyciski i linki, kontrast AA), znak-negatyw #5FC26E (na ciemnym), mgla #F3F5F7 (tlo), tasma #FFC72C (glowne CTA). Wspolne bloki stron w `src/components/blocks.tsx`.
- Logo: oryginaly wszystkich wersji w `src/files/`, na stronie kopie bez metadanych C2PA w `src/assets/` (komponent `Logo`), favicon `public/favicon.svg` (znak).

## Do zrobienia
- Podpiąć domenę.
- Treści podstron BHP do zatwierdzenia przez Natalię. Pozostałe podstrony BHP (np. wypadki, pakiety dokumentów), potem ochrona środowiska (18 stron), cennik, szkolenia, o nas, dla branż.
- Blogi (3 osobne w Soro, Brand DNA po akceptacji kierunku), SEO, schema.
- Polityka prywatności i regulamin do sprawdzenia przez prawnika. Certyfikaty i kwalifikacje do uzupełnienia.
