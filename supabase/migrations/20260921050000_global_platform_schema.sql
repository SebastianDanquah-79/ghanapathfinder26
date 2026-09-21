-- Global platform additive schema.
alter table public.profiles
  add column if not exists bio text,
  add column if not exists city text,
  add column if not exists preferred_locations text[] not null default '{}',
  add column if not exists preferred_industries text[] not null default '{}',
  add column if not exists preferred_opportunity_types text[] not null default '{}',
  add column if not exists availability text,
  add column if not exists profile_visibility text not null default 'private';

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  organization_type text not null default 'company',
  industry text,
  country_code text,
  city text,
  website_url text,
  description text,
  logo_url text,
  verification_status text not null default 'unverified',
  verification_source text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists employers_country_idx on public.employers(country_code);
create index if not exists employers_industry_idx on public.employers(industry);
create index if not exists employers_verification_idx on public.employers(verification_status);

create table if not exists public.employer_users (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(employer_id,user_id)
);
create index if not exists employer_users_user_idx on public.employer_users(user_id);

create table if not exists public.employer_verifications (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  evidence jsonb not null default '{}',
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'saved',
  notes text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,opportunity_id)
);
create index if not exists opportunity_applications_user_idx on public.opportunity_applications(user_id);
create index if not exists opportunity_applications_opportunity_idx on public.opportunity_applications(opportunity_id);

create table if not exists public.saved_candidates (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(employer_id,candidate_user_id)
);

create table if not exists public.employer_messages (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  job_matches boolean not null default true,
  internship_deadlines boolean not null default true,
  scholarship_deadlines boolean not null default true,
  startup_news boolean not null default true,
  employer_messages boolean not null default true,
  recommendations boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.employers enable row level security;
alter table public.employer_users enable row level security;
alter table public.employer_verifications enable row level security;
alter table public.opportunity_applications enable row level security;
alter table public.saved_candidates enable row level security;
alter table public.employer_messages enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "Employers public read verified" on public.employers;
create policy "Employers public read verified" on public.employers for select to anon, authenticated using (verification_status='verified');

drop policy if exists "Employer users own membership" on public.employer_users;
create policy "Employer users own membership" on public.employer_users for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists "Employer verification own submissions" on public.employer_verifications;
create policy "Employer verification own submissions" on public.employer_verifications for all to authenticated using ((select auth.uid())=submitted_by) with check ((select auth.uid())=submitted_by);

drop policy if exists "Own opportunity applications" on public.opportunity_applications;
create policy "Own opportunity applications" on public.opportunity_applications for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists "Employer manages saved candidates" on public.saved_candidates;
create policy "Employer manages saved candidates" on public.saved_candidates for all to authenticated
using (exists (select 1 from public.employer_users eu where eu.employer_id=saved_candidates.employer_id and eu.user_id=(select auth.uid())))
with check (exists (select 1 from public.employer_users eu where eu.employer_id=saved_candidates.employer_id and eu.user_id=(select auth.uid())));

drop policy if exists "Employer messages participants" on public.employer_messages;
create policy "Employer messages participants" on public.employer_messages for all to authenticated
using ((select auth.uid())=sender_user_id or (select auth.uid())=candidate_user_id)
with check ((select auth.uid())=sender_user_id);

drop policy if exists "Own notification preferences" on public.notification_preferences;
create policy "Own notification preferences" on public.notification_preferences for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
