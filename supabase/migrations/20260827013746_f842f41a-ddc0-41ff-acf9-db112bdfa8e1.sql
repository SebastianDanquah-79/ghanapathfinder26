GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_ratings TO authenticated;
GRANT ALL ON public.site_ratings TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;