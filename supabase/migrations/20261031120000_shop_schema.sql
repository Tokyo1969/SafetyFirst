-- Schemat sklepu (produkty, zamowienia, uprawnienia do pobran, ustawienia sprzedawcy).
-- Zastosowany w projekcie rcizhcktflczrtadifwd recznie w SQL Editor (poza historia migracji), stan na 1.11.2026.
-- Ten plik to odtworzenie z bazy, zeby repo mialo pelny schemat. NIE stosowac ponownie na tym projekcie.
-- Zamowienia zapisuje i aktualizuje tylko serwer (src/server/checkout.ts, src/server/stripe-webhook.ts) kluczem
-- serwisowym; RLS pozwala klientom wylacznie na odczyt wlasnych zamowien.

create type public.area_type as enum ('bhp', 'os', 'both');
create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type public.product_status as enum ('draft', 'ready', 'published');
create type public.product_type as enum ('document', 'bundle', 'training_online', 'training_onsite');
create type public.user_role as enum ('customer', 'admin');

create sequence public.order_number_seq;

create or replace function public.next_order_number() returns text language sql as $$
  select 'SF-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  email text,
  full_name text,
  company_name text,
  nip text constraint profiles_nip_format check (nip is null or nip ~ '^[0-9]{10}$'),
  address_street text,
  address_postcode text,
  address_city text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  id boolean primary key default true check (id),
  seller_name text not null,
  seller_nip text not null,
  seller_address text not null,
  seller_sales_office text,
  seller_email text,
  seller_phone text,
  seller_bank_account text,
  vat_payer boolean not null default true,
  default_vat_rate numeric not null default 23.00,
  currency text not null default 'PLN',
  terms_version text not null default '0.1',
  max_downloads_per_item integer not null default 10,
  signed_url_ttl_seconds integer not null default 60,
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  area public.area_type not null default 'bhp',
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique constraint products_sku_format check (sku ~ '^[A-Z0-9]+(-[A-Z0-9]+)+$'),
  slug text not null unique,
  type public.product_type not null,
  category_id uuid references public.categories (id) on delete set null,
  area public.area_type not null default 'bhp',
  title text not null,
  short_description text,
  long_description text,
  price_net_cents integer not null default 0 check (price_net_cents >= 0),
  vat_rate numeric not null default 23.00,
  edition text,
  language text not null default 'pl',
  page_count integer,
  status public.product_status not null default 'draft',
  is_visible boolean not null default false,
  sort_order integer not null default 0,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_visible_requires_published check ((not is_visible) or (status = 'published'))
);

create table public.product_internal (
  product_id uuid primary key references public.products (id) on delete cascade,
  source_filename text,
  source_ref text,
  notes text
);

create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  version integer not null default 1,
  storage_path text not null,
  original_filename text,
  mime_type text not null default 'application/pdf',
  size_bytes bigint,
  sha256 text,
  is_current boolean not null default false,
  change_note text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (product_id, version)
);

create table public.product_previews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  page_number integer not null default 1,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (product_id, page_number)
);

create table public.bundle_items (
  bundle_id uuid not null references public.products (id) on delete cascade,
  item_id uuid not null references public.products (id) on delete restrict,
  sort_order integer not null default 0,
  primary key (bundle_id, item_id),
  check (bundle_id <> item_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.next_order_number(),
  user_id uuid references public.profiles (id) on delete set null,
  buyer_email text not null,
  buyer_name text,
  buyer_company text,
  buyer_nip text,
  buyer_address text,
  status public.order_status not null default 'pending',
  total_net_cents integer not null default 0,
  total_vat_cents integer not null default 0,
  total_gross_cents integer not null default 0,
  currency text not null default 'PLN',
  digital_content_consent_at timestamptz,
  terms_version text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  fakturownia_invoice_id text,
  invoice_number text,
  invoice_pdf_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  sku text not null,
  title text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_net_cents integer not null,
  vat_rate numeric not null
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  download_limit integer,
  unique (user_id, product_id)
);

create table public.download_log (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  file_id uuid references public.product_files (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  table_name text not null,
  record_id text,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_download_log_user_product on public.download_log (user_id, product_id);
create index idx_order_items_order on public.order_items (order_id);
create index idx_orders_email on public.orders (lower(buyer_email));
create index idx_orders_user on public.orders (user_id);
create index idx_products_category on public.products (category_id);
create index idx_products_shop on public.products (status, is_visible, area, type);
create unique index uq_product_files_current on public.product_files (product_id) where is_current;

-- Funkcje

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.is_admin() returns boolean language sql stable security definer
set search_path to 'public' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path to 'public' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.protect_profile_role() returns trigger language plpgsql security definer
set search_path to 'public' as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Zmiana roli jest niedozwolona';
  end if;
  return new;
end $$;

create or replace function public.enforce_publish_requirements() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.type = 'document' then
    if not exists (select 1 from public.product_files
                   where product_id = new.id and is_current) then
      raise exception 'Produkt % nie ma biezacego pliku - nie mozna opublikowac', new.sku;
    end if;
  end if;
  if new.status <> 'published' then
    new.is_visible = false;
  end if;
  return new;
end $$;

create or replace function public.single_current_file() returns trigger language plpgsql as $$
begin
  if new.is_current then
    update public.product_files set is_current = false
    where product_id = new.product_id and id <> new.id and is_current;
  end if;
  return new;
end $$;

create or replace function public.write_audit() returns trigger language plpgsql security definer
set search_path to 'public' as $$
begin
  insert into public.audit_log (actor_id, table_name, record_id, action, old_data, new_data)
  values (
    auth.uid(), tg_table_name,
    coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id')),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

-- Wyzwalacze

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger trg_app_settings_updated before update on public.app_settings
  for each row execute function public.set_updated_at();
create trigger trg_audit_product_files after insert or delete or update on public.product_files
  for each row execute function public.write_audit();
create trigger trg_audit_products after insert or delete or update on public.products
  for each row execute function public.write_audit();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create trigger trg_product_files_current before insert or update on public.product_files
  for each row execute function public.single_current_file();
create trigger trg_products_publish_check before insert or update on public.products
  for each row execute function public.enforce_publish_requirements();
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
create trigger trg_profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_internal enable row level security;
alter table public.product_files enable row level security;
alter table public.product_previews enable row level security;
alter table public.bundle_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.entitlements enable row level security;
alter table public.download_log enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_select_own on public.profiles for select using ((id = auth.uid()) or is_admin());
create policy profiles_update_own on public.profiles for update
  using ((id = auth.uid()) or is_admin()) with check ((id = auth.uid()) or is_admin());
create policy settings_read on public.app_settings for select using (true);
create policy settings_admin_write on public.app_settings for all using (is_admin()) with check (is_admin());
create policy categories_read on public.categories for select using (is_active or is_admin());
create policy categories_admin_write on public.categories for all using (is_admin()) with check (is_admin());
create policy products_public_read on public.products for select
  using (((status = 'published') and is_visible) or is_admin());
create policy products_admin_write on public.products for all using (is_admin()) with check (is_admin());
create policy product_internal_admin on public.product_internal for all using (is_admin()) with check (is_admin());
create policy product_files_admin on public.product_files for all using (is_admin()) with check (is_admin());
create policy previews_public_read on public.product_previews for select
  using (is_admin() or exists (select 1 from public.products p
    where p.id = product_previews.product_id and p.status = 'published' and p.is_visible));
create policy previews_admin_write on public.product_previews for all using (is_admin()) with check (is_admin());
create policy bundle_items_public_read on public.bundle_items for select
  using (is_admin() or exists (select 1 from public.products p
    where p.id = bundle_items.bundle_id and p.status = 'published' and p.is_visible));
create policy bundle_items_admin_write on public.bundle_items for all using (is_admin()) with check (is_admin());
create policy orders_select_own on public.orders for select using ((user_id = auth.uid()) or is_admin());
create policy order_items_select_own on public.order_items for select
  using (is_admin() or exists (select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()));
create policy entitlements_select_own on public.entitlements for select using ((user_id = auth.uid()) or is_admin());
create policy download_log_select on public.download_log for select using ((user_id = auth.uid()) or is_admin());
create policy audit_log_admin on public.audit_log for select using (is_admin());
