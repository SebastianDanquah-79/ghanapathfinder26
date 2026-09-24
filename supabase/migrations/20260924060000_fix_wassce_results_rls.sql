-- Fix the onboarding write path for WASSCE results.
-- The table already exists and contains user data; this migration only adds
-- least-privilege per-user RLS policies and indexes used by the save flow.

ALTER TABLE public.wassce_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own WASSCE results" ON public.wassce_results;
DROP POLICY IF EXISTS "Users can insert own WASSCE results" ON public.wassce_results;
DROP POLICY IF EXISTS "Users can update own WASSCE results" ON public.wassce_results;
DROP POLICY IF EXISTS "Users can delete own WASSCE results" ON public.wassce_results;

CREATE POLICY "Users can select own WASSCE results"
  ON public.wassce_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own WASSCE results"
  ON public.wassce_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own WASSCE results"
  ON public.wassce_results FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own WASSCE results"
  ON public.wassce_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wassce_results_user_id
  ON public.wassce_results(user_id);