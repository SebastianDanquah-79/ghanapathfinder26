-- Atomic onboarding persistence endpoint.
create or replace function public.save_profile_bundle(
  p_full_name text,p_email text,p_school text,p_region text,p_country_code text,p_target_career text,
  p_interests text[],p_pathways text[],p_qualification_code text,p_qualification_name text,p_grading_scale text,
  p_overall_score text,p_qualification_metadata jsonb,p_wassce_results jsonb,p_qualification_results jsonb
) returns jsonb language plpgsql security invoker set search_path=public
as $$
declare v_uid uuid:=auth.uid(); v_qualification_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  insert into public.profiles(id,email,full_name,school,region,country_code,target_career,interests,pathways,onboarded)
  values(v_uid,p_email,p_full_name,p_school,p_region,p_country_code,p_target_career,coalesce(p_interests,'{}'),coalesce(p_pathways,'{}'),true)
  on conflict(id) do update set email=excluded.email,full_name=excluded.full_name,school=excluded.school,region=excluded.region,country_code=excluded.country_code,target_career=excluded.target_career,interests=excluded.interests,pathways=excluded.pathways,onboarded=true,updated_at=now();

  delete from public.wassce_results where user_id=v_uid;
  insert into public.wassce_results(user_id,subject,grade)
  select v_uid,x->>'subject',x->>'grade'
  from jsonb_array_elements(case when jsonb_typeof(coalesce(p_wassce_results,'[]'::jsonb))='array' then p_wassce_results else '[]'::jsonb end) x
  where nullif(trim(x->>'subject'),'') is not null and nullif(x->>'grade','') is not null;

  insert into public.student_qualifications(user_id,country_code,qualification_code,qualification_name,grading_scale,overall_score,metadata)
  values(v_uid,coalesce(p_country_code,'GH'),p_qualification_code,p_qualification_name,p_grading_scale,nullif(p_overall_score,''),coalesce(p_qualification_metadata,'{}'::jsonb))
  on conflict(user_id) do update set country_code=excluded.country_code,qualification_code=excluded.qualification_code,qualification_name=excluded.qualification_name,grading_scale=excluded.grading_scale,overall_score=excluded.overall_score,metadata=excluded.metadata,updated_at=now()
  returning id into v_qualification_id;

  delete from public.student_qualification_results sqr where sqr.qualification_id=v_qualification_id;
  insert into public.student_qualification_results(qualification_id,subject,grade,level)
  select v_qualification_id,x->>'subject',coalesce(nullif(x->>'grade',''),'Entered'),nullif(x->>'level','')
  from jsonb_array_elements(case when jsonb_typeof(coalesce(p_qualification_results,'[]'::jsonb))='array' then p_qualification_results else '[]'::jsonb end) x
  where nullif(trim(x->>'subject'),'') is not null;

  return jsonb_build_object('saved',true,'user_id',v_uid,'qualification_id',v_qualification_id);
end; $$;

revoke all on function public.save_profile_bundle(text,text,text,text,text,text,text[],text[],text,text,text,text,jsonb,jsonb,jsonb) from public;
grant execute on function public.save_profile_bundle(text,text,text,text,text,text,text[],text[],text,text,text,text,jsonb,jsonb,jsonb) to authenticated;
