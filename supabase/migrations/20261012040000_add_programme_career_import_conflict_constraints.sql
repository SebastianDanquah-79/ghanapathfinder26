-- Natural keys for safe idempotent catalogue imports.
-- Current programme catalogue was checked for duplicate (university_id, name, qualification) groups.
-- Slugs are intentionally not used as conflict keys because the existing catalogue has repeated slugs.
ALTER TABLE public.programmes
  ADD CONSTRAINT programmes_university_name_qualification_key
  UNIQUE (university_id, name, qualification);

ALTER TABLE public.programme_careers
  ADD CONSTRAINT programme_careers_programme_id_career_key
  UNIQUE (programme_id, career);

NOTIFY pgrst, 'reload schema';
