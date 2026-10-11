-- Extend the existing student-specific backend without removing its pathway fields.
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  education_stage text,
  intended_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles
  add column if not exists school text,
  add column if not exists region text,
  add column if not exists country_code text not null default 'GH',
  add column if not exists target_career text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists pathways text[] not null default '{}';

alter table public.student_profiles enable row level security;
grant select, insert, update, delete on table public.student_profiles to authenticated;

-- Preserve existing student details when backfilling the student-specific backend.
insert into public.student_profiles (user_id, school, region, country_code, target_career, interests, pathways)
select
  p.id,
  p.school,
  p.region,
  coalesce(nullif(p.country_code, ''), 'GH'),
  p.target_career,
  coalesce(p.interests, '{}'::text[]),
  coalesce(p.pathways, '{}'::text[])
from public.profiles p
where coalesce(p.account_role, p.role) = 'student'
on conflict (user_id) do update set
  school = coalesce(excluded.school, public.student_profiles.school),
  region = coalesce(excluded.region, public.student_profiles.region),
  country_code = coalesce(excluded.country_code, public.student_profiles.country_code),
  target_career = coalesce(excluded.target_career, public.student_profiles.target_career),
  interests = coalesce(excluded.interests, public.student_profiles.interests),
  pathways = coalesce(excluded.pathways, public.student_profiles.pathways),
  updated_at = now();

-- Role-specific profile tables must belong to the account's active role.
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('student_profiles', 'employee_profiles', 'employer_profiles', 'founder_profiles', 'international_students')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy student_profiles_select_own_role
  on public.student_profiles for select to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'student')
  );
create policy student_profiles_insert_own_role
  on public.student_profiles for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'student')
  );
create policy student_profiles_update_own_role
  on public.student_profiles for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'student')
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'student')
  );
create policy student_profiles_delete_own_role
  on public.student_profiles for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'student')
  );

create policy employee_profiles_select_own_role
  on public.employee_profiles for select to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employee');
create policy employee_profiles_insert_own_role
  on public.employee_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employee');
create policy employee_profiles_update_own_role
  on public.employee_profiles for update to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employee')
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employee');
create policy employee_profiles_delete_own_role
  on public.employee_profiles for delete to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employee');

create policy employer_profiles_select_own_role
  on public.employer_profiles for select to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employer');
create policy employer_profiles_insert_own_role
  on public.employer_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employer');
create policy employer_profiles_update_own_role
  on public.employer_profiles for update to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employer')
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employer');
create policy employer_profiles_delete_own_role
  on public.employer_profiles for delete to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'employer');

create policy founder_profiles_select_own_role
  on public.founder_profiles for select to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'startup_founder');
create policy founder_profiles_insert_own_role
  on public.founder_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'startup_founder');
create policy founder_profiles_update_own_role
  on public.founder_profiles for update to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'startup_founder')
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'startup_founder');
create policy founder_profiles_delete_own_role
  on public.founder_profiles for delete to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'startup_founder');

-- Visible international-student cards remain discoverable; private writes/reads
-- are restricted to the active international-student account.
create policy international_students_select_visible_or_own_role
  on public.international_students for select to anon, authenticated
  using (
    visible = true
    or (
      user_id = (select auth.uid())
      and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
    )
  );
create policy international_students_insert_own_role
  on public.international_students for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student');
create policy international_students_update_own_role
  on public.international_students for update to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student');
create policy international_students_delete_own_role
  on public.international_students for delete to authenticated
  using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student');
