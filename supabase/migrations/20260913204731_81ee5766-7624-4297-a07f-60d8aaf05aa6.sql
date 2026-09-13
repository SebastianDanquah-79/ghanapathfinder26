-- 1. Review/enrichment columns on existing catalogue
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS institution_type text,
  ADD COLUMN IF NOT EXISTS gtec_accreditation_status text,
  ADD COLUMN IF NOT EXISTS logo_source_url text,
  ADD COLUMN IF NOT EXISTS google_place_id text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_urls text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS mode text,
  ADD COLUMN IF NOT EXISTS admission_summary text,
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_urls text[] NOT NULL DEFAULT '{}';

-- 2. Mirror institutions table (schema as specified)
CREATE TABLE IF NOT EXISTS public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL,
  official_name text NOT NULL,
  institution_type text NOT NULL,
  gtec_accreditation_status text,
  region text,
  town text,
  website_url text,
  logo_source_url text,
  google_place_id text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  short_description text,
  needs_review boolean NOT NULL DEFAULT true,
  last_verified_at timestamptz,
  source_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.institutions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institutions are publicly readable" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Admins manage institutions" ON public.institutions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_institutions_updated BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Internship providers
CREATE TABLE IF NOT EXISTS public.internship_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text,
  provider_type text,
  website_url text,
  logo_source_url text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  programme_summary text,
  application_url text,
  paid boolean,
  source_urls text[] NOT NULL DEFAULT '{}',
  last_verified_at timestamptz,
  needs_review boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.internship_providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internship_providers TO authenticated;
GRANT ALL ON public.internship_providers TO service_role;
ALTER TABLE public.internship_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Internship providers are publicly readable" ON public.internship_providers FOR SELECT USING (true);
CREATE POLICY "Admins manage internship providers" ON public.internship_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_internship_providers_updated BEFORE UPDATE ON public.internship_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Skill providers
CREATE TABLE IF NOT EXISTS public.skill_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  course_name text,
  skill_area text,
  format text,
  duration text,
  cost text,
  certification_issued_by text,
  application_url text,
  source_urls text[] NOT NULL DEFAULT '{}',
  last_verified_at timestamptz,
  needs_review boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skill_providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_providers TO authenticated;
GRANT ALL ON public.skill_providers TO service_role;
ALTER TABLE public.skill_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skill providers are publicly readable" ON public.skill_providers FOR SELECT USING (true);
CREATE POLICY "Admins manage skill providers" ON public.skill_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_skill_providers_updated BEFORE UPDATE ON public.skill_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Public corrections queue
CREATE TABLE IF NOT EXISTS public.corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  row_id uuid,
  row_label text,
  note text NOT NULL,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.corrections TO anon;
GRANT SELECT, INSERT, UPDATE ON public.corrections TO authenticated;
GRANT ALL ON public.corrections TO service_role;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can flag a listing" ON public.corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read corrections" ON public.corrections FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins resolve corrections" ON public.corrections FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_corrections_updated BEFORE UPDATE ON public.corrections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_universities_needs_review ON public.universities(needs_review) WHERE needs_review;
CREATE INDEX IF NOT EXISTS idx_programmes_needs_review ON public.programmes(needs_review) WHERE needs_review;
CREATE INDEX IF NOT EXISTS idx_corrections_open ON public.corrections(resolved, submitted_at DESC);