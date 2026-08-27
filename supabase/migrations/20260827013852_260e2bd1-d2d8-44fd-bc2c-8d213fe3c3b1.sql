CREATE OR REPLACE FUNCTION public.notify_insight_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author uuid; _parent_author uuid;
BEGIN
  SELECT user_id INTO _author FROM public.student_insights WHERE id = NEW.insight_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (_author, 'New reply on your community post', left(NEW.body, 140), 'community', '/community');
  END IF;
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO _parent_author FROM public.insight_comments WHERE id = NEW.parent_id;
    IF _parent_author IS NOT NULL AND _parent_author <> NEW.user_id AND _parent_author IS DISTINCT FROM _author THEN
      INSERT INTO public.notifications (user_id, title, body, category, link)
      VALUES (_parent_author, 'Someone replied to your comment', left(NEW.body, 140), 'community', '/community');
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_insight_helpful()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author uuid;
BEGIN
  SELECT user_id INTO _author FROM public.student_insights WHERE id = NEW.insight_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (_author, 'Someone found your post helpful', 'Your community post just received a helpful mark.', 'community', '/community');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_comment_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author uuid;
BEGIN
  SELECT user_id INTO _author FROM public.insight_comments WHERE id = NEW.comment_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (_author, 'Someone liked your comment', 'Your comment received a new like.', 'community', '/community');
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.notify_insight_helpful() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_comment_like() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_insight_comment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_insight_comment ON public.insight_comments;
CREATE TRIGGER trg_notify_insight_comment AFTER INSERT ON public.insight_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_insight_comment();

DROP TRIGGER IF EXISTS trg_notify_insight_helpful ON public.insight_helpful;
CREATE TRIGGER trg_notify_insight_helpful AFTER INSERT ON public.insight_helpful
FOR EACH ROW EXECUTE FUNCTION public.notify_insight_helpful();

DROP TRIGGER IF EXISTS trg_notify_comment_like ON public.comment_likes;
CREATE TRIGGER trg_notify_comment_like AFTER INSERT ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_comment_like();

DROP TRIGGER IF EXISTS trg_notify_rating_saved ON public.site_ratings;
CREATE TRIGGER trg_notify_rating_saved AFTER INSERT ON public.site_ratings
FOR EACH ROW EXECUTE FUNCTION public.notify_rating_saved();