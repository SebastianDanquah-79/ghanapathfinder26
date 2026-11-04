
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS institution_profile jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.universities'::regclass
      AND conname='universities_institution_profile_object_check'
  ) THEN
    ALTER TABLE public.universities
      ADD CONSTRAINT universities_institution_profile_object_check
      CHECK (jsonb_typeof(institution_profile)='object');
  END IF;
END
$constraint$;

-- Directory-only placeholder biographies are not presented as researched school profiles.
UPDATE public.universities
SET biography=NULL,
    biography_source_url=NULL,
    updated_at=now()
WHERE biography LIKE '%is a public tertiary education institution%'
   OR biography LIKE '%is listed in GhanaPathFinder’s tertiary institution directory as%';
