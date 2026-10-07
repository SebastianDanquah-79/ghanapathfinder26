-- Phase 1: verification infrastructure
-- Additive migration. Do not apply to production until reviewed and tested.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  publisher text,
  retrieved_at timestamptz not null default now(),
  content_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.entity_aliases (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  alias text not null,
  alias_type text,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, alias)
);

create table if not exists public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  status text not null default 'started',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  progress jsonb not null default '{}'::jsonb,
  notes text
);

create table if not exists public.verification_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  field_name text not null,
  old_value jsonb,
  new_value jsonb,
  source_id uuid references public.sources(id),
  run_id uuid references public.verification_runs(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.data_change_proposals (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  field_name text not null,
  old_value jsonb,
  proposed_value jsonb,
  source_id uuid references public.sources(id),
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

-- Canonical verification metadata. Existing legacy fields/values are preserved.
alter table public.institutions
  add column if not exists verification_status text,
  add column if not exists verified_at timestamptz,
  add column if not exists primary_source_url text,
  add column if not exists source_tier text,
  add column if not exists last_checked_at timestamptz,
  add column if not exists notes text;

alter table public.universities
  add column if not exists verified_at timestamptz,
  add column if not exists primary_source_url text,
  add column if not exists source_tier text,
  add column if not exists notes text;

alter table public.programmes
  add column if not exists verified_at timestamptz,
  add column if not exists primary_source_url text,
  add column if not exists source_tier text,
  add column if not exists notes text;

alter table public.skills
  add column if not exists verification_status text,
  add column if not exists verified_at timestamptz,
  add column if not exists primary_source_url text,
  add column if not exists source_tier text,
  add column if not exists last_checked_at timestamptz,
  add column if not exists notes text;

alter table public.companies
  add column if not exists verification_status text,
  add column if not exists verified_at timestamptz,
  add column if not exists primary_source_url text,
  add column if not exists source_tier text,
  add column if not exists notes text;

-- The existing institutions/universities/programmes fields use legacy status
-- vocabularies. They are intentionally not rewritten in this migration.
-- Backfilling canonical values requires a verification run and audit log.

alter table public.sources enable row level security;
alter table public.entity_aliases enable row level security;
alter table public.verification_runs enable row level security;
alter table public.verification_log enable row level security;
alter table public.data_change_proposals enable row level security;

-- Public readers need source/alias visibility for verification UI.
create policy "Sources are publicly readable"
  on public.sources for select
  to anon, authenticated
  using (true);

create policy "Entity aliases are publicly readable"
  on public.entity_aliases for select
  to anon, authenticated
  using (true);

-- Administrators use the existing private.has_role(..., 'admin') authorization.
create policy "Admins manage sources"
  on public.sources for all
  to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));

create policy "Admins manage entity aliases"
  on public.entity_aliases for all
  to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));

create policy "Admins manage verification runs"
  on public.verification_runs for all
  to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));

create policy "Admins manage verification log"
  on public.verification_log for all
  to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can report data changes"
  on public.data_change_proposals for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Users can read their own data change proposals"
  on public.data_change_proposals for select
  to authenticated
  using (auth.uid() = reviewed_by);

create policy "Admins manage data change proposals"
  on public.data_change_proposals for all
  to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));
