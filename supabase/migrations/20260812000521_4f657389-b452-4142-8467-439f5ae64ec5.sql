CREATE TABLE public.scholarship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_name text NOT NULL,
  provider text,
  status text NOT NULL DEFAULT 'interested',
  deadline date,
  link text,
  notes text,
  submitted_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarship_applications TO authenticated;
GRANT ALL ON public.scholarship_applications TO service_role;

ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own applications" ON public.scholarship_applications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parent reads applications" ON public.scholarship_applications
  FOR SELECT TO authenticated
  USING (public.is_linked_parent(auth.uid(), user_id));

CREATE TRIGGER trg_scholarship_apps_updated
  BEFORE UPDATE ON public.scholarship_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.match_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'Undergraduate',
  field text NOT NULL DEFAULT 'Any',
  region text,
  need_based boolean NOT NULL DEFAULT true,
  gender text NOT NULL DEFAULT 'Prefer not to say',
  funding_types text[] NOT NULL DEFAULT '{}'::text[],
  min_coverage text NOT NULL DEFAULT 'Any',
  study_abroad boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_preferences TO authenticated;
GRANT ALL ON public.match_preferences TO service_role;

ALTER TABLE public.match_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own preferences" ON public.match_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parent reads preferences" ON public.match_preferences
  FOR SELECT TO authenticated
  USING (public.is_linked_parent(auth.uid(), user_id));

CREATE TRIGGER trg_match_prefs_updated
  BEFORE UPDATE ON public.match_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.accept_parent_invite(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link public.parent_links%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _link
  FROM public.parent_links
  WHERE upper(invite_code) = upper(trim(_code))
    AND status <> 'revoked'
  LIMIT 1;

  IF _link.id IS NULL THEN
    RAISE EXCEPTION 'Invite code not found';
  END IF;

  IF _link.student_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot link to your own account';
  END IF;

  IF _link.parent_id IS NOT NULL AND _link.parent_id <> auth.uid() THEN
    RAISE EXCEPTION 'This code has already been used';
  END IF;

  UPDATE public.parent_links
  SET parent_id = auth.uid(), status = 'accepted'
  WHERE id = _link.id;

  RETURN _link.student_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_parent_invite(text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_parent_invite(text) TO authenticated;