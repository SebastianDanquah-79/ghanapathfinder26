-- Replace a student's WASSCE grades atomically after the photo extraction is reviewed.
-- SECURITY INVOKER keeps the existing wassce_results RLS policies in force.
create or replace function public.replace_my_wassce_results(p_results jsonb)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  row_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_results) <> 'array' then
    raise exception 'Results must be sent as an array.' using errcode = '22023';
  end if;

  select count(*) into row_count from jsonb_array_elements(p_results);
  if row_count > 30 then
    raise exception 'A maximum of 30 subjects can be saved.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_results) as r(subject text, grade text)
    where subject is null or char_length(trim(subject)) not between 1 and 80
       or grade is null or upper(trim(grade)) not in ('A1','B2','B3','C4','C5','C6','D7','E8','F9')
  ) then
    raise exception 'Each result needs a subject and a valid WASSCE grade.' using errcode = '22023';
  end if;

  if exists (
    select lower(trim(subject))
    from jsonb_to_recordset(p_results) as r(subject text, grade text)
    group by lower(trim(subject))
    having count(*) > 1
  ) then
    raise exception 'A subject cannot appear more than once.' using errcode = '22023';
  end if;

  delete from public.wassce_results where user_id = auth.uid();
  insert into public.wassce_results (user_id, subject, grade)
  select auth.uid(), trim(r.subject), upper(trim(r.grade))
  from jsonb_to_recordset(p_results) as r(subject text, grade text);
end;
$$;
revoke all on function public.replace_my_wassce_results(jsonb) from public, anon;
grant execute on function public.replace_my_wassce_results(jsonb) to authenticated;
