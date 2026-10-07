ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS campus_image_url text,
  ADD COLUMN IF NOT EXISTS campus_image_source_url text,
  ADD COLUMN IF NOT EXISTS campus_image_resolved_at timestamptz;