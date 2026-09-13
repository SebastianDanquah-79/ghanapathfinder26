
UPDATE public.universities
SET logo_url = NULL,
    logo_verification_status = CASE WHEN logo_verification_status = 'verified' THEN logo_verification_status ELSE 'unverified' END
WHERE logo_url IS NOT NULL
  AND logo_verification_status IS DISTINCT FROM 'verified'
  AND (
    logo_url ILIKE '%gtec.edu.gh%'
    OR logo_url ILIKE '%icons.duckduckgo.com%'
    OR logo_url ILIKE '%google.com/s2/favicons%'
    OR logo_url ILIKE '%/favicon.ico%'
  );

UPDATE public.universities
SET logo_source_url = NULL
WHERE logo_source_url IS NOT NULL
  AND logo_verification_status IS DISTINCT FROM 'verified'
  AND logo_source_url !~* '\.(png|jpg|jpeg|svg|webp)(\?|$)';

UPDATE public.institutions
SET logo_source_url = NULL
WHERE logo_source_url IS NOT NULL
  AND logo_verification_status IS DISTINCT FROM 'verified'
  AND (logo_source_url ILIKE '%gtec.edu.gh%' OR logo_source_url !~* '\.(png|jpg|jpeg|svg|webp)(\?|$)');
