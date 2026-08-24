-- 1. Storage: replace the blanket read policy with ownership/approval-aware reads
DROP POLICY IF EXISTS "Community images readable" ON storage.objects;

CREATE POLICY "Community images owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'community-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Community images approved read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'community-images'
  AND EXISTS (
    SELECT 1 FROM public.student_insights si
    WHERE si.status = 'approved'
      AND storage.objects.name = ANY (si.image_paths)
  )
);

-- 2. Internal helpers should not be directly callable through the API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_linked_parent(uuid, uuid) FROM anon, authenticated;

-- 3. These actions require a session; signed-out callers should not reach them
REVOKE EXECUTE ON FUNCTION public.toggle_comment_like(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.toggle_insight_helpful(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_parent_invite(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_analytics() FROM anon;