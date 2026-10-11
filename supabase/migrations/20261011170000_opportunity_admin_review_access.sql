-- Preserve a review lane for authorised admins/reviewers.
-- Employer writes remain restricted by opportunities_employer_only policies.
create policy opportunities_admin_select_all
  on public.opportunities for select to authenticated
  using (public.is_gpf_admin());

create policy opportunities_admin_insert
  on public.opportunities for insert to authenticated
  with check (public.is_gpf_admin());

create policy opportunities_admin_update
  on public.opportunities for update to authenticated
  using (public.is_gpf_admin())
  with check (public.is_gpf_admin());

create policy opportunities_admin_delete
  on public.opportunities for delete to authenticated
  using (public.is_gpf_admin());
