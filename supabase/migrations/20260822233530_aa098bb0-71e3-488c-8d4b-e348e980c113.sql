CREATE TABLE public.insight_helpful (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id uuid NOT NULL REFERENCES public.student_insights(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (insight_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.insight_helpful TO authenticated;
GRANT ALL ON public.insight_helpful TO service_role;

ALTER TABLE public.insight_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own helpful votes"
  ON public.insight_helpful FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own helpful votes"
  ON public.insight_helpful FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own helpful votes"
  ON public.insight_helpful FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.toggle_insight_helpful(_insight_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _voted boolean;
  _count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.insight_helpful
  WHERE insight_id = _insight_id AND user_id = auth.uid();

  IF FOUND THEN
    _voted := false;
  ELSE
    INSERT INTO public.insight_helpful (insight_id, user_id)
    VALUES (_insight_id, auth.uid())
    ON CONFLICT DO NOTHING;
    _voted := true;
  END IF;

  SELECT count(*)::int INTO _count
  FROM public.insight_helpful WHERE insight_id = _insight_id;

  UPDATE public.student_insights
  SET helpful_count = _count
  WHERE id = _insight_id;

  RETURN jsonb_build_object('voted', _voted, 'helpful_count', _count);
END;
$$;