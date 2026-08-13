-- Data API grants (were missing entirely -> permission denied on all tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wassce_results TO authenticated;
GRANT ALL ON public.wassce_results TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_items TO authenticated;
GRANT ALL ON public.saved_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_checklist TO authenticated;
GRANT ALL ON public.application_checklist TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deadlines TO authenticated;
GRANT ALL ON public.deadlines TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_preferences TO authenticated;
GRANT ALL ON public.match_preferences TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarship_applications TO authenticated;
GRANT ALL ON public.scholarship_applications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Public catalogues (policies allow anon read)
GRANT SELECT ON public.universities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.universities TO authenticated;
GRANT ALL ON public.universities TO service_role;

GRANT SELECT ON public.programmes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programmes TO authenticated;
GRANT ALL ON public.programmes TO service_role;

GRANT SELECT ON public.scholarships TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarships TO authenticated;
GRANT ALL ON public.scholarships TO service_role;

GRANT SELECT ON public.programme_cutoffs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_cutoffs TO authenticated;
GRANT ALL ON public.programme_cutoffs TO service_role;

GRANT EXECUTE ON FUNCTION public.search_catalogue(text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_parent_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_linked_parent(uuid, uuid) TO authenticated;

-- Prevent duplicate saves per student
CREATE UNIQUE INDEX IF NOT EXISTS saved_items_user_type_key_uidx
  ON public.saved_items (user_id, item_type, item_key);