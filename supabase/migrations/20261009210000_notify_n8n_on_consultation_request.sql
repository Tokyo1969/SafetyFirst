-- Po kazdym nowym zgloszeniu wysylamy je do n8n (workflow wysyla mail na biuro@).
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_n8n_consultation_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://n8n.nexxsite.pl/webhook/safetyfirst-zgloszenie-3c8f24f9b41d46256967ebc60f3b6aae',
    body := jsonb_build_object('type', 'INSERT', 'table', 'consultation_requests', 'record', to_jsonb(new)),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.notify_n8n_consultation_request() from public, anon, authenticated;

create trigger consultation_request_notify
  after insert on public.consultation_requests
  for each row execute function public.notify_n8n_consultation_request();
