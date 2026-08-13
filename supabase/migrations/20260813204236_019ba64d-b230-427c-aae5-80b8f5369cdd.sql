CREATE OR REPLACE VIEW public.programme_facets
WITH (security_invoker = true) AS
  SELECT 'field'::text AS kind, p.field AS value, count(*)::bigint AS count
  FROM public.programmes p WHERE p.field IS NOT NULL GROUP BY p.field
UNION ALL
  SELECT 'degree_type', p.degree_type, count(*)::bigint
  FROM public.programmes p WHERE p.degree_type IS NOT NULL GROUP BY p.degree_type
UNION ALL
  SELECT 'qualification', p.qualification, count(*)::bigint
  FROM public.programmes p WHERE p.qualification IS NOT NULL GROUP BY p.qualification
UNION ALL
  SELECT 'region', u.region, count(*)::bigint
  FROM public.programmes p JOIN public.universities u ON u.id = p.university_id
  WHERE u.region IS NOT NULL GROUP BY u.region
UNION ALL
  SELECT 'institution', u.name, count(*)::bigint
  FROM public.programmes p JOIN public.universities u ON u.id = p.university_id
  GROUP BY u.name;

GRANT SELECT ON public.programme_facets TO anon, authenticated;
GRANT ALL ON public.programme_facets TO service_role;