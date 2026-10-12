-- Normalize unknown qualification values so the programme natural key works with ON CONFLICT.
-- Empty means "not supplied"; it is not a claim about the qualification awarded.
UPDATE public.programmes
SET qualification = ''
WHERE qualification IS NULL;

ALTER TABLE public.programmes
  ALTER COLUMN qualification SET DEFAULT '',
  ALTER COLUMN qualification SET NOT NULL;

NOTIFY pgrst, 'reload schema';
