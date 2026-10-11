DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.opportunities'::regclass
      AND tgname = 'enforce_opportunity_moderation_fields'
      AND NOT tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE public.opportunities DISABLE TRIGGER enforce_opportunity_moderation_fields';
  END IF;
END $$;

-- Private backup tables were created by the preceding migration. Keep historical
-- records so applications and audit trails remain linked, but remove stale listings
-- from public results.
UPDATE public.opportunities
SET is_active = false,
    published = false,
    verified = false,
    status = 'archived_for_refresh',
    updated_at = now()
WHERE posted_by IS NULL;

INSERT INTO public.opportunities (
  title, opportunity_type, employment_type, company_name, organisation,
  country, country_code, location, city, remote, is_remote, work_mode,
  description, requirements, eligibility, fields, skills, skills_required,
  application_url, apply_url, source_url, source_name, source, source_id,
  posted_at, deadline, deadline_date, last_verified_at, status, category,
  type, compensation, availability, is_active, published, verified
)
SELECT
  v.title, v.opportunity_type, v.employment_type, v.company_name, v.organisation,
  v.country, v.country_code, v.location, v.city, v.remote, v.remote, v.work_mode,
  v.description, v.requirements, v.eligibility, v.fields, v.skills, v.skills,
  v.application_url, v.application_url, v.source_url, v.source_name, v.source_name, v.source_id,
  NULL, v.deadline, v.deadline, now(), 'active', v.category, v.category,
  v.compensation, v.availability, true, true, true
FROM (VALUES
  (
    'National Intern: WASH Knowledge Management (KM), Accra Ghana - 26 Weeks',
    'internship', 'Internship', 'UNICEF Ghana', 'UNICEF Ghana',
    'Ghana', 'GH', 'Accra, Ghana', 'Accra', false, 'On-site',
    'A 26-week national internship supporting knowledge and information management for UNICEF Ghana’s WASH programme, including evidence-based programming, documentation and knowledge sharing. Review the original notice for the complete responsibilities and conditions.',
    'Applicants should read the full UNICEF vacancy notice for qualifications, documents and application instructions.',
    'National internship in Ghana. Confirm all nationality, education and eligibility conditions in the official vacancy notice before applying.',
    ARRAY['WASH','Knowledge Management','Research','Data Management']::text[],
    ARRAY['Documentation','Information Management','Research','Knowledge Sharing']::text[],
    'https://jobs.unicef.org/en-us/job/596175',
    'https://jobs.unicef.org/en-us/job/596175',
    'UNICEF Careers', 'unicef-job-596175',
    TIMESTAMPTZ '2026-10-15 23:55:00+00',
    'Internship', NULL, 'Check the official UNICEF vacancy notice for application status'
  ),
  (
    'National Consultant - Facilitate UNICEF Ghana Staff Retreat, 4.5 days',
    'consultancy', 'Consultancy', 'UNICEF Ghana', 'UNICEF Ghana',
    'Ghana', 'GH', 'Accra, Ghana', 'Accra', false, 'On-site',
    'A short-term facilitation consultancy to design, facilitate and document a UNICEF Ghana staff retreat focused on team connection, shared priorities and practical actions. Review the official notice for the requested deliverables and full terms.',
    'Applicants should review the original notice for the required facilitation experience, deliverables and submission requirements.',
    'National consultancy in Accra, Ghana. Confirm experience requirements and all terms in the official notice.',
    ARRAY['Consultancy','Facilitation','Communications','Human Resources']::text[],
    ARRAY['Facilitation','Workshop Design','Documentation','Stakeholder Engagement']::text[],
    'https://jobs.unicef.org/cw/en/job/596217/national-consultant-facilitate-unicef-ghana-staff-retreat-45-days-accraghana',
    'https://jobs.unicef.org/cw/en/job/596217/national-consultant-facilitate-unicef-ghana-staff-retreat-45-days-accraghana',
    'UNICEF Careers', 'unicef-job-596217',
    TIMESTAMPTZ '2026-10-16 23:55:00+00',
    'Consultancy', NULL, 'Check the official UNICEF vacancy notice for application status'
  ),
  (
    'Entry Level Software Engineer',
    'job', 'Full-time', 'Zof AI', 'Zof AI',
    'Ghana', 'GH', 'Accra, Ghana', 'Accra', false, 'On-site',
    'An advertised early-career software engineering role in Accra focused on contributing to AI-native software products. The source listing describes full-time work and a strong interest in AI-native software development. Verify compensation and benefit details with the employer before accepting an offer.',
    'Review the original listing for its complete technical, professional-link and application requirements.',
    'Entry-level software engineering position in Accra. Confirm the full selection criteria in the live listing.',
    ARRAY['Software Engineering','Artificial Intelligence','Product Engineering']::text[],
    ARRAY['Programming','Software Development','AI-native Development']::text[],
    'https://gh.linkedin.com/jobs/view/entry-level-software-engineer-at-zof-ai-4468687280',
    'https://gh.linkedin.com/jobs/view/entry-level-software-engineer-at-zof-ai-4468687280',
    'LinkedIn Jobs', 'linkedin-job-zofai-entry-software-2026',
    NULL,
    'Job', 'GHS 6,500–13,000 per month plus equity as stated in the source listing; confirm directly with the employer.',
    'Review the linked listing for application status'
  ),
  (
    'AI/ML Engineer - Remote, Sub-Saharan Africa and South Asia',
    'job', 'Contract', 'The Agency Fund', 'The Agency Fund',
    'Remote', NULL, 'Remote', NULL, true, 'Remote',
    'An actively hiring remote AI/ML Engineer role supporting AI systems used by non-profit and development partners. The employer’s listing says candidates based in Sub-Saharan Africa and South Asia may apply and describes international contractor hiring.',
    'The employer describes work building, evaluating, deploying and improving AI/ML systems. Check the original listing for the complete role requirements and contracting terms.',
    'Remote hiring is stated to include candidates based in Sub-Saharan Africa and South Asia, including Ghana. Confirm eligibility and contractor terms on the original listing.',
    ARRAY['Artificial Intelligence','Machine Learning','Software Engineering','Remote Work']::text[],
    ARRAY['Machine Learning','Model Evaluation','AI Systems','Deployment']::text[],
    'https://wellfound.com/jobs/4697849-ai-ml-engineer',
    'https://wellfound.com/jobs/4697849-ai-ml-engineer',
    'Wellfound', 'wellfound-agencyfund-aiml-4697849',
    NULL,
    'Job', NULL, 'Employer listing marked actively hiring'
  ),
  (
    'Scholarship Opportunities in the Kingdom of Saudi Arabia',
    'scholarship', 'Scholarship', 'Ghana Scholarships Authority', 'Ghana Scholarships Authority',
    'Saudi Arabia', NULL, 'Selected universities in Saudi Arabia', NULL, false, 'On-campus',
    'The Ghana Scholarships Authority announced scholarship awards at selected Saudi Arabian universities, including Taif, Madinah, Jazan, Najran, Tabuk and Fahad Bin Sultan University. The notice lists fields including technology management, business management, Islamic economics, marketing, engineering, technology, medicine, education and architecture.',
    'Review the official notice and the destination universities for application documents and programme-specific conditions.',
    'The official notice states applicants must be Ghanaian citizens resident in Ghana and have a genuine birth certificate and passport.',
    ARRAY['Scholarship','International Study','Engineering','Technology','Medicine','Education']::text[],
    ARRAY['Scholarship Application','International Admissions']::text[],
    'https://studyinsaudi.sa/en',
    'https://scholarships.gov.gh/opportunities/scholarship-oppurtunities-in-the-kingdom-of-saudi-arabia',
    'Ghana Scholarships Authority', 'gsa-saudi-scholarship-2026',
    TIMESTAMPTZ '2026-10-28 23:59:00+00',
    'Scholarship', NULL, 'Official notice lists deadline 28 October 2026'
  )
) AS v(
  title, opportunity_type, employment_type, company_name, organisation,
  country, country_code, location, city, remote, work_mode,
  description, requirements, eligibility, fields, skills,
  application_url, source_url, source_name, source_id, deadline, category,
  compensation, availability
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.opportunities o WHERE o.source_id = v.source_id
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.opportunities'::regclass
      AND tgname = 'enforce_opportunity_moderation_fields'
      AND NOT tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE public.opportunities ENABLE TRIGGER enforce_opportunity_moderation_fields';
  END IF;
END $$;

INSERT INTO public.scholarships (
  title, name, slug, provider, type, description, eligibility,
  nationality_requirement, deadline_text, deadline_date, location,
  fields, how_to_apply, website_url, application_url, source_url, verified, last_verified_at
)
SELECT
  'Scholarship Opportunities in the Kingdom of Saudi Arabia',
  'Scholarship Opportunities in the Kingdom of Saudi Arabia',
  'gsa-saudi-scholarship-2026',
  'Ghana Scholarships Authority',
  'Government',
  'Government scholarship awards at selected Saudi Arabian universities. The official notice lists available universities and subject areas; applicants must consult the notice and destination portal for details.',
  'Ghanaian citizens resident in Ghana; genuine birth certificate and passport required according to the official notice.',
  'Ghanaian citizens resident in Ghana',
  '28 October 2026',
  DATE '2026-10-28',
  'Saudi Arabia',
  ARRAY['Technology Management','Business Management','Islamic Economics','Marketing','Engineering','Technology','Medicine','Education','Architecture']::text[],
  'Review the Ghana Scholarships Authority notice, then apply through the Study in Saudi portal at https://studyinsaudi.sa/en.',
  'https://scholarships.gov.gh/opportunities',
  'https://studyinsaudi.sa/en',
  'https://scholarships.gov.gh/opportunities/scholarship-oppurtunities-in-the-kingdom-of-saudi-arabia',
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.scholarships s
  WHERE s.slug = 'gsa-saudi-scholarship-2026'
     OR s.source_url = 'https://scholarships.gov.gh/opportunities/scholarship-oppurtunities-in-the-kingdom-of-saudi-arabia'
);
