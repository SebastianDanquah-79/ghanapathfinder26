-- Production opportunity write-policy hardening.
-- Keeps the existing opportunities schema and adds safe defaults/policies for employer posting.

ALTER TABLE public.opportunities
  ALTER COLUMN opportunity_type SET DEFAULT 'job';

DROP POLICY IF EXISTS "opportunities_authenticated_insert" ON public.opportunities;
CREATE POLICY "opportunities_authenticated_insert"
  ON public.opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "opportunities_authenticated_update" ON public.opportunities;
CREATE POLICY "opportunities_authenticated_update"
  ON public.opportunities
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = posted_by)
  WITH CHECK ((SELECT auth.uid()) = posted_by);

DROP POLICY IF EXISTS "opportunities_authenticated_delete" ON public.opportunities;
CREATE POLICY "opportunities_authenticated_delete"
  ON public.opportunities
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = posted_by);
