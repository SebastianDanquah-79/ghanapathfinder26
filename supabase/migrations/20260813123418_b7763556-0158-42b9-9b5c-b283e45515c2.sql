CREATE TABLE IF NOT EXISTS public.gtec_register_staging (
  institution_id UUID PRIMARY KEY,
  gtec_category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL,
  start_date DATE,
  expiry_date DATE
);
GRANT ALL ON public.gtec_register_staging TO service_role;
ALTER TABLE public.gtec_register_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage gtec staging" ON public.gtec_register_staging
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));