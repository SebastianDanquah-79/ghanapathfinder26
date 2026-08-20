
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sector text NOT NULL DEFAULT 'General',
  employer_type text NOT NULL DEFAULT 'Private',
  description text,
  location text,
  region text,
  size text,
  website_url text,
  careers_url text,
  logo_url text,
  verified boolean NOT NULL DEFAULT false,
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are publicly readable" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins manage companies" ON public.companies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  opportunity_type text NOT NULL DEFAULT 'Internship',
  description text,
  fields text[] NOT NULL DEFAULT '{}',
  careers text[] NOT NULL DEFAULT '{}',
  location text,
  region text,
  work_mode text NOT NULL DEFAULT 'On-site',
  duration text,
  paid boolean,
  stipend_text text,
  eligibility text,
  application_url text,
  deadline_text text,
  deadline_date date,
  verified boolean NOT NULL DEFAULT false,
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.internships TO anon;
GRANT SELECT ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internships are publicly readable" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Admins manage internships" ON public.internships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_internships_updated BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_internships_company ON public.internships(company_id);
CREATE INDEX idx_internships_careers ON public.internships USING gin (careers);
CREATE INDEX idx_internships_fields ON public.internships USING gin (fields);

INSERT INTO public.companies (slug, name, sector, employer_type, description, location, region, size, website_url, careers_url, verified, source_url, last_verified_at) VALUES
('mtn-ghana','MTN Ghana','Telecommunications','Private','Ghana''s largest mobile network operator, running mobile money, enterprise connectivity and a long-standing graduate and internship intake.','Accra','Greater Accra','Large (1000+)','https://mtn.com.gh','https://mtn.com.gh/careers/',true,'https://mtn.com.gh/careers/',now()),
('vodafone-telecel-ghana','Telecel Ghana','Telecommunications','Private','Telecom operator (formerly Vodafone Ghana) with roles in engineering, technology, marketing and customer operations.','Accra','Greater Accra','Large (1000+)','https://telecel.com.gh','https://telecel.com.gh/careers/',true,'https://telecel.com.gh/careers/',now()),
('hubtel','Hubtel','Technology / Fintech','Private','Ghanaian software and payments company building commerce, messaging and payment infrastructure used by major local businesses.','Accra','Greater Accra','Medium (100–999)','https://hubtel.com','https://hubtel.com/careers/',true,'https://hubtel.com/careers/',now()),
('mpharma','mPharma','Health Technology','Private','Health-tech company managing pharmaceutical inventory and financing for pharmacies and hospitals across Africa.','Accra','Greater Accra','Medium (100–999)','https://mpharma.com','https://mpharma.com/careers',true,'https://mpharma.com/careers',now()),
('zeepay','Zeepay Ghana','Fintech','Private','Mobile financial services company focused on cross-border remittances into mobile money wallets.','Accra','Greater Accra','Medium (100–999)','https://myzeepay.com','https://myzeepay.com/careers/',true,'https://myzeepay.com/careers/',now()),
('amalitech','AmaliTech','Technology / IT Services','Private','Training and IT services social enterprise running a well-known graduate trainee programme in software, data and cloud.','Takoradi & Accra','Western','Medium (100–999)','https://amalitech.org','https://amalitech.org/careers/',true,'https://amalitech.org/careers/',now()),
('turntabl','Turntabl','Software Engineering','Private','Accra-based software consultancy that trains and places junior engineers with international clients.','Accra','Greater Accra','Medium (100–999)','https://turntabl.io','https://turntabl.io/careers',true,'https://turntabl.io/careers',now()),
('dreamoval','DreamOval','Technology / Fintech','Private','Ghanaian software firm behind payment and digital banking platforms for financial institutions.','Accra','Greater Accra','Medium (100–999)','https://dreamoval.com','https://dreamoval.com/careers',true,'https://dreamoval.com/careers',now()),
('ecobank-ghana','Ecobank Ghana','Banking & Finance','Private','Pan-African bank with a Ghanaian retail, corporate and treasury operation and a structured graduate intake.','Accra','Greater Accra','Large (1000+)','https://ecobank.com/gh','https://ecobank.com/personal-banking/careers',true,'https://ecobank.com/personal-banking/careers',now()),
('gcb-bank','GCB Bank PLC','Banking & Finance','Private','Ghana''s largest indigenous bank by branch network, hiring in banking operations, risk, IT and finance.','Accra','Greater Accra','Large (1000+)','https://gcbbank.com.gh','https://gcbbank.com.gh/careers',true,'https://gcbbank.com.gh/careers',now()),
('databank','Databank Group','Investment & Asset Management','Private','Investment banking and asset management firm running research, brokerage and fund management desks.','Accra','Greater Accra','Medium (100–999)','https://databankgroup.com','https://databankgroup.com/careers/',true,'https://databankgroup.com/careers/',now()),
('bank-of-ghana','Bank of Ghana','Central Banking / Public','Public','Ghana''s central bank, with roles and attachments in economics, research, banking supervision and IT.','Accra','Greater Accra','Large (1000+)','https://bog.gov.gh','https://bog.gov.gh/careers/',true,'https://bog.gov.gh/careers/',now()),
('tullow-ghana','Tullow Ghana','Oil & Gas','Private','Independent oil and gas producer operating the Jubilee and TEN fields offshore Ghana.','Accra / Takoradi','Greater Accra','Large (1000+)','https://tullowoil.com','https://tullowoil.com/careers/',true,'https://tullowoil.com/careers/',now()),
('newmont-ghana','Newmont Africa (Ghana)','Mining','Private','Gold mining company operating the Ahafo and Akyem mines, with engineering, geology, HSE and finance roles.','Accra / Ahafo','Ahafo','Large (1000+)','https://newmont.com','https://jobs.newmont.com',true,'https://jobs.newmont.com',now()),
('goldfields-ghana','Gold Fields Ghana','Mining','Private','Operator of the Tarkwa and Damang gold mines, offering graduate and student attachment opportunities.','Tarkwa','Western','Large (1000+)','https://goldfields.com','https://goldfields.com/careers.php',true,'https://goldfields.com/careers.php',now()),
('vra','Volta River Authority','Energy & Power','Public','State power generator running Akosombo, Kpong and thermal plants; recruits engineers and technicians.','Akosombo / Accra','Eastern','Large (1000+)','https://vra.com','https://vra.com/careers/index.php',true,'https://vra.com/careers/index.php',now()),
('ecg','Electricity Company of Ghana','Energy & Power','Public','National electricity distributor with engineering, commercial and IT operations across the southern sector.','Accra','Greater Accra','Large (1000+)','https://ecg.com.gh','https://ecg.com.gh/index.php/careers',true,'https://ecg.com.gh/index.php/careers',now()),
('ghana-health-service','Ghana Health Service','Health','Public','Public health delivery agency; the main employer of nurses, midwives, allied health and public health staff.','Nationwide','Greater Accra','Large (1000+)','https://ghs.gov.gh','https://ghs.gov.gh/vacancies/',true,'https://ghs.gov.gh/vacancies/',now()),
('korle-bu','Korle Bu Teaching Hospital','Health','Public','Ghana''s largest teaching hospital and a primary clinical training site for medical and allied health students.','Accra','Greater Accra','Large (1000+)','https://kbth.gov.gh','https://kbth.gov.gh/category/vacancies/',true,'https://kbth.gov.gh/category/vacancies/',now()),
('unilever-ghana','Unilever Ghana','Manufacturing / FMCG','Private','Consumer goods manufacturer with supply chain, marketing, finance and engineering functions.','Tema','Greater Accra','Large (1000+)','https://unilever.com.gh','https://careers.unilever.com',true,'https://careers.unilever.com',now()),
('nestle-ghana','Nestlé Ghana','Manufacturing / FMCG','Private','Food and beverage manufacturer running the Tema factory plus commercial and technical graduate programmes.','Tema','Greater Accra','Large (1000+)','https://nestle-cwa.com','https://nestle-cwa.com/en/jobs',true,'https://nestle-cwa.com/en/jobs',now()),
('kpmg-ghana','KPMG Ghana','Professional Services','Private','Audit, tax and advisory firm with a structured graduate and student internship intake.','Accra','Greater Accra','Medium (100–999)','https://kpmg.com/gh','https://kpmg.com/gh/en/careers.html',true,'https://kpmg.com/gh/en/careers.html',now()),
('pwc-ghana','PwC Ghana','Professional Services','Private','Assurance, tax and consulting firm recruiting graduates in accounting, economics and technology.','Accra','Greater Accra','Medium (100–999)','https://pwc.com/gh','https://pwc.com/gh/en/careers.html',true,'https://pwc.com/gh/en/careers.html',now()),
('deloitte-ghana','Deloitte Ghana','Professional Services','Private','Audit, consulting and risk advisory practice with annual graduate and internship recruitment.','Accra','Greater Accra','Medium (100–999)','https://deloitte.com/gh','https://deloitte.com/gh/en/careers.html',true,'https://deloitte.com/gh/en/careers.html',now()),
('ghana-tech-lab','Ghana Tech Lab','Technology / Training','Non-profit','Digital skills training hub delivering software, data and digital marketing cohorts for young Ghanaians.','Accra','Greater Accra','Small (10–99)','https://ghanatechlab.com','https://ghanatechlab.com/programs/',true,'https://ghanatechlab.com/programs/',now()),
('kosmos-innovation-center','Kosmos Innovation Center','Agribusiness / Innovation','Non-profit','Runs agritech and entrepreneurship challenges and internships for Ghanaian university students and graduates.','Accra','Greater Accra','Small (10–99)','https://kosmosinnovationcenter.com','https://kosmosinnovationcenter.com/ghana/',true,'https://kosmosinnovationcenter.com/ghana/',now()),
('mest-africa','MEST Africa','Technology / Entrepreneurship','Non-profit','Pan-African training programme and seed fund for software entrepreneurs, headquartered in Accra.','Accra','Greater Accra','Small (10–99)','https://meltwater.org','https://meltwater.org/apply/',true,'https://meltwater.org/apply/',now()),
('ghana-cocoa-board','Ghana Cocoa Board (COCOBOD)','Agriculture','Public','Regulator and marketer of Ghana''s cocoa industry, employing agronomists, quality officers and economists.','Accra','Greater Accra','Large (1000+)','https://cocobod.gh','https://cocobod.gh/careers',true,'https://cocobod.gh/careers',now()),
('ghana-revenue-authority','Ghana Revenue Authority','Public Sector','Public','National tax administration recruiting in accounting, law, economics and IT.','Accra','Greater Accra','Large (1000+)','https://gra.gov.gh','https://gra.gov.gh/career/',true,'https://gra.gov.gh/career/',now()),
('nss-ghana','National Service Authority','Public Sector','Public','Manages the mandatory one-year national service placement for Ghanaian tertiary graduates.','Accra','Greater Accra','Large (1000+)','https://nss.gov.gh','https://nss.gov.gh',true,'https://nss.gov.gh',now());

INSERT INTO public.internships (slug, company_id, title, opportunity_type, description, fields, careers, location, region, work_mode, duration, paid, eligibility, application_url, deadline_text, verified, source_url, last_verified_at)
SELECT v.slug, c.id, v.title, v.otype, v.descr, v.fields, v.careers, c.location, c.region, v.mode, v.duration, v.paid, v.elig, c.careers_url, 'Check the official careers page — intakes open at different times each year', true, c.careers_url, now()
FROM (VALUES
 ('mtn-ghana-internship','mtn-ghana','Student internship & graduate programme','Internship','Placements across network engineering, IT, data analytics, finance, marketing and customer experience.', ARRAY['Engineering','Information Technology','Business','Marketing'], ARRAY['Computer Science','Electrical Engineering','Business Administration','Marketing'],'Hybrid','6–12 weeks (vacation) / 12 months (graduate)',true,'Ghanaian tertiary students on vacation attachment, or recent graduates who have completed national service (for the graduate track).'),
 ('hubtel-engineering-internship','hubtel','Software engineering internship','Internship','Work with product teams on payments, commerce and messaging systems in a fast-moving Ghanaian tech company.', ARRAY['Information Technology','Engineering'], ARRAY['Computer Science','Computer Engineering'],'On-site','3–6 months',true,'Computer science, IT or engineering students and graduates who can demonstrate coding ability.'),
 ('amalitech-graduate-trainee','amalitech','Graduate trainee programme','Graduate programme','Structured training in software development, data or cloud, followed by placement on client delivery teams.', ARRAY['Information Technology','Engineering'], ARRAY['Computer Science','Computer Engineering','Statistics'],'On-site','6–12 months training',true,'Ghanaian graduates in STEM or related fields; selection is by aptitude test and interview.'),
 ('turntabl-junior-engineer','turntabl','Junior engineer training programme','Graduate programme','Paid training in Java, JavaScript and modern engineering practice before placement with international clients.', ARRAY['Information Technology'], ARRAY['Computer Science','Computer Engineering'],'On-site','3–6 months training',true,'Graduates and final-year students with strong problem-solving ability; no prior professional experience required.'),
 ('mpharma-internship','mpharma','Health-tech internship','Internship','Projects across pharmacy operations, supply chain, data and product for a pan-African health company.', ARRAY['Health','Business','Information Technology'], ARRAY['Pharmacy','Business Administration','Computer Science'],'Hybrid','3–6 months',true,'Students and graduates in pharmacy, supply chain, business, data or software.'),
 ('ecobank-graduate','ecobank-ghana','Banking internship & graduate intake','Internship','Rotations through retail banking, operations, risk, treasury and technology.', ARRAY['Business','Finance','Information Technology'], ARRAY['Accounting','Banking and Finance','Economics','Business Administration'],'On-site','8 weeks – 12 months',true,'Ghanaian students on attachment, or graduates who have completed national service.'),
 ('gcb-attachment','gcb-bank','Student attachment programme','Attachment','Branch and head-office attachments in banking operations, finance, audit and IT.', ARRAY['Business','Finance'], ARRAY['Accounting','Banking and Finance','Business Administration'],'On-site','2–3 months (vacation)',null,'Tertiary students required to complete industrial attachment as part of their programme.'),
 ('databank-research-internship','databank','Investment research internship','Internship','Support equity and fixed-income research, portfolio analysis and client reporting.', ARRAY['Finance','Economics'], ARRAY['Banking and Finance','Economics','Actuarial Science','Statistics'],'On-site','3 months',null,'Finance, economics, actuarial science or statistics students with strong Excel and analytical skills.'),
 ('bog-attachment','bank-of-ghana','Central bank student attachment','Attachment','Attachments in research, financial stability, banking supervision, payment systems and IT.', ARRAY['Economics','Finance','Information Technology'], ARRAY['Economics','Banking and Finance','Statistics'],'On-site','2–3 months',null,'Ghanaian tertiary students with an official attachment letter from their institution.'),
 ('tullow-internship','tullow-ghana','Oil & gas internship','Internship','Placements in subsurface, engineering, HSE, supply chain and finance functions.', ARRAY['Engineering','Geosciences','Business'], ARRAY['Petroleum Engineering','Geological Engineering','Mechanical Engineering','Accounting'],'On-site','3 months',true,'Engineering, geoscience and business students in Ghanaian universities; competitive selection.'),
 ('newmont-internship','newmont-ghana','Mining internship & graduate development','Internship','Site-based placements in mining engineering, geology, metallurgy, environment and maintenance.', ARRAY['Engineering','Geosciences','Environment'], ARRAY['Mining Engineering','Geological Engineering','Mechanical Engineering','Environmental Science'],'On-site','3–12 months',true,'Students and graduates in mining-related disciplines; site safety induction required.'),
 ('goldfields-internship','goldfields-ghana','Student attachment & graduate trainee','Internship','Structured attachments at Tarkwa and Damang across engineering, geology, HSE and finance.', ARRAY['Engineering','Geosciences'], ARRAY['Mining Engineering','Geological Engineering','Electrical Engineering'],'On-site','3–12 months',true,'Ghanaian students and graduates in mining, engineering, geology or related fields.'),
 ('vra-attachment','vra','Engineering attachment programme','Attachment','Practical training at hydro and thermal generation stations and in transmission-related functions.', ARRAY['Engineering'], ARRAY['Electrical Engineering','Mechanical Engineering','Civil Engineering'],'On-site','2–4 months',null,'Engineering students with an attachment request letter from their university or technical university.'),
 ('ecg-attachment','ecg','Industrial attachment','Attachment','Field and district-office attachments in distribution engineering, metering, commercial and IT.', ARRAY['Engineering','Information Technology'], ARRAY['Electrical Engineering','Computer Science'],'On-site','2–3 months',null,'Engineering and IT students on approved industrial attachment.'),
 ('ghs-clinical-placement','ghana-health-service','Clinical placement & housemanship pathway','Clinical placement','Supervised clinical rotations in district and regional facilities for medical, nursing, midwifery and allied health students.', ARRAY['Health'], ARRAY['Medicine','Nursing','Midwifery','Physician Assistantship','Medical Laboratory Science'],'On-site','Programme-dependent',null,'Students posted through their training institution; licensure steps follow the relevant regulator.'),
 ('korle-bu-clinical','korle-bu','Teaching hospital clinical rotation','Clinical placement','Rotations across medicine, surgery, obstetrics, paediatrics, laboratory and pharmacy departments.', ARRAY['Health'], ARRAY['Medicine','Nursing','Pharmacy','Medical Laboratory Science'],'On-site','Programme-dependent',null,'Students of accredited health training institutions with a formal posting letter.'),
 ('unilever-internship','unilever-ghana','Supply chain & commercial internship','Internship','Projects in manufacturing, supply chain, customer development, marketing and finance.', ARRAY['Engineering','Business','Marketing'], ARRAY['Chemical Engineering','Business Administration','Marketing','Accounting'],'On-site','3–6 months',true,'Penultimate-year students and recent graduates; assessment centre selection.'),
 ('nestle-internship','nestle-ghana','Technical & commercial internship','Internship','Placements at the Tema factory and in sales, marketing, finance and supply chain teams.', ARRAY['Engineering','Business','Food Science'], ARRAY['Food Science','Chemical Engineering','Marketing','Business Administration'],'On-site','3–6 months',true,'Students and graduates in engineering, food science, business or supply chain.'),
 ('kpmg-internship','kpmg-ghana','Audit, tax & advisory internship','Internship','Vacation internship and graduate intake across audit, tax, deal advisory and technology risk.', ARRAY['Business','Finance'], ARRAY['Accounting','Banking and Finance','Economics'],'On-site','6–12 weeks',true,'Accounting, finance and economics students with strong academic results; professional exam progress is an advantage.'),
 ('pwc-internship','pwc-ghana','Assurance & consulting internship','Internship','Client-facing work in assurance, tax and consulting, with structured coaching.', ARRAY['Business','Finance'], ARRAY['Accounting','Economics','Business Administration'],'On-site','6–12 weeks',true,'Penultimate-year and final-year students in accounting, economics or business.'),
 ('deloitte-internship','deloitte-ghana','Graduate & internship intake','Internship','Rotations in audit, risk advisory, tax and consulting practices.', ARRAY['Business','Finance','Information Technology'], ARRAY['Accounting','Economics','Computer Science'],'On-site','6–12 weeks',true,'Students and graduates with strong academic records and analytical skills.'),
 ('ghana-tech-lab-cohort','ghana-tech-lab','Digital skills training cohort','Training programme','Cohort-based training in software development, data analytics, digital marketing and cybersecurity.', ARRAY['Information Technology'], ARRAY['Computer Science','Information Technology','Marketing'],'Hybrid','3–6 months',null,'Young Ghanaians aged roughly 18–35; selection by application and aptitude screening.'),
 ('kic-agritech-challenge','kosmos-innovation-center','AgriTech Challenge & internships','Training programme','Team-based agribusiness innovation challenge with mentorship, seed funding and internship placements.', ARRAY['Agriculture','Business','Information Technology'], ARRAY['Agriculture','Agricultural Engineering','Business Administration','Computer Science'],'Hybrid','Several months per cycle',true,'Ghanaian university students and young graduates, usually in teams.'),
 ('mest-training-programme','mest-africa','Entrepreneur-in-training programme','Training programme','Full-time training in software development, business and communication, leading to seed funding for selected teams.', ARRAY['Information Technology','Business'], ARRAY['Computer Science','Business Administration'],'On-site','12 months',true,'African graduates with software or business aptitude; highly competitive selection.'),
 ('cocobod-attachment','ghana-cocoa-board','Agriculture attachment','Attachment','Field and laboratory attachments in cocoa agronomy, quality control and research.', ARRAY['Agriculture'], ARRAY['Agriculture','Agricultural Engineering','Biochemistry'],'On-site','2–3 months',null,'Agriculture and applied science students with an institutional attachment letter.'),
 ('gra-attachment','ghana-revenue-authority','Tax administration attachment','Attachment','Attachments in domestic tax, customs, audit and IT functions.', ARRAY['Business','Finance','Law'], ARRAY['Accounting','Economics','Law'],'On-site','2–3 months',null,'Accounting, economics, law and IT students on approved attachment.')
) AS v(slug, cslug, title, otype, descr, fields, careers, mode, duration, paid, elig)
JOIN public.companies c ON c.slug = v.cslug;
