CREATE OR REPLACE FUNCTION public.maintain_feed_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts
      SET likes_count = COALESCE(likes_count, 0) + 1
      WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE public.feed_posts
    SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
    WHERE id = OLD.post_id;
  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS feed_like_count_update ON public.feed_likes;
CREATE TRIGGER feed_like_count_update
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION public.maintain_feed_like_count();

CREATE OR REPLACE FUNCTION public.maintain_feed_comment_count_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.feed_posts
    SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1)
    WHERE id = OLD.post_id;
  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS feed_comment_count_on_delete ON public.feed_comments;
CREATE TRIGGER feed_comment_count_on_delete
AFTER DELETE ON public.feed_comments
FOR EACH ROW EXECUTE FUNCTION public.maintain_feed_comment_count_on_delete();
