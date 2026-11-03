-- Restore the admission reference RPC used by Admission Match and university recommendations.
-- The live schema stores aggregates and estimates as numeric, so cast them explicitly
-- to the integer return type consumed by the application.
CREATE OR REPLACE FUNCTION public.admission_reference(
  _q text DEFAULT '',
  _university_id uuid DEFAULT NULL,
  _limit integer DEFAULT 300
)
RETURNS TABLE(
  programme_id uuid,
  programme_slug text,
  programme_name text,
  field text,
  degree_type text,
  university_id uuid,
  university_name text,
  university_short text,
  university_slug text,
  university_type text,
  university_category text,
  region text,
  basis text,
  official_cutoff integer,
  applicant_category text,
  academic_year text,
  subject_requirements text,
  official_source_url text,
  source_name text,
  last_verified_at timestamptz,
  estimate_low integer,
  estimate_high integer,
  estimate_method text,
  estimate_evidence text,
  estimate_confidence text,
  entry_requirements text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $fn$
  WITH off AS (
    SELECT DISTINCT ON (c.programme_id)
      c.programme_id,
      c.cut_off_aggregate,
      c.applicant_category,
      c.academic_year,
      c.subject_requirements,
      c.official_source_url,
      c.source_name,
      c.last_verified_at
    FROM public.programme_cutoffs AS c
    WHERE c.programme_id IS NOT NULL
      AND c.cut_off_aggregate IS NOT NULL
      AND c.verification_status = 'verified'
    ORDER BY
      c.programme_id,
      (c.applicant_category = 'First Choice') DESC,
      c.academic_year DESC
  )
  SELECT
    p.id,
    p.slug,
    p.name,
    p.field,
    p.degree_type,
    u.id,
    u.name,
    u.short_name,
    u.slug,
    u.type,
    u.category,
    u.region,
    CASE
      WHEN o.cut_off_aggregate IS NOT NULL THEN 'official'
      WHEN e.estimate_low IS NOT NULL THEN 'estimated'
      ELSE 'none'
    END,
    o.cut_off_aggregate::integer,
    o.applicant_category,
    o.academic_year,
    COALESCE(o.subject_requirements, p.wassce_requirements),
    o.official_source_url,
    o.source_name,
    o.last_verified_at,
    e.estimate_low::integer,
    e.estimate_high::integer,
    e.method,
    e.evidence,
    e.confidence_level,
    p.entry_requirements
  FROM public.programmes AS p
  JOIN public.universities AS u ON u.id = p.university_id
  LEFT JOIN off AS o ON o.programme_id = p.id
  LEFT JOIN public.programme_admission_estimates AS e ON e.programme_id = p.id
  WHERE (_university_id IS NULL OR p.university_id = _university_id)
    AND (
      COALESCE(TRIM(_q), '') = ''
      OR p.name ILIKE '%' || TRIM(_q) || '%'
      OR COALESCE(p.field, '') ILIKE '%' || TRIM(_q) || '%'
      OR u.name ILIKE '%' || TRIM(_q) || '%'
      OR COALESCE(u.short_name, '') ILIKE '%' || TRIM(_q) || '%'
    )
  ORDER BY
    (o.cut_off_aggregate IS NOT NULL) DESC,
    COALESCE(o.cut_off_aggregate, e.estimate_low, 99),
    u.name,
    p.name
  LIMIT LEAST(GREATEST(COALESCE(_limit, 300), 1), 1000);
$fn$;

GRANT EXECUTE ON FUNCTION public.admission_reference(text, uuid, integer) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
