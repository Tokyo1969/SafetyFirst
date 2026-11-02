-- Odstapienie od umowy online (regulamin §8 ust. 4 i 6): oswiadczenie ze znacznikiem czasu.
-- Zapisuje tylko serwer (klucz serwisowy, src/server/withdrawal.ts); admin czyta i oznacza obsluzenie w panelu.
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.orders (id) on delete set null,
  order_number text not null check (char_length(order_number) <= 40),
  buyer_name text not null check (char_length(buyer_name) <= 200),
  email text not null check (char_length(email) <= 200),
  statement text not null check (char_length(statement) <= 2000),
  confirmation_sent_at timestamptz,
  handled_at timestamptz,
  note text check (char_length(note) <= 2000)
);

create index withdrawals_created_at_idx on public.withdrawals (created_at desc);
create index withdrawals_order_idx on public.withdrawals (order_id);

alter table public.withdrawals enable row level security;
create policy withdrawals_admin_select on public.withdrawals for select using (is_admin());
create policy withdrawals_admin_update on public.withdrawals for update using (is_admin()) with check (is_admin());

-- Potwierdzenie zamowienia na trwalym nosniku (regulamin §4 ust. 4): znacznik wyslania, zeby ponowione
-- zdarzenia Stripe nie wysylaly maila drugi raz.
alter table public.orders add column if not exists confirmation_sent_at timestamptz;
