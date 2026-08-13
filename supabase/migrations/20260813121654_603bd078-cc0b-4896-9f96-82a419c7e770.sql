
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS accreditation_status text NOT NULL DEFAULT 'Needs Verification',
  ADD COLUMN IF NOT EXISTS aliases text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ownership text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';

ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS academic_year text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS faculty_id uuid;

CREATE TABLE IF NOT EXISTS public.faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, name)
);
GRANT SELECT ON public.faculties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculties TO authenticated;
GRANT ALL ON public.faculties TO service_role;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculties are publicly readable" ON public.faculties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage faculties" ON public.faculties FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_faculties_updated BEFORE UPDATE ON public.faculties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  campus_name text NOT NULL,
  location text,
  region text,
  accreditation_status text NOT NULL DEFAULT 'Needs Verification',
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, campus_name)
);
GRANT SELECT ON public.campuses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campuses TO authenticated;
GRANT ALL ON public.campuses TO service_role;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campuses are publicly readable" ON public.campuses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage campuses" ON public.campuses FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_campuses_updated BEFORE UPDATE ON public.campuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  source_url text NOT NULL,
  source_name text,
  source_type text NOT NULL DEFAULT 'official',
  verification_status text NOT NULL DEFAULT 'verified',
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_data_sources_record ON public.data_sources (record_type, record_id);
GRANT SELECT ON public.data_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_sources TO authenticated;
GRANT ALL ON public.data_sources TO service_role;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources are publicly readable" ON public.data_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage sources" ON public.data_sources FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_data_sources_updated BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.programme_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  required_subject text NOT NULL,
  minimum_grade text,
  aggregate_requirement integer,
  additional_requirement text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prog_req_programme ON public.programme_requirements (programme_id);
GRANT SELECT ON public.programme_requirements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_requirements TO authenticated;
GRANT ALL ON public.programme_requirements TO service_role;
ALTER TABLE public.programme_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programme requirements are publicly readable" ON public.programme_requirements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage programme requirements" ON public.programme_requirements FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_prog_req_updated BEFORE UPDATE ON public.programme_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.programmes
  ADD CONSTRAINT programmes_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_universities_trgm_name ON public.universities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programmes_trgm_name ON public.programmes USING gin (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.find_duplicate_institution(_name text)
RETURNS TABLE(id uuid, name text, slug text, similarity real)
LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  SELECT u.id, u.name, u.slug, similarity(u.name, _name)::real
  FROM public.universities u
  WHERE lower(u.name) = lower(trim(_name))
     OR lower(coalesce(u.short_name,'')) = lower(trim(_name))
     OR EXISTS (SELECT 1 FROM unnest(u.aliases) a WHERE lower(a) = lower(trim(_name)))
     OR similarity(u.name, _name) > 0.55
  ORDER BY 4 DESC
  LIMIT 5;
$$;

CREATE OR REPLACE FUNCTION public.search_catalogue(_q text, _kind text DEFAULT 'all'::text, _limit integer DEFAULT 20, _offset integer DEFAULT 0)
 RETURNS TABLE(kind text, id uuid, slug text, title text, subtitle text, meta jsonb, score real)
 LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT coalesce(trim(_q), '') AS term)
  SELECT * FROM (
    SELECT 'university'::text AS kind, u.id, u.slug, u.name AS title,
      concat_ws(' • ', u.location, u.region, u.category) AS subtitle,
      jsonb_build_object(
        'type', u.type, 'category', u.category, 'location', u.location, 'region', u.region,
        'website_url', u.website_url, 'admissions_url', u.admissions_url,
        'top_programmes', u.top_programmes, 'verified', u.verified,
        'accreditation_status', u.accreditation_status,
        'source_url', u.source_url,
        'last_verified_at', u.last_verified_at
      ) AS meta,
      GREATEST(similarity(u.name, (SELECT term FROM q)), similarity(coalesce(u.short_name,''), (SELECT term FROM q)))::real AS score
    FROM public.universities u, q
    WHERE (_kind IN ('all','university'))
      AND (q.term = '' OR u.name ILIKE '%'||q.term||'%' OR coalesce(u.short_name,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.location,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.region,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.category,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.type,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(u.aliases) al WHERE al ILIKE '%'||q.term||'%')
           OR EXISTS (SELECT 1 FROM unnest(u.top_programmes) tp WHERE tp ILIKE '%'||q.term||'%')
           OR similarity(u.name, q.term) > 0.25)

    UNION ALL

    SELECT 'programme'::text, p.id, p.slug, p.name,
      concat_ws(' • ', coalesce(u2.short_name, u2.name), p.degree_type, u2.location),
      jsonb_build_object(
        'university', u2.name, 'university_slug', u2.slug, 'degree_type', p.degree_type,
        'duration', p.duration, 'entry_requirements', p.entry_requirements,
        'field', p.field, 'application_url', coalesce(p.application_url, u2.admissions_url),
        'programme_url', p.programme_url, 'qualification', p.qualification,
        'region', u2.region, 'location', u2.location,
        'verification_status', p.verification_status, 'source_url', p.source_url
      ),
      GREATEST(similarity(p.name, (SELECT term FROM q)), similarity(coalesce(p.field,''), (SELECT term FROM q)))::real
    FROM public.programmes p JOIN public.universities u2 ON u2.id = p.university_id, q
    WHERE (_kind IN ('all','programme'))
      AND (q.term = '' OR p.name ILIKE '%'||q.term||'%' OR coalesce(p.field,'') ILIKE '%'||q.term||'%'
           OR coalesce(p.description,'') ILIKE '%'||q.term||'%'
           OR coalesce(u2.location,'') ILIKE '%'||q.term||'%'
           OR coalesce(u2.region,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(p.relevant_subjects) rs WHERE rs ILIKE '%'||q.term||'%')
           OR similarity(p.name, q.term) > 0.25)

    UNION ALL

    SELECT 'scholarship'::text, s.id, s.slug, s.name,
      concat_ws(' • ', s.provider, s.coverage),
      jsonb_build_object(
        'provider', s.provider, 'eligibility', s.eligibility, 'deadline_text', s.deadline_text,
        'deadline_date', s.deadline_date, 'coverage', s.coverage, 'study_level', s.study_level,
        'application_url', coalesce(s.application_url, s.website_url), 'verified', s.verified,
        'last_verified_at', s.last_verified_at
      ),
      GREATEST(similarity(s.name, (SELECT term FROM q)), similarity(coalesce(s.provider,''), (SELECT term FROM q)))::real
    FROM public.scholarships s, q
    WHERE (_kind IN ('all','scholarship'))
      AND (q.term = '' OR s.name ILIKE '%'||q.term||'%' OR coalesce(s.provider,'') ILIKE '%'||q.term||'%'
           OR coalesce(s.eligibility,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(s.fields) f WHERE f ILIKE '%'||q.term||'%')
           OR similarity(s.name, q.term) > 0.25)
  ) r
  ORDER BY r.score DESC NULLS LAST, r.title ASC
  LIMIT LEAST(coalesce(_limit, 200), 200) OFFSET coalesce(_offset, 0);
$function$;
