-- Persist the security hardening applied to the live Supabase project.
-- Keep analytics readable while preventing privilege escalation through views/RPCs.

ALTER VIEW public.university_platform_analytics SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.handle_feed_comment() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_feed_like_notification() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_feed_like(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.handle_feed_comment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_feed_like_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_feed_like(uuid) TO authenticated;
