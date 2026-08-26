
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  category text NOT NULL DEFAULT 'general',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

CREATE TRIGGER trg_notifications_updated
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify on rating saved
CREATE OR REPLACE FUNCTION public.notify_rating_saved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, category, link)
  VALUES (
    NEW.user_id,
    'Thanks for rating GhanaPathFinder',
    'You rated GhanaPathFinder ' || NEW.rating || ' out of 5. You can update your rating any time.',
    'rating',
    '/'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_site_ratings_notify
  AFTER INSERT OR UPDATE OF rating ON public.site_ratings
  FOR EACH ROW EXECUTE FUNCTION public.notify_rating_saved();

-- Notify insight author on new comment
CREATE OR REPLACE FUNCTION public.notify_insight_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _author uuid;
BEGIN
  SELECT user_id INTO _author FROM public.student_insights WHERE id = NEW.insight_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (
      _author,
      'New reply on your community post',
      left(NEW.body, 140),
      'community',
      '/community'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_insight_comments_notify
  AFTER INSERT ON public.insight_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_insight_comment();

ALTER TABLE public.site_ratings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
