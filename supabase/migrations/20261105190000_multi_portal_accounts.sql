ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS enabled_portals text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS active_portal text;

-- Preserve legacy portal choices and recover any additional role profiles
-- that already exist for an account.
UPDATE public.profiles AS p
SET enabled_portals = COALESCE((
  SELECT array_agg(DISTINCT u.portal ORDER BY u.portal)
  FROM unnest(
    COALESCE(p.enabled_portals, ARRAY[]::text[]) ||
    ARRAY[
      CASE WHEN p.account_role IN ('student') OR p.role IN ('student')
        OR EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.user_id = p.id)
        THEN 'student' END,
      CASE WHEN p.account_role IN ('employee') OR p.role IN ('employee')
        OR EXISTS (SELECT 1 FROM public.employee_profiles ep WHERE ep.user_id = p.id)
        THEN 'employee' END,
      CASE WHEN p.account_role IN ('employer') OR p.role IN ('employer')
        OR EXISTS (SELECT 1 FROM public.employer_profiles ep WHERE ep.user_id = p.id)
        THEN 'employer' END,
      CASE WHEN p.account_role IN ('startup_founder', 'founder') OR p.role IN ('startup_founder', 'founder')
        OR EXISTS (SELECT 1 FROM public.founder_profiles fp WHERE fp.user_id = p.id)
        THEN 'startup_founder' END,
      CASE WHEN p.account_role IN ('international_student', 'international-student')
        OR p.role IN ('international_student', 'international-student')
        OR EXISTS (SELECT 1 FROM public.international_students isp WHERE isp.user_id = p.id)
        THEN 'international_student' END
    ]::text[]
  ) AS u(portal)
  WHERE u.portal = ANY(ARRAY[
    'student', 'employee', 'employer', 'startup_founder', 'international_student'
  ]::text[])
), ARRAY['student']::text[]);

UPDATE public.profiles AS p
SET active_portal = CASE
  WHEN p.account_role = 'student' THEN 'student'
  WHEN p.account_role = 'employee' THEN 'employee'
  WHEN p.account_role = 'employer' THEN 'employer'
  WHEN p.account_role IN ('startup_founder', 'founder') THEN 'startup_founder'
  WHEN p.account_role IN ('international_student', 'international-student') THEN 'international_student'
  WHEN p.role = 'student' THEN 'student'
  WHEN p.role = 'employee' THEN 'employee'
  WHEN p.role = 'employer' THEN 'employer'
  WHEN p.role IN ('startup_founder', 'founder') THEN 'startup_founder'
  WHEN p.role IN ('international_student', 'international-student') THEN 'international_student'
  ELSE 'student'
END;

UPDATE public.profiles
SET enabled_portals = array_append(enabled_portals, active_portal)
WHERE NOT (active_portal = ANY(enabled_portals));

UPDATE public.profiles
SET enabled_portals = ARRAY['student']::text[]
WHERE cardinality(enabled_portals) = 0;

ALTER TABLE public.profiles
  ALTER COLUMN enabled_portals SET DEFAULT ARRAY['student']::text[],
  ALTER COLUMN active_portal SET DEFAULT 'student',
  ALTER COLUMN active_portal SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_enabled_portals_allowed,
  DROP CONSTRAINT IF EXISTS profiles_active_portal_allowed,
  DROP CONSTRAINT IF EXISTS profiles_active_portal_is_enabled;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_enabled_portals_allowed
    CHECK (enabled_portals <@ ARRAY[
      'student', 'employee', 'employer', 'startup_founder', 'international_student'
    ]::text[]),
  ADD CONSTRAINT profiles_active_portal_allowed
    CHECK (active_portal = ANY(ARRAY[
      'student', 'employee', 'employer', 'startup_founder', 'international_student'
    ]::text[])),
  ADD CONSTRAINT profiles_active_portal_is_enabled
    CHECK (active_portal = ANY(enabled_portals));
