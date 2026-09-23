-- Ghana International Admissions Engine
-- Programme-level matching for saved international qualifications.
-- Requirements must be sourced from official institutional evidence before
-- they are marked verified.

create index if not exists programme_qualification_requirements_qualification_code_idx
  on public.programme_qualification_requirements (qualification_code);

create index if not exists programme_qualification_requirements_verified_idx
  on public.programme_qualification_requirements (verification_status, programme_id);

create or replace function public.match_international_programmes(
  p_country_code text default null,
  p_qualification_code text default null
)
returns table (
  programme_id uuid,
  programme_name text,
  university_id uuid,
  university_name text,
  qualification_code text,
  verification_status text,
  minimum_overall_score numeric,
  minimum_score_operator text,
  required_subjects jsonb,
  notes text,
  source_url text,
  programme_url text,
  admissions_url text,
  match_status text
)
language sql
security invoker
stable
set search_path = ''
as $$
  with student_data as (
    select
      q.id as qualification_id,
      coalesce(p_country_code, q.country_code) as country_code,
      coalesce(p_qualification_code, q.qualification_code) as qualification_code,
      q.overall_score,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'subject', r.subject,
            'grade', r.grade,
            'level', r.level
          )
        ) filter (where r.id is not null),
        '[]'::jsonb
      ) as results
    from public.student_qualifications q
    left join public.student_qualification_results r
      on r.qualification_id = q.id
    where q.user_id = (select auth.uid())
      and (p_country_code is null or q.country_code = p_country_code)
      and (p_qualification_code is null or q.qualification_code = p_qualification_code)
    group by q.id, q.country_code, q.qualification_code, q.overall_score
  )
  select
    p.id,
    p.name,
    u.id,
    u.name,
    r.qualification_code,
    r.verification_status,
    r.minimum_overall_score,
    r.minimum_score_operator,
    r.required_subjects,
    r.notes,
    r.source_url,
    p.programme_url,
    u.admissions_url,
    case
      when r.verification_status <> 'verified' then 'review_required'
      when r.required_subjects = '[]'::jsonb then 'provisional'
      else 'eligible_check'
    end
  from public.programme_qualification_requirements r
  join public.programmes p on p.id = r.programme_id
  left join public.universities u on u.id = p.university_id
  join student_data s on s.qualification_code = r.qualification_code
  where r.verification_status in ('verified', 'review_required')
    and (
      s.overall_score is null
      or r.minimum_overall_score is null
      or r.minimum_score_operator is null
      or (r.minimum_score_operator = '>=' and nullif(s.overall_score, '')::numeric >= r.minimum_overall_score)
      or (r.minimum_score_operator = '<=' and nullif(s.overall_score, '')::numeric <= r.minimum_overall_score)
      or r.minimum_score_operator not in ('>=', '<=')
    )
  order by
    case when r.verification_status = 'verified' then 0 else 1 end,
    u.name,
    p.name;
$$;

revoke execute on function public.match_international_programmes(text, text) from public, anon;
grant execute on function public.match_international_programmes(text, text) to authenticated;
