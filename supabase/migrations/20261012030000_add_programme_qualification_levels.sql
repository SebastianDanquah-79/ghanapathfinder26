-- Add explicit qualification-level classification without creating unverified programme claims.
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS qualification_level text NOT NULL DEFAULT 'other_review';

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
  -- Research doctorates take precedence over postgraduate/master's labels.
  IF v ~ '(^|[^a-z])(ph[.]?d|dphil|doctorate|doctor of philosophy|edd)([^a-z]|$)' THEN
    RETURN 'doctoral_phd';
  ELSIF v ~ '(^|[^a-z])(m[.]?sc|m[.]?phil|m[.]?tech|m[.]?ed|m[.]?a|m[.]?com|m[.]?arch|m[.]?ba|mba|mph|mfa|llm|master|masters|postgraduate|post-graduate)([^a-z]|$)' THEN
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
SET qualification_level = public.classify_programme_qualification_level(name, qualification, degree_type);

CREATE OR REPLACE FUNCTION public.sync_programme_qualification_level()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.qualification_level := public.classify_programme_qualification_level(
    NEW.name, NEW.qualification, NEW.degree_type
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_programme_qualification_level ON public.programmes;
CREATE TRIGGER trg_sync_programme_qualification_level
BEFORE INSERT OR UPDATE OF name, qualification, degree_type
ON public.programmes
FOR EACH ROW
EXECUTE FUNCTION public.sync_programme_qualification_level();

COMMENT ON COLUMN public.programmes.qualification_level IS
  'Rule-based grouping from the recorded programme name/qualification/degree_type. This is a discovery filter only; it does not verify the institution or programme.';
