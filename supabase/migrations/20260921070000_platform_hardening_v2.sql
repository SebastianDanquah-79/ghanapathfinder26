-- Production hardening for onboarding persistence and profile avatars.
create or replace function public.save_profile_bundle(
  p_full_name text,p_email text default null,p_school text default null,p_region text default null,p_country_code text default 'GH',
  p_target_career text default null,p_interests text[] default '{}',p_pathways text[] default '{}',p_qualification_code text default null,
  p_qualification_name text default null,p_grading_scale text default null,p_overall_score text default null,p_qualification_metadata jsonb default '{}'::jsonb,
  p_wassce_results jsonb default '[]'::jsonb,p_qualification_results jsonb default '[]'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_qid uuid; r jsonb;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 update public.profiles set full_name=nullif(trim(p_full_name),''),email=coalesce(nullif(trim(p_email),''),email),school=nullif(trim(p_school),''),
 region=nullif(trim(p_region),''),country_code=coalesce(nullif(trim(p_country_code),''),'GH'),target_career=nullif(trim(p_target_career),''),
 interests=coalesce(p_interests,'{}'),pathways=coalesce(p_pathways,'{}'),onboarded=true,updated_at=now() where id=v_user;
 if not found then insert into public.profiles(id,full_name,email,school,region,country_code,target_career,interests,pathways,onboarded)
 values(v_user,nullif(trim(p_full_name),''),nullif(trim(p_email),''),nullif(trim(p_school),''),nullif(trim(p_region),''),coalesce(nullif(trim(p_country_code),''),'GH'),
 nullif(trim(p_target_career),''),coalesce(p_interests,'{}'),coalesce(p_pathways,'{}'),true); end if;
 if p_qualification_code is not null and trim(p_qualification_code)<>'' then
   insert into public.student_qualifications(user_id,country_code,qualification_code,qualification_name,grading_scale,overall_score,metadata)
   values(v_user,coalesce(nullif(trim(p_country_code),''),'GH'),trim(p_qualification_code),coalesce(p_qualification_name,trim(p_qualification_code)),p_grading_scale,p_overall_score,coalesce(p_qualification_metadata,'{}'))
   on conflict(user_id) do update set country_code=excluded.country_code,qualification_code=excluded.qualification_code,qualification_name=excluded.qualification_name,
   grading_scale=excluded.grading_scale,overall_score=excluded.overall_score,metadata=excluded.metadata,updated_at=now() returning id into v_qid;
   delete from public.student_qualification_results where qualification_id=v_qid;
   for r in select * from jsonb_array_elements(coalesce(p_qualification_results,'[]')) loop
     if nullif(trim(r->>'subject'),'') is not null then insert into public.student_qualification_results(qualification_id,subject,grade,level)
     values(v_qid,trim(r->>'subject'),coalesce(nullif(trim(r->>'grade'),''),'Entered'),nullif(trim(r->>'level'),'')); end if;
   end loop;
 end if;
 delete from public.wassce_results where user_id=v_user;
 for r in select * from jsonb_array_elements(coalesce(p_wassce_results,'[]')) loop
   if nullif(trim(r->>'subject'),'') is not null then insert into public.wassce_results(user_id,subject,grade)
   values(v_user,trim(r->>'subject'),coalesce(nullif(trim(r->>'grade'),''),'Entered')); end if;
 end loop;
 return jsonb_build_object('saved',true,'user_id',v_user);
end; $$;
revoke all on function public.save_profile_bundle(text,text,text,text,text,text,text[],text[],text,text,text,text,jsonb,jsonb,jsonb) from public;
grant execute on function public.save_profile_bundle(text,text,text,text,text,text,text[],text[],text,text,text,text,jsonb,jsonb,jsonb) to authenticated;

insert into storage.buckets(id,name,public) values('avatars','avatars',true) on conflict(id) do update set public=true;
drop policy if exists "Avatar uploads own folder" on storage.objects;
create policy "Avatar uploads own folder" on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Avatar updates own folder" on storage.objects;
create policy "Avatar updates own folder" on storage.objects for update to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read" on storage.objects for select to public using(bucket_id='avatars');
