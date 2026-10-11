CREATE POLICY "Public can view feed videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'feed-videos');

CREATE POLICY "Users can upload to own feed video folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feed-videos'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

CREATE POLICY "Users can delete own feed video files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'feed-videos'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);
