-- Extend existing privacy-conscious analytics with coarse device and acquisition context.
-- No IP addresses, search terms, grades, names, or email addresses are stored.
alter table public.analytics_events
  add column if not exists device_type text,
  add column if not exists referrer_host text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'analytics_events_device_type_check' and conrelid = 'public.analytics_events'::regclass) then
    alter table public.analytics_events add constraint analytics_events_device_type_check check (device_type is null or device_type in ('mobile', 'desktop', 'tablet'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analytics_events_referrer_host_length_check' and conrelid = 'public.analytics_events'::regclass) then
    alter table public.analytics_events add constraint analytics_events_referrer_host_length_check check (referrer_host is null or length(referrer_host) <= 255);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analytics_events_utm_source_length_check' and conrelid = 'public.analytics_events'::regclass) then
    alter table public.analytics_events add constraint analytics_events_utm_source_length_check check (utm_source is null or length(utm_source) <= 120);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analytics_events_utm_medium_length_check' and conrelid = 'public.analytics_events'::regclass) then
    alter table public.analytics_events add constraint analytics_events_utm_medium_length_check check (utm_medium is null or length(utm_medium) <= 120);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analytics_events_utm_campaign_length_check' and conrelid = 'public.analytics_events'::regclass) then
    alter table public.analytics_events add constraint analytics_events_utm_campaign_length_check check (utm_campaign is null or length(utm_campaign) <= 120);
  end if;
end $$;

create index if not exists analytics_events_type_created_at_idx on public.analytics_events (event_type, created_at desc);
create index if not exists analytics_events_user_created_at_idx on public.analytics_events (user_id, created_at desc) where user_id is not null;

create or replace function private.admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_uid uuid := auth.uid();
  result jsonb;
begin
  if v_uid is null or not private.has_role(v_uid, 'admin'::public.app_role) then
    raise exception 'Administrator access required';
  end if;

  with periods(label, start_at) as (
    values ('today', date_trunc('day', now())),
           ('last_7_days', now() - interval '7 days'),
           ('last_30_days', now() - interval '30 days'),
           ('all_time', timestamptz '1970-01-01')
  ),
  metrics as (
    select p.label,
      (select count(*) from auth.users u where u.created_at >= p.start_at) as registered_users,
      (select count(distinct e.user_id) from public.analytics_events e where e.created_at >= p.start_at and e.user_id is not null) as unique_users,
      (select count(distinct e.session_id) from public.analytics_events e where e.created_at >= p.start_at) as sessions,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'recommendation_run') as recommendation_runs,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'programme_view') as programme_views,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'university_view') as university_views,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'scholarship_view') as scholarship_views,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'page_view') as page_views,
      (select count(*) from public.saved_items s where s.created_at >= p.start_at and s.item_type = 'university') as saved_universities,
      (select count(*) from public.saved_items s where s.created_at >= p.start_at and s.item_type = 'programme') as saved_programmes,
      (select count(*) from public.saved_items s where s.created_at >= p.start_at and s.item_type = 'scholarship') as saved_scholarships,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'sign_up') as signups,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'onboarding_completed') as onboarding_completions,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'search_performed') as searches,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'opportunity_saved') as saved_opportunities,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.event_type = 'cv_exported') as cv_exports,
      (select count(distinct e.user_id) from public.analytics_events e where e.created_at >= p.start_at and e.user_id is not null and exists (select 1 from public.analytics_events prior where prior.user_id = e.user_id and prior.created_at < p.start_at)) as returning_users,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.device_type = 'mobile') as mobile_events,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.device_type = 'desktop') as desktop_events,
      (select count(*) from public.analytics_events e where e.created_at >= p.start_at and e.device_type = 'tablet') as tablet_events
    from periods p
  )
  select jsonb_object_agg(label, jsonb_build_object(
    'registered_users', registered_users, 'unique_users', unique_users, 'sessions', sessions,
    'recommendation_runs', recommendation_runs, 'programme_views', programme_views,
    'university_views', university_views, 'scholarship_views', scholarship_views, 'page_views', page_views,
    'saved_universities', saved_universities, 'saved_programmes', saved_programmes,
    'saved_scholarships', saved_scholarships, 'signups', signups,
    'onboarding_completions', onboarding_completions, 'searches', searches,
    'saved_opportunities', saved_opportunities, 'cv_exports', cv_exports,
    'returning_users', returning_users, 'mobile_events', mobile_events,
    'desktop_events', desktop_events, 'tablet_events', tablet_events
  )) into result from metrics;
  return result;
end;
$function$;
