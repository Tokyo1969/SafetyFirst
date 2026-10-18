-- Rozmowy z asystentem AI na stronie (do analiz, decyzja Natalii z 17.10.2026).
-- Zapisujemy tylko tresc pytania i odpowiedzi oraz losowy identyfikator rozmowy, bez adresu IP.
-- Publicznosc (rola anon) moze tylko dodawac wiersze, nie moze ich czytac.
-- Retencja: wiersze starsze niz 12 miesiecy usuwamy (zadanie do dodania, np. pg_cron lub n8n).
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  user_message text not null check (char_length(user_message) <= 1000),
  assistant_reply text not null check (char_length(assistant_reply) <= 4000)
);

create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);

alter table public.chat_messages enable row level security;

create policy "anon_can_insert_chat_messages"
  on public.chat_messages
  for insert
  to anon
  with check (true);
