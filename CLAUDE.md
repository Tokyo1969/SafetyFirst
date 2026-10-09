# Safety First (safetyfirst.opole.pl)

Strona usług BHP i ochrony środowiska. Usługę prowadzi Natalia Krysztofiak (wszystkie dokumenty podpisuje ona, "Safety First" to tylko marka). Technicznie odpowiada Maciej Dominik (NexXsite).

## Stack i decyzje
- TanStack Start (React 19, Vite) z SSR na Cloudflare Workers (`@cloudflare/vite-plugin` przed `tanstackStart()`). LH.pl zostaje tylko dla domeny i poczty. Nie ruszać rekordów MX.
- Tailwind v4 (`src/styles.css`, tokeny w `@theme`), fonty self-hosted (fontsource).
- Supabase: osobny projekt `rcizhcktflczrtadifwd` (sprawdzić, czy region UE). Formularz zapisuje przez REST z anon key, RLS: anon tylko INSERT.
- Zmienne: SUPABASE_URL i SUPABASE_ANON_KEY (klucz publishable, publiczny z założenia) są w `wrangler.jsonc` (`vars`), bo wrangler deploy kasuje zmienne ustawione tylko w panelu. Lokalnie `.dev.vars`. Zob. `.env.example`.
- Importy względne (brak aliasu ścieżek).
- n8n (n8n.nexxsite.pl): workflow "Safety First - Zgloszenie z formularza na biuro@" (id sGtFiIJ96HQUzw10), wywoływany triggerem w Supabase (pg_net), wysyła mail z biuro@ na biuro@ (credential "SMTP SafetyFirst Biuro": host mail-serwer501253.lh.pl, port 587 BEZ SSL/TLS, bo SSL na LH.pl powoduje timeout). Dalej: akceptacja wpisów blogowych.

## Struktura
- `src/config/site.ts` – jedyne źródło danych firmy i kontaktu (po założeniu sp. z o.o. zmieniamy tylko ten plik).
- `src/data/pricing.ts` – cennik abonamentu BHP z oferty Natalii.
- `src/server/consultation.ts` – server function formularza.
- `supabase/migrations/` – migracje (zastosowane w Supabase, region eu-central-1).

## Zasady
- Ceny zawsze "od", netto, orientacyjne. Nawigacja tylko do istniejących stron (bez martwych linków).
- Doświadczenie Natalii bez pracodawców i dat. Zdjęcie jest tymczasowe i ma zostać podmienione na prawdziwe przed startem.
- Widoczny adres e-mail: tylko biuro@. Pozostałe skrzynki (bhp@, os@, szkolenia@, serwis@) zarezerwowane pod automatyzacje.
- Design: język znaków BHP, tasma ostrzegawcza, "karta kontroli", sekcje liniami zamiast kart. Kolory: papier #F5F6F2, tusz #16212C, znak #0A5A9C, zieleń #1F7A4D, taśma #F4C20D.

## Do zrobienia
- Podpiąć domenę.
- Pozostałe podstrony BHP, potem ochrona środowiska (18 stron), cennik, szkolenia, o nas, dla branż.
- Blogi (3 osobne w Soro, Brand DNA po akceptacji kierunku), SEO, schema.
- Polityka prywatności i regulamin do sprawdzenia przez prawnika. Certyfikaty i kwalifikacje do uzupełnienia.
