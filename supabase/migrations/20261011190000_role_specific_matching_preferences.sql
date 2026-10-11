-- Keep startup profile information and job-search preferences in their own role tables.
alter table public.founder_profiles
  add column if not exists description text,
  add column if not exists problem_statement text,
  add column if not exists solution_summary text,
  add column if not exists target_market text,
  add column if not exists business_model text,
  add column if not exists team_size integer,
  add column if not exists founded_year integer,
  add column if not exists funding_stage text,
  add column if not exists funding_needed numeric,
  add column if not exists funding_currency text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists interests text[] not null default '{}';

alter table public.employee_profiles
  add column if not exists interests text[] not null default '{}',
  add column if not exists preferred_locations text[] not null default '{}',
  add column if not exists preferred_industries text[] not null default '{}',
  add column if not exists preferred_opportunity_types text[] not null default '{}';
