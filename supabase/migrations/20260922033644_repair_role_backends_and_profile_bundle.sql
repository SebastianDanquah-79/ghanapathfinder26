-- Repair role-specific profile persistence and the student, employee, employer and founder backend paths.
create table if not exists public.founder_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  startup_name text,
  sector text,
  stage text,
  website_url text,
  pitch_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.founder_profiles enable row level security;
drop policy if exists "founders manage own profile" on public.founder_profiles;
create policy "founders manage own profile" on public.founder_profiles
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on table public.founder_profiles to authenticated;

-- Keep the existing profile-bundle API compatible while persisting the founder role.
create or replace function public.save_profile_bundle(
  p_full_name text, p_email text default null, p_school text default null,
  p_region text default null, p_country_code text default 'GH',
  p_target_career text default null, p_interests text[] default '{}',
  p_pathways text[] default '{}', p_qualification_code text default null,
  p_qualification_name text default null, p_grading_scale text default null,
  p_overall_score text default null, p_qualification_metadata jsonb default '{}',
  p_wassce_results jsonb default '[]', p_qualification_results jsonb default '[]',
  p_account_role text default 'student', p_whatsapp_number text default null,
  p_linkedin_url text default null
) returns jsonb
language plpgsql set search_path to public
as $function$
declare
  v_user uuid := auth.uid();
  v_qid uuid;
  r jsonb;
  v_role text := case when p_account_role in ('student','employer','employee','startup_founder') then p_account_role else 'student' end;
  v_linkedin text := nullif(trim(p_linkedin_url),'');
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_linkedin is not null and v_linkedin !~ '^https://(www\\.)?linkedin\\.com/in/[A-Za-z0-9._-]+/?$' then raise exception 'Invalid LinkedIn profile URL'; end if;

  insert into public.profiles (id,full_name,email,school,region,country_code,target_career,interests,pathways,account_role,linkedin_url,onboarded,updated_at)
  values (v_user,nullif(trim(p_full_name),''),nullif(trim(p_email),''),nullif(trim(p_school),''),nullif(trim(p_region),''),coalesce(nullif(trim(p_country_code),''),'GH'),nullif(trim(p_target_career),''),coalesce(p_interests,'{}'),coalesce(p_pathways,'{}'),v_role,v_linkedin,true,now())
  on conflict (id) do update set
    full_name=excluded.full_name,email=coalesce(excluded.email,profiles.email),school=excluded.school,region=excluded.region,
    country_code=excluded.country_code,target_career=excluded.target_career,interests=excluded.interests,pathways=excluded.pathways,
    account_role=excluded.account_role,linkedin_url=excluded.linkedin_url,onboarded=true,updated_at=now();

  if v_role='student' then
    insert into public.student_profiles(user_id,intended_country) values(v_user,coalesce(nullif(trim(p_country_code),''),'GH'))
    on conflict(user_id) do update set intended_country=excluded.intended_country,updated_at=now();
  elsif v_role='employee' then
    insert into public.employee_profiles(user_id,professional_title) values(v_user,nullif(trim(p_target_career),''))
    on conflict(user_id) do update set professional_title=excluded.professional_title,updated_at=now();
  elsif v_role='employer' then
    insert into public.employer_profiles(user_id,organization_name) values(v_user,nullif(trim(p_school),''))
    on conflict(user_id) do update set organization_name=excluded.organization_name,updated_at=now();
  elsif v_role='startup_founder' then
    insert into public.founder_profiles(user_id,startup_name,sector) values(v_user,nullif(trim(p_school),''),nullif(trim(p_target_career),''))
    on conflict(user_id) do update set startup_name=excluded.startup_name,sector=excluded.sector,updated_at=now();
  end if;

  if p_qualification_code is not null and trim(p_qualification_code)<>'' then
    insert into public.student_qualifications(user_id,country_code,qualification_code,qualification_name,grading_scale,overall_score,metadata)
    values(v_user,coalesce(nullif(trim(p_country_code),''),'GH'),trim(p_qualification_code),coalesce(p_qualification_name,trim(p_qualification_code)),p_grading_scale,p_overall_score,coalesce(p_qualification_metadata,'{}'))
    on conflict(user_id) do update set country_code=excluded.country_code,qualification_code=excluded.qualification_code,qualification_name=excluded.qualification_name,grading_scale=excluded.grading_scale,overall_score=excluded.overall_score,metadata=excluded.metadata,updated_at=now()
    returning id into v_qid;
    delete from public.student_qualification_results where qualification_id=v_qid;
    for r in select * from jsonb_array_elements(coalesce(p_qualification_results,'[]')) loop
      if nullif(trim(r->>'subject'),'') is not null then
        insert into public.student_qualification_results(qualification_id,subject,grade,level)
        values(v_qid,trim(r->>'subject'),coalesce(nullif(trim(r->>'grade'),''),'Entered'),nullif(trim(r->>'level'),''));
      end if;
    end loop;
  end if;

  delete from public.wassce_results where user_id=v_user;
  for r in select * from jsonb_array_elements(coalesce(p_wassce_results,'[]')) loop
    if nullif(trim(r->>'subject'),'') is not null then
      insert into public.wassce_results(user_id,subject,grade)
      values(v_user,trim(r->>'subject'),coalesce(nullif(trim(r->>'grade'),''),'Entered'));
    end if;
  end loop;

  return jsonb_build_object('saved',true,'user_id',v_user,'account_role',v_role);
end;
$function$;