-- Restore additive application fields and compatibility RPCs without deleting existing data.
alter table public.scholarships
  add column if not exists academic_requirements text,
  add column if not exists coverage text,
  add column if not exists deadline_date date,
  add column if not exists deadline_text text,
  add column if not exists funding_type text,
  add column if not exists how_to_apply text,
  add column if not exists last_verified_at timestamptz,
  add column if not exists location text,
  add column if not exists name text,
  add column if not exists nationality_requirement text,
  add column if not exists slug text,
  add column if not exists study_level text,
  add column if not exists website_url text;
update public.scholarships set name=coalesce(name,title), deadline_date=coalesce(deadline_date,deadline), website_url=coalesce(website_url,source_url) where name is null or deadline_date is null or website_url is null;

alter table public.student_insights
  add column if not exists advice text, add column if not exists category text, add column if not exists programme text,
  add column if not exists rating smallint, add column if not exists student_status text,
  add column if not exists wish_i_knew text, add column if not exists year_of_study text;

alter table public.universities
  add column if not exists google_place_id text, add column if not exists gtec_accreditation_status text,
  add column if not exists institution_type text, add column if not exists logo_source_url text,
  add column if not exists logo_verification_status text, add column if not exists logo_verified_at timestamptz,
  add column if not exists needs_review boolean, add column if not exists short_description text,
  add column if not exists social_links jsonb, add column if not exists source_urls text[];
update public.universities set
  gtec_accreditation_status=coalesce(gtec_accreditation_status,accreditation_status),
  institution_type=coalesce(institution_type,type), logo_source_url=coalesce(logo_source_url,logo_url),
  logo_verification_status=coalesce(logo_verification_status,verification_status),
  needs_review=coalesce(needs_review,verification_status <> 'verified'),
  short_description=coalesce(short_description,description),
  social_links=coalesce(social_links,'{}'::jsonb),
  source_urls=coalesce(source_urls,case when source_url is null then '{}'::text[] else array[source_url] end)
where gtec_accreditation_status is null or institution_type is null or logo_source_url is null or logo_verification_status is null
or needs_review is null or short_description is null or social_links is null or source_urls is null;

alter table public.programme_careers
  add column if not exists description text, add column if not exists last_verified timestamptz,
  add column if not exists licence_note text, add column if not exists occupation text,
  add column if not exists salary_data_source text, add column if not exists salary_experience_level text,
  add column if not exists salary_period text, add column if not exists salary_range text;
update public.programme_careers set occupation=coalesce(occupation,career) where occupation is null;

alter table public.programme_information
  add column if not exists academic_difficulty text, add column if not exists content_scope text,
  add column if not exists job_market text, add column if not exists last_updated timestamptz,
  add column if not exists short_bio text, add column if not exists source text;
update public.programme_information set content_scope=coalesce(content_scope,'programme'),
job_market=coalesce(job_market,job_market_outlook), last_updated=coalesce(last_updated,updated_at),
short_bio=coalesce(short_bio,description)
where content_scope is null or job_market is null or last_updated is null or short_bio is null;

alter table public.programme_cutoffs
  add column if not exists academic_year text, add column if not exists admission_notes text,
  add column if not exists applicant_category text, add column if not exists cut_off_aggregate numeric,
  add column if not exists last_verified_at timestamptz, add column if not exists minimum_grades jsonb,
  add column if not exists official_source_url text, add column if not exists programme_name text,
  add column if not exists source_name text, add column if not exists source_type text,
  add column if not exists subject_requirements text, add column if not exists verification_status text;
update public.programme_cutoffs pc set academic_year=coalesce(pc.academic_year,pc.year::text),
cut_off_aggregate=coalesce(pc.cut_off_aggregate,pc.cutoff), official_source_url=coalesce(pc.official_source_url,pc.source_url),
programme_name=coalesce(pc.programme_name,p.name), applicant_category=coalesce(pc.applicant_category,'general'),
source_type=coalesce(pc.source_type,'official'), verification_status=coalesce(pc.verification_status,'needs_review'),
minimum_grades=coalesce(pc.minimum_grades,'{}'::jsonb)
from public.programmes p where p.id=pc.programme_id;

alter table public.programme_sources
  add column if not exists source_type text, add column if not exists verification_status text, add column if not exists verified_at timestamptz;
update public.programme_sources set source_type=coalesce(source_type,'official_institution'),
verification_status=coalesce(verification_status,'needs_review') where source_type is null or verification_status is null;

alter table public.internships
  add column if not exists deadline_date date, add column if not exists deadline_text text, add column if not exists duration text,
  add column if not exists eligibility text, add column if not exists last_verified_at timestamptz,
  add column if not exists opportunity_type text, add column if not exists paid boolean, add column if not exists region text,
  add column if not exists slug text, add column if not exists stipend_text text, add column if not exists work_mode text;
update public.internships set deadline_date=coalesce(deadline_date,end_date), opportunity_type=coalesce(opportunity_type,'Internship'),
slug=coalesce(slug,id::text), work_mode=coalesce(work_mode,'On-site');

alter table public.opportunities
  add column if not exists category text, add column if not exists compensation text, add column if not exists deadline_date timestamptz,
  add column if not exists eligibility text, add column if not exists fields text[], add column if not exists organisation text,
  add column if not exists published boolean, add column if not exists slug text, add column if not exists verified boolean,
  add column if not exists work_mode text;
update public.opportunities set category=coalesce(category,opportunity_type), deadline_date=coalesce(deadline_date,deadline),
fields=coalesce(fields,skills_required,skills), organisation=coalesce(organisation,company_name),
published=coalesce(published,coalesce(is_active,status='active')), slug=coalesce(slug,id::text),
verified=coalesce(verified,status='verified'), work_mode=coalesce(work_mode,case when remote then 'Remote' else employment_type end);

alter table public.scholarship_applications
  add column if not exists deadline date, add column if not exists link text, add column if not exists notes text,
  add column if not exists provider text, add column if not exists scholarship_name text, add column if not exists submitted_at timestamptz;

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(), table_name text not null, row_id uuid, row_label text, note text not null,
  resolved boolean not null default false, submitted_by uuid, submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.corrections enable row level security;
drop policy if exists "Public can submit corrections" on public.corrections;
create policy "Public can submit corrections" on public.corrections for insert to anon, authenticated
with check (submitted_by is null or submitted_by=(select auth.uid()));
drop policy if exists "Admins can read corrections" on public.corrections;
create policy "Admins can read corrections" on public.corrections for select to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'));
drop policy if exists "Admins can update corrections" on public.corrections;
create policy "Admins can update corrections" on public.corrections for update to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='admin'));
grant insert on public.corrections to anon, authenticated;
grant select,update on public.corrections to authenticated;

create or replace function public.site_rating_summary() returns json language sql security definer set search_path='' stable as $$
select json_build_object('average',coalesce(avg(rating),0),'count',count(*)) from public.site_ratings;
$$;
grant execute on function public.site_rating_summary() to anon, authenticated;

create or replace function public.search_catalogue(_q text,_kind text default 'all',_limit integer default 12,_offset integer default 0)
returns table(id uuid,kind text,slug text,title text,subtitle text,meta json,score real)
language sql security invoker stable as $$
with rows as (
select u.id,'university'::text,u.slug,u.name,coalesce(u.short_name,u.location,u.region,''),
json_build_object('country',u.country,'region',u.region,'verified',u.verified),
case when lower(u.name)=lower(_q) then 1.0 when u.name ilike '%'||_q||'%' then 0.8 else 0.1 end::real
from public.universities u where (_kind='all' or _kind='university') and (_q='' or u.name ilike '%'||_q||'%' or coalesce(u.short_name,'') ilike '%'||_q||'%')
union all
select p.id,'programme'::text,p.slug,p.name,coalesce(p.field,p.degree_type,''),
json_build_object('university_id',p.university_id,'verified',p.verified),
case when lower(p.name)=lower(_q) then 1.0 when p.name ilike '%'||_q||'%' then 0.8 else 0.1 end::real
from public.programmes p where (_kind='all' or _kind='programme') and (_q='' or p.name ilike '%'||_q||'%' or coalesce(p.field,'') ilike '%'||_q||'%')
union all
select s.id,'scholarship'::text,coalesce(s.slug,s.id::text),coalesce(s.name,s.title),coalesce(s.provider,''),
json_build_object('type',s.type,'deadline',coalesce(s.deadline_date,s.deadline)),
case when lower(coalesce(s.name,s.title))=lower(_q) then 1.0 when coalesce(s.name,s.title) ilike '%'||_q||'%' then 0.8 else 0.1 end::real
from public.scholarships s where (_kind='all' or _kind='scholarship') and (_q='' or coalesce(s.name,s.title) ilike '%'||_q||'%' or coalesce(s.provider,'') ilike '%'||_q||'%')
)
select * from rows order by score desc,title asc limit greatest(_limit,1) offset greatest(_offset,0);
$$;
grant execute on function public.search_catalogue(text,text,integer,integer) to anon,authenticated;

create or replace function public.find_duplicate_institution(_name text)
returns table(id uuid,name text,slug text,similarity real)
language sql security invoker stable as $$
select u.id,u.name,u.slug,
case when lower(u.name)=lower(_name) then 1.0 when u.name ilike '%'||_name||'%' then 0.9 else 0.5 end::real
from public.universities u where u.name ilike '%'||_name||'%' or lower(u.name)=lower(_name)
order by similarity desc limit 10;
$$;
grant execute on function public.find_duplicate_institution(text) to authenticated;

create or replace function public.accept_parent_invite(_code text) returns text
language plpgsql security invoker set search_path='' as $$
declare uid uuid:=(select auth.uid()); row_id uuid;
begin
if uid is null then raise exception 'You must be signed in to accept an invite.'; end if;
select id into row_id from public.parent_links where invite_code=_code and status='pending'
and (parent_id is null or parent_id=uid) and (parent_email is null or lower(parent_email)=lower(coalesce(auth.email(),'')))
order by created_at desc limit 1;
if row_id is null then raise exception 'Invite code is invalid or has already been used.'; end if;
update public.parent_links set parent_id=uid,status='accepted',updated_at=now() where id=row_id;
return 'accepted';
end;
$$;
grant execute on function public.accept_parent_invite(text) to authenticated;
revoke execute on function public.accept_parent_invite(text) from anon;

create or replace function public.toggle_comment_like(_comment_id uuid) returns json
language plpgsql security definer set search_path='' as $$
declare uid uuid:=(select auth.uid()); liked boolean; count_value integer;
begin
if uid is null then raise exception 'Authentication required'; end if;
if exists(select 1 from public.comment_likes where comment_id=_comment_id and user_id=uid) then
delete from public.comment_likes where comment_id=_comment_id and user_id=uid; liked:=false;
else insert into public.comment_likes(comment_id,user_id) values(_comment_id,uid); liked:=true; end if;
select count(*) into count_value from public.comment_likes where comment_id=_comment_id;
update public.insight_comments set like_count=count_value where id=_comment_id;
return json_build_object('liked',liked,'like_count',count_value);
end;
$$;
grant execute on function public.toggle_comment_like(uuid) to authenticated;
revoke execute on function public.toggle_comment_like(uuid) from anon;

create or replace function public.toggle_insight_helpful(_insight_id uuid) returns json
language plpgsql security definer set search_path='' as $$
declare uid uuid:=(select auth.uid()); voted boolean; count_value integer;
begin
if uid is null then raise exception 'Authentication required'; end if;
if exists(select 1 from public.insight_helpful where insight_id=_insight_id and user_id=uid) then
delete from public.insight_helpful where insight_id=_insight_id and user_id=uid; voted:=false;
else insert into public.insight_helpful(insight_id,user_id) values(_insight_id,uid); voted:=true; end if;
select count(*) into count_value from public.insight_helpful where insight_id=_insight_id;
update public.student_insights set helpful_count=count_value where id=_insight_id;
return json_build_object('voted',voted,'helpful_count',count_value);
end;
$$;
grant execute on function public.toggle_insight_helpful(uuid) to authenticated;
revoke execute on function public.toggle_insight_helpful(uuid) from anon;
