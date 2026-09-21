-- GhanaPathFinder backend repair: restore missing routing RPCs and harden role-profile RLS.
-- Applied to production on 2026-09-21 before this migration was committed.

create or replace function public.resolve_gpf_backend(
  p_language text default 'en',
  p_country_code text default null
)
returns table(
  language_backend text,
  country_code text,
  language_code text,
  locale text,
  direction text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    'lang_' || coalesce(nullif(trim(p_language), ''), 'en'),
    nullif(upper(trim(p_country_code)), ''),
    coalesce(nullif(trim(p_language), ''), 'en'),
    case
      when p_country_code is null or trim(p_country_code) = ''
        then coalesce(nullif(trim(p_language), ''), 'en')
      else coalesce(nullif(trim(p_language), ''), 'en') || '-' || upper(trim(p_country_code))
    end,
    case when lower(coalesce(p_language, 'en')) in ('ar', 'fa', 'ur') then 'rtl' else 'ltr' end;
$$;

revoke execute on function public.resolve_gpf_backend(text,text) from public;
grant execute on function public.resolve_gpf_backend(text,text) to anon, authenticated;

create or replace function public.get_backend_content(
  p_language text default 'en',
  p_keys text[] default '{}'
)
returns setof jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'key', null::text,
    'language', coalesce(nullif(trim(p_language), ''), 'en'),
    'value', null::jsonb
  )
  where false;
$$;

revoke execute on function public.get_backend_content(text,text[]) from public;
grant execute on function public.get_backend_content(text,text[]) to anon, authenticated;

drop policy if exists "employees manage own profile" on public.employee_profiles;
create policy "employees manage own profile"
on public.employee_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "employers manage own profile" on public.employer_profiles;
create policy "employers manage own profile"
on public.employer_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "students manage own profile" on public.student_profiles;
create policy "students manage own profile"
on public.student_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
