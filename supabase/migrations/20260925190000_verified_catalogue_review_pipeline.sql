-- GhanaPathFinder verified catalogue and review pipeline
-- Additive only. Data seeding is performed against the production Supabase project
-- from verified regulator and official institutional sources.

alter table public.institutions
  add column if not exists gtec_accreditation_status text,
  add column if not exists source_urls text[] not null default '{}',
  add column if not exists verification_method text,
  add column if not exists verification_notes text,
  add column if not exists needs_review boolean not null default true,
  add column if not exists last_verified_at timestamptz,
  add column if not exists logo_source_url text,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.programmes
  add column if not exists institution_id uuid references public.institutions(id) on delete set null,
  add column if not exists needs_review boolean not null default true,
  add column if not exists last_verified_at timestamptz,
  add column if not exists source_url text,
  add column if not exists verification_status text default 'unverified';

create table if not exists public.internship_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  provider_type text,
  website_url text,
  logo_source_url text,
  social_links jsonb not null default '{}'::jsonb,
  programme_summary text,
  application_url text,
  paid boolean,
  source_urls text[] not null default '{}',
  last_verified_at timestamptz,
  needs_review boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_providers (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  course_name text,
  skill_area text,
  format text,
  duration text,
  cost text,
  certification_issued_by text,
  application_url text,
  source_urls text[] not null default '{}',
  last_verified_at timestamptz,
  needs_review boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  table_name text,
  row_id uuid,
  row_label text,
  note text not null,
  submitted_at timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create table if not exists public.admin_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.review_audit (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reviewer_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists institutions_needs_review_idx on public.institutions(needs_review, institution_type, official_name);
create index if not exists programmes_institution_id_idx on public.programmes(institution_id);
create index if not exists programmes_needs_review_idx on public.programmes(needs_review, name);
create index if not exists internship_providers_needs_review_idx on public.internship_providers(needs_review, name);
create index if not exists skill_providers_needs_review_idx on public.skill_providers(needs_review, provider_name);
create index if not exists corrections_open_idx on public.corrections(resolved, submitted_at desc);

alter table public.internship_providers enable row level security;
alter table public.skill_providers enable row level security;
alter table public.corrections enable row level security;
alter table public.admin_reviewers enable row level security;
alter table public.review_audit enable row level security;
