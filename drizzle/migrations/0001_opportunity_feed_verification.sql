ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';
UPDATE public.opportunities SET verification_status = CASE WHEN verified THEN 'verified' ELSE 'unverified' END;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_verification_status_check CHECK (verification_status IN ('verified','unverified','expired','needs_review'));
CREATE INDEX IF NOT EXISTS opportunities_feed_idx ON public.opportunities (published, is_active, deadline_date);
CREATE INDEX IF NOT EXISTS opportunity_pipeline_user_deadline_idx ON public.opportunity_pipeline (user_id, deadline_date);
-- Tighten: unpublished rows must not be public just because they are active.
DROP POLICY IF EXISTS "Active opportunities are readable" ON public.opportunities;