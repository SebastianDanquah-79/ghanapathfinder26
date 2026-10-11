-- Academic records are available only in the active student workspace.
-- Preserve linked-parent read access for students' deadlines and WASSCE results.
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('deadlines', 'wassce_results')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy deadlines_select_student_or_linked_parent
  on public.deadlines for select to authenticated
  using (
    (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and coalesce(p.account_role, p.role) = 'student'
      )
    )
    or (
      private.is_linked_parent((select auth.uid()), user_id)
      and exists (
        select 1 from public.profiles p
        where p.id = deadlines.user_id
          and coalesce(p.account_role, p.role) = 'student'
      )
    )
  );
create policy deadlines_insert_student_only
  on public.deadlines for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );
create policy deadlines_update_student_only
  on public.deadlines for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );
create policy deadlines_delete_student_only
  on public.deadlines for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );

create policy wassce_results_select_student_or_linked_parent
  on public.wassce_results for select to authenticated
  using (
    (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and coalesce(p.account_role, p.role) = 'student'
      )
    )
    or (
      private.is_linked_parent((select auth.uid()), user_id)
      and exists (
        select 1 from public.profiles p
        where p.id = wassce_results.user_id
          and coalesce(p.account_role, p.role) = 'student'
      )
    )
  );
create policy wassce_results_insert_student_only
  on public.wassce_results for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );
create policy wassce_results_update_student_only
  on public.wassce_results for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );
create policy wassce_results_delete_student_only
  on public.wassce_results for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and coalesce(p.account_role, p.role) = 'student'
    )
  );
