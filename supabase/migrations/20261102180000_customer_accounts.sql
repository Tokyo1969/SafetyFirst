-- Konto klienta "Moje zakupy" (regulamin §2 i §6). Uprawnienia do plikow nadaje serwer po oplaceniu
-- (src/server/entitlements.ts, klucz serwisowy); pobieranie przez Workera (src/server/download.ts).

-- Klient widzi kupione produkty takze po ich ukryciu w sklepie (nazwa, typ, wydanie w "Moich zakupach").
create policy products_entitled_read on public.products for select
  using (exists (
    select 1 from public.entitlements e
    where e.product_id = products.id and e.user_id = auth.uid() and e.revoked_at is null
  ));

-- Admin zmienia limit pobran i cofa dostep (regulamin §6 ust. 2, §7 ust. 6).
create policy entitlements_admin_write on public.entitlements for all
  using (is_admin()) with check (is_admin());

-- Powiadomienie o aktualizacji dokumentu (regulamin §6 ust. 5): kiedy ostatnio wyslane dla danej wersji.
alter table public.product_files add column if not exists update_notified_at timestamptz;

create index if not exists idx_entitlements_product on public.entitlements (product_id);
create index if not exists idx_profiles_email on public.profiles (lower(email));
