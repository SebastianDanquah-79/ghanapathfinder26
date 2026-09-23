CREATE TABLE IF NOT EXISTS public.opportunity_pipeline (
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
ALTER TABLE public.opportunity_pipeline ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_pipeline TO authenticated;
CREATE POLICY "Own opportunity pipeline" ON public.opportunity_pipeline FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.directory_profiles (
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
ALTER TABLE public.directory_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.directory_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.directory_profiles TO authenticated;
CREATE POLICY "Public directory profiles" ON public.directory_profiles FOR SELECT TO anon USING (visibility = 'public');
CREATE POLICY "Members directory profiles" ON public.directory_profiles FOR SELECT TO authenticated USING (visibility IN ('public','members') OR auth.uid() = user_id);
CREATE POLICY "Own directory profile insert" ON public.directory_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own directory profile update" ON public.directory_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own directory profile delete" ON public.directory_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.directory_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_user_id uuid NOT NULL REFERENCES public.directory_profiles(user_id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.directory_reports ENABLE ROW LEVEL SECURITY;
GRANT INSERT, SELECT ON public.directory_reports TO authenticated;
CREATE POLICY "Own directory reports" ON public.directory_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Read own directory reports" ON public.directory_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.directory_blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
ALTER TABLE public.directory_blocks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.directory_blocks TO authenticated;
CREATE POLICY "Own directory blocks" ON public.directory_blocks FOR ALL TO authenticated USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS public.life_path_items (
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
ALTER TABLE public.life_path_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_path_items TO authenticated;
CREATE POLICY "Own life path items" ON public.life_path_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'universities', (SELECT count(*) FROM public.universities),
    'programmes', (SELECT count(*) FROM public.programmes),
    'scholarships', (SELECT count(*) FROM public.scholarships),
    'internships', (SELECT count(*) FROM public.internships),
    'companies', (SELECT count(*) FROM public.companies),
    'courses', (SELECT count(*) FROM public.skill_providers WHERE NOT needs_review),
    'opportunities', (SELECT count(*) FROM public.opportunities WHERE coalesce(is_active,true)),
    'countries', (SELECT count(DISTINCT country) FROM public.universities WHERE country IS NOT NULL),
    'directory_members', (SELECT count(*) FROM public.directory_profiles WHERE visibility = 'public'),
    'universities_by_type', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(type,'Unspecified') k, count(*) v FROM public.universities GROUP BY 1) s),
    'universities_by_category', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(category,'Unspecified') k, count(*) v FROM public.universities GROUP BY 1 ORDER BY 2 DESC LIMIT 8) s),
    'universities_by_country', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(country,'Unspecified') k, count(*) v FROM public.universities GROUP BY 1) s),
    'universities_by_region', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT region k, count(*) v FROM public.universities WHERE region IS NOT NULL GROUP BY 1) s),
    'programmes_by_degree', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(degree_type,'Unspecified') k, count(*) v FROM public.programmes GROUP BY 1 ORDER BY 2 DESC LIMIT 8) s),
    'scholarships_by_funding', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (SELECT coalesce(type,'Unspecified') k, count(*) v FROM public.scholarships GROUP BY 1) s),
    'opportunities_by_type', (SELECT coalesce(jsonb_agg(jsonb_build_object('label',k,'value',v) ORDER BY v DESC),'[]') FROM (
      SELECT coalesce(type, opportunity_type, 'Other') k, count(*) v FROM public.opportunities WHERE coalesce(is_active,true) GROUP BY 1
      UNION ALL
      SELECT coalesce(opportunity_type, 'Internship') k, count(*) v FROM public.internships GROUP BY 1
    ) s),
    'generated_at', now()
  );
$$;
REVOKE ALL ON FUNCTION public.platform_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated;
