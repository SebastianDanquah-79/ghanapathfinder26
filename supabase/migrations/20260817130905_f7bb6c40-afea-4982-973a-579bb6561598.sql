CREATE OR REPLACE FUNCTION public.heartbeat_session(_session_id text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _live integer;
BEGIN
  IF coalesce(trim(_session_id), '') = '' OR length(_session_id) > 100 THEN
    RAISE EXCEPTION 'Invalid session id';
  END IF;

  INSERT INTO public.active_sessions (session_id, user_id, last_seen)
  VALUES (_session_id, auth.uid(), now())
  ON CONFLICT (session_id) DO UPDATE
    SET last_seen = now(), user_id = auth.uid();

  DELETE FROM public.active_sessions WHERE last_seen < now() - interval '30 minutes';

  SELECT count(*)::int INTO _live FROM (
    SELECT DISTINCT coalesce('u:' || user_id::text, 's:' || session_id)
    FROM public.active_sessions
    WHERE last_seen > now() - interval '5 minutes'
  ) x;

  RETURN _live;
END;
$function$;

CREATE OR REPLACE FUNCTION public.live_presence()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'live_now', (
      SELECT count(*)::int FROM (
        SELECT DISTINCT coalesce('u:' || user_id::text, 's:' || session_id)
        FROM public.active_sessions
        WHERE last_seen > now() - interval '5 minutes'
      ) x
    ),
    'total_users', (SELECT count(*)::int FROM public.profiles)
  );
$function$;

GRANT EXECUTE ON FUNCTION public.live_presence() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.end_session(text) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS active_sessions_last_seen_idx ON public.active_sessions (last_seen);