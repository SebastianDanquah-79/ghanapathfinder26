
-- ============ 1. Occupation salary library ============
CREATE TABLE public.occupation_salaries (
  occupation text PRIMARY KEY,
  salary_range text NOT NULL,
  salary_period text NOT NULL DEFAULT 'per month',
  experience_level text NOT NULL DEFAULT 'Entry to mid-level',
  data_source text NOT NULL DEFAULT 'Indicative estimate compiled from Ghana Statistical Service AHIES earnings tables and published public-sector pay guidance',
  last_verified timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.occupation_salaries TO anon, authenticated;
GRANT ALL ON public.occupation_salaries TO service_role;
ALTER TABLE public.occupation_salaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salary library is public" ON public.occupation_salaries FOR SELECT USING (true);
CREATE POLICY "Admins manage salary library" ON public.occupation_salaries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER occupation_salaries_updated_at BEFORE UPDATE ON public.occupation_salaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 2. Programme curriculum snippets ============
CREATE TABLE public.programme_curriculum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  year_label text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  courses text[] NOT NULL DEFAULT '{}',
  note text,
  source text NOT NULL DEFAULT 'indicative',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, year_label)
);
CREATE INDEX idx_programme_curriculum_programme ON public.programme_curriculum(programme_id);
GRANT SELECT ON public.programme_curriculum TO anon, authenticated;
GRANT ALL ON public.programme_curriculum TO service_role;
ALTER TABLE public.programme_curriculum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Curriculum is public" ON public.programme_curriculum FOR SELECT USING (true);
CREATE POLICY "Admins manage curriculum" ON public.programme_curriculum FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER programme_curriculum_updated_at BEFORE UPDATE ON public.programme_curriculum
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 3. Programme feedback ============
CREATE TABLE public.programme_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  issue_type text NOT NULL DEFAULT 'general',
  comment text,
  status text NOT NULL DEFAULT 'new',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, user_id)
);
CREATE INDEX idx_programme_feedback_programme ON public.programme_feedback(programme_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_feedback TO authenticated;
GRANT ALL ON public.programme_feedback TO service_role;
ALTER TABLE public.programme_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own feedback" ON public.programme_feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users add own feedback" ON public.programme_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users edit own feedback" ON public.programme_feedback FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own feedback" ON public.programme_feedback FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER programme_feedback_updated_at BEFORE UPDATE ON public.programme_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 4. Admin write access for verification work ============
DO $pol$
DECLARE t text; n text;
BEGIN
  FOR t, n IN VALUES ('programmes','Admins manage programmes'),
                     ('programme_information','Admins manage programme information'),
                     ('programme_careers','Admins manage programme careers'),
                     ('programme_sources','Admins manage programme sources') LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=n) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', n, t);
    END IF;
  END LOOP;
END $pol$;

-- ============ 5. Salary + curriculum generators ============
CREATE OR REPLACE FUNCTION public.apply_occupation_salaries(_programme_id uuid DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.programme_careers c
  SET salary_range = s.salary_range,
      salary_period = s.salary_period,
      salary_experience_level = s.experience_level,
      salary_data_source = s.data_source,
      last_verified = s.last_verified
  FROM public.occupation_salaries s
  WHERE lower(trim(c.occupation)) = lower(trim(s.occupation))
    AND (_programme_id IS NULL OR c.programme_id = _programme_id);
$$;

CREATE OR REPLACE FUNCTION public.apply_programme_curriculum(_programme_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p record; areas text[]; f text; yrs int;
BEGIN
  SELECT pr.*, coalesce(pi.study_areas, '{}') AS sa INTO p
  FROM public.programmes pr
  LEFT JOIN public.programme_information pi ON pi.programme_id = pr.id
  WHERE pr.id = _programme_id;
  IF NOT FOUND THEN RETURN; END IF;

  areas := p.sa;
  f := coalesce(nullif(p.field, ''), 'the field');
  yrs := CASE WHEN coalesce(p.duration,'') ~ '2' THEN 2 WHEN coalesce(p.duration,'') ~ '3' THEN 3 ELSE 4 END;

  DELETE FROM public.programme_curriculum WHERE programme_id = _programme_id AND source = 'indicative';

  INSERT INTO public.programme_curriculum (programme_id, year_label, position, courses, note, source)
  VALUES (
    _programme_id, 'Year 1 — foundation', 1,
    ARRAY['Academic writing and communication skills',
          'Quantitative methods / mathematics for ' || f,
          'Introduction to ' || f,
          'Information technology and study skills',
          'African studies / general studies'],
    'Most Ghanaian institutions start with general studies plus introductory courses in the field.',
    'indicative'
  ),
  (
    _programme_id, 'Year 2 — core subjects', 2,
    CASE WHEN array_length(areas,1) > 0 THEN areas[1:3]
         ELSE ARRAY['Core principles of ' || f, 'Research methods', 'Practical / laboratory work'] END,
    'Core theory of the discipline, usually with practical or laboratory sessions.',
    'indicative'
  ),
  (
    _programme_id, 'Year 3 — specialisation', 3,
    CASE WHEN array_length(areas,1) > 3 THEN areas[4:7]
         WHEN array_length(areas,1) > 0 THEN areas
         ELSE ARRAY['Advanced topics in ' || f, 'Professional ethics and practice', 'Electives'] END,
    'Deeper specialist courses and electives; many programmes add an industrial attachment here.',
    'indicative'
  )
  ON CONFLICT (programme_id, year_label) DO UPDATE
    SET courses = EXCLUDED.courses, note = EXCLUDED.note, position = EXCLUDED.position;

  IF yrs >= 4 THEN
    INSERT INTO public.programme_curriculum (programme_id, year_label, position, courses, note, source)
    VALUES (_programme_id, 'Final year — project and practice', 4,
      ARRAY['Research project / long essay', 'Industrial attachment or clinical practice',
            'Advanced electives', 'Entrepreneurship and professional practice'],
      'Final year is usually project-based with supervised practice or attachment.',
      'indicative')
    ON CONFLICT (programme_id, year_label) DO UPDATE
      SET courses = EXCLUDED.courses, note = EXCLUDED.note, position = EXCLUDED.position;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.programmes_autofill_information()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.apply_programme_information(NEW.id);
  PERFORM public.apply_occupation_salaries(NEW.id);
  PERFORM public.apply_programme_curriculum(NEW.id);
  RETURN NEW;
END;
$$;

-- ============ 6. Seed salary library (indicative GHS monthly ranges) ============
INSERT INTO public.occupation_salaries (occupation, salary_range, experience_level) VALUES
('Engineer','GHS 2,500 – 6,500','Entry to mid-level'),
('Design Engineer','GHS 2,500 – 6,000','Entry to mid-level'),
('Project Engineer','GHS 3,000 – 7,500','Entry to mid-level'),
('Maintenance Engineer','GHS 2,500 – 6,000','Entry to mid-level'),
('Quality and Safety Engineer','GHS 2,800 – 6,500','Entry to mid-level'),
('Production Supervisor','GHS 2,000 – 4,500','Entry to mid-level'),
('Software Developer','GHS 3,000 – 9,000','Entry to mid-level'),
('Web Developer','GHS 2,000 – 6,000','Entry to mid-level'),
('Data Analyst','GHS 2,800 – 7,000','Entry to mid-level'),
('Data Scientist','GHS 4,000 – 12,000','Mid-level'),
('Machine Learning Engineer','GHS 4,500 – 13,000','Mid-level'),
('Computer Vision Engineer','GHS 4,500 – 12,000','Mid-level'),
('AI Research Assistant','GHS 2,500 – 6,000','Entry level'),
('Business Intelligence Analyst','GHS 3,500 – 8,500','Mid-level'),
('Cybersecurity Analyst','GHS 3,500 – 9,000','Entry to mid-level'),
('Security Analyst','GHS 3,000 – 8,000','Entry to mid-level'),
('Security Engineer','GHS 4,000 – 10,000','Mid-level'),
('Penetration Tester','GHS 4,000 – 10,000','Mid-level'),
('Digital Forensics Analyst','GHS 3,500 – 8,500','Mid-level'),
('Cloud Engineer','GHS 4,000 – 11,000','Mid-level'),
('Systems Analyst','GHS 3,000 – 7,500','Entry to mid-level'),
('Systems Administrator','GHS 2,800 – 7,000','Entry to mid-level'),
('Network Administrator','GHS 2,800 – 7,000','Entry to mid-level'),
('Database Administrator','GHS 3,200 – 8,000','Entry to mid-level'),
('IT Support Officer','GHS 1,800 – 4,000','Entry level'),
('GIS Analyst','GHS 2,500 – 6,000','Entry to mid-level'),
('Registered General Nurse','GHS 2,300 – 4,200','Entry to mid-level (public sector Single Spine)'),
('Community Health Nurse','GHS 1,900 – 3,400','Entry to mid-level (public sector Single Spine)'),
('Public Health Nurse','GHS 2,300 – 4,300','Entry to mid-level'),
('Registered Midwife','GHS 2,300 – 4,200','Entry to mid-level (public sector Single Spine)'),
('Registered Mental Health Nurse','GHS 2,300 – 4,200','Entry to mid-level'),
('Critical Care Nurse','GHS 2,600 – 5,000','Mid-level'),
('Theatre Nurse','GHS 2,600 – 5,000','Mid-level'),
('Emergency Unit Nurse','GHS 2,500 – 4,800','Mid-level'),
('Recovery Room Nurse','GHS 2,500 – 4,800','Mid-level'),
('Ophthalmic Nurse','GHS 2,500 – 4,800','Mid-level'),
('ENT Nurse','GHS 2,500 – 4,800','Mid-level'),
('Nurse Educator','GHS 3,000 – 6,000','Mid to senior level'),
('Nurse Manager','GHS 3,500 – 7,000','Senior level'),
('Clinical Instructor','GHS 3,000 – 6,000','Mid-level'),
('Midwifery Tutor','GHS 3,000 – 6,000','Mid-level'),
('Medical Doctor','GHS 5,500 – 12,000','House officer to specialist track'),
('Medical Specialist','GHS 10,000 – 25,000','Specialist level'),
('Public Health Physician','GHS 9,000 – 20,000','Specialist level'),
('Medical Researcher','GHS 4,000 – 10,000','Mid-level'),
('Pharmacist','GHS 4,000 – 9,000','Entry to mid-level'),
('Clinical Pharmacist','GHS 4,500 – 10,000','Mid-level'),
('Pharmaceutical Sales Manager','GHS 4,000 – 10,000','Mid-level'),
('Regulatory Affairs Officer','GHS 3,000 – 7,000','Mid-level'),
('Public Health Officer','GHS 2,500 – 5,500','Entry to mid-level'),
('Environmental Health Officer','GHS 2,200 – 5,000','Entry to mid-level'),
('Epidemiologist','GHS 4,000 – 9,000','Mid-level'),
('Disease Surveillance Officer','GHS 2,500 – 5,500','Entry to mid-level'),
('Immunisation Officer','GHS 2,200 – 4,800','Entry to mid-level'),
('Health Promotion Officer','GHS 2,200 – 4,800','Entry to mid-level'),
('Health Programme Manager','GHS 4,500 – 11,000','Senior level'),
('Health Programme Coordinator','GHS 3,000 – 7,000','Mid-level'),
('Maternal Health Officer','GHS 2,500 – 5,000','Entry to mid-level'),
('Family Planning Counsellor','GHS 2,000 – 4,200','Entry to mid-level'),
('Community Mental Health Officer','GHS 2,300 – 4,800','Entry to mid-level'),
('Clinical Psychologist','GHS 3,500 – 8,000','Mid-level'),
('Counsellor','GHS 2,000 – 4,500','Entry to mid-level'),
('Allied Health Professional','GHS 2,500 – 5,500','Entry to mid-level'),
('Rehabilitation Officer','GHS 2,300 – 5,000','Entry to mid-level'),
('Rehabilitation Support Worker','GHS 1,500 – 3,200','Entry level'),
('Audiology Support Officer','GHS 2,000 – 4,500','Entry level'),
('Eye Screening Officer','GHS 2,000 – 4,500','Entry level'),
('Health Care Assistant','GHS 1,200 – 2,600','Entry level'),
('Ward Assistant','GHS 1,100 – 2,400','Entry level'),
('Home Care Aide','GHS 1,000 – 2,400','Entry level'),
('Basic School Teacher','GHS 1,800 – 3,300','Entry to mid-level (public sector Single Spine)'),
('Subject Teacher','GHS 2,000 – 3,800','Entry to mid-level (public sector Single Spine)'),
('Teacher','GHS 1,900 – 3,600','Entry to mid-level'),
('Language Teacher','GHS 1,900 – 3,800','Entry to mid-level'),
('Religious Studies Teacher','GHS 1,900 – 3,600','Entry to mid-level'),
('TVET Teacher','GHS 2,200 – 4,200','Entry to mid-level'),
('Technical Instructor','GHS 2,200 – 4,500','Entry to mid-level'),
('Head Teacher','GHS 3,000 – 5,500','Senior level'),
('Education Officer','GHS 2,500 – 5,000','Mid-level'),
('Education Administrator','GHS 2,800 – 6,000','Mid-level'),
('Curriculum Developer','GHS 3,000 – 6,500','Mid-level'),
('Instructional Designer','GHS 3,000 – 7,000','Mid-level'),
('Training Officer','GHS 2,800 – 6,000','Mid-level'),
('Accounts Officer','GHS 2,000 – 4,500','Entry to mid-level'),
('Auditor','GHS 2,800 – 7,000','Entry to mid-level'),
('Tax Officer','GHS 2,500 – 6,000','Entry to mid-level'),
('Financial Analyst','GHS 3,200 – 8,000','Entry to mid-level'),
('Credit Risk Analyst','GHS 3,200 – 8,000','Mid-level'),
('Investment Adviser','GHS 3,500 – 9,000','Mid-level'),
('Banking Officer','GHS 2,500 – 5,500','Entry to mid-level'),
('Compliance Officer','GHS 3,000 – 7,000','Mid-level'),
('Marketing Officer','GHS 2,200 – 5,500','Entry to mid-level'),
('Business Development Officer','GHS 2,500 – 6,500','Entry to mid-level'),
('Operations Officer','GHS 2,200 – 5,500','Entry to mid-level'),
('Human Resource Officer','GHS 2,500 – 6,000','Entry to mid-level'),
('Administrative Officer','GHS 2,000 – 4,500','Entry to mid-level'),
('Communications Officer','GHS 2,200 – 5,500','Entry to mid-level'),
('Project Officer','GHS 2,800 – 6,500','Entry to mid-level'),
('Project Coordinator','GHS 3,000 – 7,000','Mid-level'),
('Programme Officer','GHS 3,000 – 7,000','Mid-level'),
('Monitoring and Evaluation Officer','GHS 3,000 – 7,500','Mid-level'),
('Policy Analyst','GHS 3,000 – 7,500','Mid-level'),
('Policy Researcher','GHS 3,000 – 7,000','Mid-level'),
('Research Assistant','GHS 1,800 – 4,000','Entry level'),
('Community Development Officer','GHS 2,200 – 4,800','Entry to mid-level'),
('Local Government Officer','GHS 2,200 – 4,800','Entry to mid-level'),
('Peacebuilding Officer','GHS 2,800 – 6,500','Mid-level'),
('Lawyer','GHS 3,500 – 12,000','Entry to mid-level after call to the Bar'),
('Legal Officer','GHS 3,500 – 9,000','Entry to mid-level'),
('Legal Researcher','GHS 2,500 – 6,000','Entry level'),
('Quantity Surveyor','GHS 3,000 – 7,500','Entry to mid-level'),
('Land Surveyor','GHS 2,800 – 6,500','Entry to mid-level'),
('Mine Surveyor','GHS 4,000 – 10,000','Entry to mid-level'),
('Site Supervisor','GHS 2,500 – 5,500','Entry to mid-level'),
('Building Technologist','GHS 2,500 – 5,500','Entry to mid-level'),
('Contracts Officer','GHS 2,800 – 6,500','Mid-level'),
('Architect','GHS 3,000 – 8,000','Entry to mid-level'),
('Architectural Assistant','GHS 2,000 – 4,500','Entry level'),
('Interior Designer','GHS 2,000 – 5,500','Entry to mid-level'),
('Agricultural Extension Officer','GHS 2,000 – 4,500','Entry to mid-level'),
('Agribusiness Officer','GHS 2,300 – 5,500','Entry to mid-level'),
('Farm Manager','GHS 2,500 – 6,000','Mid-level'),
('Agricultural Research Assistant','GHS 1,800 – 4,000','Entry level'),
('Livestock Production Officer','GHS 2,200 – 5,000','Entry to mid-level'),
('Veterinary Surgeon','GHS 4,000 – 9,000','Entry to mid-level'),
('Veterinary Technician','GHS 2,000 – 4,500','Entry level'),
('Environmental Officer','GHS 2,500 – 6,000','Entry to mid-level'),
('Environmental Consultant','GHS 3,500 – 9,000','Mid-level'),
('Sustainability Officer','GHS 3,000 – 7,000','Mid-level'),
('Natural Resource Manager','GHS 3,000 – 7,500','Mid-level'),
('Laboratory Analyst','GHS 2,200 – 5,000','Entry to mid-level'),
('Quality Control Officer','GHS 2,300 – 5,500','Entry to mid-level'),
('Tourism Officer','GHS 2,000 – 4,500','Entry to mid-level'),
('Hotel Operations Officer','GHS 2,000 – 4,800','Entry to mid-level'),
('Food and Beverage Supervisor','GHS 1,800 – 4,000','Entry to mid-level'),
('Events Coordinator','GHS 2,000 – 5,000','Entry to mid-level'),
('Content Creator','GHS 1,800 – 6,000','Highly variable, project based'),
('Video Editor','GHS 2,000 – 6,000','Entry to mid-level'),
('Cinematographer','GHS 2,500 – 7,000','Project based'),
('Producer','GHS 3,000 – 9,000','Project based'),
('Interpreter','GHS 2,000 – 5,500','Project based'),
('Translator','GHS 2,000 – 5,500','Project based'),
('Entrepreneur','Highly variable','Depends entirely on the venture'),
('Pastor or Minister','GHS 1,500 – 4,500','Varies widely by denomination'),
('Chaplain','GHS 2,000 – 4,500','Entry to mid-level'),
('Faith-Based Programme Officer','GHS 2,200 – 5,000','Entry to mid-level'),
('Workshop Supervisor','GHS 2,200 – 5,000','Entry to mid-level')
ON CONFLICT (occupation) DO NOTHING;

-- ============ 7. Backfill existing programmes ============
SELECT public.apply_occupation_salaries(NULL);
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.programmes LOOP
    PERFORM public.apply_programme_curriculum(r.id);
  END LOOP;
END $$;
