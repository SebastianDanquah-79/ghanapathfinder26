
INSERT INTO public.internship_providers (name, sector, provider_type, website_url, logo_source_url, programme_summary, application_url, paid, source_urls, last_verified_at, needs_review)
VALUES
 ('AngloGold Ashanti Ghana','Mining','Corporate','https://www.anglogoldashanti.com', NULL,'Graduate, apprentice and vacation attachment openings at the Obuasi and Iduapriem mines are advertised on the group careers page.','https://www.anglogoldashanti.com/careers/', true, ARRAY['https://www.anglogoldashanti.com/careers/'], now(), false),
 ('Vivo Energy Ghana','Oil & Gas','Corporate','https://vivoenergy.com', NULL,'Shell-licensed fuels and lubricants marketer running graduate and internship intakes advertised on the group careers page.','https://vivoenergy.com/careers/', true, ARRAY['https://vivoenergy.com/careers/'], now(), false),
 ('Databank Ghana','Banking & Finance','Corporate','https://www.databankgroup.com', NULL,'Investment banking and asset management firm listing internship and analyst openings on its careers page.','https://www.databankgroup.com/careers', true, ARRAY['https://www.databankgroup.com/careers'], now(), false),
 ('Ghana Ports and Harbours Authority','Public Sector','Public agency','https://ghanaports.gov.gh', NULL,'State ports authority in Tema and Takoradi taking student attachments and national service personnel; vacancies are posted on the official site.','https://ghanaports.gov.gh/', NULL, ARRAY['https://ghanaports.gov.gh/'], now(), false),
 ('Standard Chartered Bank Ghana','Banking & Finance','Corporate','https://www.sc.com/gh/', NULL,'International graduate programme and internships applied for through the global Standard Chartered careers portal.','https://www.sc.com/en/careers/', true, ARRAY['https://www.sc.com/en/careers/'], now(), false),
 ('Bank of Ghana','Public Sector','Public agency','https://www.bog.gov.gh', NULL,'The central bank advertises internships, national service and entry-level recruitment on its official careers page.','https://www.bog.gov.gh/careers/', NULL, ARRAY['https://www.bog.gov.gh/careers/'], now(), false),
 ('Ghana Revenue Authority','Public Sector','Public agency','https://www.gra.gov.gh', NULL,'Tax administration agency posting recruitment, attachment and national service opportunities on its official career page.','https://www.gra.gov.gh/career/', NULL, ARRAY['https://www.gra.gov.gh/career/'], now(), false);

UPDATE public.internship_providers
SET application_url = 'https://careers.telecel.com/',
    programme_summary = 'Telecommunications operator running graduate and internship intakes advertised on the Telecel group careers portal.',
    paid = true,
    source_urls = ARRAY['https://telecel.com.gh','https://careers.telecel.com/'],
    last_verified_at = now(),
    needs_review = false
WHERE name = 'Telecel Ghana';
