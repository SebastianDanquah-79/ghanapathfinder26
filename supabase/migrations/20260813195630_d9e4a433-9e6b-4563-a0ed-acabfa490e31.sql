
REVOKE ALL ON FUNCTION public.apply_programme_information(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_programme_information(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.apply_programme_information(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.programmes_autofill_information() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.programmes_autofill_information() FROM anon;
REVOKE ALL ON FUNCTION public.programmes_autofill_information() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_programme_information(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.programmes_autofill_information() TO service_role;
