-- Retencja z polityki prywatnosci (pkt 2): zapytania z formularza 12 miesiecy, dziennik pobran 3 lata.
-- Codziennie o 3:30 (UTC) przez pg_cron. Rozmowy z asystentem (12 miesiecy) czysci workflow n8n.
create extension if not exists pg_cron;

create or replace function public.cleanup_retention() returns void
language sql security definer set search_path to 'public' as $$
  delete from public.consultation_requests where created_at < now() - interval '12 months';
  delete from public.download_log where created_at < now() - interval '3 years';
$$;

revoke execute on function public.cleanup_retention() from public, anon, authenticated;

select cron.schedule('safetyfirst-retencja', '30 3 * * *', 'select public.cleanup_retention()');
