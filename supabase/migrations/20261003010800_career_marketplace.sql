alter table public.opportunities add column if not exists employer_id uuid references public.employers(id) on delete set null;
create index if not exists opportunities_employer_id_idx on public.opportunities(employer_id);
create index if not exists employer_users_user_employer_idx on public.employer_users(user_id, employer_id);
create index if not exists opportunity_applications_opportunity_idx on public.opportunity_applications(opportunity_id);
alter table public.employee_profiles add column if not exists bio text;
alter table public.employee_profiles add column if not exists skills text[] not null default '{}';
alter table public.employee_profiles add column if not exists education_level text;
alter table public.employee_profiles add column if not exists university text;
alter table public.employee_profiles add column if not exists graduation_year integer;
alter table public.employee_profiles add column if not exists location text;
alter table public.employee_profiles add column if not exists portfolio_url text;
alter table public.employee_profiles add column if not exists linkedin_url text;
alter table public.employee_profiles add column if not exists github_url text;
alter table public.employee_profiles add column if not exists cv_url text;
alter table public.employee_profiles add column if not exists discoverable boolean not null default false;
alter table public.employee_profiles add column if not exists availability text;
alter table public.employers add column if not exists created_by uuid references auth.users(id) on delete set null;
create index if not exists employers_created_by_idx on public.employers(created_by);
create table if not exists public.employer_application_reviews (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null unique references public.opportunity_applications(id) on delete cascade,
 employer_id uuid not null references public.employers(id) on delete cascade,
 candidate_user_id uuid not null references auth.users(id) on delete cascade,
 stage text not null default 'new' check (stage in ('new','reviewing','shortlisted','interview','offer','rejected','hired')),
 interview_at timestamptz,
 interview_location text,
 interviewer_notes text,
 updated_by uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists employer_application_reviews_employer_idx on public.employer_application_reviews(employer_id);
create index if not exists employer_application_reviews_candidate_idx on public.employer_application_reviews(candidate_user_id);
create index if not exists employer_application_reviews_stage_idx on public.employer_application_reviews(employer_id, stage);
alter table public.employer_application_reviews enable row level security;
revoke all on table public.employer_application_reviews from anon, authenticated;
grant select, insert, update, delete on table public.employer_application_reviews to authenticated;
drop policy if exists "Employer reads applications to its opportunities" on public.opportunity_applications;
create policy "Employers read applications to their opportunities" on public.opportunity_applications for select to authenticated using (exists (select 1 from public.opportunities o join public.employer_users eu on eu.employer_id = o.employer_id where o.id = opportunity_applications.opportunity_id and eu.user_id = (select auth.uid())));
drop policy if exists "opportunities_authenticated_insert" on public.opportunities;
drop policy if exists "opportunities_authenticated_update" on public.opportunities;
drop policy if exists "opportunities_authenticated_delete" on public.opportunities;
create policy "Opportunity owners can create employer postings" on public.opportunities for insert to authenticated with check ((select auth.uid()) = posted_by and (employer_id is null or exists (select 1 from public.employer_users eu where eu.employer_id = opportunities.employer_id and eu.user_id = (select auth.uid()))));
create policy "Opportunity owners can update postings" on public.opportunities for update to authenticated using ((select auth.uid()) = posted_by and (employer_id is null or exists (select 1 from public.employer_users eu where eu.employer_id = opportunities.employer_id and eu.user_id = (select auth.uid())))) with check ((select auth.uid()) = posted_by and (employer_id is null or exists (select 1 from public.employer_users eu where eu.employer_id = opportunities.employer_id and eu.user_id = (select auth.uid()))));
create policy "Opportunity owners can delete postings" on public.opportunities for delete to authenticated using ((select auth.uid()) = posted_by and (employer_id is null or exists (select 1 from public.employer_users eu where eu.employer_id = opportunities.employer_id and eu.user_id = (select auth.uid()))));
drop policy if exists "Employers public read verified" on public.employers;
create policy "Employers public read verified" on public.employers for select to anon, authenticated using (verification_status = 'verified' or created_by = (select auth.uid()));
create policy "Users can create employer records" on public.employers for insert to authenticated with check (created_by = (select auth.uid()) and verification_status = 'pending');
create policy "Employer owners can update company" on public.employers for update to authenticated using (created_by = (select auth.uid()) or exists (select 1 from public.employer_users eu where eu.employer_id = employers.id and eu.user_id = (select auth.uid()))) with check (created_by = (select auth.uid()) or exists (select 1 from public.employer_users eu where eu.employer_id = employers.id and eu.user_id = (select auth.uid())));
create policy "Employer owners can delete company" on public.employers for delete to authenticated using (created_by = (select auth.uid()));
drop policy if exists "Employer users manage own membership" on public.employer_users;
drop policy if exists "Employer users read own employer members" on public.employer_users;
create policy "Employer members read their memberships" on public.employer_users for select to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.employer_users eu where eu.employer_id = employer_users.employer_id and eu.user_id = (select auth.uid())));
create policy "Employer owners add memberships" on public.employer_users for insert to authenticated with check (exists (select 1 from public.employers e where e.id = employer_users.employer_id and e.created_by = (select auth.uid())) or (user_id = (select auth.uid()) and exists (select 1 from public.employer_users eu where eu.employer_id = employer_users.employer_id and eu.user_id = (select auth.uid()))));
create policy "Employer members update own membership" on public.employer_users for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Employer owners remove memberships" on public.employer_users for delete to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.employers e where e.id = employer_users.employer_id and e.created_by = (select auth.uid())));
create policy "Employers read application workflow" on public.employer_application_reviews for select to authenticated using (candidate_user_id = (select auth.uid()) or exists (select 1 from public.employer_users eu where eu.employer_id = employer_application_reviews.employer_id and eu.user_id = (select auth.uid())));
create policy "Employers create application workflow" on public.employer_application_reviews for insert to authenticated with check (updated_by = (select auth.uid()) and exists (select 1 from public.employer_users eu where eu.employer_id = employer_application_reviews.employer_id and eu.user_id = (select auth.uid())));
create policy "Employers update application workflow" on public.employer_application_reviews for update to authenticated using (exists (select 1 from public.employer_users eu where eu.employer_id = employer_application_reviews.employer_id and eu.user_id = (select auth.uid()))) with check (updated_by = (select auth.uid()) and exists (select 1 from public.employer_users eu where eu.employer_id = employer_application_reviews.employer_id and eu.user_id = (select auth.uid())));
create policy "Employers delete application workflow" on public.employer_application_reviews for delete to authenticated using (exists (select 1 from public.employer_users eu where eu.employer_id = employer_application_reviews.employer_id and eu.user_id = (select auth.uid())));