-- Add practical career options to every currently unmapped programme.
-- These are indicative role pathways, not employment guarantees or licensing advice.
WITH programme_text AS (
  SELECT
    p.id,
    p.name,
    p.field,
    p.department,
    lower(concat_ws(
      ' ',
      p.name,
      p.field,
      p.department,
      p.qualification,
      CASE
        WHEN coalesce(p.degree_type, '') ~* '(^|[^a-z])b[ .-]?ed([^a-z]|$)'
          OR coalesce(p.qualification, '') ~* 'bachelor of education'
        THEN 'education'
        ELSE ''
      END
    )) AS text_match
  FROM public.programmes p
),
career_map AS (
  SELECT
    p.id,
    p.name,
    p.field,
    CASE
      WHEN p.text_match ~* '(^|[^a-z])(fine arts?|visual arts?|creative arts?|art history|graphic design|communication design|integrated rural arts?|industrial arts?|fashion design|textile design|painting and sculpture|performing arts?|theatre arts?|theater arts?|music|animation|photography|film production|ceramics?|jewellery design|jewelry design|illustration|product design)([^a-z]|$)'
        AND p.text_match ~* '(education|teaching|teacher training|curriculum|pedagogy)'
      THEN ARRAY[
        'Art or creative-subject teacher (where qualified)',
        'Creative arts educator',
        'Arts curriculum or learning-resource developer',
        'Gallery, studio or arts-programme coordinator'
      ]::text[]
      WHEN p.text_match ~* '(education|teaching|teacher training|curriculum|pedagogy)'
      THEN ARRAY[
        'Teacher or lecturer in ' || coalesce(nullif(btrim(p.field), ''), 'the subject area') || ' (subject to qualification requirements)',
        'Curriculum or learning-resource developer',
        'Education assessment or quality-assurance assistant',
        'Education programme coordinator'
      ]::text[]
      WHEN p.text_match ~* '(medicine and surgery|medical doctor|mbchb|doctor of medicine|human biology)'
      THEN ARRAY[
        'Medical doctor or clinical practitioner (after accredited training and registration)',
        'Clinical or biomedical research assistant',
        'Public-health programme officer',
        'Health-service quality or operations coordinator'
      ]::text[]
      WHEN p.text_match ~* '(dentistry|dental surgery|dental medicine|oral health)'
      THEN ARRAY[
        'Dentist or dental surgeon (after required professional training and registration)',
        'Dental public-health officer',
        'Oral-health research assistant',
        'Dental clinic or service coordinator'
      ]::text[]
      WHEN p.text_match ~* '(nursing|midwifery|midwife|nurse practitioner)'
      THEN ARRAY[
        'Registered nurse or midwife (after required training and registration)',
        'Community-health or patient-education practitioner',
        'Clinical research or care-coordination assistant',
        'Health-service quality-improvement officer'
      ]::text[]
      WHEN p.text_match ~* '(pharmacy|pharmacist|pharmacology)'
      THEN ARRAY[
        'Pharmacist or pharmacy professional (where the qualification and registration permit)',
        'Pharmaceutical or medicines-information officer',
        'Clinical-trial or pharmacology research assistant',
        'Pharmaceutical quality or regulatory-assistant role'
      ]::text[]
      WHEN p.text_match ~* '(medical laboratory|medical laboratory technology|laboratory medicine|biomedical science|biomedical laboratory|medical imaging|radiography|radiologic|optometry|physiotherapy|occupational therapy|audiology|speech and language therapy|dietetics|nutrition|physician assistant|allied health|health information management|anaesthesia|anesthesia|orthotics|prosthetics)'
      THEN ARRAY[
        'Clinical or diagnostic support practitioner (where accredited)',
        'Laboratory, imaging or health-service technologist',
        'Clinical research assistant',
        'Health quality, records or service-coordination officer'
      ]::text[]
      WHEN p.text_match ~* '(public health|epidemiology|disease control|environmental health|community health|health promotion)'
      THEN ARRAY[
        'Public-health or health-promotion officer',
        'Monitoring, evaluation and learning assistant',
        'Epidemiology or surveillance research assistant',
        'Community-health programme coordinator'
      ]::text[]
      WHEN p.text_match ~* '(^|[^a-z])(llb|ll\.b|law|legal studies|jurisprudence|human rights law|international law|criminal justice|alternative dispute resolution)([^a-z]|$)'
      THEN ARRAY[
        'Legal practitioner (after law school and applicable professional requirements)',
        'Legal or policy researcher',
        'Paralegal or legal-administration assistant',
        'Compliance, governance or contracts officer'
      ]::text[]
      WHEN p.text_match ~* '(architecture|architectural technology|quantity surveying|building technology|construction management|urban planning|spatial planning|land economy|real estate|estate management|interior architecture)'
      THEN ARRAY[
        'Architect or architectural technologist (subject to accreditation and registration)',
        'Construction or facilities project coordinator',
        'BIM, CAD or design technician',
        'Quantity-surveying, property or planning assistant'
      ]::text[]
      WHEN p.text_match ~* '(civil engineering|structural engineering|geotechnical engineering|transportation engineering|highway engineering|water resources engineering)'
      THEN ARRAY[
        'Civil or infrastructure engineer (subject to applicable professional requirements)',
        'Construction or site engineer',
        'Transport, water or infrastructure planning assistant',
        'Project, quality-control or quantity-estimation officer'
      ]::text[]
      WHEN p.text_match ~* '(electrical engineering|electronic engineering|electronics engineering|telecommunications engineering|power engineering|control engineering|instrumentation)'
      THEN ARRAY[
        'Electrical, electronics or controls engineer/technologist',
        'Telecommunications or power-systems technician',
        'Embedded-systems or hardware test assistant',
        'Maintenance, automation or technical-project engineer'
      ]::text[]
      WHEN p.text_match ~* '(mechanical engineering|automotive engineering|automobile engineering|mechatronics|mechanisation|mechanization|manufacturing engineering|industrial engineering|aerospace engineering|marine engineering)'
      THEN ARRAY[
        'Mechanical, automotive or mechatronics engineer/technologist',
        'Manufacturing, maintenance or reliability engineer',
        'CAD, product-design or production-planning technician',
        'Automation, quality or technical-project coordinator'
      ]::text[]
      WHEN p.text_match ~* '(mining engineering|mineral engineering|metallurgical engineering|petroleum engineering|geological engineering|materials engineering|chemical engineering|biological engineering|agricultural engineering)'
      THEN ARRAY[
        'Engineer or engineering technologist in the relevant specialism',
        'Operations, plant or maintenance engineer',
        'Technical quality, safety or process-improvement officer',
        'Engineering project or research assistant'
      ]::text[]
      WHEN p.text_match ~* '(computer science|software engineering|computer engineering|information technology|information systems|computing|cybersecurity|data science|artificial intelligence|machine learning|cloud computing|business information technology|informatics|database|computer network|web development|digital technology)'
      THEN ARRAY[
        'Software, IT or systems analyst/developer',
        'Data, business-intelligence or machine-learning analyst (with relevant skills)',
        'Cybersecurity, cloud or network support specialist',
        'Product, QA or technical-support associate'
      ]::text[]
      WHEN p.text_match ~* '(accounting|accountancy|auditing|accountancy with computing|accounting and finance)'
      THEN ARRAY[
        'Accountant or audit associate (with applicable professional training)',
        'Tax, payroll or accounts officer',
        'Financial reporting or internal-control analyst',
        'Budget or business-support analyst'
      ]::text[]
      WHEN p.text_match ~* '(banking|finance|financial economics|economics|actuarial|insurance|investment|risk management|financial mathematics)'
      THEN ARRAY[
        'Financial, credit or investment analyst',
        'Banking, insurance or treasury associate',
        'Risk, compliance or actuarial analyst (with relevant professional progression)',
        'Economic research or business-intelligence assistant'
      ]::text[]
      WHEN p.text_match ~* '(procurement|supply chain|logistics|transport management|purchasing|operations management|shipping|port management)'
      THEN ARRAY[
        'Procurement or purchasing officer',
        'Supply-chain, inventory or logistics analyst',
        'Warehouse, transport or distribution coordinator',
        'Operations or vendor-management associate'
      ]::text[]
      WHEN p.text_match ~* '(business administration|business management|management studies|marketing|human resource|human resources|entrepreneurship|commerce|public relations|sales management|office administration|secretaryship|management studies)'
      THEN ARRAY[
        'Business, operations or administrative officer',
        'Marketing, sales or customer-insights associate',
        'Human-resources or recruitment assistant',
        'Entrepreneur, account manager or project coordinator'
      ]::text[]
      WHEN p.text_match ~* '(agric|agronomy|crop science|soil science|animal science|veterinary|fisheries|aquaculture|food science|food technology|horticulture|forestry|agro-processing|natural resources|agricultural extension)'
      THEN ARRAY[
        'Agricultural, agribusiness or extension officer',
        'Food, crop, soil, animal or fisheries technologist (by specialism)',
        'Farm, production or supply-chain supervisor',
        'Agricultural research or community-development assistant'
      ]::text[]
      WHEN p.text_match ~* '(environmental science|environmental management|climate change|sustainability|geography and resource|geology|geophysics|earth science|geomatic|geomatics|geoinformatics|remote sensing|geographical information|gis|meteorology|water resources|conservation|natural resource management)'
      THEN ARRAY[
        'Environmental, sustainability or conservation officer',
        'GIS, mapping or remote-sensing analyst (with relevant software skills)',
        'Climate, water or natural-resources project assistant',
        'Environmental assessment or research assistant'
      ]::text[]
      WHEN p.text_match ~* '(mathematics|statistics|physics|chemistry|biochemistry|biological science|biology|microbiology|biotechnology|molecular biology|laboratory science|actuarial science|applied science)'
      THEN ARRAY[
        'Research or laboratory assistant in the relevant science',
        'Data, statistics or quality-assurance analyst (with relevant tools)',
        'Science educator or technical communicator (where qualified)',
        'Laboratory, testing or scientific-sales associate'
      ]::text[]
      WHEN p.text_match ~* '(graphic design|communication design|fashion|textile|fine art|visual art|creative art|industrial art|integrated rural art|painting|sculpture|animation|photography|film|cinema|theatre|theater|performing art|music|dance|ceramic|jewellery|jewelry|illustration|product design|interior design|creative media|fashion design)'
      THEN ARRAY[
        'Graphic, visual, product or fashion designer (by specialism)',
        'Illustrator, animator, photographer or multimedia creator',
        'Performer, filmmaker, musician or production assistant (by specialism)',
        'Freelance creative, studio assistant or creative-business owner'
      ]::text[]
      WHEN p.text_match ~* '(journalism|communication studies|mass communication|broadcast|media studies|film studies|public relations|advertising|strategic communication|development communication|digital media|content creation)'
      THEN ARRAY[
        'Journalist, reporter or editorial assistant',
        'Public-relations, communications or media officer',
        'Content producer, broadcaster or social-media editor',
        'Research, campaign or audience-insights assistant'
      ]::text[]
      WHEN p.text_match ~* '(political science|international relations|diplomacy|public administration|governance|development studies|peace and security|public policy|international development|gender studies)'
      THEN ARRAY[
        'Policy or governance research assistant',
        'Public-service, diplomatic or programme-officer pathway (subject to recruitment requirements)',
        'NGO, community-development or monitoring-and-evaluation officer',
        'Advocacy, stakeholder-relations or public-affairs associate'
      ]::text[]
      WHEN p.text_match ~* '(psychology|sociology|social work|social science|anthropology|counselling|counseling|criminology|population studies|demography|community development)'
      THEN ARRAY[
        'Social-research or monitoring-and-evaluation assistant',
        'Community, youth or social-services programme officer',
        'Human-resources, user-research or customer-insights associate',
        'Counselling or psychology pathway (where further training and registration are required)'
      ]::text[]
      WHEN p.text_match ~* '(history|philosophy|english|literature|linguistic|language|translation|interpretation|african studies|archaeology|culture|cultural studies|religious studies|theology|classics|french|arabic|chinese|spanish|portuguese|german|akan|dagbani|ewe|ga language)'
      THEN ARRAY[
        'Writer, editor, translator or language-services associate (by specialism)',
        'Research, archives, museum or cultural-programme assistant',
        'Communications, publishing or public-engagement officer',
        'Teaching, academic research or policy-support pathway (where qualified)'
      ]::text[]
      WHEN p.text_match ~* '(tourism|hospitality|hotel management|travel management|culinary|catering|food and beverage|event management|leisure management)'
      THEN ARRAY[
        'Tourism, travel or guest-experience officer',
        'Hotel, events or hospitality operations coordinator',
        'Food-service, catering or venue supervisor',
        'Destination marketing or event-production associate'
      ]::text[]
      WHEN p.text_match ~* '(sport|sports science|physical education|exercise science|coaching|recreation)'
      THEN ARRAY[
        'Sports development or coaching pathway (where qualified)',
        'Fitness, recreation or wellness programme assistant',
        'Sports administration or event coordinator',
        'Physical-education or sports-science research assistant'
      ]::text[]
      ELSE ARRAY[
        'Graduate trainee in ' || coalesce(nullif(btrim(p.field), ''), nullif(btrim(p.department), ''), 'this discipline'),
        'Research or project assistant in ' || coalesce(nullif(btrim(p.field), ''), nullif(btrim(p.department), ''), 'this discipline'),
        'Operations or programme coordinator in ' || coalesce(nullif(btrim(p.field), ''), nullif(btrim(p.department), ''), 'this discipline'),
        'Self-employed practitioner or consultant in ' || coalesce(nullif(btrim(p.field), ''), nullif(btrim(p.department), ''), 'this discipline')
      ]::text[]
    END AS careers
  FROM programme_text p
)
UPDATE public.programmes AS target
SET career_opportunities = career_map.careers,
    updated_at = now()
FROM career_map
WHERE target.id = career_map.id
  AND coalesce(cardinality(target.career_opportunities), 0) = 0;

INSERT INTO public.programme_careers
  (programme_id, career, occupation, description, licence_note, updated_at)
SELECT
  p.id,
  role.career,
  role.career,
  'Possible career route associated with ' || p.name || coalesce(' (' || nullif(btrim(p.field), '') || ')', '') ||
  '. Actual opportunities depend on skills, experience, employers and current professional requirements.',
  CASE
    WHEN role.career ~* '(doctor|dentist|pharmacist|registered nurse|midwife|legal practitioner|architect|clinical practitioner)'
    THEN 'Check current Ghanaian accreditation, supervised-practice and professional-registration requirements before pursuing this role.'
    ELSE NULL
  END,
  now()
FROM public.programmes p
CROSS JOIN LATERAL unnest(coalesce(p.career_opportunities, ARRAY[]::text[])) AS role(career)
WHERE coalesce(cardinality(p.career_opportunities), 0) > 0
ON CONFLICT (programme_id, career) DO UPDATE
SET occupation = EXCLUDED.occupation,
    description = EXCLUDED.description,
    licence_note = coalesce(EXCLUDED.licence_note, public.programme_careers.licence_note),
    updated_at = now();
