-- Zgloszenia z formularza bezplatnej konsultacji.
-- Publicznosc (rola anon) moze tylko dodawac wiersze, nie moze ich czytac.
create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  phone text,
  industry text,
  employees text,
  positions text,
  location text,
  services text[] not null default '{}',
  message text,
  consent boolean not null check (consent),
  status text not null default 'nowe'
);

alter table public.consultation_requests enable row level security;

create policy "anon_can_insert_consultation_requests"
  on public.consultation_requests
  for insert
  to anon
  with check (true);
