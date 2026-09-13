CREATE OR REPLACE FUNCTION public.paths_owned_by(_user_id uuid, _paths text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT coalesce(bool_and(p LIKE _user_id::text || '/%'), true)
  FROM unnest(coalesce(_paths, '{}'::text[])) AS p
$$;

GRANT EXECUTE ON FUNCTION public.paths_owned_by(uuid, text[]) TO authenticated, service_role;

UPDATE public.student_insights si
SET image_paths = (
  SELECT coalesce(array_agg(p), '{}'::text[])
  FROM unnest(si.image_paths) AS p
  WHERE p LIKE si.user_id::text || '/%'
)
WHERE NOT public.paths_owned_by(si.user_id, si.image_paths);

DROP POLICY IF EXISTS "Users can post their own insights" ON public.student_insights;
CREATE POLICY "Users can post their own insights"
ON public.student_insights FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'approved'
  AND public.paths_owned_by(auth.uid(), image_paths)
);

DROP POLICY IF EXISTS "Authors can edit their own insights" ON public.student_insights;
CREATE POLICY "Authors can edit their own insights"
ON public.student_insights FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.paths_owned_by(auth.uid(), image_paths)
);