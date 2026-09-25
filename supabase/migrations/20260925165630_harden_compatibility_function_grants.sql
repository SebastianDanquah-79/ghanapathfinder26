-- Security hardening for compatibility RPCs.
alter function public.search_catalogue(text,text,integer,integer) security invoker;
alter function public.find_duplicate_institution(text) security invoker;
alter function public.accept_parent_invite(text) security invoker;
revoke execute on function public.accept_parent_invite(text) from anon;
revoke execute on function public.find_duplicate_institution(text) from anon;
revoke execute on function public.toggle_comment_like(uuid) from anon;
revoke execute on function public.toggle_insight_helpful(uuid) from anon;
