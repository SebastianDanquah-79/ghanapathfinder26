CREATE OR REPLACE FUNCTION public.toggle_feed_like(p_post_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); liked boolean;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF EXISTS (SELECT 1 FROM public.feed_likes WHERE user_id=uid AND post_id=p_post_id) THEN
   DELETE FROM public.feed_likes WHERE user_id=uid AND post_id=p_post_id;
   UPDATE public.feed_posts SET likes_count=GREATEST(COALESCE(likes_count,0)-1,0) WHERE id=p_post_id;
   RETURN false;
 ELSE
   INSERT INTO public.feed_likes(user_id,post_id) VALUES(uid,p_post_id);
   UPDATE public.feed_posts SET likes_count=COALESCE(likes_count,0)+1 WHERE id=p_post_id;
   RETURN true;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.toggle_feed_like(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.toggle_feed_like(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_feed_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid;
BEGIN
 UPDATE public.feed_posts SET comments_count=COALESCE(comments_count,0)+1 WHERE id=NEW.post_id RETURNING author_id INTO owner;
 IF owner IS NOT NULL AND owner <> NEW.author_id THEN
   INSERT INTO public.notifications(user_id,type,title,body,message,action_url,link)
   VALUES(owner,'comment','New comment','Someone commented on your innovation post.','Someone commented on your innovation post.','/feed','/feed');
 END IF;
 RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS feed_comment_count_notify ON public.feed_comments;
CREATE TRIGGER feed_comment_count_notify AFTER INSERT ON public.feed_comments FOR EACH ROW EXECUTE FUNCTION public.handle_feed_comment();

CREATE OR REPLACE FUNCTION public.handle_feed_like_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid;
BEGIN
 SELECT author_id INTO owner FROM public.feed_posts WHERE id=NEW.post_id;
 IF owner IS NOT NULL AND owner <> NEW.user_id THEN
   INSERT INTO public.notifications(user_id,type,title,body,message,action_url,link)
   VALUES(owner,'like','Your post was liked','Someone liked your innovation post.','Someone liked your innovation post.','/feed','/feed');
 END IF;
 RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS feed_like_notify ON public.feed_likes;
CREATE TRIGGER feed_like_notify AFTER INSERT ON public.feed_likes FOR EACH ROW EXECUTE FUNCTION public.handle_feed_like_notification();

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='feed-videos') THEN
   INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('feed-videos','feed-videos',true,104857600);
 END IF;
END $$;
