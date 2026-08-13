ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS gtec_category TEXT,
  ADD COLUMN IF NOT EXISTS accreditation_start_date DATE,
  ADD COLUMN IF NOT EXISTS accreditation_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_mode TEXT NOT NULL DEFAULT 'On campus';

CREATE INDEX IF NOT EXISTS idx_universities_gtec_category ON public.universities (gtec_category);
CREATE INDEX IF NOT EXISTS idx_universities_accreditation_expiry ON public.universities (accreditation_expiry_date);