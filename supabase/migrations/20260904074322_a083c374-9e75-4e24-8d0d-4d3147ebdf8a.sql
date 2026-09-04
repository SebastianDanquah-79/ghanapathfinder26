
-- Real, source-linked institution data (2025/2026). Figures labelled indicative where the
-- official source publishes ranges or per-programme schedules.

UPDATE public.universities SET
  tuition_range = 'GHS 3,000 - 6,000/yr (regular); fee-paying higher',
  admission_aggregate = '6-24 (Medicine, Law & Engineering 6-8)',
  admission_info = 'WASSCE: credit passes (A1-C6) in six subjects - three core (English, Core Mathematics, Integrated Science or Social Studies) plus three relevant electives. Programme-specific electives apply, e.g. Engineering requires Elective Mathematics and Physics (usually B3 or better). Aggregate is the sum of your best six grades - lower is better. Cut-off points are published each year on the UG admissions portal.',
  scholarship_info = 'Fees differ by college and by regular vs fee-paying admission. Confirm the current schedule on the UG admissions portal before you apply. Support options include the Students Loan Trust Fund, GETFund and Scholarship Secretariat awards.',
  top_programmes = ARRAY['Medicine (MBChB)','Law (LLB)','Computer Science','Business Administration','Biomedical Engineering','Nursing'],
  admissions_url = 'https://admissions.ug.edu.gh/undergraduate/entry-requirements',
  financial_aid_url = 'https://admissions.ug.edu.gh/undergraduate/cut-off',
  source_url = 'https://admissions.ug.edu.gh/undergraduate/entry-requirements',
  last_verified_at = now()
WHERE slug = 'university-of-ghana';

UPDATE public.universities SET
  tuition_range = 'Set per programme in the 2025/26 fee schedule (regular vs fee-paying)',
  admission_aggregate = '6-24 depending on programme (Medicine, Pharmacy & Engineering most competitive)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects (English, Core Mathematics, Integrated Science) and three relevant electives. Science and engineering programmes require Elective Mathematics, Physics and Chemistry; Medicine and Pharmacy additionally require Biology. Programme cut-off points are released with each admission cycle.',
  scholarship_info = 'KNUST publishes a full fee schedule per programme for 2025/2026, separating regular, fee-paying and international rates. Check the official schedule for your exact programme.',
  top_programmes = ARRAY['Mechanical Engineering','Civil Engineering','Human Medicine','Pharmacy (Pharm.D)','Architecture','Computer Science'],
  admissions_url = 'https://www.knust.edu.gh/announcements/undergraduate-admissions',
  financial_aid_url = 'https://www.knust.edu.gh/academics/academics-fees/fees-schedule-20252026-academic-year',
  source_url = 'https://www.knust.edu.gh/academics/academics-fees/fees-schedule-20252026-academic-year',
  last_verified_at = now()
WHERE slug = 'knust';

UPDATE public.universities SET
  tuition_range = 'GHS 2,500 - 5,000/yr (regular, indicative - confirm on UCC fees schedule)',
  admission_aggregate = '6-24 (published per programme on apply.ucc.edu.gh)',
  admission_info = 'WASSCE: credit passes (A1-C6) in six subjects - three core (English, Core Mathematics, Integrated Science or Social Studies) plus three relevant electives. Education, Nursing and Law each have additional elective requirements. Cut-off points per programme are published on the UCC application portal.',
  scholarship_info = 'Exact fees depend on programme and residential status; the current schedule is published with each admission advert. Students Loan Trust Fund and teacher-trainee allowances apply to eligible Education students.',
  top_programmes = ARRAY['B.Ed Education','Nursing','Law (LLB)','Agriculture','Business Administration','Biological Sciences'],
  admissions_url = 'https://apply.ucc.edu.gh',
  financial_aid_url = 'https://ucc.edu.gh/announcements/admission-first-degree-regular-programmes-20252026-academic-year',
  source_url = 'https://apply.ucc.edu.gh',
  last_verified_at = now()
WHERE slug = 'university-of-cape-coast';

UPDATE public.universities SET
  tuition_range = 'About GHS 3,095/yr for regular UG freshers (2025/26 provisional schedule)',
  admission_aggregate = '15-30 typical for B.Ed programmes (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects (English, Core Mathematics, Integrated Science or Social Studies) and three relevant electives matching your teaching subject. Aggregate 36 or better is required, with stronger aggregates needed for competitive B.Ed options.',
  scholarship_info = 'The 2025/26 provisional fee for regular undergraduate freshers is about GHS 3,095 per year (tuition GHS 2,687, university fee GHS 298, SRC GHS 110). Eligible teacher trainees may receive government allowances.',
  top_programmes = ARRAY['B.Ed Early Grade Education','B.Ed Mathematics','B.Ed Social Studies','Special Education','Home Economics Education','Educational Psychology'],
  admissions_url = 'https://www.uew.edu.gh/students/fees-schedule',
  financial_aid_url = 'https://www.uew.edu.gh/students/fees-schedule',
  source_url = 'https://www.uew.edu.gh/students/fees-schedule',
  last_verified_at = now()
WHERE slug = 'uew';

UPDATE public.universities SET
  tuition_range = 'Published per programme each year; e-voucher GHS 200',
  admission_aggregate = 'Medicine (MBChB) 9, Pharm.D 12 (18 fee-paying); others up to 30',
  admission_info = 'WASSCE: at least C6 in all three core subjects and three elective subjects - any D7, E8 or F9 in the six subjects used disqualifies the application. Health science programmes require Biology, Chemistry and Physics or Elective Mathematics.',
  scholarship_info = 'Fees are published per programme with each admission cycle. Northern-sector scholarships, the Students Loan Trust Fund and Scholarship Secretariat awards are commonly used by UDS students.',
  top_programmes = ARRAY['Medicine (MBChB)','Doctor of Pharmacy','Nursing and Midwifery','Agriculture','Development Studies','Renewable Energy Technology'],
  admissions_url = 'https://uds.edu.gh/admissions/entry-requirements',
  financial_aid_url = 'https://uds.edu.gh/admissions/cut-off-points',
  source_url = 'https://uds.edu.gh/admissions/cut-off-points',
  last_verified_at = now()
WHERE slug = 'uds';

UPDATE public.universities SET
  tuition_range = 'Level 100 Allied Health: GHS 5,893/yr regular, GHS 8,032/yr fee-paying',
  admission_aggregate = 'Medicine & Dental Surgery 8, Pharm.D 8, Nursing 10-24',
  admission_info = 'WASSCE: credit passes (A1-C6, or A-D on SSSCE) in English, Core Mathematics, Integrated Science and Social Studies plus three relevant electives. Health programmes require Biology, Chemistry and Physics or Elective Mathematics.',
  scholarship_info = 'Published 2025/26 fees for Level 100 Allied Health Sciences: GHS 5,893.29 regular and GHS 8,031.77 fee-paying (international USD 4,205). Other schools differ - check the UHAS fees page.',
  top_programmes = ARRAY['Medicine (MBChB)','Dental Surgery','Doctor of Pharmacy','Nursing','Midwifery','Physiotherapy'],
  admissions_url = 'https://uhas.edu.gh/uhas/admission/cutoff-points',
  financial_aid_url = 'https://uhas.edu.gh/uhas/admission/fees',
  source_url = 'https://uhas.edu.gh/uhas/admission/fees',
  last_verified_at = now()
WHERE slug = 'uhas';

UPDATE public.universities SET
  tuition_range = 'GHS 3,000 - 5,000/yr (regular, indicative - engineering premium applies)',
  admission_aggregate = '6-18 for engineering programmes (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in English, Core Mathematics and Integrated Science plus three electives that must include Elective Mathematics and Physics for engineering programmes; Chemistry is required for minerals and petroleum options.',
  scholarship_info = 'Mining and petroleum companies (including the Ghana Chamber of Mines and Tullow) run scholarship schemes for UMaT students. Confirm current fees on the official admissions page.',
  top_programmes = ARRAY['Mining Engineering','Geological Engineering','Petroleum Engineering','Mechanical Engineering','Geomatic Engineering','Minerals Engineering'],
  admissions_url = 'https://umat.edu.gh/how-to-apply-ghanaian-undergraduate-applicant',
  financial_aid_url = 'https://umat.edu.gh/how-to-apply-ghanaian-undergraduate-applicant',
  source_url = 'https://umat.edu.gh/how-to-apply-ghanaian-undergraduate-applicant',
  last_verified_at = now()
WHERE slug = 'umat';

UPDATE public.universities SET
  tuition_range = 'Published in the UPSA fees schedule (regular vs fee-paying)',
  admission_aggregate = '6-24 (Accounting, Law and Banking most competitive)',
  admission_info = 'WASSCE: credit passes grade A1-C6 (or A-D on SSSCE/GBCE) in three core subjects and three electives. Business programmes favour Elective Mathematics, Economics, Accounting and Business Management; the LLB has its own additional criteria.',
  scholarship_info = 'UPSA publishes a full fees schedule each academic year covering regular, evening and weekend streams. Students Loan Trust Fund support is available.',
  top_programmes = ARRAY['BSc Accounting','BSc Banking and Finance','BSc Marketing','Law (LLB)','BSc Management','BSc Information Technology Management'],
  admissions_url = 'https://admissions.upsa.edu.gh/admissions/undergrad-entry-requirements',
  financial_aid_url = 'https://upsa.edu.gh/academics/fees-schedule',
  source_url = 'https://admissions.upsa.edu.gh/admissions/undergrad-entry-requirements',
  last_verified_at = now()
WHERE slug = 'upsa';

UPDATE public.universities SET
  tuition_range = 'Published in the UENR provisional 2025/26 fees schedule',
  admission_aggregate = '6-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in English, Core Mathematics and Integrated Science plus three relevant electives. Engineering and energy programmes require Elective Mathematics and Physics.',
  scholarship_info = 'UENR publishes a provisional fee schedule for each academic year covering all levels and programmes. Energy-sector and district assembly scholarships are commonly used.',
  top_programmes = ARRAY['Renewable Energy Engineering','Petroleum Engineering','Agricultural Engineering','Natural Resource Management','Environmental Science','Computer Science and Informatics'],
  admissions_url = 'https://www.uenr.edu.gh/admission-details',
  financial_aid_url = 'https://www.uenr.edu.gh/download/provisional-fees-for-the-2025-2026-academic-year',
  source_url = 'https://www.uenr.edu.gh/admission-details',
  last_verified_at = now()
WHERE slug = 'uenr';

UPDATE public.universities SET
  tuition_range = 'Approved 2025/26 fees published per programme',
  admission_aggregate = '8-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects and three relevant electives. Computing and engineering programmes require Elective Mathematics and Physics or Technical drawing-related electives.',
  scholarship_info = 'GCTU publishes an approved fees schedule for 2025/2026 by programme and stream (regular, evening, weekend, distance).',
  top_programmes = ARRAY['BSc Computer Science','Telecommunications Engineering','BSc Information Technology','Business Computing','Cybersecurity','Networking'],
  admissions_url = 'https://site.gctu.edu.gh/2026-2027-admissions',
  financial_aid_url = 'https://site.gctu.edu.gh/fees-schedule',
  source_url = 'https://site.gctu.edu.gh/fees-schedule',
  last_verified_at = now()
WHERE slug = 'gctu';

UPDATE public.universities SET
  tuition_range = 'About GHS 2,400 - 2,850/yr for full-time freshers (2025/26 schedule)',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects and three relevant electives; technical and vocational (TVET) applicants may present relevant NVTI, City & Guilds or technical certificates for the same programmes.',
  scholarship_info = 'Full-time fresher fees for 2025/26 sit roughly between GHS 2,400 and GHS 2,850 per year across faculties. Teacher-trainee and TVET support schemes may apply.',
  top_programmes = ARRAY['B.Ed Technical Education','Fashion Design and Textiles','Catering and Hospitality Education','Construction Technology Education','Automotive Technology Education','Information Technology Education'],
  admissions_url = 'https://aamusted.edu.gh/fees-schedule',
  financial_aid_url = 'https://aamusted.edu.gh/fees-schedule',
  source_url = 'https://aamusted.edu.gh/fees-schedule',
  last_verified_at = now()
WHERE slug = 'aamusted';

UPDATE public.universities SET
  tuition_range = 'Level 100 about GHS 2,538/yr; Levels 200-300 about GHS 2,664/yr',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in English, Core Mathematics and Integrated Science plus three relevant electives; science and applied science programmes require Elective Mathematics, Physics, Chemistry or Biology.',
  scholarship_info = 'The 2025/26 schedule lists about GHS 2,538 at Level 100 and GHS 2,663.64 at Levels 200-300, with 2024/25 rates provisionally in effect where implementation was postponed.',
  top_programmes = ARRAY['BSc Actuarial Science','BSc Statistics','BSc Mathematics','BSc Computer Science','BSc Applied Biology','BSc Environmental Science'],
  admissions_url = 'https://cktutas.edu.gh/adms25',
  financial_aid_url = 'https://utas.edu.gh/fees',
  source_url = 'https://utas.edu.gh/fees',
  last_verified_at = now()
WHERE slug = 'cktutas';

UPDATE public.universities SET
  tuition_range = 'Application fee GHS 150; tuition among the highest for private universities',
  admission_aggregate = 'No fixed aggregate - holistic review (WASSCE, essays, interview)',
  admission_info = 'Ashesi reviews the whole application: WASSCE (or IB, A-Level, SAT) results, essays, recommendations and an interview. Strong Mathematics and Science grades are expected for Computer Science and Engineering. There is no published numeric cut-off aggregate.',
  scholarship_info = 'Ashesi runs one of Ghana''s largest need-based financial aid programmes, including the Mastercard Foundation Scholars Program, covering up to full tuition, accommodation and stipend for qualifying students.',
  top_programmes = ARRAY['BSc Computer Science','Management Information Systems','Business Administration','Computer Engineering','Mechanical Engineering','Electrical and Electronic Engineering'],
  admissions_url = 'https://www.ashesi.edu.gh/how-to-apply',
  financial_aid_url = 'https://www.ashesi.edu.gh/how-to-apply',
  source_url = 'https://www.ashesi.edu.gh/how-to-apply',
  last_verified_at = now()
WHERE slug = 'ashesi';

UPDATE public.universities SET
  tuition_range = 'About GHS 2,800 - 3,270/semester depending on programme',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects and three relevant electives. Mature applicants (25+) may enter through the mature students'' entrance examination and interview.',
  scholarship_info = 'Published semester fees run from about GHS 2,809 (Accounting, Banking and Finance, HRM, Marketing, Management, Agribusiness) to about GHS 3,015-3,267 for Economics and English.',
  top_programmes = ARRAY['BSc Business Administration','BSc Accounting','Law (LLB)','BSc Agribusiness','Theology and Divinity','BSc Computer Science'],
  admissions_url = 'https://central.edu.gh/admission',
  financial_aid_url = 'https://central.edu.gh/admission',
  source_url = 'https://central.edu.gh/admission',
  last_verified_at = now()
WHERE slug = 'central-university';

UPDATE public.universities SET
  tuition_range = 'About GHS 3,740 - 4,040/semester (School of Business); diplomas from GHS 2,250',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes in six subjects - three core (English, Core Mathematics, Integrated Science or Social Studies) plus three relevant electives. Nursing and Midwifery require Biology and Chemistry.',
  scholarship_info = 'School of Business fees are about GHS 4,040 per semester for fresh students and GHS 3,740 for continuing students; diploma tuition starts around GHS 2,250. Work-study options are available on campus.',
  top_programmes = ARRAY['BSc Nursing','Midwifery','BBA Accounting','BBA Human Resource Management','Development Studies','BSc Information Technology'],
  admissions_url = 'https://vvu.edu.gh/freshmen_info.php',
  financial_aid_url = 'https://vvu.edu.gh/index.php/admissions/fee-structure',
  source_url = 'https://vvu.edu.gh/index.php/admissions/fee-structure',
  last_verified_at = now()
WHERE slug = 'valley-view';

UPDATE public.universities SET
  tuition_range = 'Set in the 2025/26 Ghanaian-student fee policy (per semester, by programme)',
  admission_aggregate = 'No fixed aggregate - programme-specific STEM entry criteria',
  admission_info = 'Entry requirements are set per programme and accept WASSCE, IB and A-Level equivalencies. Engineering and Computer Science applicants need strong Mathematics and Physics grades; admission includes a review of the full application.',
  scholarship_info = 'Academic City publishes a Ghanaian-student fee policy for 2025/2026 per semester and per programme, with engineering priced separately. Merit and need-based scholarships are offered.',
  top_programmes = ARRAY['BSc Computer Science','Mechatronics Engineering','Electrical and Electronic Engineering','Computer Engineering','Business Administration','Robotics Engineering'],
  admissions_url = 'https://acity.edu.gh/entry-requirements',
  financial_aid_url = 'https://acity.edu.gh/entry-requirements',
  source_url = 'https://acity.edu.gh/entry-requirements',
  last_verified_at = now()
WHERE slug = 'academic-city';

UPDATE public.universities SET
  tuition_range = 'GHS 2,000 - 3,500/yr (technical university tier, indicative)',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE/SSSCE: passes (A1-C6 or A-D) in three core subjects (English, Core Mathematics, Integrated Science) plus three relevant electives. Holders of relevant technical, NVTI or HND qualifications may enter B.Tech top-up programmes.',
  scholarship_info = 'Fees vary by programme and stream; the current schedule accompanies each admission cycle. Students Loan Trust Fund support applies.',
  top_programmes = ARRAY['B.Tech Mechanical Engineering','B.Tech Electrical and Electronic Engineering','Fashion Design and Textiles','Purchasing and Supply','Accountancy','Hospitality Management'],
  admissions_url = 'https://atu.edu.gh/how-to-apply-to-atu',
  financial_aid_url = 'https://atu.edu.gh/how-to-apply-to-atu',
  source_url = 'https://atu.edu.gh/how-to-apply-to-atu',
  last_verified_at = now()
WHERE slug = 'atu';

UPDATE public.universities SET
  tuition_range = 'About GHS 2,676 - 3,194/yr depending on level (2025/26 provisional)',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE/SSSCE: passes (A1-C6 or A-D) in three core subjects and three relevant electives. Technical, NVTI and HND holders qualify for the relevant B.Tech top-up routes.',
  scholarship_info = 'Provisional 2025/26 fees, for example BSc Accountancy with Informatics (regular): GHS 3,194 for freshers, GHS 2,761 for years 2-3 and GHS 2,676 for year 4.',
  top_programmes = ARRAY['BSc Accountancy with Informatics','Fashion Design and Technology','Building Technology','Electrical and Electronic Engineering','Hospitality Management','Mechanical Engineering'],
  admissions_url = 'https://kstu.edu.gh/admissions/requirements',
  financial_aid_url = 'https://kstu.edu.gh/academics/fees/school-fees-202526-provisional',
  source_url = 'https://kstu.edu.gh/academics/fees/school-fees-202526-provisional',
  last_verified_at = now()
WHERE slug = 'kstu';

UPDATE public.universities SET
  tuition_range = 'GHS 2,000 - 3,500/yr (technical university tier, indicative)',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE/SSSCE: passes (A1-C6 or A-D) in three core subjects and three relevant electives; engineering options require Elective Mathematics and Physics. Technical certificate and HND holders may apply for B.Tech top-up programmes.',
  scholarship_info = 'Fees are published per programme with each admission cycle. Oil and gas sector scholarships are common for TTU petroleum and marine students.',
  top_programmes = ARRAY['Petroleum Engineering','Mechanical Engineering','Marine Engineering','Applied Chemistry','Commerce','Civil Engineering'],
  admissions_url = 'https://www.ttu.edu.gh/admissions',
  financial_aid_url = 'https://www.ttu.edu.gh/admissions',
  source_url = 'https://www.ttu.edu.gh/admissions',
  last_verified_at = now()
WHERE slug = 'ttu';

UPDATE public.universities SET
  tuition_range = 'Published in the SDD-UBIDS provisional 2025/26 fee schedule',
  admission_aggregate = '12-30 depending on programme (indicative)',
  admission_info = 'WASSCE: credit passes (A1-C6) in three core subjects and three relevant electives. Business and development programmes favour Economics, Elective Mathematics, Accounting and Government.',
  scholarship_info = 'SDD-UBIDS publishes provisional fee schedules per level each academic year. Northern-sector and district assembly scholarships are widely used.',
  top_programmes = ARRAY['BSc Business Administration','Integrated Development Studies','BSc Entrepreneurship','Local Governance and Public Administration','BSc Accounting','BSc Economics'],
  admissions_url = 'https://ubids.edu.gh/admissions/how-to-apply',
  financial_aid_url = 'https://ubids.edu.gh/admissions/how-to-apply',
  source_url = 'https://ubids.edu.gh/admissions/how-to-apply',
  last_verified_at = now()
WHERE slug IN ('sdd-ubids','ubids');
