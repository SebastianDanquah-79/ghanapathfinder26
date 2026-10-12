-- Make field-library upserts target a real, deterministic unique index.
-- Existing table is empty at migration time; normalized uniqueness prevents
-- duplicates caused only by case or surrounding whitespace.
CREATE UNIQUE INDEX IF NOT EXISTS programme_field_library_field_normalized_uidx
ON public.programme_field_library (lower(btrim(field)));
