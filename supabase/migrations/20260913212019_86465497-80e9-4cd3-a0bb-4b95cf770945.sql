-- 1. Internship / graduate programme providers
INSERT INTO public.internship_providers (name, sector, provider_type, website_url, programme_summary, application_url, paid, source_urls, last_verified_at, needs_review)
VALUES
 ('MTN Ghana','Telecommunications','Corporate','https://mtn.com.gh','Graduate trainee and internship placements across engineering, technology, finance and commercial functions.','https://mtn.com.gh/careers/',true,ARRAY['https://mtn.com.gh/careers/'],now(),false),
 ('Ecobank Ghana','Banking & Finance','Corporate','https://ecobank.com','Internships and the Ecobank graduate programme across retail, corporate banking and technology.','https://ecobank.com/gh/careers',true,ARRAY['https://ecobank.com/gh/careers'],now(),false),
 ('Tullow Oil Ghana','Oil & Gas','Corporate','https://www.tullowoil.com','Internships and early-career roles in petroleum engineering, geoscience, HSE and finance.','https://www.tullowoil.com/careers/',true,ARRAY['https://www.tullowoil.com/careers/'],now(),false),
 ('KPMG Ghana','Professional Services','Corporate','https://kpmg.com/gh/en/home.html','Audit, tax and advisory internships and graduate recruitment for Ghanaian students.','https://kpmg.com/gh/en/careers.html',true,ARRAY['https://kpmg.com/gh/en/careers.html'],now(),false),
 ('PwC Ghana','Professional Services','Corporate','https://www.pwc.com/gh/en.html','Student internships and graduate entry into assurance, tax and consulting.','https://www.pwc.com/gh/en/careers.html',true,ARRAY['https://www.pwc.com/gh/en/careers.html'],now(),false),
 ('Deloitte Ghana','Professional Services','Corporate','https://www.deloitte.com/gh/en.html','Internships and graduate roles in audit, risk advisory, tax and consulting.','https://www.deloitte.com/gh/en/careers.html',true,ARRAY['https://www.deloitte.com/gh/en/careers.html'],now(),false),
 ('EY Ghana','Professional Services','Corporate','https://www.ey.com/en_gl','Student programmes and graduate recruitment in assurance, consulting, strategy and tax.','https://www.ey.com/en_gl/careers',true,ARRAY['https://www.ey.com/en_gl/careers'],now(),false),
 ('Fidelity Bank Ghana','Banking & Finance','Corporate','https://fidelitybank.com.gh','National service, internship and graduate trainee openings in banking operations and technology.','https://fidelitybank.com.gh/careers/',true,ARRAY['https://fidelitybank.com.gh/careers/'],now(),false),
 ('CalBank','Banking & Finance','Corporate','https://calbank.net','Internship and entry-level banking roles advertised on the bank''s careers page.','https://calbank.net/careers/',true,ARRAY['https://calbank.net/careers/'],now(),false),
 ('Zenith Bank Ghana','Banking & Finance','Corporate','https://www.zenithbank.com.gh','Graduate recruitment and internship openings in retail and corporate banking.','https://www.zenithbank.com.gh/careers/',true,ARRAY['https://www.zenithbank.com.gh/careers/'],now(),false),
 ('Newmont Ghana','Mining','Corporate','https://www.newmont.com','Internships, national service and graduate programmes at the Ahafo and Akyem mines.','https://jobs.newmont.com/',true,ARRAY['https://jobs.newmont.com/'],now(),false),
 ('Unilever Ghana','Manufacturing & FMCG','Corporate','https://www.unilever.com','Unilever Future Leaders Programme and student internships in supply chain, marketing and finance.','https://careers.unilever.com/',true,ARRAY['https://careers.unilever.com/'],now(),false),
 ('GCB Bank','Banking & Finance','Corporate','https://www.gcbbank.com.gh',NULL,NULL,NULL,ARRAY['https://www.gcbbank.com.gh'],now(),true),
 ('Telecel Ghana','Telecommunications','Corporate','https://telecel.com.gh',NULL,NULL,NULL,ARRAY['https://telecel.com.gh'],now(),true);

-- 2. Next GTEC batch of institutions
INSERT INTO public.institutions (official_name, institution_type, gtec_accreditation_status, region, town, website_url, short_description, source_urls, last_verified_at, needs_review)
VALUES
 ('Data Link Institute','Private University College','Accredited','Central','Tema','https://datalink.edu.gh','Private tertiary institution offering business, computing and health information programmes.',ARRAY['https://datalink.edu.gh','https://gtec.edu.gh'],now(),true),
 ('Anglican University College of Technology','Private University College','Accredited','Bono','Nkoranza','https://angutech.edu.gh','Church-founded university college offering business, education and technology programmes.',ARRAY['https://angutech.edu.gh','https://gtec.edu.gh'],now(),true),
 ('Perez University College','Private University College','Accredited','Central','Winneba','https://perez.edu.gh','Private university college offering theology, business and education programmes.',ARRAY['https://perez.edu.gh','https://gtec.edu.gh'],now(),true),
 ('OLA College of Education','College of Education','Accredited','Central','Cape Coast','https://olacoe.edu.gh','Public college of education training basic school teachers.',ARRAY['https://olacoe.edu.gh','https://gtec.edu.gh'],now(),true),
 ('Atebubu College of Education','College of Education','Accredited','Bono East','Atebubu','https://atecoe.edu.gh','Public college of education awarding the Bachelor of Education.',ARRAY['https://atecoe.edu.gh','https://gtec.edu.gh'],now(),true),
 ('SDA College of Education','College of Education','Accredited','Eastern','Asokore-Koforidua','https://sdacoe.edu.gh','Public college of education training basic school teachers.',ARRAY['https://sdacoe.edu.gh','https://gtec.edu.gh'],now(),true),
 ('Enchi College of Education','College of Education','Accredited','Western North','Enchi','https://enchicoe.edu.gh','Public college of education awarding the Bachelor of Education.',ARRAY['https://enchicoe.edu.gh','https://gtec.edu.gh'],now(),true);

-- 3. Approve the new institutions and publish them in the directory
WITH pending AS (
  SELECT i.*, u.id AS match_id
  FROM public.institutions i
  LEFT JOIN LATERAL (
    SELECT u.id FROM public.universities u
    WHERE similarity(lower(u.name), lower(i.official_name)) >= 0.8
    ORDER BY similarity(lower(u.name), lower(i.official_name)) DESC LIMIT 1
  ) u ON true
  WHERE i.needs_review = true
    AND i.website_url IN ('https://datalink.edu.gh','https://angutech.edu.gh','https://perez.edu.gh','https://olacoe.edu.gh','https://atecoe.edu.gh','https://sdacoe.edu.gh','https://enchicoe.edu.gh')
), updated AS (
  UPDATE public.universities u
  SET website_url = COALESCE(u.website_url, p.website_url),
      short_description = COALESCE(u.short_description, p.short_description),
      institution_type = COALESCE(u.institution_type, p.institution_type),
      gtec_accreditation_status = COALESCE(u.gtec_accreditation_status, p.gtec_accreditation_status),
      verification_status = 'verified', verified = true, needs_review = false,
      source_urls = p.source_urls, last_verified_at = now(), updated_at = now()
  FROM pending p WHERE u.id = p.match_id
  RETURNING u.id
), inserted AS (
  INSERT INTO public.universities (slug, name, country, location, region, type, category, description, short_description, website_url, institution_type, gtec_accreditation_status, accreditation_status, verification_status, verified, needs_review, source_url, source_urls, last_verified_at)
  SELECT regexp_replace(lower(p.official_name), '[^a-z0-9]+', '-', 'g'), p.official_name, 'Ghana', p.town, p.region,
         CASE WHEN p.institution_type ILIKE 'private%' THEN 'Private' ELSE 'Public' END,
         CASE WHEN p.institution_type ILIKE '%College of Education%' THEN 'College of Education' ELSE 'University College' END,
         p.short_description, p.short_description, p.website_url, p.institution_type, p.gtec_accreditation_status,
         'Accredited', 'verified', true, false, p.website_url, p.source_urls, now()
  FROM pending p WHERE p.match_id IS NULL
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
UPDATE public.institutions i
SET needs_review = false, last_verified_at = now(), updated_at = now()
FROM pending p WHERE i.id = p.id;