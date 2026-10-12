-- Improve global search matching without changing accreditation or review states.
CREATE OR REPLACE FUNCTION public.search_catalogue(
  _q text,
  _kind text DEFAULT 'all',
  _limit integer DEFAULT 12,
  _offset integer DEFAULT 0
)
RETURNS TABLE(id uuid, kind text, slug text, title text, subtitle text, meta json, score real)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
WITH rows AS (
  SELECT
    u.id,
    'university'::text AS kind,
    u.slug,
    u.name AS title,
    COALESCE(u.short_name, u.location, u.region, '') AS subtitle,
    json_build_object(
      'country', u.country,
      'region', u.region,
      'category', u.category,
      'website_url', u.website_url,
      'source_url', u.source_url,
      'accreditation_status', u.accreditation_status,
      'verified', u.verified
    ) AS meta,
    CASE
      WHEN lower(u.name) = lower(COALESCE(_q, '')) THEN 1.0
      WHEN u.name ILIKE '%' || COALESCE(_q, '') || '%' THEN 0.9
      WHEN COALESCE(u.short_name, '') ILIKE '%' || COALESCE(_q, '') || '%' THEN 0.8
      ELSE 0.5
    END::real AS score
  FROM public.universities u
  WHERE (_kind = 'all' OR _kind = 'university')
    AND (
      COALESCE(_q, '') = ''
      OR u.name ILIKE '%' || _q || '%'
      OR COALESCE(u.short_name, '') ILIKE '%' || _q || '%'
      OR COALESCE(u.location, '') ILIKE '%' || _q || '%'
      OR COALESCE(u.region, '') ILIKE '%' || _q || '%'
      OR COALESCE(u.category, '') ILIKE '%' || _q || '%'
      OR COALESCE(u.gtec_category, '') ILIKE '%' || _q || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(u.aliases, ARRAY[]::text[])) alias
        WHERE alias ILIKE '%' || _q || '%'
      )
    )
  UNION ALL
  SELECT
    p.id,
    'programme'::text,
    p.slug,
    p.name,
    concat_ws(' · ', p.field, p.qualification, u.name),
    json_build_object(
      'university_id', p.university_id,
      'university', u.name,
      'qualification', p.qualification,
      'degree_type', p.degree_type,
      'field', p.field,
      'verified', p.verified,
      'source_url', p.source_url
    ),
    CASE
      WHEN lower(p.name) = lower(COALESCE(_q, '')) THEN 1.0
      WHEN p.name ILIKE '%' || COALESCE(_q, '') || '%' THEN 0.9
      ELSE 0.5
    END::real
  FROM public.programmes p
  LEFT JOIN public.universities u ON u.id = p.university_id
  WHERE (_kind = 'all' OR _kind = 'programme')
    AND (
      COALESCE(_q, '') = ''
      OR p.name ILIKE '%' || _q || '%'
      OR COALESCE(p.field, '') ILIKE '%' || _q || '%'
      OR COALESCE(p.qualification, '') ILIKE '%' || _q || '%'
      OR COALESCE(p.degree_type, '') ILIKE '%' || _q || '%'
      OR COALESCE(u.name, '') ILIKE '%' || _q || '%'
    )
  UNION ALL
  SELECT
    s.id,
    'scholarship'::text,
    COALESCE(s.slug, s.id::text),
    COALESCE(s.name, s.title),
    COALESCE(s.provider, ''),
    json_build_object('type', s.type, 'deadline', COALESCE(s.deadline_date, s.deadline)),
    CASE
      WHEN lower(COALESCE(s.name, s.title)) = lower(COALESCE(_q, '')) THEN 1.0
      WHEN COALESCE(s.name, s.title) ILIKE '%' || COALESCE(_q, '') || '%' THEN 0.9
      ELSE 0.5
    END::real
  FROM public.scholarships s
  WHERE (_kind = 'all' OR _kind = 'scholarship')
    AND (
      COALESCE(_q, '') = ''
      OR COALESCE(s.name, s.title) ILIKE '%' || _q || '%'
      OR COALESCE(s.provider, '') ILIKE '%' || _q || '%'
      OR COALESCE(s.eligibility, '') ILIKE '%' || _q || '%'
      OR COALESCE(s.study_level, '') ILIKE '%' || _q || '%'
    )
)
SELECT rows.id, rows.kind, rows.slug, rows.title, rows.subtitle, rows.meta, rows.score
FROM rows
ORDER BY rows.score DESC, rows.title ASC
LIMIT LEAST(GREATEST(COALESCE(_limit, 12), 1), 100)
OFFSET GREATEST(COALESCE(_offset, 0), 0);
$function$;
