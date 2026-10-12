-- Make source-linked programme catalogue entries discoverable without falsely verifying them.
-- Records still marked needs_review remain visibly "Not verified" in the UI.
DROP POLICY IF EXISTS programmes_public_read_verified ON public.programmes;

CREATE POLICY programmes_public_read_catalogued
ON public.programmes
FOR SELECT
TO anon, authenticated
USING (
  (
    COALESCE(needs_review, false) = false
    AND COALESCE(verification_status, 'verified') = 'verified'
  )
  OR (
    COALESCE(needs_review, false) = true
    AND verification_status IN (
      'source_linked_needs_individual_review',
      'official_catalogue_linked_needs_individual_review',
      'official_source_linked_needs_individual_review'
    )
    AND NULLIF(BTRIM(source_url), '') IS NOT NULL
    AND university_id IS NOT NULL
  )
);
