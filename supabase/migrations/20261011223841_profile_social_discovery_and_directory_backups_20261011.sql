CREATE SCHEMA IF NOT EXISTS private;

DO $$
BEGIN
  IF to_regclass('private.opportunities_backup_20261011') IS NULL THEN
    EXECUTE 'CREATE TABLE private.opportunities_backup_20261011 AS TABLE public.opportunities';
  END IF;
  IF to_regclass('private.internships_backup_20261011') IS NULL THEN
    EXECUTE 'CREATE TABLE private.internships_backup_20261011 AS TABLE public.internships';
  END IF;
  IF to_regclass('private.scholarships_backup_20261011') IS NULL THEN
    EXECUTE 'CREATE TABLE private.scholarships_backup_20261011 AS TABLE public.scholarships';
  END IF;
  IF to_regclass('private.universities_backup_20261011') IS NULL THEN
    EXECUTE 'CREATE TABLE private.universities_backup_20261011 AS TABLE public.universities';
  END IF;
  IF to_regclass('private.programmes_backup_20261011') IS NULL THEN
    EXECUTE 'CREATE TABLE private.programmes_backup_20261011 AS TABLE public.programmes';
  END IF;
END $$;

REVOKE ALL ON TABLE private.opportunities_backup_20261011 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.internships_backup_20261011 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.scholarships_backup_20261011 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.universities_backup_20261011 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.programmes_backup_20261011 FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS x_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS is_linkedin_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_instagram_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_x_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_whatsapp_public boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_discoverable_updated_at_idx
  ON public.profiles (updated_at DESC)
  WHERE is_discoverable IS TRUE;

CREATE OR REPLACE VIEW public.public_people_directory
WITH (security_barrier = true)
AS
SELECT
  p.id AS user_id,
  COALESCE(NULLIF(BTRIM(p.full_name), ''), 'Community member') AS full_name,
  COALESCE(NULLIF(BTRIM(p.job_title), ''), NULLIF(BTRIM(p.account_role), ''), 'Member') AS professional_title,
  COALESCE(NULLIF(BTRIM(p.city), ''), NULLIF(BTRIM(p.location), '')) AS city,
  COALESCE(p.skills, '{}'::text[]) AS skills,
  NULLIF(BTRIM(p.bio), '') AS bio,
  p.avatar_url,
  CASE
    WHEN p.is_linkedin_public IS TRUE
     AND LOWER(COALESCE(p.linkedin_url, '')) ~ '^https://([a-z0-9-]+\.)?linkedin\.com/'
    THEN p.linkedin_url
    ELSE NULL
  END AS linkedin_url,
  CASE
    WHEN p.is_instagram_public IS TRUE
     AND LOWER(COALESCE(p.instagram_url, '')) ~ '^https://([a-z0-9-]+\.)?instagram\.com/'
    THEN p.instagram_url
    ELSE NULL
  END AS instagram_url,
  CASE
    WHEN p.is_x_public IS TRUE
     AND LOWER(COALESCE(p.x_url, '')) ~ '^https://(x\.com|twitter\.com)/'
    THEN p.x_url
    ELSE NULL
  END AS x_url,
  CASE
    WHEN p.is_whatsapp_public IS TRUE
     AND REGEXP_REPLACE(COALESCE(p.whatsapp_number, ''), '\\D', '', 'g') ~ '^[1-9][0-9]{7,14}$'
    THEN 'https://wa.me/' || REGEXP_REPLACE(p.whatsapp_number, '\\D', '', 'g')
    ELSE NULL
  END AS whatsapp_url,
  p.updated_at
FROM public.profiles p
WHERE p.is_discoverable IS TRUE
  AND NULLIF(BTRIM(p.full_name), '') IS NOT NULL;

GRANT SELECT ON public.public_people_directory TO anon, authenticated;
