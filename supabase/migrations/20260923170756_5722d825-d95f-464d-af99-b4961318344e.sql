
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('job','internship','attachment','apprenticeship','national-service','graduate-trainee','remote','freelance','fellowship','volunteer','work-abroad','hackathon','competition','accelerator','incubator','funding','startup','startup-job','event','research','course','certification')),
  organisation text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  country text DEFAULT 'Ghana',
  location text,
  work_mode text,
  description text,
  eligibility text,
  fields text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  compensation text,
  deadline_date date,
  application_url text,
  source_url text,
  verified boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX opportunities_category_idx ON public.opportunities(category) WHERE published;
CREATE INDEX opportunities_deadline_idx ON public.opportunities(deadline_date);
GRANT SELECT ON public.opportunities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published opportunities are public" ON public.opportunities FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins manage opportunities" ON public.opportunities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER opportunities_updated BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunity_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_kind text NOT NULL CHECK (item_kind IN ('opportunity','internship','scholarship','programme','other')),
  item_ref text,
  title text NOT NULL,
  organisation text,
  stage text NOT NULL DEFAULT 'interested' CHECK (stage IN ('interested','applying','applied','interview','accepted','rejected')),
  deadline_date date,
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_kind, item_ref)
);
CREATE INDEX opportunity_pipeline_user_idx ON public.opportunity_pipeline(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_pipeline TO authenticated;
GRANT ALL ON public.opportunity_pipeline TO service_role;
ALTER TABLE public.opportunity_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own pipeline" ON public.opportunity_pipeline FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER opportunity_pipeline_updated BEFORE UPDATE ON public.opportunity_pipeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.directory_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 80),
  country text,
  university text,
  programme text,
  level text,
  graduation_year int CHECK (graduation_year BETWEEN 1950 AND 2100),
  field text,
  skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  projects text CHECK (char_length(projects) <= 2000),
  bio text CHECK (char_length(bio) <= 600),
  portfolio_url text,
  linkedin_url text,
  github_url text,
  open_to_collaboration boolean NOT NULL DEFAULT false,
  open_to_mentoring boolean NOT NULL DEFAULT false,
  seeking_mentor boolean NOT NULL DEFAULT false,
  open_to_opportunities boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','members','public')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX directory_profiles_visibility_idx ON public.directory_profiles(visibility);
GRANT SELECT ON public.directory_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_profiles TO authenticated;
GRANT ALL ON public.directory_profiles TO service_role;
ALTER TABLE public.directory_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public directory profiles" ON public.directory_profiles FOR SELECT TO anon USING (visibility = 'public');
CREATE POLICY "Members see opted-in profiles" ON public.directory_profiles FOR SELECT TO authenticated USING (visibility IN ('public','members') OR auth.uid() = user_id);
CREATE POLICY "Own directory profile insert" ON public.directory_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own directory profile update" ON public.directory_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own directory profile delete" ON public.directory_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER directory_profiles_updated BEFORE UPDATE ON public.directory_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.directory_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_user_id uuid NOT NULL REFERENCES public.directory_profiles(user_id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.directory_reports TO authenticated;
GRANT ALL ON public.directory_reports TO service_role;
ALTER TABLE public.directory_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "File own reports" ON public.directory_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins read reports" ON public.directory_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR auth.uid() = reporter_id);

CREATE TABLE public.directory_blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.directory_blocks TO authenticated;
GRANT ALL ON public.directory_blocks TO service_role;
ALTER TABLE public.directory_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own blocks" ON public.directory_blocks FOR ALL TO authenticated USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

CREATE TABLE public.life_path_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('education','skills','projects','experience','opportunities','career','entrepreneurship','further-education')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  detail text CHECK (char_length(detail) <= 1000),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in-progress','done')),
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX life_path_items_user_idx ON public.life_path_items(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_path_items TO authenticated;
GRANT ALL ON public.life_path_items TO service_role;
ALTER TABLE public.life_path_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own life path" ON public.life_path_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER life_path_items_updated BEFORE UPDATE ON public.life_path_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'universities', (SELECT count(*) FROM universities),
    'programmes', (SELECT count(*) FROM programmes),
    'scholarships', (SELECT count(*) FROM scholarships),
    'internships', (SELECT count(*) FROM internships),
    'companies', (SELECT count(*) FROM companies),
    'courses', (SELECT count(*) FROM skill_providers WHERE NOT needs_review),
    'opportunities', (SELECT count(*) FROM opportunities WHERE published),
    'countries', (SELECT count(DISTINCT country) FROM universities WHERE country IS NOT NULL),
    'directory_members', (SELECT count(*) FROM directory_profiles WHERE visibility = 'public'),
    'universities_by_type', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(type,'Unspecified') k, count(*) v FROM universities GROUP BY 1) s),
    'universities_by_category', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(category,'Unspecified') k, count(*) v FROM universities GROUP BY 1 ORDER BY 2 DESC LIMIT 8) s),
    'universities_by_country', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(country,'Unspecified') k, count(*) v FROM universities GROUP BY 1) s),
    'universities_by_region', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT region k, count(*) v FROM universities WHERE region IS NOT NULL GROUP BY 1) s),
    'programmes_by_degree', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(degree_type,'Unspecified') k, count(*) v FROM programmes GROUP BY 1 ORDER BY 2 DESC LIMIT 8) s),
    'scholarships_by_funding', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(funding_type,'Unspecified') k, count(*) v FROM scholarships GROUP BY 1) s),
    'opportunities_by_type', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (
        SELECT k, sum(v)::int v FROM (
          SELECT coalesce(opportunity_type,'Other') k, count(*) v FROM internships GROUP BY 1
          UNION ALL SELECT category, count(*) FROM opportunities WHERE published GROUP BY 1
        ) u GROUP BY k) s),
    'generated_at', now()
  );
$$;
REVOKE ALL ON FUNCTION public.platform_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated;

DROP POLICY IF EXISTS "Community images approved read" ON storage.objects;
CREATE POLICY "Community images approved read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-images' AND EXISTS (SELECT 1 FROM public.student_insights si WHERE si.status = 'approved' AND objects.name = ANY (si.image_paths)));
