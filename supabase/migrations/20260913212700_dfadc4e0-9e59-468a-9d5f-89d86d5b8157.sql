
WITH batch(official_name, match_pattern, website_url, region, town) AS (
  VALUES
    ('Accra College of Education', 'Accra College of Education%', 'https://acce.edu.gh', 'Greater Accra', 'East Legon, Accra'),
    ('Wesley College of Education', 'Wesley College of Education%', 'https://www.wesco.edu.gh', 'Ashanti', 'Kumasi'),
    ('Presbyterian College of Education, Akropong', 'Presbyterian College of Education%', 'https://pce.edu.gh', 'Eastern', 'Akropong-Akuapem'),
    ('Komenda College of Education', 'Komenda College of Education%', 'https://www.komendacollege.edu.gh', 'Central', 'Komenda'),
    ('Bagabaga College of Education', 'Bagabaga College of Education%', 'https://bace.edu.gh', 'Northern', 'Tamale'),
    ('Akatsi College of Education', 'Akatsi College of Education%', 'https://akatsico.edu.gh', 'Volta', 'Akatsi'),
    ('Holy Child College of Education', 'Holy Child College of Education%', 'https://holicoe.edu.gh', 'Western', 'Takoradi'),
    ('Berekum College of Education', 'Berekum College of Education%', 'https://becoled.edu.gh', 'Bono', 'Berekum'),
    ('Peki College of Education', 'Peki College of Education%', 'https://pekicoe.edu.gh', 'Volta', 'Peki'),
    ('Ada College of Education', 'Ada College of Education%', 'https://adacoe.edu.gh', 'Greater Accra', 'Ada Foah'),
    ('Foso College of Education', 'Fos%College of Education%', 'https://fosco.edu.gh', 'Central', 'Assin Foso')
),
ins AS (
  INSERT INTO public.institutions (official_name, institution_type, gtec_accreditation_status, region, town, website_url, logo_source_url, short_description, needs_review, last_verified_at, source_urls)
  SELECT b.official_name,
         'College of Education',
         'Accredited (GTEC list)',
         b.region,
         b.town,
         b.website_url,
         b.website_url,
         b.official_name || ' is a GTEC-accredited public college of education training basic school teachers in Ghana.',
         false,
         now(),
         ARRAY[b.website_url, 'https://gtec.edu.gh']
  FROM batch b
  WHERE NOT EXISTS (
    SELECT 1 FROM public.institutions i WHERE lower(i.official_name) = lower(b.official_name)
  )
  RETURNING 1
)
UPDATE public.universities u
SET website_url = COALESCE(u.website_url, b.website_url),
    admissions_url = COALESCE(u.admissions_url, b.website_url),
    logo_source_url = b.website_url,
    source_url = COALESCE(u.source_url, b.website_url),
    source_type = 'gtec_register',
    verification_status = 'verified',
    accreditation_status = 'Accredited',
    verified = true,
    last_verified_at = now(),
    needs_review = false,
    updated_at = now()
FROM batch b
WHERE u.name ILIKE b.match_pattern;
