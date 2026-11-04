-- Restrict the mentor directory to adult mentors and record the reviewing administrator.
alter table public.mentor_applications
  add column if not exists mentor_confirmed_18_plus boolean not null default false,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create or replace function public.admin_review_mentor_application(
  p_application_id uuid,
  p_decision text
)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  application_row public.mentor_applications%rowtype;
begin
  if not private.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  if p_decision not in ('verified','rejected') then
    raise exception 'Decision must be verified or rejected.' using errcode = '22023';
  end if;

  select * into application_row
  from public.mentor_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Mentor application was not found.' using errcode = 'P0002';
  end if;

  if p_decision = 'verified' and not application_row.mentor_confirmed_18_plus then
    raise exception 'The applicant has not confirmed that they are at least 18 years old.' using errcode = '22023';
  end if;

  if p_decision = 'verified' then
    insert into public.mentor_directory (
      user_id, full_name, institution, programme, study_stage, region,
      expertise, mentorship_modes, biography, public_profile_url,
      verified_at, is_active, updated_at
    ) values (
      application_row.user_id, application_row.full_name, application_row.institution,
      application_row.programme, application_row.study_stage, application_row.region,
      application_row.expertise, application_row.mentorship_modes, application_row.biography,
      application_row.public_profile_url, now(), true, now()
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      institution = excluded.institution,
      programme = excluded.programme,
      study_stage = excluded.study_stage,
      region = excluded.region,
      expertise = excluded.expertise,
      mentorship_modes = excluded.mentorship_modes,
      biography = excluded.biography,
      public_profile_url = excluded.public_profile_url,
      verified_at = now(),
      is_active = true,
      updated_at = now();
  else
    update public.mentor_directory set is_active = false, updated_at = now()
    where user_id = application_row.user_id;
  end if;

  update public.mentor_applications
  set application_status = p_decision,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      updated_at = now()
  where id = p_application_id;
end;
$$;

revoke all on function public.admin_review_mentor_application(uuid, text) from public, anon;
grant execute on function public.admin_review_mentor_application(uuid, text) to authenticated;
