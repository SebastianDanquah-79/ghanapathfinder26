CREATE TABLE public.sms_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, campaign)
);

GRANT SELECT ON public.sms_sends TO authenticated;
GRANT ALL ON public.sms_sends TO service_role;

ALTER TABLE public.sms_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sms sends"
ON public.sms_sends FOR SELECT TO authenticated
USING (auth.uid() = user_id);