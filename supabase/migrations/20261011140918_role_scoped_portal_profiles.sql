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

-- Copy existing student details without deleting or overwriting unrelated pathway fields.
insert into public.student_profiles (user_id, school, region, country_code, target_career, interests, pathways)
select p.id, p.school, p.region, coalesce(nullif(p.country_code, ''), 'GH'),
       p.target_career, coalesce(p.interests, '{}'::text[]), coalesce(p.pathways, '{}'::text[])
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

-- Replace the existing owner-only policies with policies scoped to the active role.
do $$
declare
  p record;
  cfg record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('student_profiles', 'employee_profiles', 'employer_profiles', 'founder_profiles', 'international_students')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;

  for cfg in
    select * from (values
      ('student_profiles', 'student'),
      ('employee_profiles', 'employee'),
      ('employer_profiles', 'employer'),
      ('founder_profiles', 'startup_founder')
    ) as roles(table_name, role_name)
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = %L))',
      cfg.table_name || '_select_own_role', cfg.table_name, cfg.role_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = %L))',
      cfg.table_name || '_insert_own_role', cfg.table_name, cfg.role_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = %L)) with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = %L))',
      cfg.table_name || '_update_own_role', cfg.table_name, cfg.role_name, cfg.role_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = %L))',
      cfg.table_name || '_delete_own_role', cfg.table_name, cfg.role_name
    );
  end loop;
end $$;

-- Visible international-student cards remain discoverable, while private reads/writes
-- remain restricted to the account's active international-student role.
create policy international_students_select_visible_or_own_role
  on public.international_students for select to anon, authenticated
  using (
    visible = true
    or (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and coalesce(p.account_role, p.role) = 'international_student'
      )
    )
  );
create policy international_students_insert_own_role
  on public.international_students for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
  );
create policy international_students_update_own_role
  on public.international_students for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
  );
create policy international_students_delete_own_role
  on public.international_students for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.account_role, p.role) = 'international_student')
  );
