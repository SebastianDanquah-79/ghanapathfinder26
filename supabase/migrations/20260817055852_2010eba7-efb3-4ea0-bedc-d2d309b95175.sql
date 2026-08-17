REVOKE EXECUTE ON FUNCTION public.refresh_usage_counters() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_refresh_usage_counters() FROM anon, authenticated, PUBLIC;