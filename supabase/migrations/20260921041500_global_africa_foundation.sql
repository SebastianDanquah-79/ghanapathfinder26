-- Global Africa foundation schema. Applied to production on 2026-09-21.
-- Adds only nullable/defaulted profile fields and new isolated entities. Existing tables are preserved.

alter table public.profiles
  add column if not exists country_code text,
  add column if not exists pathways text[] not null default '{}',
  add column if not exists avatar_url text,
  add column if not exists linkedin_url text,
  add column if not exists github_url text,
  add column if not exists portfolio_url text,
  add column if not exists cv_visibility text not null default 'private',
  add column if not exists discoverable_to_recruiters boolean not null default false;

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(), title text not null, opportunity_type text not null,
  company_id uuid references public.companies(id) on delete set null, country_code text, location text,
  remote boolean not null default false, employment_type text, description text, requirements text,
  skills text[] not null default '{}', application_url text, source_name text, source_url text,
  posted_at timestamptz, deadline timestamptz, last_verified_at timestamptz,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists opportunities_type_idx on public.opportunities(opportunity_type);
create index if not exists opportunities_country_idx on public.opportunities(country_code);
create index if not exists opportunities_status_idx on public.opportunities(status);

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(), name text not null, url text not null,
  category text, country_code text, active boolean not null default true,
  refresh_interval_minutes integer not null default 60, last_fetched_at timestamptz,
  last_success_at timestamptz, last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists news_sources_url_idx on public.news_sources(url);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(), source_id uuid references public.news_sources(id) on delete set null,
  title text not null, excerpt text, original_url text not null, image_url text, country_code text,
  category text, published_at timestamptz, fetched_at timestamptz not null default now(), content_hash text, created_at timestamptz not null default now()
);
create unique index if not exists news_articles_url_idx on public.news_articles(original_url);
create index if not exists news_articles_category_idx on public.news_articles(category, published_at desc);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My CV', template text not null default 'standard',
  visibility text not null default 'private', discoverable boolean not null default false,
  data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists cvs_user_id_idx on public.cvs(user_id);

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(), cv_id uuid not null references public.cvs(id) on delete cascade,
  version_name text not null, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists cv_versions_cv_id_idx on public.cv_versions(cv_id);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, category text not null,
  description text, difficulty text, prerequisites text[] not null default '{}',
  learning_resources jsonb not null default '[]'::jsonb, projects jsonb not null default '[]'::jsonb,
  related_jobs jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.skill_relationships (
  id uuid primary key default gen_random_uuid(), from_skill_id uuid not null references public.skills(id) on delete cascade,
  to_skill_id uuid not null references public.skills(id) on delete cascade, relationship_type text not null default 'next',
  rationale text, weight numeric(5,2) not null default 1, unique(from_skill_id, to_skill_id, relationship_type)
);

create table if not exists public.user_skill_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade, level text, evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, skill_id)
);

alter table public.opportunities enable row level security;
alter table public.news_sources enable row level security;
alter table public.news_articles enable row level security;
alter table public.cvs enable row level security;
alter table public.cv_versions enable row level security;
alter table public.skills enable row level security;
alter table public.skill_relationships enable row level security;
alter table public.user_skill_profiles enable row level security;

drop policy if exists "Opportunities public read" on public.opportunities;
create policy "Opportunities public read" on public.opportunities for select to anon, authenticated using (status = 'active');
drop policy if exists "News sources public read" on public.news_sources;
create policy "News sources public read" on public.news_sources for select to anon, authenticated using (active = true);
drop policy if exists "News articles public read" on public.news_articles;
create policy "News articles public read" on public.news_articles for select to anon, authenticated using (true);
drop policy if exists "Skills public read" on public.skills;
create policy "Skills public read" on public.skills for select to anon, authenticated using (true);
drop policy if exists "Skill relationships public read" on public.skill_relationships;
create policy "Skill relationships public read" on public.skill_relationships for select to anon, authenticated using (true);
drop policy if exists "Own CVs" on public.cvs;
create policy "Own CVs" on public.cvs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Own CV versions" on public.cv_versions;
create policy "Own CV versions" on public.cv_versions for all to authenticated using (exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = (select auth.uid())));
drop policy if exists "Own skill profile" on public.user_skill_profiles;
create policy "Own skill profile" on public.user_skill_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
