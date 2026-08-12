REVOKE ALL ON FUNCTION public.accept_parent_invite(text) FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;