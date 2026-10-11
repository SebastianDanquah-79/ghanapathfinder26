-- Employers may create and manage only their own opportunity submissions.
-- Public discovery remains governed by the existing active-status SELECT policies.
do $$
declare
  p record;
begin
  for p in
    select policyname, cmd
    from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunities'
      and cmd in ('INSERT','UPDATE','DELETE')
  loop
    execute format('drop policy if exists %I on public.opportunities', p.policyname);
  end loop;
end $$;

create policy opportunities_insert_employer_only
  on public.opportunities for insert to authenticated
  with check (
    posted_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'employer'
    )
    and (
      employer_id is null
      or exists (
        select 1 from public.employer_users eu
        where eu.employer_id = opportunities.employer_id
          and eu.user_id = (select auth.uid())
      )
    )
  );

create policy opportunities_update_employer_only
  on public.opportunities for update to authenticated
  using (
    posted_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'employer'
    )
    and (
      employer_id is null
      or exists (
        select 1 from public.employer_users eu
        where eu.employer_id = opportunities.employer_id
          and eu.user_id = (select auth.uid())
      )
    )
  )
  with check (
    posted_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'employer'
    )
    and (
      employer_id is null
      or exists (
        select 1 from public.employer_users eu
        where eu.employer_id = opportunities.employer_id
          and eu.user_id = (select auth.uid())
      )
    )
  );

create policy opportunities_delete_employer_only
  on public.opportunities for delete to authenticated
  using (
    posted_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'employer'
    )
    and (
      employer_id is null
      or exists (
        select 1 from public.employer_users eu
        where eu.employer_id = opportunities.employer_id
          and eu.user_id = (select auth.uid())
      )
    )
  );

-- Let an employer view their own pending-review submissions without exposing
-- pending listings to other users.
create policy opportunities_select_own_employer_submissions
  on public.opportunities for select to authenticated
  using (
    posted_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'employer'
    )
  );
