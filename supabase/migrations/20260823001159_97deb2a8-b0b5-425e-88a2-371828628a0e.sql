ALTER TABLE public.student_insights
  ADD COLUMN IF NOT EXISTS image_paths text[] NOT NULL DEFAULT '{}';

CREATE POLICY "Community images readable"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'community-images');

CREATE POLICY "Users upload own community images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own community images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own community images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE IF NOT EXISTS public.logo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  organisation_name text NOT NULL,
  suggested_url text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.logo_requests TO authenticated;
GRANT ALL ON public.logo_requests TO service_role;

ALTER TABLE public.logo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit logo requests"
  ON public.logo_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can read their own logo requests"
  ON public.logo_requests FOR SELECT TO authenticated
  USING (auth.uid() = requested_by);

CREATE POLICY "Admins can read all logo requests"
  ON public.logo_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage logo requests"
  ON public.logo_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));