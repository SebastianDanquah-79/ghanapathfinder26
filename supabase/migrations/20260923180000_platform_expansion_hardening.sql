-- Additive platform hardening. University and programme rows are never modified.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS program text,
  ADD COLUMN IF NOT EXISTS graduation_year integer,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS is_discoverable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_discoverable_role ON public.profiles(is_discoverable, account_role);
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_international_students_visible ON public.international_students(visible, country_code, university_name);
CREATE INDEX IF NOT EXISTS idx_international_universities_country ON public.international_universities(country_code, name);
CREATE INDEX IF NOT EXISTS idx_feed_posts_published_rank ON public.feed_posts(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_country_category ON public.news_articles(country_code, category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_active_country ON public.opportunities(is_active, country, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.platform_analytics()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH cv AS (
  SELECT coalesce(max(students),0)::bigint students,
         coalesce(max(active_students),0)::bigint active_students,
         coalesce(max(website_visits),0)::bigint website_visits,
         coalesce(max(recommendation_runs),0)::bigint recommendation_runs
  FROM public.usage_counters
),
fb AS (
  SELECT (SELECT count(*) FROM public.profiles)::bigint profile_count,
         (SELECT count(*) FROM public.active_sessions WHERE last_seen >= now()-interval '30 minutes')::bigint active_sessions,
         (SELECT count(*) FROM public.analytics_events)::bigint event_count,
         (SELECT count(*) FROM public.recommendation_runs)::bigint recommendation_count,
         (SELECT count(DISTINCT country_code) FROM public.profiles WHERE country_code IS NOT NULL AND country_code <> '')::bigint profile_countries
)
SELECT jsonb_build_object(
 'total_users', greatest(cv.students,fb.profile_count),
 'active_users', greatest(cv.active_students,fb.active_sessions),
 'website_visits', greatest(cv.website_visits,fb.event_count),
 'recommendation_runs', greatest(cv.recommendation_runs,fb.recommendation_count),
 'countries', greatest(fb.profile_countries,(SELECT count(DISTINCT country) FROM public.universities WHERE country IS NOT NULL AND country <> '')),
 'university_count',(SELECT count(*) FROM public.universities),
 'programme_count',(SELECT count(*) FROM public.programmes),
 'scholarship_count',(SELECT count(*) FROM public.scholarships),
 'opportunity_count',(SELECT count(*) FROM public.opportunities WHERE coalesce(is_active,true)),
 'internship_count',(SELECT count(*) FROM public.internships),
 'international_student_count',(SELECT count(*) FROM public.international_students WHERE visible=true),
 'international_university_count',(SELECT count(*) FROM public.international_universities WHERE verified=true),
 'countries_list',(SELECT coalesce(jsonb_agg(x.country ORDER BY x.country),'[]'::jsonb) FROM (SELECT DISTINCT country FROM public.universities WHERE country IS NOT NULL AND country <> '') x),
 'generated_at',now()
)
FROM cv CROSS JOIN fb;
$$;
REVOKE ALL ON FUNCTION public.platform_analytics() FROM public;
GRANT EXECUTE ON FUNCTION public.platform_analytics() TO anon, authenticated;

ALTER TABLE public.international_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "International students public opt in" ON public.international_students;
CREATE POLICY "International students public opt in" ON public.international_students FOR SELECT TO anon,authenticated USING (visible=true OR auth.uid()=user_id);
DROP POLICY IF EXISTS "International students own insert" ON public.international_students;
CREATE POLICY "International students own insert" ON public.international_students FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "International students own update" ON public.international_students;
CREATE POLICY "International students own update" ON public.international_students FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "International students own delete" ON public.international_students;
CREATE POLICY "International students own delete" ON public.international_students FOR DELETE TO authenticated USING (auth.uid()=user_id);

ALTER TABLE public.international_universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "International universities public read" ON public.international_universities;
CREATE POLICY "International universities public read" ON public.international_universities FOR SELECT TO anon,authenticated USING (true);

ALTER TABLE public.africa_leaders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Africa leaders public read" ON public.africa_leaders;
CREATE POLICY "Africa leaders public read" ON public.africa_leaders FOR SELECT TO anon,authenticated USING (true);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "News public read" ON public.news_articles;
CREATE POLICY "News public read" ON public.news_articles FOR SELECT TO anon,authenticated USING (true);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published feed public read" ON public.feed_posts;
CREATE POLICY "Published feed public read" ON public.feed_posts FOR SELECT TO anon,authenticated USING (is_published=true OR auth.uid()=author_id);
DROP POLICY IF EXISTS "Feed users create own" ON public.feed_posts;
CREATE POLICY "Feed users create own" ON public.feed_posts FOR INSERT TO authenticated WITH CHECK (auth.uid()=author_id);
DROP POLICY IF EXISTS "Feed users update own" ON public.feed_posts;
CREATE POLICY "Feed users update own" ON public.feed_posts FOR UPDATE TO authenticated USING (auth.uid()=author_id) WITH CHECK (auth.uid()=author_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications own read" ON public.notifications;
CREATE POLICY "Notifications own read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid()=user_id);
DROP POLICY IF EXISTS "Notifications own update" ON public.notifications;
CREATE POLICY "Notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
