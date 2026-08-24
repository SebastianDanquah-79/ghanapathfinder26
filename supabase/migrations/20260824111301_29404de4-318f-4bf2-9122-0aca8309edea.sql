CREATE TABLE public.site_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_ratings TO authenticated;
GRANT ALL ON public.site_ratings TO service_role;

ALTER TABLE public.site_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own site rating"
ON public.site_ratings FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_site_ratings_updated_at
BEFORE UPDATE ON public.site_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.site_rating_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'average', COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
    'count', COUNT(*)
  )
  FROM public.site_ratings;
$$;

GRANT EXECUTE ON FUNCTION public.site_rating_summary() TO anon, authenticated;