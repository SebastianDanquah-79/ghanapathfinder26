-- Additional top-up and diploma offerings explicitly identified in official institutional catalogues.
-- Top-up labels are listed separately only where the source says the same bachelor programmes are available in top-up form.
WITH incoming(university_id,name,slug,field,qualification,degree_type,duration,source_url) AS (
 VALUES
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Information Technology (Top-Up)','bsc-information-technology-top-up-gctu','BSc Information Technology (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Mobile Computing (Top-Up)','bsc-mobile-computing-top-up-gctu','BSc Mobile Computing (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Information Systems (Top-Up)','bsc-information-systems-top-up-gctu','BSc Information Systems (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Computer Science (Top-Up)','bsc-computer-science-top-up-gctu','BSc Computer Science (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Computer Science (Cyber Security option) (Top-Up)','bsc-computer-science-cyber-security-option-top-up-gctu','BSc Computer Science (Cyber Security option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Data Science and Analytics (Top-Up)','bsc-data-science-and-analytics-top-up-gctu','BSc Data Science and Analytics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Networking and Systems Administration (Top-Up)','bsc-networking-and-systems-administration-top-up-gctu','BSc Networking and Systems Administration (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Software Engineering (Top-Up)','bsc-software-engineering-top-up-gctu','BSc Software Engineering (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Internet of Things and Big Data (Top-Up)','bsc-internet-of-things-and-big-data-top-up-gctu','BSc Internet of Things and Big Data (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Web Application Development (Top-Up)','bsc-web-application-development-top-up-gctu','BSc Web Application Development (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Telecommunication Engineering (Top-Up)','bsc-telecommunication-engineering-top-up-gctu','BSc Telecommunication Engineering (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Computer Engineering (Top-Up)','bsc-computer-engineering-top-up-gctu','BSc Computer Engineering (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Electrical and Electronics Engineering (Top-Up)','bsc-electrical-and-electronics-engineering-top-up-gctu','BSc Electrical and Electronics Engineering (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Mathematics (Top-Up)','bsc-mathematics-top-up-gctu','BSc Mathematics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Actuarial Science with Data Analytics (Top-Up)','bsc-actuarial-science-with-data-analytics-top-up-gctu','BSc Actuarial Science with Data Analytics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Computational Statistics (Top-Up)','bsc-computational-statistics-top-up-gctu','BSc Computational Statistics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Accounting with Computing (Top-Up)','bsc-accounting-with-computing-top-up-gctu','BSc Accounting with Computing (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Economics (Top-Up)','bsc-economics-top-up-gctu','BSc Economics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Procurement and Logistics (Top-Up)','bsc-procurement-and-logistics-top-up-gctu','BSc Procurement and Logistics (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc E-Commerce and Marketing Management (Top-Up)','bsc-e-commerce-and-marketing-management-top-up-gctu','BSc E-Commerce and Marketing Management (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Financial Technology (Top-Up)','bsc-financial-technology-top-up-gctu','BSc Financial Technology (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Business Administration (Banking and Finance option) (Top-Up)','bsc-business-administration-banking-and-finance-option-top-up-gctu','BSc Business Administration (Banking and Finance option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Business Administration (Human Resource Management option) (Top-Up)','bsc-business-administration-human-resource-management-option-top-up-gctu','BSc Business Administration (Human Resource Management option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Business Administration (Marketing option) (Top-Up)','bsc-business-administration-marketing-option-top-up-gctu','BSc Business Administration (Marketing option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Business Administration (Accounting option) (Top-Up)','bsc-business-administration-accounting-option-top-up-gctu','BSc Business Administration (Accounting option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('4cb9e048-7c16-4dc1-a053-426e64ae28fd'::uuid,'BSc Business Administration (Management option) (Top-Up)','bsc-business-administration-management-option-top-up-gctu','BSc Business Administration (Management option) (Top-Up)','BSc','Undergraduate','2 years','https://site.gctu.edu.gh/2026-2027-admissions'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Automotive Engineering','diploma-in-automotive-engineering-kstu','Diploma in Automotive Engineering','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Automotive Engineering (Tertiary)','diploma-in-automotive-engineering-tertiary-kstu','Diploma in Automotive Engineering (Tertiary)','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Chemical Engineering','diploma-in-chemical-engineering-kstu','Diploma in Chemical Engineering','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Civil Engineering (Tertiary)','diploma-in-civil-engineering-tertiary-kstu','Diploma in Civil Engineering (Tertiary)','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Electrical and Electronic Engineering','diploma-in-electrical-and-electronic-engineering-kstu','Diploma in Electrical and Electronic Engineering','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Hardware and Networking','diploma-in-hardware-and-networking-kstu','Diploma in Hardware and Networking','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Mass Communication and Journalism','diploma-in-mass-communication-and-journalism-kstu','Diploma in Mass Communication and Journalism','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Statistics for Risk Management','diploma-in-statistics-for-risk-management-kstu','Diploma in Statistics for Risk Management','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Banking Technology and Finance','diploma-in-banking-technology-and-finance-kstu','Diploma in Banking Technology and Finance','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Information Technology','diploma-in-information-technology-kstu','Diploma in Information Technology','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Library and Information Science','diploma-in-library-and-information-science-kstu','Diploma in Library and Information Science','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Business Administration','diploma-in-business-administration-kstu','Diploma in Business Administration','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Procurement and Materials Management','diploma-in-procurement-and-materials-management-kstu','Diploma in Procurement and Materials Management','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes'),
 ('a7b76479-a9cf-42b5-b3dd-6db7ba3d925e'::uuid,'Diploma in Agribusiness and Finance','diploma-in-agribusiness-and-finance-kstu','Diploma in Agribusiness and Finance','Diploma','Diploma','2 years','https://jrid.kstu.edu.gh/academics/programmes')
), clean AS (
 SELECT DISTINCT ON (university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g'))) *
 FROM incoming ORDER BY university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g'))
)
INSERT INTO public.programmes
(university_id,name,slug,field,qualification,degree_type,duration,programme_url,source_url,primary_source_url,
 source_urls,source_tier,verification_status,verified,needs_review,verification_method,verification_notes,notes,field_sources)
SELECT c.university_id,c.name,c.slug,
 regexp_replace(c.name,'^(Bachelor of Science in |Bachelor of Technology in |Bachelor of Engineering in |Bachelor of Arts in |Bachelor Of Science |BSc[.]? |BEng |BTech |BA |MSc[.]? |MPhil |PhD |Master of Technology in |Diploma in |MBA |MA )','','i'),
 c.qualification,c.degree_type,c.duration,c.source_url,c.source_url,c.source_url,
 ARRAY[c.source_url],'official_institution_catalogue','source_linked_needs_individual_review',false,true,
 'Official programme / admissions listing','Official source confirms qualification category and programme or top-up availability; individual intake details still require review.',
 'Source-linked import; not independently verified.',jsonb_build_object('name',c.source_url,'qualification',c.source_url,'duration',c.source_url,'institution',c.source_url)
FROM clean c
WHERE NOT EXISTS (
 SELECT 1 FROM public.programmes p WHERE p.university_id=c.university_id
 AND lower(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=lower(regexp_replace(c.name,'[^a-zA-Z0-9]','','g'))
)
ON CONFLICT DO NOTHING;
