
CREATE OR REPLACE FUNCTION public.apply_programme_information(_programme_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p record;
  lib record;
BEGIN
  SELECT * INTO p FROM public.programmes WHERE id = _programme_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT * INTO lib FROM public.programme_field_library WHERE field = coalesce(p.field, '');
  IF NOT FOUND THEN
    SELECT * INTO lib FROM public.programme_field_library WHERE field = 'General';
  END IF;

  INSERT INTO public.programme_information (
    programme_id, short_bio, description, study_areas, career_opportunities,
    why_choose, job_market, academic_difficulty, content_scope, source, last_updated
  )
  VALUES (
    p.id,
    lib.short_bio,
    coalesce(nullif(p.description, ''), lib.about),
    lib.study_areas,
    (
      SELECT coalesce(array_agg(DISTINCT c), '{}')
      FROM (
        SELECT unnest(coalesce(p.career_opportunities, '{}')) AS c
        UNION
        SELECT jsonb_array_elements(lib.careers) ->> 'occupation'
      ) s
      WHERE c IS NOT NULL AND c <> ''
    ),
    lib.why_choose,
    lib.job_market,
    lib.academic_difficulty,
    CASE WHEN nullif(p.description, '') IS NOT NULL THEN 'institution_and_field' ELSE 'field_typical' END,
    'GhanaPath editorial guidance for ' || coalesce(p.field, 'this field') || '; admission and institution details from the official institution/regulator source.',
    now()
  )
  ON CONFLICT (programme_id) DO UPDATE SET
    short_bio = EXCLUDED.short_bio,
    description = EXCLUDED.description,
    study_areas = EXCLUDED.study_areas,
    career_opportunities = EXCLUDED.career_opportunities,
    why_choose = EXCLUDED.why_choose,
    job_market = EXCLUDED.job_market,
    academic_difficulty = EXCLUDED.academic_difficulty,
    content_scope = EXCLUDED.content_scope,
    source = EXCLUDED.source,
    last_updated = now();

  INSERT INTO public.programme_careers (programme_id, occupation, description, licence_note, salary_data_source, salary_range, salary_period)
  SELECT p.id, c ->> 'occupation', c ->> 'description', c ->> 'note', NULL, NULL, NULL
  FROM jsonb_array_elements(lib.careers) c
  ON CONFLICT (programme_id, occupation) DO UPDATE SET
    description = EXCLUDED.description,
    licence_note = EXCLUDED.licence_note;

  INSERT INTO public.programme_sources (programme_id, source_url, source_type, verification_status, verified_at)
  SELECT p.id, u.url, u.stype, coalesce(p.verification_status, 'verified'), coalesce(p.last_verified_at, now())
  FROM (
    VALUES (nullif(p.programme_url, ''), 'programme_page'),
           (nullif(p.application_url, ''), 'application_page'),
           (nullif(p.source_url, ''), 'institution_or_regulator')
  ) AS u(url, stype)
  WHERE u.url IS NOT NULL
  ON CONFLICT (programme_id, source_url) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_programme_information(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.programmes_autofill_information()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.apply_programme_information(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER programmes_autofill_information_trg
AFTER INSERT OR UPDATE OF field, description, career_opportunities, programme_url, application_url, source_url
ON public.programmes
FOR EACH ROW EXECUTE FUNCTION public.programmes_autofill_information();

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.programmes LOOP
    PERFORM public.apply_programme_information(r.id);
  END LOOP;
END $$;
