-- Route the legacy catalogue RPCs and review-audit policies through the single-admin helper.
-- This prevents old direct user_roles/admin_reviewers checks from bypassing the allow-list.

CREATE OR REPLACE FUNCTION private.gpf_admin_approve_catalogue(
  p_table text,
  p_id uuid,
  p_patch jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  approved boolean;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  IF p_table = 'institutions' THEN
    SELECT NOT needs_review INTO approved FROM public.institutions WHERE id = p_id;
    IF approved THEN RAISE EXCEPTION 'approved record requires explicit re-review before overwrite'; END IF;
    UPDATE public.institutions SET
      official_name = coalesce(p_patch->>'official_name', official_name),
      institution_type = coalesce(p_patch->>'institution_type', institution_type),
      town = coalesce(p_patch->>'town', town),
      region = coalesce(p_patch->>'region', region),
      website_url = coalesce(p_patch->>'website_url', website_url),
      logo_source_url = coalesce(p_patch->>'logo_source_url', logo_source_url),
      gtec_accreditation_status = coalesce(p_patch->>'gtec_accreditation_status', gtec_accreditation_status),
      short_description = coalesce(p_patch->>'short_description', short_description),
      last_verified_at = now(), needs_review = false, updated_at = now()
    WHERE id = p_id;
  ELSIF p_table = 'programmes' THEN
    SELECT NOT needs_review INTO approved FROM public.programmes WHERE id = p_id;
    IF approved THEN RAISE EXCEPTION 'approved record requires explicit re-review before overwrite'; END IF;
    UPDATE public.programmes SET
      name = coalesce(p_patch->>'name', name),
      degree_type = coalesce(p_patch->>'degree_type', degree_type),
      department = coalesce(p_patch->>'department', department),
      duration = coalesce(p_patch->>'duration', duration),
      mode = coalesce(p_patch->>'mode', mode),
      admission_summary = coalesce(p_patch->>'admission_summary', admission_summary),
      source_url = coalesce(p_patch->>'source_url', source_url),
      programme_url = coalesce(p_patch->>'programme_url', programme_url),
      last_verified_at = now(), needs_review = false,
      verification_status = 'verified', verified = true, updated_at = now()
    WHERE id = p_id;
  ELSIF p_table = 'internship_providers' THEN
    SELECT NOT needs_review INTO approved FROM public.internship_providers WHERE id = p_id;
    IF approved THEN RAISE EXCEPTION 'approved record requires explicit re-review before overwrite'; END IF;
    UPDATE public.internship_providers SET
      name = coalesce(p_patch->>'name', name),
      sector = coalesce(p_patch->>'sector', sector),
      provider_type = coalesce(p_patch->>'provider_type', provider_type),
      website_url = coalesce(p_patch->>'website_url', website_url),
      logo_source_url = coalesce(p_patch->>'logo_source_url', logo_source_url),
      programme_summary = coalesce(p_patch->>'programme_summary', programme_summary),
      application_url = coalesce(p_patch->>'application_url', application_url),
      paid = coalesce((p_patch->>'paid')::boolean, paid),
      last_verified_at = now(), needs_review = false, updated_at = now()
    WHERE id = p_id;
  ELSIF p_table = 'skill_providers' THEN
    SELECT NOT needs_review INTO approved FROM public.skill_providers WHERE id = p_id;
    IF approved THEN RAISE EXCEPTION 'approved record requires explicit re-review before overwrite'; END IF;
    UPDATE public.skill_providers SET
      provider_name = coalesce(p_patch->>'provider_name', provider_name),
      course_name = coalesce(p_patch->>'course_name', course_name),
      skill_area = coalesce(p_patch->>'skill_area', skill_area),
      format = coalesce(p_patch->>'format', format),
      duration = coalesce(p_patch->>'duration', duration),
      cost = coalesce(p_patch->>'cost', cost),
      certification_issued_by = coalesce(p_patch->>'certification_issued_by', certification_issued_by),
      application_url = coalesce(p_patch->>'application_url', application_url),
      last_verified_at = now(), needs_review = false, updated_at = now()
    WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'unsupported catalogue table';
  END IF;

  INSERT INTO public.review_audit(table_name, row_id, action, before_data, after_data, reviewer_id)
  VALUES (p_table, p_id, 'approve', NULL, p_patch, auth.uid());
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION private.gpf_admin_reject_catalogue(p_table text, p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  IF p_table = 'institutions' THEN
    UPDATE public.institutions SET needs_review = false, updated_at = now() WHERE id = p_id;
  ELSIF p_table = 'programmes' THEN
    UPDATE public.programmes SET needs_review = false, verification_status = 'outdated', updated_at = now() WHERE id = p_id;
  ELSIF p_table = 'internship_providers' THEN
    UPDATE public.internship_providers SET needs_review = false, updated_at = now() WHERE id = p_id;
  ELSIF p_table = 'skill_providers' THEN
    UPDATE public.skill_providers SET needs_review = false, updated_at = now() WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'unsupported catalogue table';
  END IF;
  RETURN true;
END;
$function$;

DROP POLICY IF EXISTS gpf_rls_1950d28204ead9a36e810aac7cf1bd96 ON public.review_audit;
DROP POLICY IF EXISTS gpf_rls_1f406478d5231a6c80e689dbfbd682f4 ON public.review_audit;

CREATE POLICY review_audit_admin_read
ON public.review_audit
FOR SELECT
TO authenticated
USING (public.is_gpf_admin());

CREATE POLICY review_audit_admin_insert
ON public.review_audit
FOR INSERT
TO authenticated
WITH CHECK (public.is_gpf_admin());
