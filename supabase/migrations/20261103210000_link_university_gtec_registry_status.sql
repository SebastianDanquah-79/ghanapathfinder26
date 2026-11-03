-- Attach exact-name GTEC registry evidence to matching university records.
-- This records the regulator's listing status; it deliberately does not set verified=true.
WITH exact_matches AS (
  SELECT
    u.id AS university_id,
    i.official_name,
    i.gtec_accreditation_status AS registry_status,
    i.source_urls AS registry_sources,
    i.last_verified_at AS registry_last_verified_at
  FROM public.universities u
  JOIN public.institutions i
    ON regexp_replace(lower(u.name), '[^a-z0-9]', '', 'g')
     = regexp_replace(lower(i.official_name), '[^a-z0-9]', '', 'g')
  WHERE lower(i.gtec_accreditation_status) IN ('active', 'expired')
),
updated AS (
  UPDATE public.universities u
  SET
    gtec_accreditation_status = CASE
      WHEN lower(m.registry_status) = 'active' THEN 'Active per GTEC institution register'
      WHEN lower(m.registry_status) = 'expired' THEN 'Expired per GTEC institution register'
      ELSE u.gtec_accreditation_status
    END,
    source_urls = (
      SELECT array_agg(DISTINCT source_url)
      FROM unnest(
        coalesce(u.source_urls, ARRAY[]::text[])
        || coalesce(m.registry_sources, ARRAY[]::text[])
      ) AS source_url
      WHERE source_url IS NOT NULL AND btrim(source_url) <> ''
    ),
    field_sources = jsonb_set(
      coalesce(u.field_sources, '{}'::jsonb),
      '{gtec_registry_status}',
      jsonb_build_object(
        'institution_name', m.official_name,
        'status', m.registry_status,
        'source_urls', to_jsonb(coalesce(m.registry_sources, ARRAY[]::text[])),
        'last_checked_at', m.registry_last_verified_at,
        'matching_method', 'Exact institution-name match after punctuation and whitespace normalization',
        'verified_flag_changed', false
      ),
      true
    ),
    updated_at = now()
  FROM exact_matches m
  WHERE u.id = m.university_id
  RETURNING u.id
)
SELECT
  count(*) AS updated_registry_status_records,
  count(*) FILTER (WHERE u.gtec_accreditation_status ILIKE 'Active per GTEC%') AS active_listings,
  count(*) FILTER (WHERE u.gtec_accreditation_status ILIKE 'Expired per GTEC%') AS expired_listings,
  count(*) FILTER (WHERE u.verified = false) AS remain_unverified
FROM updated x
JOIN public.universities u ON u.id = x.id;
