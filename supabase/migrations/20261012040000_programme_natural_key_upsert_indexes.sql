-- Programme imports use institution-scoped natural keys.
-- Current catalogue audit found no duplicate (university_id, slug) or
-- (university_id, name) pairs, so these indexes are safe to add.
-- Import scripts can now use either ON CONFLICT (university_id, slug)
-- or ON CONFLICT (university_id, name) DO UPDATE/NOTHING.
CREATE UNIQUE INDEX IF NOT EXISTS programmes_university_slug_uidx
  ON public.programmes (university_id, slug);

CREATE UNIQUE INDEX IF NOT EXISTS programmes_university_name_uidx
  ON public.programmes (university_id, name);

NOTIFY pgrst, 'reload schema';
