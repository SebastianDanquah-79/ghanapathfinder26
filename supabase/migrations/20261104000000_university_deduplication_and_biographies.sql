
BEGIN;

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS biography text,
  ADD COLUMN IF NOT EXISTS biography_source_url text,
  ADD COLUMN IF NOT EXISTS achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS slug_aliases text[] NOT NULL DEFAULT '{}'::text[];

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.universities'::regclass
      AND conname = 'universities_achievements_array_check'
  ) THEN
    ALTER TABLE public.universities
      ADD CONSTRAINT universities_achievements_array_check
      CHECK (jsonb_typeof(achievements) = 'array');
  END IF;
END
$constraint$;

DO $merge$
DECLARE
  pair record;
BEGIN
  FOR pair IN
    WITH city_suffix AS (
      SELECT b.id AS keep_id, d.id AS duplicate_id
      FROM public.universities d
      JOIN public.universities b
        ON lower(trim(b.name)) = lower(trim(regexp_replace(d.name, ', *[^,]+$', '')))
       AND b.id <> d.id
      WHERE d.name ~ ', *[^,]+$'
        AND lower(trim(split_part(d.name, ',', array_length(string_to_array(d.name, ','), 1)))) =
            lower(trim(coalesce(nullif(d.city, ''), d.location, '')))
    ),
    known_variants AS (
      SELECT b.id AS keep_id, d.id AS duplicate_id
      FROM public.universities b
      JOIN public.universities d ON (
        (b.name = 'Millar Institute For Transdisciplinary And Development Studies'
          AND d.name = 'Millar Institute of Transdisciplinary And Development Studies')
        OR (b.name = 'Nursing and Midwifery Training College, Keta'
          AND d.name = 'Nursinig and Midwifery Training college, Keta')
        OR (b.name = 'Nursing and Midwifery Training College, Kete-Krachi'
          AND d.name = 'Nursinig and Midwifery Training college, Kete-Krachi')
        OR (b.name = 'Nursing and Midwifery Training School, Gushegu'
          AND d.name = 'Nusing and Midwifery Training School, Gushegu')
        OR (b.name = 'Academic City University'
          AND d.name = 'Academic City College')
        OR (b.name = 'University of Health and Allied Sciences'
          AND d.name = 'University of Health and Allied Science')
        OR (b.name = 'Berekum College of Education'
          AND d.name = 'Berekum College of Education, Berekum')
        OR (b.name = 'Gbewaa College of Education'
          AND d.name = 'Gbewaa College of Education, Gbewaa')
        OR (b.name = 'Lancaster University'
          AND d.name = 'Lancaster University, Ghana Campus')
        OR (b.name = 'Mampong Technical College of Education'
          AND d.name = 'Mampong Technical College of Education, Ashanti Mampong')
        OR (b.name = 'Pharmtrust Professional College'
          AND d.name = 'Pharmatrust Professional College, Accra')
        OR (b.name = 'Presbyterian Women’s College of Education'
          AND d.name = 'Presbyterian Women''s College of Education, Aburi')
        OR (b.name = 'Saviour Church Nursing and Midwifery Training College'
          AND d.name = 'Saviour Church Nursing and Training College')
        OR (b.name = 'St. Joseph’s College of Education'
          AND d.name = 'St. Joseph''s College of Education, Bechem')
        OR (b.name = 'St Louis College of Education'
          AND d.name = 'St. Louis College of Education, Kumasi')
        OR (b.name = 'St. Theresa’s College of Education'
          AND d.name = 'St. Teresa''s College of Education, Hohoe')
        OR (b.name = 'Assinman Nursing and Midwifery Training College'
          AND d.name = 'Assinman Nursing and Midwifrey Training College, Assin Fosu')
      )
    ),
    pairs AS (
      SELECT keep_id, duplicate_id FROM city_suffix
      UNION
      SELECT keep_id, duplicate_id FROM known_variants
    )
    SELECT p.keep_id, p.duplicate_id, k.name AS keep_name, k.slug AS keep_slug,
           d.name AS duplicate_name, d.slug AS duplicate_slug
    FROM pairs p
    JOIN public.universities k ON k.id = p.keep_id
    JOIN public.universities d ON d.id = p.duplicate_id
    ORDER BY k.name
  LOOP
    UPDATE public.campuses SET institution_id = pair.keep_id WHERE institution_id = pair.duplicate_id;
    UPDATE public.faculties SET institution_id = pair.keep_id WHERE institution_id = pair.duplicate_id;
    UPDATE public.international_pathway_rules SET institution_id = pair.keep_id WHERE institution_id = pair.duplicate_id;
    UPDATE public.logo_requests SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;
    UPDATE public.programme_admission_estimates SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;
    UPDATE public.programme_cutoffs SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;
    UPDATE public.programmes SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;
    UPDATE public.student_insights SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;
    UPDATE public.institutions SET university_id = pair.keep_id WHERE university_id = pair.duplicate_id;

    DELETE FROM public.saved_items old_item
    USING public.saved_items kept_item
    WHERE old_item.user_id = kept_item.user_id
      AND old_item.item_type = 'university'
      AND kept_item.item_type = 'university'
      AND old_item.item_key = pair.duplicate_slug
      AND kept_item.item_key = pair.keep_slug;

    UPDATE public.saved_items
    SET item_key = pair.keep_slug,
        title = pair.keep_name,
        updated_at = now()
    WHERE item_type = 'university'
      AND item_key = pair.duplicate_slug;

    UPDATE public.universities k
    SET
      aliases = ARRAY(
        SELECT DISTINCT value
        FROM unnest(
          coalesce(k.aliases, '{}'::text[]) ||
          coalesce(d.aliases, '{}'::text[]) ||
          ARRAY[pair.duplicate_name]::text[]
        ) AS values_to_keep(value)
        WHERE nullif(trim(value), '') IS NOT NULL
        ORDER BY value
      ),
      source_urls = ARRAY(
        SELECT DISTINCT value
        FROM unnest(
          coalesce(k.source_urls, '{}'::text[]) ||
          coalesce(d.source_urls, '{}'::text[]) ||
          ARRAY[k.source_url, d.source_url, k.primary_source_url, d.primary_source_url]::text[]
        ) AS sources(value)
        WHERE nullif(trim(value), '') IS NOT NULL
        ORDER BY value
      ),
      top_programmes = ARRAY(
        SELECT DISTINCT value
        FROM unnest(coalesce(k.top_programmes, '{}'::text[]) || coalesce(d.top_programmes, '{}'::text[])) AS programmes(value)
        WHERE nullif(trim(value), '') IS NOT NULL
        ORDER BY value
      ),
      slug_aliases = ARRAY(
        SELECT DISTINCT value
        FROM unnest(
          coalesce(k.slug_aliases, '{}'::text[]) ||
          coalesce(d.slug_aliases, '{}'::text[]) ||
          ARRAY[pair.duplicate_slug]::text[]
        ) AS slugs(value)
        WHERE nullif(trim(value), '') IS NOT NULL
        ORDER BY value
      ),
      description = coalesce(nullif(trim(k.description), ''), nullif(trim(d.description), '')),
      short_description = coalesce(nullif(trim(k.short_description), ''), nullif(trim(d.short_description), '')),
      biography = coalesce(nullif(trim(k.biography), ''), nullif(trim(d.biography), '')),
      biography_source_url = coalesce(k.biography_source_url, d.biography_source_url),
      achievements = coalesce(k.achievements, '[]'::jsonb) || coalesce(d.achievements, '[]'::jsonb),
      website_url = coalesce(nullif(k.website_url, ''), nullif(d.website_url, '')),
      source_url = coalesce(nullif(k.source_url, ''), nullif(d.source_url, '')),
      primary_source_url = coalesce(nullif(k.primary_source_url, ''), nullif(d.primary_source_url, '')),
      city = coalesce(nullif(k.city, ''), nullif(d.city, '')),
      region = coalesce(nullif(k.region, ''), nullif(d.region, '')),
      location = coalesce(nullif(k.location, ''), nullif(d.location, '')),
      established_year = coalesce(k.established_year, d.established_year),
      logo_url = coalesce(nullif(k.logo_url, ''), nullif(d.logo_url, '')),
      logo_source_url = coalesce(nullif(k.logo_source_url, ''), nullif(d.logo_source_url, '')),
      admissions_url = coalesce(nullif(k.admissions_url, ''), nullif(d.admissions_url, '')),
      financial_aid_url = coalesce(nullif(k.financial_aid_url, ''), nullif(d.financial_aid_url, '')),
      admission_info = coalesce(nullif(k.admission_info, ''), nullif(d.admission_info, '')),
      scholarship_info = coalesce(nullif(k.scholarship_info, ''), nullif(d.scholarship_info, '')),
      campus_vibe = coalesce(nullif(k.campus_vibe, ''), nullif(d.campus_vibe, '')),
      verified = k.verified OR d.verified,
      updated_at = now()
    FROM public.universities d
    WHERE k.id = pair.keep_id
      AND d.id = pair.duplicate_id;

    DELETE FROM public.universities WHERE id = pair.duplicate_id;
  END LOOP;
END
$merge$;


UPDATE public.universities u
SET
  biography = coalesce(
    nullif(trim(u.biography), ''),
    nullif(trim(u.description), ''),
    nullif(trim(u.short_description), ''),
    u.name || ' is a ' ||
      CASE lower(coalesce(u.type, ''))
        WHEN 'public' THEN 'public'
        WHEN 'private' THEN 'private'
        WHEN 'regional' THEN 'regional'
        ELSE 'tertiary'
      END || ' tertiary education institution' ||
      CASE lower(coalesce(u.category, ''))
        WHEN 'university' THEN ' providing university-level higher education.'
        WHEN 'technical university' THEN ' focused on technical and applied higher education.'
        WHEN 'college of education' THEN ' focused on teacher education and professional preparation.'
        WHEN 'private college of education' THEN ' focused on teacher education and professional preparation.'
        WHEN 'nursing/health training' THEN ' focused on nursing and health-professions training.'
        WHEN 'nursing and midwifery training college' THEN ' focused on nursing and midwifery education.'
        WHEN 'tutorial college' THEN ' providing tutorial and academic preparation.'
        WHEN 'professional institution' THEN ' providing professional and tertiary-level education.'
        WHEN 'private tertiary institution' THEN ' providing tertiary-level education and training.'
        ELSE ' listed in Ghana’s tertiary education directory.'
      END ||
      CASE
        WHEN nullif(trim(coalesce(u.city, u.location, '')), '') IS NOT NULL
          THEN ' It is located in ' || trim(coalesce(u.city, u.location, '')) || ', Ghana.'
        ELSE ' It is listed in Ghana, although a more precise campus location is not currently recorded.'
      END ||
      ' GhanaPathFinder links this profile to the Ghana Tertiary Education Commission (GTEC) institution register for reference. A detailed founding history and notable institutional achievements are published only when they can be confirmed from official institutional or regulator sources.'
  ),
  biography_source_url = coalesce(
    nullif(trim(u.biography_source_url), ''),
    nullif(trim(u.website_url), ''),
    nullif(trim(u.primary_source_url), ''),
    nullif(trim(u.source_url), ''),
    u.source_urls[1]
  ),
  achievements = coalesce(u.achievements, '[]'::jsonb),
  updated_at = now()
WHERE u.biography IS NULL OR trim(u.biography) = ''
   OR u.achievements IS NULL;

UPDATE public.universities u
SET achievements = jsonb_build_array(
  jsonb_build_object(
    'title', 'Regulatory recognition: active on the GTEC register',
    'description', 'The Ghana Tertiary Education Commission institution-register record lists this institution as active. This is a regulatory standing, not an award, ranking or performance claim.',
    'year', null,
    'source_url', coalesce(
      (SELECT s FROM unnest(coalesce(u.source_urls, '{}'::text[])) s WHERE s ILIKE '%gtec.edu.gh%' ORDER BY s LIMIT 1),
      nullif(u.source_url, ''),
      nullif(u.primary_source_url, '')
    ),
    'source_name', 'Ghana Tertiary Education Commission',
    'verified', true
  )
),
updated_at = now()
WHERE lower(coalesce(u.gtec_accreditation_status, '')) LIKE '%active%'
  AND (
    u.source_url ILIKE '%gtec.edu.gh%'
    OR u.primary_source_url ILIKE '%gtec.edu.gh%'
    OR EXISTS (
      SELECT 1 FROM unnest(coalesce(u.source_urls, '{}'::text[])) s
      WHERE s ILIKE '%gtec.edu.gh%'
    )
  )
  AND jsonb_array_length(coalesce(u.achievements, '[]'::jsonb)) = 0;

COMMIT;
