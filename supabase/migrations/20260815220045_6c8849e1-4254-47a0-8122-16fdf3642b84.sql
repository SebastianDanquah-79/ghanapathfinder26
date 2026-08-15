-- Secure invite code generator
CREATE OR REPLACE FUNCTION public.gen_invite_code()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT upper(replace(gen_random_uuid()::text, '-', '')) || upper(replace(gen_random_uuid()::text, '-', ''));
$$;

REVOKE ALL ON FUNCTION public.gen_invite_code() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.parent_links
  ALTER COLUMN invite_code SET DEFAULT public.gen_invite_code();

UPDATE public.parent_links
SET invite_code = public.gen_invite_code()
WHERE status = 'pending' AND length(invite_code) < 12;

-- Lock down maintenance / admin-only routines
REVOKE ALL ON FUNCTION public.refresh_admission_estimates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_analytics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics() TO authenticated;