-- Match the client upsert's ON CONFLICT (field) target.
-- A unique expression index on lower(trim(field)) is not inferable from ON CONFLICT (field).
-- The table was checked and is empty at the time this constraint was applied.
ALTER TABLE public.programme_field_library
  ADD CONSTRAINT programme_field_library_field_key UNIQUE (field);

NOTIFY pgrst, 'reload schema';
