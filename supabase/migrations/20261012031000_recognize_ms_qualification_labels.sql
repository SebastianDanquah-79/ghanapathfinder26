-- Recognise MS/M.S. degree naming while keeping programme classification heuristic-only.
CREATE OR REPLACE FUNCTION public.classify_programme_qualification_level(
  p_name text,
  p_qualification text,
  p_degree_type text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $function$
DECLARE
  v text := lower(concat_ws(' ', p_name, p_qualification, p_degree_type));
BEGIN
  IF v ~ '(^|[^a-z])(ph[.]?d|dphil|doctorate|doctor of philosophy|edd)([^a-z]|$)' THEN
    RETURN 'doctoral_phd';
  ELSIF v ~ '(^|[^a-z])(m[.]?s[.]?|m[.]?sc[.]?|m[.]?phil|m[.]?tech|m[.]?ed|m[.]?a|m[.]?com|m[.]?arch|m[.]?ba|mba|mph|mfa|llm|master|masters|postgraduate|post-graduate)([^a-z]|$)' THEN
    RETURN 'masters_postgraduate';
  ELSIF v ~ '(^|[^a-z])(diploma|hnd|pre-hnd|certificate|advanced certificate|technician part)([^a-z]|$)' THEN
    RETURN 'diploma_hnd_certificate';
  ELSIF v ~ '(^|[^a-z])(bsc|ba|bed|btech|bcom|bfa|llb|bds|pharmd|dvm|bachelor|undergraduate)([^a-z]|$)' THEN
    RETURN 'undergraduate';
  ELSE
    RETURN 'other_review';
  END IF;
END;
$function$;

UPDATE public.programmes
SET qualification_level = public.classify_programme_qualification_level(name, qualification, degree_type)
WHERE qualification_level IS DISTINCT FROM public.classify_programme_qualification_level(name, qualification, degree_type);

CREATE INDEX IF NOT EXISTS programmes_qualification_level_idx
  ON public.programmes (qualification_level);

NOTIFY pgrst, 'reload schema';
