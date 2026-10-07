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

alter table public.sources enable row level security;
alter table public.entity_aliases enable row level security;
alter table public.verification_runs enable row level security;
alter table public.verification_log enable row level security;
alter table public.data_change_proposals enable row level security;

-- Authorization policies will be added only after the existing admin
-- authorization model is verified. This avoids inventing an access-control
-- mechanism.
