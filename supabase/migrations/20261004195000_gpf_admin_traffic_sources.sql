create or replace function public.admin_traffic_sources()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'private', 'pg_temp'
as $function$
declare
  v_uid uuid := auth.uid();
  result jsonb;
begin
  if v_uid is null or not private.has_role(v_uid, 'admin'::public.app_role) then
    raise exception 'Administrator access required';
  end if;

  select coalesce(jsonb_object_agg(source, visits), '{}'::jsonb)
    into result
    from (
      select coalesce(nullif(utm_source, ''), nullif(referrer_host, ''), 'direct') as source,
             count(*) as visits
        from public.analytics_events
       where created_at >= now() - interval '30 days'
       group by 1
       order by count(*) desc
       limit 8
    ) source_counts;

  return result;
end;
$function$;

revoke all on function public.admin_traffic_sources() from public, anon;
grant execute on function public.admin_traffic_sources() to authenticated;