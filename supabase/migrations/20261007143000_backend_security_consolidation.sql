-- GhanaPathFinder backend security/performance consolidation
-- Applied to production on 2026-10-07.

BEGIN;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC',
                   r.nspname, r.proname, r.args);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_traffic_sources() TO authenticated;
GRANT EXECUTE ON FUNCTION public.gpf_admin_approve_catalogue(text,uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gpf_admin_reject_catalogue(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_rating_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_comment_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_feed_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_insight_helpful(uuid) TO authenticated;

DROP POLICY IF EXISTS "Public can view approved internship providers" ON public.internship_providers;
DROP POLICY IF EXISTS "News public read" ON public.news_articles;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "public read programmes" ON public.programmes;
DROP POLICY IF EXISTS "Public can view approved skill providers" ON public.skill_providers;
DROP POLICY IF EXISTS "public read universities" ON public.universities;
DROP POLICY IF EXISTS "Users manage own WASSCE results" ON public.wassce_results;

-- Normalize auth.uid() evaluation in RLS policies so it is initialized once per statement.
DO $
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname='public'
      AND (
        (qual IS NOT NULL AND qual ~ 'auth\\.uid\\(\\)' AND qual !~ '\\(select auth\\.uid\\(\\)\\)')
        OR
        (with_check IS NOT NULL AND with_check ~ 'auth\\.uid\\(\\)' AND with_check !~ '\\(select auth\\.uid\\(\\)\\)')
      )
  LOOP
    IF r.qual IS NOT NULL AND r.qual ~ 'auth\\.uid\\(\\)' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)',
        r.policyname, r.schemaname, r.tablename,
        regexp_replace(r.qual, 'auth\\.uid\\(\\)', '(select auth.uid())', 'g'));
    END IF;
    IF r.with_check IS NOT NULL AND r.with_check ~ 'auth\\.uid\\(\\)' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)',
        r.policyname, r.schemaname, r.tablename,
        regexp_replace(r.with_check, 'auth\\.uid\\(\\)', '(select auth.uid())', 'g'));
    END IF;
  END LOOP;
END $;

CREATE INDEX IF NOT EXISTS candidate_cvs_user_id_idx ON public.candidate_cvs(user_id);
CREATE INDEX IF NOT EXISTS employer_application_reviews_updated_by_idx ON public.employer_application_reviews(updated_by);
CREATE INDEX IF NOT EXISTS review_audit_reviewer_id_idx ON public.review_audit(reviewer_id);

COMMIT;
