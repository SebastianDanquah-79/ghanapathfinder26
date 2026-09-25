-- Restrict compatibility RPC execution to intended client roles.
alter function public.search_catalogue(text,text,integer,integer) security invoker;
alter function public.find_duplicate_institution(text) security invoker;
alter function public.accept_parent_invite(text) security invoker;
revoke execute on function public.accept_parent_invite(text) from public, anon;
grant execute on function public.accept_parent_invite(text) to authenticated;
revoke execute on function public.find_duplicate_institution(text) from public, anon;
grant execute on function public.find_duplicate_institution(text) to authenticated;
revoke execute on function public.toggle_comment_like(uuid) from public, anon;
grant execute on function public.toggle_comment_like(uuid) to authenticated;
revoke execute on function public.toggle_insight_helpful(uuid) from public, anon;
grant execute on function public.toggle_insight_helpful(uuid) to authenticated;
