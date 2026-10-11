CREATE OR REPLACE FUNCTION public.handle_feed_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE owner uuid;
BEGIN
  UPDATE public.feed_posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id
    RETURNING author_id INTO owner;

  IF owner IS NOT NULL AND owner <> NEW.author_id THEN
    INSERT INTO public.notifications(user_id,type,title,body,message,action_url,link)
    VALUES (
      owner,
      'comment',
      'New comment',
      'Someone commented on your innovation post.',
      'Someone commented on your innovation post.',
      '/for-you',
      '/for-you'
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_feed_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE owner uuid;
BEGIN
  SELECT author_id INTO owner FROM public.feed_posts WHERE id = NEW.post_id;
  IF owner IS NOT NULL AND owner <> NEW.user_id THEN
    INSERT INTO public.notifications(user_id,type,title,body,message,action_url,link)
    VALUES (
      owner,
      'like',
      'Your post was liked',
      'Someone liked your innovation post.',
      'Someone liked your innovation post.',
      '/for-you',
      '/for-you'
    );
  END IF;
  RETURN NEW;
END;
$function$;
