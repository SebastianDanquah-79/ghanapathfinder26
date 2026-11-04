-- Growth OS, private student milestones and verified mentor matching.
create table if not exists public.student_growth_journey (
  user_id uuid primary key references auth.users(id) on delete cascade,
  education_stage text not null default 'secondary_school'
    check (education_stage in ('secondary_school','tertiary_year_1','tertiary_year_2','tertiary_year_3','tertiary_year_4','tertiary_year_5_plus','graduate','national_service','employed')),
  institution text,
  programme text,
  graduation_year integer check (graduation_year is null or graduation_year between 2000 and 2100),
  target_career text,
  preferred_sectors text[] not null default '{}',
  preferred_region text,
  nss_status text not null default 'not_applicable'
    check (nss_status in ('not_applicable','not_started','preparing','seeking_placement','posted','completed')),
  nss_organisation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.student_growth_journey enable row level security;
create policy growth_journey_select_own on public.student_growth_journey
  for select to authenticated using ((select auth.uid()) = user_id);
create policy growth_journey_insert_own on public.student_growth_journey
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy growth_journey_update_own on public.student_growth_journey
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy growth_journey_delete_own on public.student_growth_journey
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.student_growth_journey to authenticated;
grant all on public.student_growth_journey to service_role;

create table if not exists public.student_growth_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  category text not null default 'career' check (category in ('study','skills','experience','nss','career')),
  is_complete boolean not null default false,
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists student_growth_milestones_user_order_idx
  on public.student_growth_milestones(user_id, sort_order, created_at);
alter table public.student_growth_milestones enable row level security;
create policy growth_milestones_select_own on public.student_growth_milestones
  for select to authenticated using ((select auth.uid()) = user_id);
create policy growth_milestones_insert_own on public.student_growth_milestones
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy growth_milestones_update_own on public.student_growth_milestones
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy growth_milestones_delete_own on public.student_growth_milestones
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.student_growth_milestones to authenticated;
grant all on public.student_growth_milestones to service_role;

create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  institution text not null,
  programme text,
  study_stage text not null,
  region text,
  expertise text[] not null default '{}',
  mentorship_modes text[] not null default '{online}',
  biography text not null,
  public_profile_url text,
  application_status text not null default 'pending'
    check (application_status in ('pending','verified','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mentor_applications enable row level security;
create policy mentor_applications_select_owner_or_admin on public.mentor_applications
  for select to authenticated using (
    (select auth.uid()) = user_id
    or (select private.has_role((select auth.uid()), 'admin'::app_role))
  );
create policy mentor_applications_insert_pending on public.mentor_applications
  for insert to authenticated with check (
    (select auth.uid()) = user_id and application_status = 'pending'
  );
create policy mentor_applications_update_pending on public.mentor_applications
  for update to authenticated using (
    (select auth.uid()) = user_id and application_status = 'pending'
  ) with check (
    (select auth.uid()) = user_id and application_status = 'pending'
  );
create policy mentor_applications_admin_all on public.mentor_applications
  for all to authenticated using (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  ) with check (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  );
grant select, insert, update on public.mentor_applications to authenticated;
grant all on public.mentor_applications to service_role;

create table if not exists public.mentor_directory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  institution text not null,
  programme text,
  study_stage text not null,
  region text,
  expertise text[] not null default '{}',
  mentorship_modes text[] not null default '{online}',
  biography text not null,
  public_profile_url text,
  verified_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mentor_directory_verified_idx
  on public.mentor_directory(region, verified_at desc) where is_active = true;
alter table public.mentor_directory enable row level security;
create policy mentor_directory_verified_read on public.mentor_directory
  for select to authenticated using (is_active = true and verified_at is not null);
create policy mentor_directory_admin_all on public.mentor_directory
  for all to authenticated using (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  ) with check (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  );
grant select, insert, update, delete on public.mentor_directory to authenticated;
grant all on public.mentor_directory to service_role;

create table if not exists public.mentor_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  mentor_id uuid not null references public.mentor_directory(user_id) on delete cascade,
  topic text not null check (char_length(trim(topic)) between 3 and 160),
  message text not null check (char_length(trim(message)) between 10 and 1200),
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentor_requests_one_active unique (student_id, mentor_id)
);
create index if not exists mentor_requests_mentor_status_idx
  on public.mentor_requests(mentor_id, status, created_at desc);
create index if not exists mentor_requests_student_idx
  on public.mentor_requests(student_id, created_at desc);
alter table public.mentor_requests enable row level security;
create policy mentor_requests_participant_read on public.mentor_requests
  for select to authenticated using (
    student_id = (select auth.uid()) or mentor_id = (select auth.uid())
    or (select private.has_role((select auth.uid()), 'admin'::app_role))
  );
create policy mentor_requests_verified_mentor_insert on public.mentor_requests
  for insert to authenticated with check (
    student_id = (select auth.uid())
    and student_id <> mentor_id
    and status = 'pending'
    and exists (
      select 1 from public.mentor_directory d
      where d.user_id = mentor_id and d.is_active = true and d.verified_at is not null
    )
  );
create policy mentor_requests_mentor_update on public.mentor_requests
  for update to authenticated using (
    mentor_id = (select auth.uid()) and status = 'pending'
  ) with check (
    mentor_id = (select auth.uid()) and status in ('accepted','declined')
  );
create policy mentor_requests_admin_all on public.mentor_requests
  for all to authenticated using (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  ) with check (
    (select private.has_role((select auth.uid()), 'admin'::app_role))
  );
grant select, insert on public.mentor_requests to authenticated;
grant update(status) on public.mentor_requests to authenticated;
grant all on public.mentor_requests to service_role;
