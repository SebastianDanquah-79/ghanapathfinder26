
CREATE OR REPLACE FUNCTION public.search_catalogue(_q text, _kind text DEFAULT 'all'::text, _limit integer DEFAULT 20, _offset integer DEFAULT 0)
 RETURNS TABLE(kind text, id uuid, slug text, title text, subtitle text, meta jsonb, score real)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT coalesce(trim(_q), '') AS term)
  SELECT * FROM (
    SELECT 'university'::text AS kind, u.id, u.slug, u.name AS title,
      concat_ws(' • ', u.location, u.region, u.category) AS subtitle,
      jsonb_build_object(
        'type', u.type, 'category', u.category, 'location', u.location, 'region', u.region,
        'website_url', u.website_url, 'admissions_url', u.admissions_url,
        'top_programmes', u.top_programmes, 'verified', u.verified,
        'accreditation_status', u.accreditation_status,
        'accreditation_expiry_date', u.accreditation_expiry_date,
        'delivery_mode', u.delivery_mode,
        'gtec_category', u.gtec_category,
        'source_url', u.source_url,
        'last_verified_at', u.last_verified_at
      ) AS meta,
      GREATEST(similarity(u.name, (SELECT term FROM q)), similarity(coalesce(u.short_name,''), (SELECT term FROM q)))::real AS score
    FROM public.universities u, q
    WHERE (_kind IN ('all','university'))
      AND (q.term = '' OR u.name ILIKE '%'||q.term||'%' OR coalesce(u.short_name,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.location,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.region,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.category,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.gtec_category,'') ILIKE '%'||q.term||'%'
           OR coalesce(u.type,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(u.aliases) al WHERE al ILIKE '%'||q.term||'%')
           OR EXISTS (SELECT 1 FROM unnest(u.top_programmes) tp WHERE tp ILIKE '%'||q.term||'%')
           OR similarity(u.name, q.term) > 0.25)

    UNION ALL

    SELECT 'programme'::text, p.id, p.slug, p.name,
      concat_ws(' • ', coalesce(u2.short_name, u2.name), p.degree_type, u2.location),
      jsonb_build_object(
        'university', u2.name, 'university_slug', u2.slug, 'degree_type', p.degree_type,
        'duration', p.duration, 'entry_requirements', p.entry_requirements,
        'field', p.field, 'application_url', coalesce(p.application_url, u2.admissions_url),
        'programme_url', p.programme_url, 'qualification', p.qualification,
        'region', u2.region, 'location', u2.location,
        'verification_status', p.verification_status, 'source_url', p.source_url,
        'short_bio', pi.short_bio,
        'careers', coalesce(pi.career_opportunities[1:4], '{}'),
        'academic_difficulty', pi.academic_difficulty
      ),
      GREATEST(similarity(p.name, (SELECT term FROM q)), similarity(coalesce(p.field,''), (SELECT term FROM q)))::real
    FROM public.programmes p
      JOIN public.universities u2 ON u2.id = p.university_id
      LEFT JOIN public.programme_information pi ON pi.programme_id = p.id, q
    WHERE (_kind IN ('all','programme'))
      AND (q.term = '' OR p.name ILIKE '%'||q.term||'%' OR coalesce(p.field,'') ILIKE '%'||q.term||'%'
           OR coalesce(p.description,'') ILIKE '%'||q.term||'%'
           OR coalesce(u2.location,'') ILIKE '%'||q.term||'%'
           OR coalesce(u2.region,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(p.relevant_subjects) rs WHERE rs ILIKE '%'||q.term||'%')
           OR similarity(p.name, q.term) > 0.25)

    UNION ALL

    SELECT 'scholarship'::text, s.id, s.slug, s.name,
      concat_ws(' • ', s.provider, s.coverage),
      jsonb_build_object(
        'provider', s.provider, 'eligibility', s.eligibility, 'deadline_text', s.deadline_text,
        'deadline_date', s.deadline_date, 'coverage', s.coverage, 'study_level', s.study_level,
        'application_url', coalesce(s.application_url, s.website_url), 'verified', s.verified,
        'last_verified_at', s.last_verified_at
      ),
      GREATEST(similarity(s.name, (SELECT term FROM q)), similarity(coalesce(s.provider,''), (SELECT term FROM q)))::real
    FROM public.scholarships s, q
    WHERE (_kind IN ('all','scholarship'))
      AND (q.term = '' OR s.name ILIKE '%'||q.term||'%' OR coalesce(s.provider,'') ILIKE '%'||q.term||'%'
           OR coalesce(s.eligibility,'') ILIKE '%'||q.term||'%'
           OR EXISTS (SELECT 1 FROM unnest(s.fields) f WHERE f ILIKE '%'||q.term||'%')
           OR similarity(s.name, q.term) > 0.25)
  ) r
  ORDER BY r.score DESC NULLS LAST, r.title ASC
  LIMIT LEAST(coalesce(_limit, 200), 200) OFFSET coalesce(_offset, 0);
$function$;
