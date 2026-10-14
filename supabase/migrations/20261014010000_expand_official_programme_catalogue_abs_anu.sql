-- Source-backed programme catalogue expansion for All Nations University and Accra Business School.
-- Official programme lists were checked on 2026-10-14. These entries remain unverified until
-- each programme's current availability and full details are individually confirmed.
-- Unknown duration and admissions details are intentionally NULL rather than guessed.
WITH incoming(university_id,name,slug,field,qualification,degree_type,duration,source_url) AS (
  VALUES
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Diploma in Biomedical Engineering', 'diploma-biomedical-engineering-anu', 'Biomedical Engineering', 'Diploma', 'Diploma', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Diploma in Business Administration', 'diploma-business-administration-anu', 'Business Administration', 'Diploma', 'Diploma', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Diploma in Oil and Gas Engineering', 'diploma-oil-and-gas-engineering-anu', 'Oil and Gas Engineering', 'Diploma', 'Diploma', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Arts in Biblical Studies with Business Administration', 'ba-biblical-studies-business-administration-anu', 'Biblical Studies and Business Administration', 'BA', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Business Administration in Banking and Finance', 'bba-banking-finance-anu', 'Banking and Finance', 'BBA', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Business Administration in Entrepreneurship', 'bba-entrepreneurship-anu', 'Entrepreneurship', 'BBA', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Business Administration in Human Resource Management', 'bba-human-resource-management-anu', 'Human Resource Management', 'BBA', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Business Administration in Marketing', 'bba-marketing-anu', 'Marketing', 'BBA', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Engineering in Biomedical Engineering', 'beng-biomedical-engineering-anu', 'Biomedical Engineering', 'BEng', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Engineering in Computer Engineering', 'beng-computer-engineering-anu', 'Computer Engineering', 'BEng', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Engineering in Electronics and Communications Engineering', 'beng-electronics-communications-engineering-anu', 'Electronics and Communications Engineering', 'BEng', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Bachelor of Science in Computer Science', 'bsc-computer-science-anu', 'Computer Science', 'BSc', 'Bachelor', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Science in Cyber Security', 'msc-cyber-security-anu', 'Cyber Security', 'MSc', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Arts in Theology', 'ma-theology-anu', 'Theology', 'MA', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Business Administration in Accounting', 'mba-accounting-anu', 'Accounting', 'MBA', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Business Administration in Finance', 'mba-finance-anu', 'Finance', 'MBA', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Business Administration in Health Services Management', 'mba-health-services-management-anu', 'Health Services Management', 'MBA', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Business Administration in Marketing and Strategy', 'mba-marketing-strategy-anu', 'Marketing and Strategy', 'MBA', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Philosophy in Business Administration', 'mphil-business-administration-anu', 'Business Administration', 'MPhil', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Master of Philosophy in Theology', 'mphil-theology-anu', 'Theology', 'MPhil', 'Postgraduate', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Doctor of Ministry', 'doctor-of-ministry-anu', 'Ministry', 'DMin', 'Doctoral', NULL, 'https://anu.edu.gh/schools/programs'),
  ('8eb9571a-eaf9-4e0c-a532-9bb22716dd11', 'Doctor of Philosophy in Theology', 'phd-theology-anu', 'Theology', 'PhD', 'Doctoral', NULL, 'https://anu.edu.gh/schools/programs'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Dual MBA', 'dual-mba-abs', 'Business Administration', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Finance', 'mba-finance-abs', 'Finance', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Marketing and Communication', 'mba-marketing-communication-abs', 'Marketing and Communication', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Entrepreneurship and Innovation', 'mba-entrepreneurship-innovation-abs', 'Entrepreneurship and Innovation', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Business Intelligence and Analytics', 'mba-business-intelligence-analytics-abs', 'Business Intelligence and Analytics', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Human Resource Management', 'mba-human-resource-management-abs', 'Human Resource Management', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MBA in Operations and Supply Chain Management', 'mba-operations-supply-chain-management-abs', 'Operations and Supply Chain Management', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Wrexham University MBA', 'wrexham-university-mba-abs', 'Business Administration', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'KNUST MBA', 'knust-mba-abs', 'Business Administration', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'KNUST Global Executive MBA', 'knust-global-executive-mba-abs', 'Business Administration', 'Executive MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'UGC MBA', 'ugc-mba-abs', 'Business Administration', 'MBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MSc Accounting and Finance', 'msc-accounting-finance-abs', 'Accounting and Finance', 'MSc', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MSc Human Resource Management', 'msc-human-resource-management-abs', 'Human Resource Management', 'MSc', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MSc Communication and International Marketing', 'msc-communication-international-marketing-abs', 'Communication and International Marketing', 'MSc', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MSc International Relations', 'msc-international-relations-abs', 'International Relations', 'MSc', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MSc International Law, Security and Diplomacy', 'msc-international-law-security-diplomacy-abs', 'International Law, Security and Diplomacy', 'MSc', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'LLM International Law, Securities and Diplomacy', 'llm-international-law-securities-diplomacy-abs', 'International Law, Securities and Diplomacy', 'LLM', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'MA Biblical Studies and Practical Theology', 'ma-biblical-studies-practical-theology-abs', 'Biblical Studies and Practical Theology', 'MA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Postgraduate Diploma in Business Administration', 'pgd-business-administration-abs', 'Business Administration', 'PGDBA', 'Postgraduate', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'BSc Business Administration and Global Leadership', 'bsc-business-administration-global-leadership-abs', 'Business Administration and Global Leadership', 'BSc', 'Bachelor', NULL, 'https://abs.edu.gh/bsc-administration-global-leadership/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'BSc IT Management', 'bsc-it-management-abs', 'Information Technology Management', 'BSc', 'Bachelor', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'BSc Cybercrime and IT Security', 'bsc-cybercrime-it-security-abs', 'Cybercrime and IT Security', 'BSc', 'Bachelor', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Professional Graduate Diploma in IT', 'professional-graduate-diploma-it-abs', 'Information Technology', 'Professional Diploma', 'Professional', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Level 7 Extended Diploma in Strategic Management', 'level-7-extended-diploma-strategic-management-abs', 'Strategic Management', 'Level 7 Extended Diploma', 'Professional', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Level 7 Extended Diploma in Computing Technologies', 'level-7-extended-diploma-computing-technologies-abs', 'Computing Technologies', 'Level 7 Extended Diploma', 'Professional', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Level 6 Extended Diploma in Finance', 'level-6-extended-diploma-finance-abs', 'Finance', 'Level 6 Extended Diploma', 'Professional', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Level 6 Extended Diploma in Management Qualifications', 'level-6-extended-diploma-management-abs', 'Management', 'Level 6 Extended Diploma', 'Professional', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Level 6 Extended Diploma in Theology and Management', 'level-6-extended-diploma-theology-management-abs', 'Theology and Management', 'Level 6 Extended Diploma', 'Professional', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'PhD Research Foundations Programme', 'phd-research-foundations-abs', 'Research Foundations', 'Foundation Programme', 'Professional', NULL, 'https://abs.edu.gh/programmes/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Executive Mini-MBA', 'executive-mini-mba-abs', 'Business Administration', 'Mini-MBA', 'Professional', NULL, 'https://abs.edu.gh/apply-now/'),
  ('c171eeb7-acea-4325-afd6-5c46f42c2439', 'Executive Certificate in Business Administration', 'executive-certificate-business-administration-abs', 'Business Administration', 'Executive Certificate', 'Professional', NULL, 'https://abs.edu.gh/programmes/')
), clean AS (
  SELECT DISTINCT ON (university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g')))
    university_id,name,slug,field,qualification,degree_type,duration,source_url
  FROM incoming
  ORDER BY university_id, lower(regexp_replace(name,'[^a-zA-Z0-9]','','g'))
)
INSERT INTO public.programmes
  (university_id,name,slug,field,qualification,degree_type,duration,programme_url,source_url,
   primary_source_url,source_urls,source_tier,verification_status,verified,needs_review,
   verification_method,verification_notes,notes,field_sources)
SELECT
  c.university_id,c.name,c.slug,c.field,c.qualification,c.degree_type,c.duration,
  c.source_url,c.source_url,c.source_url,ARRAY[c.source_url],
  'official_institution_catalogue',
  'source_linked_needs_individual_review',false,true,
  'Official institutional programme listing',
  'Title and award label were taken from an official institution programme list checked on 2026-10-14. Current offer, exact award, admissions requirements, and duration require individual verification.',
  'Imported from an official institutional programme list on 2026-10-14. Not verified for current intake.',
  jsonb_build_object('name',c.source_url,'qualification',c.source_url,'institution',c.source_url)
FROM clean c
WHERE NOT EXISTS (
  SELECT 1 FROM public.programmes existing
  WHERE existing.university_id=c.university_id
    AND lower(regexp_replace(existing.name,'[^a-zA-Z0-9]','','g')) =
        lower(regexp_replace(c.name,'[^a-zA-Z0-9]','','g'))
)
ON CONFLICT DO NOTHING;
