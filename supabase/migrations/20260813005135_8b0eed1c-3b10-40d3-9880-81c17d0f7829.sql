
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============ UNIVERSITIES ============
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_name text,
  country text NOT NULL DEFAULT 'Ghana',
  location text,
  region text,
  type text NOT NULL DEFAULT 'Public',
  category text NOT NULL DEFAULT 'University',
  description text,
  website_url text,
  admissions_url text,
  financial_aid_url text,
  logo_url text,
  tuition_range text,
  admission_aggregate text,
  admission_info text,
  scholarship_info text,
  campus_vibe text,
  top_programmes text[] NOT NULL DEFAULT '{}',
  verified boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT universities_name_unique UNIQUE (name),
  CONSTRAINT universities_type_chk CHECK (type IN ('Public','Private')),
  CONSTRAINT universities_website_chk CHECK (website_url IS NULL OR website_url ~* '^https?://[^\s]+$'),
  CONSTRAINT universities_admissions_chk CHECK (admissions_url IS NULL OR admissions_url ~* '^https?://[^\s]+$'),
  CONSTRAINT universities_aid_chk CHECK (financial_aid_url IS NULL OR financial_aid_url ~* '^https?://[^\s]+$')
);

GRANT SELECT ON public.universities TO anon, authenticated;
GRANT ALL ON public.universities TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.universities TO authenticated;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are publicly readable"
  ON public.universities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage universities"
  ON public.universities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_universities_updated BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_universities_name_trgm ON public.universities USING gin (name gin_trgm_ops);
CREATE INDEX idx_universities_short_trgm ON public.universities USING gin (coalesce(short_name,'') gin_trgm_ops);
CREATE INDEX idx_universities_region ON public.universities (region);
CREATE INDEX idx_universities_type ON public.universities (type);

-- ============ PROGRAMMES ============
CREATE TABLE public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  degree_type text NOT NULL DEFAULT 'Bachelor',
  duration text,
  field text,
  entry_requirements text,
  wassce_requirements text,
  relevant_subjects text[] NOT NULL DEFAULT '{}',
  career_opportunities text[] NOT NULL DEFAULT '{}',
  programme_url text,
  application_url text,
  verified boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programmes_unique_per_university UNIQUE (university_id, name),
  CONSTRAINT programmes_url_chk CHECK (programme_url IS NULL OR programme_url ~* '^https?://[^\s]+$'),
  CONSTRAINT programmes_app_url_chk CHECK (application_url IS NULL OR application_url ~* '^https?://[^\s]+$')
);

GRANT SELECT ON public.programmes TO anon, authenticated;
GRANT ALL ON public.programmes TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.programmes TO authenticated;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programmes are publicly readable"
  ON public.programmes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage programmes"
  ON public.programmes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_programmes_updated BEFORE UPDATE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_programmes_name_trgm ON public.programmes USING gin (name gin_trgm_ops);
CREATE INDEX idx_programmes_university ON public.programmes (university_id);
CREATE INDEX idx_programmes_field ON public.programmes (field);

-- ============ SCHOLARSHIPS ============
CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  provider text,
  type text NOT NULL DEFAULT 'Private',
  description text,
  eligibility text,
  nationality_requirement text,
  academic_requirements text,
  deadline_text text,
  deadline_date date,
  funding_type text,
  coverage text,
  location text,
  study_level text,
  fields text[] NOT NULL DEFAULT '{}',
  how_to_apply text,
  website_url text,
  application_url text,
  verified boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scholarships_name_provider_unique UNIQUE (name, provider),
  CONSTRAINT scholarships_website_chk CHECK (website_url IS NULL OR website_url ~* '^https?://[^\s]+$'),
  CONSTRAINT scholarships_app_url_chk CHECK (application_url IS NULL OR application_url ~* '^https?://[^\s]+$')
);

GRANT SELECT ON public.scholarships TO anon, authenticated;
GRANT ALL ON public.scholarships TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.scholarships TO authenticated;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scholarships are publicly readable"
  ON public.scholarships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage scholarships"
  ON public.scholarships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_scholarships_updated BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_scholarships_name_trgm ON public.scholarships USING gin (name gin_trgm_ops);
CREATE INDEX idx_scholarships_deadline ON public.scholarships (deadline_date);

-- ============ SAVED ITEMS: dedupe + indexes ============
DELETE FROM public.saved_items a USING public.saved_items b
  WHERE a.ctid < b.ctid AND a.user_id = b.user_id
    AND a.item_type = b.item_type AND a.item_key = b.item_key;

CREATE UNIQUE INDEX idx_saved_items_unique
  ON public.saved_items (user_id, item_type, item_key);
CREATE INDEX idx_saved_items_user_type ON public.saved_items (user_id, item_type);

-- ============ ADMIN ROLE VISIBILITY ============
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ UNIFIED SEARCH ============
CREATE OR REPLACE FUNCTION public.search_catalogue(
  _q text,
  _kind text DEFAULT 'all',
  _limit int DEFAULT 20,
  _offset int DEFAULT 0
)
RETURNS TABLE (
  kind text,
  id uuid,
  slug text,
  title text,
  subtitle text,
  meta jsonb,
  score real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH q AS (SELECT coalesce(trim(_q), '') AS term)
  SELECT * FROM (
    SELECT 'university'::text AS kind, u.id, u.slug, u.name AS title,
      concat_ws(' • ', u.location, u.type) AS subtitle,
      jsonb_build_object(
        'type', u.type, 'location', u.location, 'region', u.region,
        'website_url', u.website_url, 'admissions_url', u.admissions_url,
        'top_programmes', u.top_programmes, 'verified', u.verified,
        'last_verified_at', u.last_verified_at
      ) AS meta,
      GREATEST(similarity(u.name, (SELECT term FROM q)), similarity(coalesce(u.short_name,''), (SELECT term FROM q)))::real AS score
    FROM public.universities u, q
    WHERE (_kind IN ('all','university'))
      AND (q.term = '' OR u.name ILIKE '%'||q.term||'%' OR coalesce(u.short_name,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.location,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(u.top_programmes) tp WHERE tp ILIKE '%'||q.term||'%')
           OR similarity(u.name, q.term) > 0.25)

    UNION ALL

    SELECT 'programme'::text, p.id, p.slug, p.name,
      concat_ws(' • ', u2.short_name, p.degree_type, p.duration),
      jsonb_build_object(
        'university', u2.name, 'university_slug', u2.slug, 'degree_type', p.degree_type,
        'duration', p.duration, 'entry_requirements', p.entry_requirements,
        'field', p.field, 'application_url', coalesce(p.application_url, u2.admissions_url),
        'programme_url', p.programme_url
      ),
      GREATEST(similarity(p.name, (SELECT term FROM q)), similarity(coalesce(p.field,''), (SELECT term FROM q)))::real
    FROM public.programmes p JOIN public.universities u2 ON u2.id = p.university_id, q
    WHERE (_kind IN ('all','programme'))
      AND (q.term = '' OR p.name ILIKE '%'||q.term||'%' OR coalesce(p.field,'') ILIKE '%'||q.term||'%'
           OR coalesce(p.description,'') ILIKE '%'||q.term||'%'
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
  LIMIT LEAST(coalesce(_limit, 20), 50) OFFSET coalesce(_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.search_catalogue(text, text, int, int) TO anon, authenticated;
