CREATE TABLE IF NOT EXISTS public.active_sessions (
  session_id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS active_sessions_last_seen_idx ON public.active_sessions (last_seen);
CREATE INDEX IF NOT EXISTS active_sessions_user_idx ON public.active_sessions (user_id);

GRANT ALL ON public.active_sessions TO service_role;

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- No direct policies: all access goes through the security-definer functions below.

CREATE OR REPLACE FUNCTION public.heartbeat_session(_session_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _live integer;
BEGIN
  IF coalesce(trim(_session_id), '') = '' OR length(_session_id) > 100 THEN
    RAISE EXCEPTION 'Invalid session id';
  END IF;

  INSERT INTO public.active_sessions (session_id, user_id, last_seen)
  VALUES (_session_id, auth.uid(), now())
  ON CONFLICT (session_id) DO UPDATE
    SET last_seen = now(), user_id = auth.uid();

  DELETE FROM public.active_sessions WHERE last_seen < now() - interval '10 minutes';

  SELECT count(*)::int INTO _live FROM (
    SELECT DISTINCT coalesce('u:' || user_id::text, 's:' || session_id)
    FROM public.active_sessions
    WHERE last_seen > now() - interval '90 seconds'
  ) x;

  RETURN _live;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_session(_session_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.active_sessions WHERE session_id = _session_id;
$$;

CREATE OR REPLACE FUNCTION public.live_presence()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'live_now', (
      SELECT count(*)::int FROM (
        SELECT DISTINCT coalesce('u:' || user_id::text, 's:' || session_id)
        FROM public.active_sessions
        WHERE last_seen > now() - interval '90 seconds'
      ) x
    ),
    'total_users', (SELECT count(*)::int FROM public.profiles)
  );
$$;

GRANT EXECUTE ON FUNCTION public.heartbeat_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.end_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_presence() TO anon, authenticated;