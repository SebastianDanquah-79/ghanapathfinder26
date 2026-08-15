-- 1. Link existing official cut-offs to programmes (name similarity within same institution)
UPDATE public.programme_cutoffs c
SET programme_id = (
  SELECT t.id FROM (
    SELECT pp.id, similarity(pp.name, c.programme_name) AS s
    FROM public.programmes pp
    WHERE pp.university_id = c.university_id
    ORDER BY s DESC
    LIMIT 1
  ) t
  WHERE t.s > 0.45
)
WHERE c.programme_id IS NULL;

-- 2. Evidence-based estimated admission ranges
CREATE TABLE IF NOT EXISTS public.programme_admission_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL UNIQUE REFERENCES public.programmes(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  estimate_low integer NOT NULL,
  estimate_high integer NOT NULL,
  method text NOT NULL,
  evidence text NOT NULL,
  sample_size integer NOT NULL DEFAULT 0,
  confidence_level text NOT NULL DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.programme_admission_estimates TO anon, authenticated;
GRANT ALL ON public.programme_admission_estimates TO service_role;
ALTER TABLE public.programme_admission_estimates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Estimates are public" ON public.programme_admission_estimates;
CREATE POLICY "Estimates are public" ON public.programme_admission_estimates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage estimates" ON public.programme_admission_estimates;
CREATE POLICY "Admins manage estimates" ON public.programme_admission_estimates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_estimates_updated ON public.programme_admission_estimates;
CREATE TRIGGER trg_estimates_updated BEFORE UPDATE ON public.programme_admission_estimates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.institution_tier_offset(_category text, _type text, _short text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $fn$
  SELECT CASE
    WHEN coalesce(_short,'') IN ('KNUST','UG') THEN 0
    WHEN _category = 'University' AND _type = 'Public' THEN 3
    WHEN _category IN ('Technical University','Professional Institution','College of Agriculture','Regional (West Africa) Institution') THEN 6
    WHEN _category IN ('College of Education','Nursing and Midwifery Training College','Health Training Institution') THEN 7
    ELSE 9
  END;
$fn$;

CREATE OR REPLACE FUNCTION public.refresh_admission_estimates()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE _n integer;
BEGIN
  DELETE FROM public.programme_admission_estimates;

  WITH official AS (
    SELECT p.field, c.cut_off_aggregate AS agg
    FROM public.programme_cutoffs c
    JOIN public.programmes p ON p.id = c.programme_id
    WHERE c.cut_off_aggregate IS NOT NULL
      AND c.verification_status = 'verified'
      AND c.applicant_category = 'First Choice'
      AND coalesce(p.field,'') <> ''
  ),
  field_stats AS (
    SELECT field, count(*)::int AS n,
           round(percentile_cont(0.5) WITHIN GROUP (ORDER BY agg))::int AS med
    FROM official GROUP BY field HAVING count(*) >= 3
  ),
  overall AS (
    SELECT round(percentile_cont(0.5) WITHIN GROUP (ORDER BY agg))::int AS med, count(*)::int AS n FROM official
  ),
  candidates AS (
    SELECT p.id AS programme_id, p.university_id, p.degree_type, p.field,
           u.category, u.type, u.short_name,
           fs.med AS field_med, fs.n AS field_n,
           (SELECT med FROM overall) AS overall_med,
           (SELECT n FROM overall) AS overall_n,
           public.institution_tier_offset(u.category, u.type, u.short_name) AS offset_pts,
           coalesce(nullif(p.entry_requirements,''), nullif(p.wassce_requirements,'')) AS req
    FROM public.programmes p
    JOIN public.universities u ON u.id = p.university_id
    LEFT JOIN field_stats fs ON fs.field = p.field
    WHERE NOT EXISTS (
      SELECT 1 FROM public.programme_cutoffs c
      WHERE c.programme_id = p.id AND c.cut_off_aggregate IS NOT NULL AND c.verification_status = 'verified'
    )
  )
  INSERT INTO public.programme_admission_estimates
    (programme_id, university_id, estimate_low, estimate_high, method, evidence, sample_size, confidence_level)
  SELECT programme_id, university_id,
    GREATEST(6, LEAST(36, low_raw)), GREATEST(6, LEAST(36, high_raw)),
    method, evidence, sample_size, confidence_level
  FROM (
    SELECT c.programme_id, c.university_id,
      CASE WHEN c.degree_type = 'Bachelor' THEN
        (CASE WHEN c.field_med IS NOT NULL THEN c.field_med + c.offset_pts ELSE c.overall_med + c.offset_pts + 2 END) - 2
        ELSE 26 END AS low_raw,
      CASE WHEN c.degree_type = 'Bachelor' THEN
        (CASE WHEN c.field_med IS NOT NULL THEN c.field_med + c.offset_pts ELSE c.overall_med + c.offset_pts + 2 END) + 3
        ELSE 36 END AS high_raw,
      CASE
        WHEN c.degree_type = 'Bachelor' AND c.field_med IS NOT NULL
          THEN 'Median of officially published first-choice cut-offs for ' || c.field ||
               ' programmes, adjusted for this institution''s competitiveness tier.'
        WHEN c.degree_type = 'Bachelor'
          THEN 'Median of all officially published first-choice cut-offs held by GhanaPath, adjusted for this institution''s competitiveness tier.'
        ELSE 'Published minimum entry requirement for ' || c.degree_type ||
             ' programmes (credit passes, C6 or better, in six subjects including the three cores).'
      END AS method,
      CASE
        WHEN c.degree_type = 'Bachelor' AND c.field_med IS NOT NULL
          THEN c.field_n || ' official cut-off records for ' || c.field ||
               coalesce(', plus this programme''s stated requirements: ' || left(c.req, 160), '')
        WHEN c.degree_type = 'Bachelor'
          THEN c.overall_n || ' official cut-off records across all fields'
        ELSE 'Ghanaian ' || c.degree_type || ' admission rules' ||
             coalesce('; programme requirements: ' || left(c.req, 160), '')
      END AS evidence,
      CASE
        WHEN c.degree_type = 'Bachelor' AND c.field_med IS NOT NULL THEN c.field_n
        WHEN c.degree_type = 'Bachelor' THEN c.overall_n
        ELSE 0 END AS sample_size,
      CASE
        WHEN c.degree_type = 'Bachelor' AND coalesce(c.field_n,0) >= 8 THEN 'moderate'
        WHEN c.degree_type = 'Bachelor' THEN 'low'
        ELSE 'moderate' END AS confidence_level
    FROM candidates c
    WHERE (c.degree_type = 'Bachelor' AND (c.field_med IS NOT NULL OR c.overall_n >= 10))
       OR c.degree_type <> 'Bachelor'
  ) s;

  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.refresh_admission_estimates() TO service_role;

SELECT public.refresh_admission_estimates();