CREATE TABLE public.student_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'approved',
  student_status text NOT NULL DEFAULT 'Current student',
  programme text,
  year_of_study text,
  category text NOT NULL DEFAULT 'General',
  rating smallint,
  body text NOT NULL,
  wish_i_knew text,
  advice text,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_insights_status_chk CHECK (status IN ('pending','approved','rejected','hidden')),
  CONSTRAINT student_insights_student_status_chk CHECK (student_status IN ('Current student','Graduate','Former student')),
  CONSTRAINT student_insights_rating_chk CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  CONSTRAINT student_insights_body_chk CHECK (char_length(btrim(body)) BETWEEN 20 AND 4000)
);

CREATE INDEX student_insights_university_idx ON public.student_insights (university_id, status, created_at DESC);
CREATE INDEX student_insights_user_idx ON public.student_insights (user_id);

GRANT SELECT (id, university_id, status, student_status, programme, year_of_study, category, rating, body, wish_i_knew, advice, helpful_count, created_at, updated_at) ON public.student_insights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_insights TO authenticated;
GRANT ALL ON public.student_insights TO service_role;

ALTER TABLE public.student_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved insights" ON public.student_insights
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Authors can read their own insights" ON public.student_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all insights" ON public.student_insights
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can post their own insights" ON public.student_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'approved');
CREATE POLICY "Authors can edit their own insights" ON public.student_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete their own insights" ON public.student_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can moderate insights" ON public.student_insights
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete insights" ON public.student_insights
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER student_insights_updated_at BEFORE UPDATE ON public.student_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.insight_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid NOT NULL REFERENCES public.student_insights(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT insight_reports_reason_chk CHECK (reason IN ('misinformation','harassment','inappropriate','spam','other')),
  CONSTRAINT insight_reports_status_chk CHECK (status IN ('open','reviewed','dismissed'))
);

CREATE INDEX insight_reports_insight_idx ON public.insight_reports (insight_id);

GRANT SELECT, INSERT, UPDATE ON public.insight_reports TO authenticated;
GRANT ALL ON public.insight_reports TO service_role;

ALTER TABLE public.insight_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report insights" ON public.insight_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters can see their own reports" ON public.insight_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can read reports" ON public.insight_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON public.insight_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER insight_reports_updated_at BEFORE UPDATE ON public.insight_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();