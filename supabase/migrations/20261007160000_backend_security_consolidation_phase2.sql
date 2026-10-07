-- GhanaPathFinder backend security consolidation
-- Rebuild permissive RLS policies into one policy per table/role/action,
-- move privileged SECURITY DEFINER RPC implementations into private schema,
-- expose only SECURITY INVOKER RPC wrappers, and cover unindexed FKs.

BEGIN;

CREATE TEMP TABLE gpf_policy_snapshot ON COMMIT DROP AS
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND permissive='PERMISSIVE';

DO $$
DECLARE
  p record;
  role_name text;
  action_name text;
  qexpr text;
  cexpr text;
  policy_name text;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM gpf_policy_snapshot LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      p.policyname, p.schemaname, p.tablename);
  END LOOP;

  FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
    FOR p IN
      SELECT DISTINCT tablename
      FROM gpf_policy_snapshot
      WHERE roles @> ARRAY['public']::name[]
         OR roles @> ARRAY[role_name]::name[]
    LOOP
      FOREACH action_name IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
        IF NOT EXISTS (
          SELECT 1 FROM gpf_policy_snapshot s
          WHERE s.tablename=p.tablename
            AND (s.roles @> ARRAY['public']::name[] OR s.roles @> ARRAY[role_name]::name[])
            AND (s.cmd='ALL' OR s.cmd=action_name)
        ) THEN CONTINUE; END IF;

        IF action_name IN ('SELECT','DELETE','UPDATE') THEN
          SELECT string_agg('(' || coalesce(s.qual,'true') || ')',' OR ')
          INTO qexpr
          FROM gpf_policy_snapshot s
          WHERE s.tablename=p.tablename
            AND (s.roles @> ARRAY['public']::name[] OR s.roles @> ARRAY[role_name]::name[])
            AND (s.cmd='ALL' OR s.cmd=action_name);
        ELSE qexpr := NULL; END IF;

        IF action_name IN ('INSERT','UPDATE') THEN
          SELECT string_agg('(' || coalesce(s.with_check,'true') || ')',' OR ')
          INTO cexpr
          FROM gpf_policy_snapshot s
          WHERE s.tablename=p.tablename
            AND (s.roles @> ARRAY['public']::name[] OR s.roles @> ARRAY[role_name]::name[])
            AND (s.cmd='ALL' OR s.cmd=action_name);
        ELSE cexpr := NULL; END IF;

        policy_name := 'gpf_rls_' || md5(p.tablename || '|' || role_name || '|' || action_name);

        IF action_name='SELECT' THEN
          EXECUTE format('CREATE POLICY %I ON public.%I AS PERMISSIVE FOR SELECT TO %I USING (%s)',
            policy_name,p.tablename,role_name,qexpr);
        ELSIF action_name='INSERT' THEN
          EXECUTE format('CREATE POLICY %I ON public.%I AS PERMISSIVE FOR INSERT TO %I WITH CHECK (%s)',
            policy_name,p.tablename,role_name,cexpr);
        ELSIF action_name='UPDATE' THEN
          EXECUTE format('CREATE POLICY %I ON public.%I AS PERMISSIVE FOR UPDATE TO %I USING (%s) WITH CHECK (%s)',
            policy_name,p.tablename,role_name,qexpr,cexpr);
        ELSE
          EXECUTE format('CREATE POLICY %I ON public.%I AS PERMISSIVE FOR DELETE TO %I USING (%s)',
            policy_name,p.tablename,role_name,qexpr);
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

ALTER FUNCTION public.admin_traffic_sources() SET SCHEMA private;
ALTER FUNCTION public.gpf_admin_approve_catalogue(text,uuid,jsonb) SET SCHEMA private;
ALTER FUNCTION public.gpf_admin_reject_catalogue(text,uuid) SET SCHEMA private;
ALTER FUNCTION public.platform_analytics() SET SCHEMA private;
ALTER FUNCTION public.site_rating_summary() SET SCHEMA private;
ALTER FUNCTION public.toggle_comment_like(uuid) SET SCHEMA private;
ALTER FUNCTION public.toggle_feed_like(uuid) SET SCHEMA private;
ALTER FUNCTION public.toggle_insight_helpful(uuid) SET SCHEMA private;

CREATE OR REPLACE FUNCTION public.admin_traffic_sources()
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.admin_traffic_sources(); $$;
CREATE OR REPLACE FUNCTION public.gpf_admin_approve_catalogue(p_table text,p_id uuid,p_patch jsonb DEFAULT '{}'::jsonb)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.gpf_admin_approve_catalogue(p_table,p_id,p_patch); $$;
CREATE OR REPLACE FUNCTION public.gpf_admin_reject_catalogue(p_table text,p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.gpf_admin_reject_catalogue(p_table,p_id); $$;
CREATE OR REPLACE FUNCTION public.platform_analytics()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$ SELECT private.platform_analytics(); $$;
CREATE OR REPLACE FUNCTION public.site_rating_summary()
RETURNS json LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$ SELECT private.site_rating_summary(); $$;
CREATE OR REPLACE FUNCTION public.toggle_comment_like(_comment_id uuid)
RETURNS json LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.toggle_comment_like(_comment_id); $$;
CREATE OR REPLACE FUNCTION public.toggle_feed_like(p_post_id uuid)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.toggle_feed_like(p_post_id); $$;
CREATE OR REPLACE FUNCTION public.toggle_insight_helpful(_insight_id uuid)
RETURNS json LANGUAGE sql SECURITY INVOKER SET search_path=''
AS $$ SELECT private.toggle_insight_helpful(_insight_id); $$;

REVOKE EXECUTE ON FUNCTION public.admin_traffic_sources() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gpf_admin_approve_catalogue(text,uuid,jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gpf_admin_reject_catalogue(text,uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.platform_analytics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.site_rating_summary() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_comment_like(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_feed_like(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_insight_helpful(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_traffic_sources() TO authenticated;
GRANT EXECUTE ON FUNCTION public.gpf_admin_approve_catalogue(text,uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gpf_admin_reject_catalogue(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_rating_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_comment_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_feed_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_insight_helpful(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS candidate_cvs_user_id_idx ON public.candidate_cvs(user_id);
CREATE INDEX IF NOT EXISTS employer_application_reviews_updated_by_idx ON public.employer_application_reviews(updated_by);
CREATE INDEX IF NOT EXISTS review_audit_reviewer_id_idx ON public.review_audit(reviewer_id);

COMMIT;
