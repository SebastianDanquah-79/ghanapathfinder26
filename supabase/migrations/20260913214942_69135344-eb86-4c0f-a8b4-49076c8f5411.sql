ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS logo_verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS logo_verified_at timestamp with time zone;

ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS logo_verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS logo_verified_at timestamp with time zone;

COMMENT ON COLUMN public.universities.logo_verification_status IS 'Review state for the institution logo: unverified, needs_review, verified, or rejected.';
COMMENT ON COLUMN public.institutions.logo_verification_status IS 'Review state for the institution logo: unverified, needs_review, verified, or rejected.';