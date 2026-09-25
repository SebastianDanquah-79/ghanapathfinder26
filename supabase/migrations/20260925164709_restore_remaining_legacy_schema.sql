-- Restore additive tables and columns referenced by the existing application.
create table if not exists public.institutions (
 id uuid primary key default gen_random_uuid(), official_name text not null, institution_type text not null,
 town text, region text, website_url text, logo_source_url text, logo_verification_status text not null default 'needs_review',
 logo_verified_at timestamptz, google_place_id text, gtec_accreditation_status text, short_description text,
 social_links jsonb not null default '{}'::jsonb, source_urls text[] not null default '{}', verification_method text,
 verification_notes text, verified_by uuid, needs_review boolean not null default true, university_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), last_verified_at timestamptz
);
alter table public.institutions enable row level security;
drop policy if exists "Public can read verified institutions" on public.institutions;
create policy "Public can read verified institutions" on public.institutions for select to anon,authenticated using (needs_review=false);
drop policy if exists "Admins manage institutions" on public.institutions;
create policy "Admins manage institutions" on public.institutions for all to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'));
grant select on public.institutions to anon,authenticated;
grant all on public.institutions to authenticated;

create table if not exists public.internship_providers (
 id uuid primary key default gen_random_uuid(), name text not null, sector text, provider_type text,
 website_url text, logo_source_url text, programme_summary text, application_url text, paid boolean,
 social_links jsonb not null default '{}'::jsonb, source_urls text[] not null default '{}',
 verification_method text, verification_notes text, verified_by uuid, needs_review boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), last_verified_at timestamptz
);
alter table public.internship_providers enable row level security;
drop policy if exists "Public can read verified internship providers" on public.internship_providers;
create policy "Public can read verified internship providers" on public.internship_providers for select to anon,authenticated using (needs_review=false);
drop policy if exists "Admins manage internship providers" on public.internship_providers;
create policy "Admins manage internship providers" on public.internship_providers for all to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'));
grant select on public.internship_providers to anon,authenticated;
grant all on public.internship_providers to authenticated;

create table if not exists public.skill_providers (
 id uuid primary key default gen_random_uuid(), provider_name text not null, course_name text, skill_area text,
 format text, duration text, cost text, certification_issued_by text, application_url text,
 source_urls text[] not null default '{}', verification_method text, verification_notes text, verified_by uuid,
 needs_review boolean not null default true, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), last_verified_at timestamptz
);
alter table public.skill_providers enable row level security;
drop policy if exists "Public can read verified skill providers" on public.skill_providers;
create policy "Public can read verified skill providers" on public.skill_providers for select to anon,authenticated using (needs_review=false);
drop policy if exists "Admins manage skill providers" on public.skill_providers;
create policy "Admins manage skill providers" on public.skill_providers for all to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'));
grant select on public.skill_providers to anon,authenticated;
grant all on public.skill_providers to authenticated;

create table if not exists public.sms_sends (
 id uuid primary key default gen_random_uuid(), campaign text not null, phone text not null, user_id uuid not null,
 status text not null default 'pending', error text, created_at timestamptz not null default now()
);
alter table public.sms_sends enable row level security;
drop policy if exists "Users can read own sms sends" on public.sms_sends;
create policy "Users can read own sms sends" on public.sms_sends for select to authenticated using (user_id=(select auth.uid()));
grant select on public.sms_sends to authenticated;

alter table public.collection_items add column if not exists item_key text, add column if not exists item_type text, add column if not exists note text;
update public.collection_items set item_key=coalesce(item_key,entity_key), item_type=coalesce(item_type,entity_type) where item_key is null or item_type is null;
alter table public.insight_reports add column if not exists details text;
alter table public.logo_requests add column if not exists note text, add column if not exists organisation_name text, add column if not exists suggested_url text;
alter table public.match_preferences add column if not exists field text, add column if not exists gender text, add column if not exists level text,
 add column if not exists min_coverage text, add column if not exists need_based boolean, add column if not exists region text, add column if not exists study_abroad boolean;
alter table public.news_articles add column if not exists source_name text;
alter table public.notifications add column if not exists category text, add column if not exists link text, add column if not exists read_at timestamptz,
 add column if not exists read boolean, add column if not exists updated_at timestamptz;
alter table public.occupation_salaries add column if not exists data_source text, add column if not exists experience_level text,
 add column if not exists last_verified timestamptz, add column if not exists occupation text, add column if not exists salary_period text,
 add column if not exists salary_range text;
alter table public.programme_admission_estimates add column if not exists confidence_level text, add column if not exists estimate_high numeric,
 add column if not exists estimate_low numeric, add column if not exists evidence text, add column if not exists method text,
 add column if not exists sample_size integer;
alter table public.programme_curriculum add column if not exists note text, add column if not exists position integer,
 add column if not exists source text, add column if not exists year_label text;
alter table public.programme_field_library add column if not exists about text, add column if not exists academic_difficulty text,
 add column if not exists careers jsonb, add column if not exists job_market text, add column if not exists short_bio text, add column if not exists why_choose text;
alter table public.programme_requirements add column if not exists additional_requirement text, add column if not exists aggregate_requirement numeric,
 add column if not exists minimum_grade text, add column if not exists required_subject text, add column if not exists source_url text;
alter table public.programmes add column if not exists admission_summary text, add column if not exists department text, add column if not exists mode text,
 add column if not exists needs_review boolean, add column if not exists source_urls text[], add column if not exists verification_method text,
 add column if not exists verification_notes text, add column if not exists verified_by uuid;
alter table public.site_ratings add column if not exists updated_at timestamptz;
alter table public.usage_counters add column if not exists id uuid default gen_random_uuid();
