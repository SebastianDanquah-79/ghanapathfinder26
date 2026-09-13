WITH matched AS (
  SELECT i.id AS inst_id, u.id AS uni_id
  FROM public.institutions i
  JOIN LATERAL (
    SELECT u2.* FROM public.universities u2
    ORDER BY similarity(lower(i.official_name), lower(u2.name)) DESC LIMIT 1
  ) u ON true
  WHERE i.needs_review
    AND similarity(lower(i.official_name), lower(u.name)) >= 0.8
),
upd_uni AS (
  UPDATE public.universities u
  SET website_url = COALESCE(NULLIF(u.website_url,''), i.website_url),
      short_description = COALESCE(NULLIF(u.short_description,''), i.short_description),
      description = COALESCE(NULLIF(u.description,''), i.short_description),
      institution_type = COALESCE(u.institution_type, i.institution_type),
      gtec_accreditation_status = COALESCE(u.gtec_accreditation_status, i.gtec_accreditation_status),
      accreditation_status = COALESCE(NULLIF(u.accreditation_status,''), 'Accredited'),
      verification_status = 'verified',
      verified = true,
      needs_review = false,
      source_url = COALESCE(NULLIF(u.source_url,''), i.website_url),
      source_urls = CASE WHEN coalesce(array_length(u.source_urls,1),0) = 0 THEN i.source_urls ELSE u.source_urls END,
      last_verified_at = now(),
      updated_at = now()
  FROM matched m
  JOIN public.institutions i ON i.id = m.inst_id
  WHERE u.id = m.uni_id
  RETURNING u.id
)
UPDATE public.institutions i
SET university_id = m.uni_id,
    needs_review = false,
    last_verified_at = now(),
    updated_at = now()
FROM matched m
WHERE i.id = m.inst_id;