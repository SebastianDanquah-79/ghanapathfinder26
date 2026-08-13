
CREATE TABLE public.programme_field_library (
  field text PRIMARY KEY,
  short_bio text NOT NULL,
  about text NOT NULL,
  study_areas text[] NOT NULL DEFAULT '{}',
  why_choose text NOT NULL,
  job_market text NOT NULL,
  academic_difficulty text NOT NULL DEFAULT 'Moderate',
  careers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.programme_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL UNIQUE REFERENCES public.programmes(id) ON DELETE CASCADE,
  short_bio text,
  description text,
  study_areas text[] NOT NULL DEFAULT '{}',
  career_opportunities text[] NOT NULL DEFAULT '{}',
  why_choose text,
  job_market text,
  academic_difficulty text,
  content_scope text NOT NULL DEFAULT 'field_typical',
  source text,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.programme_careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  occupation text NOT NULL,
  description text,
  licence_note text,
  salary_data_source text,
  salary_range text,
  salary_period text,
  salary_experience_level text,
  last_verified timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, occupation)
);

CREATE TABLE public.programme_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_type text NOT NULL DEFAULT 'institution',
  verification_status text NOT NULL DEFAULT 'verified',
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, source_url)
);

CREATE INDEX programme_careers_programme_idx ON public.programme_careers(programme_id);
CREATE INDEX programme_sources_programme_idx ON public.programme_sources(programme_id);

GRANT SELECT ON public.programme_field_library TO anon, authenticated;
GRANT SELECT ON public.programme_information TO anon, authenticated;
GRANT SELECT ON public.programme_careers TO anon, authenticated;
GRANT SELECT ON public.programme_sources TO anon, authenticated;
GRANT ALL ON public.programme_field_library TO service_role;
GRANT ALL ON public.programme_information TO service_role;
GRANT ALL ON public.programme_careers TO service_role;
GRANT ALL ON public.programme_sources TO service_role;

ALTER TABLE public.programme_field_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read field library" ON public.programme_field_library FOR SELECT USING (true);
CREATE POLICY "Public can read programme information" ON public.programme_information FOR SELECT USING (true);
CREATE POLICY "Public can read programme careers" ON public.programme_careers FOR SELECT USING (true);
CREATE POLICY "Public can read programme sources" ON public.programme_sources FOR SELECT USING (true);

CREATE TRIGGER programme_information_updated_at BEFORE UPDATE ON public.programme_information
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER programme_careers_updated_at BEFORE UPDATE ON public.programme_careers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER programme_field_library_updated_at BEFORE UPDATE ON public.programme_field_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
