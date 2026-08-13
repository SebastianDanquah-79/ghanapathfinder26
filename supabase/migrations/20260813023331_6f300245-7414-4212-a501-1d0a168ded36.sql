CREATE TABLE public.programme_cutoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  programme_id uuid REFERENCES public.programmes(id) ON DELETE SET NULL,
  programme_name text NOT NULL,
  academic_year text NOT NULL,
  applicant_category text NOT NULL DEFAULT 'First Choice',
  cut_off_aggregate integer,
  subject_requirements text,
  minimum_grades jsonb NOT NULL DEFAULT '{}'::jsonb,
  admission_notes text,
  official_source_url text,
  source_name text,
  source_type text NOT NULL DEFAULT 'official_university',
  last_verified_at timestamptz,
  verification_status text NOT NULL DEFAULT 'unverified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programme_cutoffs_status_chk CHECK (verification_status IN ('verified','needs_review','outdated','unverified')),
  CONSTRAINT programme_cutoffs_aggregate_chk CHECK (cut_off_aggregate IS NULL OR (cut_off_aggregate BETWEEN 6 AND 60))
);

GRANT SELECT ON public.programme_cutoffs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_cutoffs TO authenticated;
GRANT ALL ON public.programme_cutoffs TO service_role;

ALTER TABLE public.programme_cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cut-offs are publicly readable"
  ON public.programme_cutoffs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage cut-offs"
  ON public.programme_cutoffs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE UNIQUE INDEX programme_cutoffs_unique_idx
  ON public.programme_cutoffs (university_id, lower(programme_name), academic_year, applicant_category);

CREATE INDEX programme_cutoffs_university_idx ON public.programme_cutoffs (university_id);
CREATE INDEX programme_cutoffs_name_trgm_idx ON public.programme_cutoffs USING gin (programme_name gin_trgm_ops);

CREATE TRIGGER trg_programme_cutoffs_updated
  BEFORE UPDATE ON public.programme_cutoffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();