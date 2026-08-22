-- Comments on student insights (Facebook-style discussion)
CREATE TABLE public.insight_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid NOT NULL REFERENCES public.student_insights(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.insight_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_label text NOT NULL DEFAULT 'Student',
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  like_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_insight_comments_insight ON public.insight_comments(insight_id, created_at);
CREATE INDEX idx_insight_comments_parent ON public.insight_comments(parent_id);

GRANT SELECT ON public.insight_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_comments TO authenticated;
GRANT ALL ON public.insight_comments TO service_role;

ALTER TABLE public.insight_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved comments"
  ON public.insight_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can add their own comments"
  ON public.insight_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments"
  ON public.insight_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.insight_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate comments"
  ON public.insight_comments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_insight_comments_updated_at
  BEFORE UPDATE ON public.insight_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes on comments
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.insight_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.comment_likes TO authenticated;
GRANT ALL ON public.comment_likes TO service_role;

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own comment likes"
  ON public.comment_likes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.toggle_comment_like(_comment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _existing uuid;
  _count integer;
  _liked boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Sign in to like a comment';
  END IF;

  SELECT id INTO _existing FROM public.comment_likes
   WHERE comment_id = _comment_id AND user_id = _uid;

  IF _existing IS NULL THEN
    INSERT INTO public.comment_likes (comment_id, user_id) VALUES (_comment_id, _uid);
    _liked := true;
  ELSE
    DELETE FROM public.comment_likes WHERE id = _existing;
    _liked := false;
  END IF;

  SELECT count(*) INTO _count FROM public.comment_likes WHERE comment_id = _comment_id;
  UPDATE public.insight_comments SET like_count = _count WHERE id = _comment_id;

  RETURN jsonb_build_object('liked', _liked, 'like_count', _count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_comment_like(uuid) TO authenticated;

-- Populate university logos from their official website domains
UPDATE public.universities
SET logo_url = 'https://icons.duckduckgo.com/ip3/' ||
  regexp_replace(regexp_replace(website_url, '^https?://', ''), '/.*$', '') || '.ico'
WHERE website_url IS NOT NULL
  AND website_url <> ''
  AND (logo_url IS NULL OR logo_url = '');

UPDATE public.companies
SET logo_url = 'https://icons.duckduckgo.com/ip3/' ||
  regexp_replace(regexp_replace(website_url, '^https?://', ''), '/.*$', '') || '.ico'
WHERE website_url IS NOT NULL
  AND website_url <> ''
  AND (logo_url IS NULL OR logo_url = '');