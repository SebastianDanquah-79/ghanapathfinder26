-- Admission reference: official cut-offs + evidence-based estimates for every programme
CREATE OR REPLACE FUNCTION public.admission_reference(_q text DEFAULT '', _university_id uuid DEFAULT NULL, _limit integer DEFAULT 300)
RETURNS TABLE(
  programme_id uuid, programme_slug text, programme_name text, field text, degree_type text,
  university_id uuid, university_name text, university_short text, university_slug text,
  university_type text, university_category text, region text,
  basis text, official_cutoff integer, applicant_category text, academic_year text,
  subject_requirements text, official_source_url text, source_name text, last_verified_at timestamptz,
  estimate_low integer, estimate_high integer, estimate_method text, estimate_evidence text,
  estimate_confidence text, entry_requirements text
)
LANGUAGE sql STABLE SET search_path = public AS $fn$
  WITH off AS (
    SELECT DISTINCT ON (c.programme_id)
      c.programme_id, c.cut_off_aggregate, c.applicant_category, c.academic_year,
      c.subject_requirements, c.official_source_url, c.source_name, c.last_verified_at
    FROM public.programme_cutoffs c
    WHERE c.programme_id IS NOT NULL
      AND c.cut_off_aggregate IS NOT NULL
      AND c.verification_status = 'verified'
    ORDER BY c.programme_id,
      (c.applicant_category = 'First Choice') DESC,
      c.academic_year DESC
  )
  SELECT p.id, p.slug, p.name, p.field, p.degree_type,
         u.id, u.name, u.short_name, u.slug, u.type, u.category, u.region,
         CASE WHEN o.cut_off_aggregate IS NOT NULL THEN 'official'
              WHEN e.estimate_low IS NOT NULL THEN 'estimated'
              ELSE 'none' END,
         o.cut_off_aggregate, o.applicant_category, o.academic_year,
         coalesce(o.subject_requirements, p.wassce_requirements),
         o.official_source_url, o.source_name, o.last_verified_at,
         e.estimate_low, e.estimate_high, e.method, e.evidence, e.confidence_level,
         p.entry_requirements
  FROM public.programmes p
  JOIN public.universities u ON u.id = p.university_id
  LEFT JOIN off o ON o.programme_id = p.id
  LEFT JOIN public.programme_admission_estimates e ON e.programme_id = p.id
  WHERE (_university_id IS NULL OR p.university_id = _university_id)
    AND (
      coalesce(trim(_q), '') = ''
      OR p.name ILIKE '%' || trim(_q) || '%'
      OR coalesce(p.field,'') ILIKE '%' || trim(_q) || '%'
      OR u.name ILIKE '%' || trim(_q) || '%'
      OR coalesce(u.short_name,'') ILIKE '%' || trim(_q) || '%'
    )
  ORDER BY (o.cut_off_aggregate IS NOT NULL) DESC,
           coalesce(o.cut_off_aggregate, e.estimate_low, 99),
           u.name, p.name
  LIMIT LEAST(coalesce(_limit, 300), 1000);
$fn$;

GRANT EXECUTE ON FUNCTION public.admission_reference(text, uuid, integer) TO anon, authenticated;

-- Privacy-conscious usage analytics
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  path text,
  ref_type text,
  ref_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events (event_type, created_at DESC);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record an event" ON public.analytics_events;
CREATE POLICY "Anyone can record an event" ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read analytics" ON public.analytics_events;
CREATE POLICY "Admins read analytics" ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings are public" ON public.app_settings;
CREATE POLICY "Settings are public" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;

INSERT INTO public.app_settings (key, value)
VALUES ('public_counter_metric', '"students"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Aggregate-only public counter (no personal data exposed)
CREATE OR REPLACE FUNCTION public.public_usage_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT jsonb_build_object(
    'metric', coalesce((SELECT value #>> '{}' FROM public.app_settings WHERE key = 'public_counter_metric'), 'students'),
    'students', (SELECT count(*) FROM public.profiles),
    'active_students', (SELECT count(DISTINCT user_id) FROM public.analytics_events WHERE user_id IS NOT NULL),
    'website_visits', (SELECT count(DISTINCT session_id) FROM public.analytics_events),
    'recommendation_runs', (SELECT count(*) FROM public.analytics_events WHERE event_type = 'recommendation_run')
  );
$fn$;
REVOKE ALL ON FUNCTION public.public_usage_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_usage_stats() TO anon, authenticated;

-- Admin-only analytics breakdown
CREATE OR REPLACE FUNCTION public.admin_analytics()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_object_agg(period, metrics) INTO result
  FROM (
    SELECT p.period,
      jsonb_build_object(
        'registered_users', (SELECT count(*) FROM public.profiles pr WHERE pr.created_at >= p.since),
        'unique_users', (SELECT count(DISTINCT user_id) FROM public.analytics_events e WHERE e.user_id IS NOT NULL AND e.created_at >= p.since),
        'sessions', (SELECT count(DISTINCT session_id) FROM public.analytics_events e WHERE e.created_at >= p.since),
        'recommendation_runs', (SELECT count(*) FROM public.analytics_events e WHERE e.event_type = 'recommendation_run' AND e.created_at >= p.since),
        'programme_views', (SELECT count(*) FROM public.analytics_events e WHERE e.event_type = 'programme_view' AND e.created_at >= p.since),
        'university_views', (SELECT count(*) FROM public.analytics_events e WHERE e.event_type = 'university_view' AND e.created_at >= p.since),
        'scholarship_views', (SELECT count(*) FROM public.analytics_events e WHERE e.event_type = 'scholarship_view' AND e.created_at >= p.since),
        'page_views', (SELECT count(*) FROM public.analytics_events e WHERE e.event_type = 'page_view' AND e.created_at >= p.since),
        'saved_universities', (SELECT count(*) FROM public.saved_items s WHERE s.item_type = 'university' AND s.created_at >= p.since),
        'saved_programmes', (SELECT count(*) FROM public.saved_items s WHERE s.item_type = 'programme' AND s.created_at >= p.since),
        'saved_scholarships', (SELECT count(*) FROM public.saved_items s WHERE s.item_type = 'scholarship' AND s.created_at >= p.since)
      ) AS metrics
    FROM (VALUES
      ('today', date_trunc('day', now())),
      ('last_7_days', now() - interval '7 days'),
      ('last_30_days', now() - interval '30 days'),
      ('all_time', '1970-01-01'::timestamptz)
    ) AS p(period, since)
  ) x;

  RETURN coalesce(result, '{}'::jsonb);
END;
$fn$;
REVOKE ALL ON FUNCTION public.admin_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_analytics() TO authenticated;