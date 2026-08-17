CREATE TABLE IF NOT EXISTS public.usage_counters (
  id text PRIMARY KEY,
  metric text NOT NULL DEFAULT 'students',
  students integer NOT NULL DEFAULT 0,
  active_students integer NOT NULL DEFAULT 0,
  website_visits integer NOT NULL DEFAULT 0,
  recommendation_runs integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.usage_counters TO anon, authenticated;
GRANT ALL ON public.usage_counters TO service_role;

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read aggregate usage counters" ON public.usage_counters;
CREATE POLICY "Anyone can read aggregate usage counters"
  ON public.usage_counters FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.refresh_usage_counters()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $fn$
  INSERT INTO public.usage_counters AS u (id, metric, students, active_students, website_visits, recommendation_runs, updated_at)
  SELECT 'global',
    coalesce((SELECT value #>> '{}' FROM public.app_settings WHERE key = 'public_counter_metric'), 'students'),
    (SELECT count(*) FROM public.profiles),
    (SELECT count(DISTINCT user_id) FROM public.analytics_events WHERE user_id IS NOT NULL),
    (SELECT count(DISTINCT session_id) FROM public.analytics_events),
    (SELECT count(*) FROM public.analytics_events WHERE event_type = 'recommendation_run'),
    now()
  ON CONFLICT (id) DO UPDATE SET
    metric = excluded.metric,
    students = excluded.students,
    active_students = excluded.active_students,
    website_visits = excluded.website_visits,
    recommendation_runs = excluded.recommendation_runs,
    updated_at = now()
  WHERE (u.metric, u.students, u.active_students, u.website_visits, u.recommendation_runs)
     IS DISTINCT FROM
        (excluded.metric, excluded.students, excluded.active_students, excluded.website_visits, excluded.recommendation_runs);
$fn$;

REVOKE ALL ON FUNCTION public.refresh_usage_counters() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_usage_counters() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.trg_refresh_usage_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.refresh_usage_counters();
  RETURN NULL;
END;
$fn$;

DROP TRIGGER IF EXISTS analytics_events_refresh_counters ON public.analytics_events;
CREATE TRIGGER analytics_events_refresh_counters
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_usage_counters();

DROP TRIGGER IF EXISTS profiles_refresh_counters ON public.profiles;
CREATE TRIGGER profiles_refresh_counters
  AFTER INSERT OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_usage_counters();

DROP TRIGGER IF EXISTS app_settings_refresh_counters ON public.app_settings;
CREATE TRIGGER app_settings_refresh_counters
  AFTER INSERT OR UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_usage_counters();

SELECT public.refresh_usage_counters();

ALTER TABLE public.usage_counters REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_counters;