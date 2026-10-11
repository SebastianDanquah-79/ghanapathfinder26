ALTER TABLE public.employer_application_reviews
  ALTER COLUMN updated_by DROP NOT NULL;

ALTER TABLE public.employer_application_reviews
  DROP CONSTRAINT IF EXISTS employer_application_reviews_updated_by_fkey;

ALTER TABLE public.employer_application_reviews
  ADD CONSTRAINT employer_application_reviews_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.list_account_storage_objects(_user_id uuid)
RETURNS TABLE(bucket_id text, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, storage
AS $function$
  SELECT o.bucket_id, o.name
  FROM storage.objects AS o
  WHERE o.owner_id = _user_id::text;
$function$;

REVOKE ALL ON FUNCTION public.list_account_storage_objects(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_account_storage_objects(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.delete_account_completely(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
DECLARE
  v_insight_ids uuid[];
  v_comment_ids uuid[];
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Account identifier is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'Account was not found';
  END IF;

  -- Preserve audit history while removing the deleted account's identity references.
  UPDATE public.data_change_proposals SET created_by = NULL WHERE created_by = _user_id;
  UPDATE public.data_change_proposals SET reviewed_by = NULL WHERE reviewed_by = _user_id;
  UPDATE public.review_audit SET reviewer_id = NULL WHERE reviewer_id = _user_id;
  UPDATE public.employer_application_reviews SET updated_by = NULL WHERE updated_by = _user_id;
  UPDATE public.corrections SET submitted_by = NULL WHERE submitted_by = _user_id;

  -- Remove posts authored by the account and their dependent comments/reactions.
  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[])
    INTO v_insight_ids
    FROM public.student_insights
    WHERE user_id = _user_id;

  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[])
    INTO v_comment_ids
    FROM public.insight_comments
    WHERE user_id = _user_id OR insight_id = ANY(v_insight_ids);

  UPDATE public.insight_comments
    SET parent_id = NULL
    WHERE parent_id = ANY(v_comment_ids);

  DELETE FROM public.comment_likes
    WHERE user_id = _user_id OR comment_id = ANY(v_comment_ids);

  DELETE FROM public.insight_comments WHERE id = ANY(v_comment_ids);
  DELETE FROM public.insight_helpful
    WHERE user_id = _user_id OR insight_id = ANY(v_insight_ids);
  DELETE FROM public.insight_reports
    WHERE reporter_id = _user_id OR insight_id = ANY(v_insight_ids);
  DELETE FROM public.student_insights WHERE user_id = _user_id;

  -- Remove private records whose legacy tables did not declare a user foreign key.
  DELETE FROM public.active_sessions WHERE user_id = _user_id;
  DELETE FROM public.notifications WHERE user_id = _user_id;
  DELETE FROM public.logo_requests WHERE requested_by = _user_id;
  DELETE FROM public.match_preferences WHERE user_id = _user_id;
  DELETE FROM public.programme_feedback WHERE user_id = _user_id;
  DELETE FROM public.scholarship_applications WHERE user_id = _user_id;
  DELETE FROM public.site_ratings WHERE user_id = _user_id;
  DELETE FROM public.sms_sends WHERE user_id = _user_id;
  DELETE FROM public.comment_likes WHERE user_id = _user_id;
  DELETE FROM public.insight_helpful WHERE user_id = _user_id;
  DELETE FROM public.insight_reports WHERE reporter_id = _user_id;

  -- The auth deletion cascades through profiles and all declared account-owned records.
  DELETE FROM auth.users WHERE id = _user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account deletion failed';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.delete_account_completely(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_account_completely(uuid) TO service_role;
