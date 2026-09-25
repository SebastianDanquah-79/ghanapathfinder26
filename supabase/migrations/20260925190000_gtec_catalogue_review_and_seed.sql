-- GhanaPathFinder verified catalogue expansion and review workflow
create table if not exists public.institution_ingestion_queue (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null,
  source_url text not null,
  source_name text not null,
  status text not null default 'needs_review' check (status in ('needs_review','approved','rejected')),
  payload jsonb not null default '{}'::jsonb,
  needs_review boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists institution_ingestion_queue_status_idx on public.institution_ingestion_queue(status);

alter table public.institution_ingestion_queue enable row level security;
drop policy if exists "review queue public read approved" on public.institution_ingestion_queue;
create policy "review queue public read approved" on public.institution_ingestion_queue for select to anon, authenticated using (status = 'approved');

create or replace function public.gpf_admin_approve_catalogue(
  p_table text,
  p_id uuid,
  p_patch jsonb default '{}'::jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin') into ok;
  if not ok then raise exception 'admin access required'; end if;

  if p_table = 'institutions' then
    execute 'update public.institutions set
      official_name=coalesce(($1->>''official_name''),official_name),
      institution_type=coalesce(($1->>''institution_type''),institution_type),
      town=coalesce(($1->>''town''),town),
      region=coalesce(($1->>''region''),region),
      website_url=coalesce(($1->>''website_url''),website_url),
      logo_source_url=coalesce(($1->>''logo_source_url''),logo_source_url),
      gtec_accreditation_status=coalesce(($1->>''gtec_accreditation_status''),gtec_accreditation_status),
      short_description=coalesce(($1->>''short_description''),short_description),
      last_verified_at=now(), needs_review=false, updated_at=now()
      where id=$2' using p_patch,p_id;
  elsif p_table = 'programmes' then
    execute 'update public.programmes set
      name=coalesce(($1->>''name''),name),
      degree_type=coalesce(($1->>''degree_type''),degree_type),
      department=coalesce(($1->>''department''),department),
      duration=coalesce(($1->>''duration''),duration),
      mode=coalesce(($1->>''mode''),mode),
      admission_summary=coalesce(($1->>''admission_summary''),admission_summary),
      source_url=coalesce(($1->>''source_url''),source_url),
      last_verified_at=now(), needs_review=false, verification_status=''verified'', verified=true, updated_at=now()
      where id=$2' using p_patch,p_id;
  elsif p_table = 'internship_providers' then
    execute 'update public.internship_providers set
      name=coalesce(($1->>''name''),name),
      sector=coalesce(($1->>''sector''),sector),
      provider_type=coalesce(($1->>''provider_type''),provider_type),
      website_url=coalesce(($1->>''website_url''),website_url),
      logo_source_url=coalesce(($1->>''logo_source_url''),logo_source_url),
      programme_summary=coalesce(($1->>''programme_summary''),programme_summary),
      application_url=coalesce(($1->>''application_url''),application_url),
      paid=coalesce(($1->>''paid'')::boolean,paid),
      last_verified_at=now(), needs_review=false, updated_at=now()
      where id=$2' using p_patch,p_id;
  elsif p_table = 'skill_providers' then
    execute 'update public.skill_providers set
      provider_name=coalesce(($1->>''provider_name''),provider_name),
      course_name=coalesce(($1->>''course_name''),course_name),
      skill_area=coalesce(($1->>''skill_area''),skill_area),
      format=coalesce(($1->>''format''),format),
      duration=coalesce(($1->>''duration''),duration),
      cost=coalesce(($1->>''cost''),cost),
      certification_issued_by=coalesce(($1->>''certification_issued_by''),certification_issued_by),
      application_url=coalesce(($1->>''application_url''),application_url),
      last_verified_at=now(), needs_review=false, updated_at=now()
      where id=$2' using p_patch,p_id;
  else
    raise exception 'unsupported catalogue table';
  end if;
  return true;
end;
$$;

revoke all on function public.gpf_admin_approve_catalogue(text,uuid,jsonb) from public;
grant execute on function public.gpf_admin_approve_catalogue(text,uuid,jsonb) to authenticated;

create or replace function public.gpf_admin_reject_catalogue(p_table text,p_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare ok boolean;
begin
  select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin') into ok;
  if not ok then raise exception 'admin access required'; end if;
  if p_table='institutions' then update public.institutions set needs_review=false, updated_at=now() where id=p_id;
  elsif p_table='programmes' then update public.programmes set needs_review=false, verification_status='outdated', updated_at=now() where id=p_id;
  elsif p_table='internship_providers' then update public.internship_providers set needs_review=false, updated_at=now() where id=p_id;
  elsif p_table='skill_providers' then update public.skill_providers set needs_review=false, updated_at=now() where id=p_id;
  else raise exception 'unsupported catalogue table'; end if;
  return true;
end;
$$;
revoke all on function public.gpf_admin_reject_catalogue(text,uuid) from public;
grant execute on function public.gpf_admin_reject_catalogue(text,uuid) to authenticated;

-- GTEC current catalogue seed. All rows remain review-gated.
insert into public.institutions
(official_name,institution_type,town,region,gtec_accreditation_status,source_urls,verification_method,verification_notes,needs_review)
select v.name,v.type,v.town,v.region,'active',array['https://gtec.edu.gh/explore-institutions/'],'GTEC live institution register','Imported from GTEC current category listing; official website/logo still requires individual verification.',true
from (values
('Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development','traditional_university','Kumasi','Ashanti'),
('C.K. Tedam University of Technology and Applied Sciences','traditional_university','Navrongo','Upper East'),
('Ghana Communication Technology University','traditional_university','Tesano','Greater Accra'),
('Ghana Institute of Management and Public Administration','traditional_university','Achimota','Greater Accra'),
('Kwame Nkrumah University of Science and Technology','traditional_university','Kumasi','Ashanti'),
('S.D. Dombo University of Business and Integrated Development Studies','traditional_university','Wa','Upper West'),
('University for Development Studies','traditional_university','Tamale','Northern'),
('University of Cape Coast','traditional_university','Cape Coast','Central'),
('University of Education, Winneba','traditional_university','Winneba','Central'),
('University of Energy and Natural Resources','traditional_university','Sunyani','Bono'),
('University of Environment and Sustainable Development','traditional_university','Somanya','Eastern'),
('University of Ghana','traditional_university','Legon','Greater Accra'),
('University of Health and Allied Sciences','traditional_university','Ho','Volta'),
('University of Media, Arts and Communication','traditional_university','Accra','Greater Accra'),
('University of Mines and Technology','traditional_university','Tarkwa','Western'),
('University of Professional Studies, Accra','traditional_university','Legon','Greater Accra'),
('Accra Technical University','public_technical_university','Accra','Greater Accra'),
('Bolgatanga Technical University','public_technical_university','Bolgatanga','Upper East'),
('Cape Coast Technical University','public_technical_university','Cape Coast','Central'),
('Dr. Hilla Limann Technical University','public_technical_university','Wa','Upper West'),
('Ho Technical University','public_technical_university','Ho','Volta'),
('Koforidua Technical University','public_technical_university','Koforidua','Eastern'),
('Kumasi Technical University','public_technical_university','Kumasi','Ashanti'),
('Sunyani Technical University','public_technical_university','Sunyani','Bono'),
('Takoradi Technical University','public_technical_university','Takoradi','Western'),
('Tamale Technical University','public_technical_university','Tamale','Northern'),
('Akrofi-Christaller Institute of Theology, Mission and Culture','chartered_private_university','Akropong','Eastern'),
('All Nations University','chartered_private_university','Koforidua','Eastern'),
('Ashesi University','chartered_private_university','Berekuso','Eastern'),
('Catholic University','chartered_private_university','Fiapre','Bono'),
('Central University','chartered_private_university','Miotso','Central'),
('Methodist University','chartered_private_university','Accra','Greater Accra'),
('Pentecost University','chartered_private_university','Sowutuom','Greater Accra'),
('Presbyterian University','chartered_private_university','Abetifi','Eastern'),
('Trinity Theological Seminary','chartered_private_university','East Legon','Greater Accra'),
('Valley View University','chartered_private_university','Oyibi','Greater Accra'),
('Abetifi College of Education, Abetifi','college_of_education','Abetifi','Eastern'),
('Accra College of Education, Accra','college_of_education','Accra','Greater Accra'),
('Ada College of Education, Ada','college_of_education','Ada','Greater Accra'),
('Agogo Presbyterian College of Education, Agogo','college_of_education','Agogo','Ashanti'),
('Akatsi College of Education, Akatsi','college_of_education','Akatsi','Volta'),
('Akrokerri College of Education, Akrokerri','college_of_education','Akrokerri','Ashanti'),
('Al-Faruq College of Education','college_of_education','Wenchi','Bono'),
('Atebubu College of Education','college_of_education','Atebubu','Bono East'),
('Bagabaga College of Education','college_of_education','Tamale','Northern'),
('Berekum College of Education','college_of_education','Berekum','Bono'),
('BIA Lamplighter College of Education','college_of_education','Sefwi Debiso','Western North'),
('Christ The Teacher College of Education','college_of_education','Kumasi','Ashanti'),
('Ghana Armed Forces Command and Staff College','public_degree_awarding_professional','Burma Camp, Accra','Greater Accra'),
('Ghana School of Survey and Mapping','public_degree_awarding_professional','Accra','Greater Accra'),
('Institute of Local Government Studies','public_degree_awarding_professional','Ogbodjo','Greater Accra'),
('Kofi Annan International Peace Keeping Training Centre','public_degree_awarding_professional','Teshie','Greater Accra'),
('Rural Development College','public_degree_awarding_professional','Kwaso','Ashanti')
) v(name,type,town,region)
where not exists(select 1 from public.institutions i where lower(i.official_name)=lower(v.name));

-- Ensure the canonical university row exists because programmes reference public.universities.
insert into public.universities (name,slug,category,type,country,city,region,website_url,source_url,source_type,accreditation_status,gtec_accreditation_status,institution_type,verification_status,verified,needs_review,short_description,source_urls)
values ('Ghana Communication Technology University','ghana-communication-technology-university','Traditional University','Public','Ghana','Accra','Greater Accra','https://site.gctu.edu.gh/','https://gtec.edu.gh/explore-institutions/','regulator','Accredited','active','traditional_university','verified',true,false,'Public Ghanaian university offering computing, engineering, business and communication technology programmes.','{https://gtec.edu.gh/explore-institutions/,https://site.gctu.edu.gh/2026-2027-admissions}')
on conflict (slug) do update set website_url=excluded.website_url,source_url=excluded.source_url,gtec_accreditation_status=excluded.gtec_accreditation_status,verified=true,verification_status='verified',updated_at=now();

-- Real GCTU programmes from the university's current 2026-2027 admissions page.
with g as (select id from public.institutions where lower(official_name)='ghana communication technology university' limit 1)
insert into public.programmes
(university_id,name,slug,degree_type,duration,field,department,mode,source_url,source_urls,verification_status,verified,needs_review,admission_summary,last_verified_at)
select g.id,v.name,regexp_replace(lower(v.name),'[^a-z0-9]+','-','g'),v.level,v.duration,v.field,v.department,'full_time','https://site.gctu.edu.gh/2026-2027-admissions',array['https://site.gctu.edu.gh/2026-2027-admissions'],'verified',true,false,v.summary,now()
from g cross join (values
('BSc. Computer Science','Bachelor','4 years','Computer Science','Department of Computer Science','GCTU lists this as a current undergraduate programme for 2026-2027 admissions.'),
('BSc. Computer Science (Cyber Security Option)','Bachelor','4 years','Computer Science','Department of Computer Science','GCTU lists this current undergraduate specialization.'),
('BSc. Data Science and Analytics','Bachelor','4 years','Data Science','Department of Computer Science','GCTU lists this current undergraduate programme.'),
('BSc. Software Engineering','Bachelor','4 years','Software Engineering','Department of Computer Science','GCTU lists this current undergraduate programme.'),
('BSc. Information Technology','Bachelor','4 years','Information Technology','Department of Information Technology','GCTU lists this current undergraduate programme.'),
('BSc. Mobile Computing','Bachelor','4 years','Mobile Computing','Department of Mobile and Pervasive Computing','GCTU lists this current undergraduate programme.'),
('BSc. Information Systems','Bachelor','4 years','Information Systems','Department of Information Systems','GCTU lists this current undergraduate programme.'),
('BSc. Internet of Things and Big Data','Bachelor','4 years','IoT and Big Data','Department of Mobile and Pervasive Computing','GCTU lists this current undergraduate programme.'),
('BSc. Web Application Development','Bachelor','4 years','Web Development','Department of Mobile and Pervasive Computing','GCTU lists this current undergraduate programme.'),
('BSc. Network and System Administration','Bachelor','4 years','Networking','Faculty of Computing and Information Systems','GCTU lists this current undergraduate programme.'),
('Diploma in Computer Science','Diploma','2 years','Computer Science','Faculty of Computing and Information Systems','GCTU lists this current diploma programme.'),
('Diploma in Cyber Security','Diploma','2 years','Cyber Security','Faculty of Computing and Information Systems','GCTU lists this current diploma programme.'),
('Diploma in Data Science and Analytics','Diploma','2 years','Data Science','Faculty of Computing and Information Systems','GCTU lists this current diploma programme.'),
('Diploma in Information Technology','Diploma','2 years','Information Technology','Faculty of Computing and Information Systems','GCTU lists this current diploma programme.'),
('Diploma in Web Application Development','Diploma','2 years','Web Development','Faculty of Computing and Information Systems','GCTU lists this current diploma programme.'),
('BSc. Computer Engineering','Bachelor','4 years','Computer Engineering','Faculty of Engineering','GCTU lists this current undergraduate programme.'),
('BSc. Electrical and Electronic Engineering','Bachelor','4 years','Electrical and Electronic Engineering','Faculty of Engineering','GCTU lists this current undergraduate programme.'),
('BSc. Telecommunications Engineering','Bachelor','4 years','Telecommunications Engineering','Faculty of Engineering','GCTU lists this current undergraduate programme.'),
('BSc. Computational Statistics','Bachelor','4 years','Computational Statistics','Faculty of Engineering','GCTU lists this current undergraduate programme.'),
('BSc. Mathematics','Bachelor','4 years','Mathematics','Faculty of Engineering','GCTU lists this current undergraduate programme.')
) v(name,level,duration,field,department,summary)
where not exists(select 1 from public.programmes p where p.university_id=g.id and lower(p.name)=lower(v.name));

-- Verified skill providers, retained in review queue until field-level confirmation.
insert into public.skill_providers(provider_name,course_name,skill_area,format,duration,cost,certification_issued_by,application_url,source_urls,verification_method,verification_notes,needs_review)
values
('ALX Africa',null,'Technology, business and career skills','online',null,'Varies','ALX Africa','https://www.alxafrica.com/',array['https://www.alxafrica.com/'],'official website','Provider exists; individual course/cohort details require current review.',true),
('Soronko Academy',null,'Technology and digital skills','in_person',null,'Varies','Soronko Academy','https://soronkoacademy.org/',array['https://soronkoacademy.org/'],'official website','Provider exists; individual course/cohort details require current review.',true),
('MEST Africa',null,'Technology and entrepreneurship','hybrid',null,'Varies','MEST Africa','https://meltwater.org/',array['https://meltwater.org/'],'official website','Provider exists; individual course details require current review.',true),
('Kumasi Hive',null,'Hardware, STEM and entrepreneurship','hybrid',null,'Varies','Kumasi Hive','https://kumasi-hive.com/',array['https://kumasi-hive.com/'],'official website','Provider exists; individual programme details require current review.',true),
('iSpace Foundation',null,'Technology, entrepreneurship and innovation','hybrid',null,'Varies','iSpace Foundation','https://ispacefoundation.org/',array['https://ispacefoundation.org/'],'official website','Provider exists; individual programme details require current review.',true),
('Coursera',null,'Online professional and academic skills','online',null,'Varies','Course provider','https://www.coursera.org/',array['https://www.coursera.org/'],'official website','Provider exists; individual course details require current review.',true),
('edX',null,'Online professional and academic skills','online',null,'Varies','Course provider','https://www.edx.org/',array['https://www.edx.org/'],'official website','Provider exists; individual course details require current review.',true),
('Google Career Certificates',null,'Career and technology skills','online',null,'Varies','Google','https://grow.google/certificates/',array['https://grow.google/certificates/'],'official website','Programme catalogue changes; review current offerings.',true),
('Microsoft Learn',null,'Cloud, software and technology skills','online',null,'Free','Microsoft','https://learn.microsoft.com/training/',array['https://learn.microsoft.com/training/'],'official website','Programme catalogue changes; review current offerings.',true),
('freeCodeCamp',null,'Programming and web development','online',null,'Free','freeCodeCamp','https://www.freecodecamp.org/',array['https://www.freecodecamp.org/'],'official website','Provider exists; course paths should be reviewed periodically.',true)
on conflict do nothing;


-- Official starting points for internship/graduate discovery. These remain review-gated.
insert into public.internship_providers(name,sector,provider_type,website_url,programme_summary,application_url,paid,source_urls,verification_method,verification_notes,needs_review)
values
('MEST Africa','Technology and entrepreneurship','tech_hub','https://meltwater.org/','Technology and entrepreneurship programmes and startup support.','https://meltwater.org/',null,array['https://meltwater.org/'],'official website','Specific internship terms require current review.',true),
('iSpace Foundation','Technology and innovation','tech_hub','https://www.ispacefoundation.com/','Innovation hub supporting entrepreneurs, startups and skills development in Ghana.','https://www.ispacefoundation.com/',null,array['https://www.ispacefoundation.com/'],'official website','Specific internship terms require current review.',true),
('Impact Hub Accra','Innovation and entrepreneurship','tech_hub','https://accra.impacthub.net/','Accra innovation hub running venture, ecosystem, research and entrepreneurship programmes.','https://accra.impacthub.net/',null,array['https://accra.impacthub.net/'],'official website','Specific internship terms require current review.',true),
('Kumasi Hive','Technology, hardware and entrepreneurship','tech_hub','https://www.kumasihive.com/','Innovation hub providing technology, training, prototyping and entrepreneurship support.','https://www.kumasihive.com/',null,array['https://www.kumasihive.com/'],'official website','Specific internship terms require current review.',true),
('Kosmos Innovation Center','Agriculture technology and entrepreneurship','ngo','https://kicghana.org/','Non-profit supporting young entrepreneurs through training, mentorship and business support.','https://kicghana.org/',null,array['https://kicghana.org/'],'official website','Specific internship terms require current review.',true),
('NEIP','Entrepreneurship and business development','govt_agency','https://neip.gov.gh/','Government entrepreneurship programme providing business development services, incubation, training and support.','https://neip.gov.gh/',null,array['https://neip.gov.gh/'],'official website','Specific placements require current review.',true),
('MTN Ghana','Telecommunications and technology','corporate','https://mtn.com.gh/','Ghana telecommunications company with a careers channel.','https://mtn.com.gh/careers-success/',null,array['https://mtn.com.gh/','https://mtn.com.gh/careers-success/'],'official website','Specific internship or graduate programme status requires current review.',true),
('Ecobank Ghana','Banking and financial services','corporate','https://ecobank.com/gh/personal-banking','Banking organisation with careers and professional opportunities.','https://ecobank.com/careers',null,array['https://ecobank.com/gh/personal-banking','https://ecobank.com/careers'],'official website','Specific Ghana internship terms require current review.',true)
on conflict do nothing;

insert into public.scholarships(title,name,provider,type,source_url,website_url,application_url,description,eligibility,study_level,nationality_requirement,deadline_text,verified,last_verified_at)
values
('THE JOINT ALGERIA/GHANA GOVERNMENT SCHOLARSHIP AWARDS 2026/2027','Algeria/Ghana Government Scholarship Awards','Ghana Scholarships Authority','Government scholarship','https://scholarships.gov.gh/opportunities/the-joint-algeriaghana-government-scholarship-awards-for-the-20262027-academic-year-tenable-in-algeria','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Scholarship awards for undergraduate studies, vocational/technical education and religious studies in Algeria.','See official notice for current eligibility.','Undergraduate','Ghanaian','September 21, 2026',true,now()),
('PRESIDENTIAL WEST AFRICAN SCHOLARSHIP INITIATIVE (PWASI) 2026','PWASI 2026','Ghana Scholarships Authority','Government scholarship','https://scholarships.gov.gh/opportunities/presidential-west-african-scholarship-initiative-pwasi-2026','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Scholarships for full-time undergraduate and postgraduate studies in public tertiary institutions in Ghana for eligible ECOWAS applicants.','See official notice for current eligibility.','Undergraduate; Postgraduate','ECOWAS','Not specified',true,now()),
('LOCAL TERTIARY SCHOLARSHIP APPLICATIONS 2026/2027','Local Tertiary Scholarship Applications 2026/2027','Ghana Scholarships Authority','Local tertiary scholarship','https://scholarships.gov.gh/opportunities/local-tertiary-scholarship-applications-for-20262027-academic-year','https://scholarships.gov.gh/','https://apply.scholarships.gov.gh/','Local tertiary scholarship support for eligible Ghanaian students.','See official notice for current eligibility.','Undergraduate','Ghanaian','May 15, 2026',true,now()),
('SCHOLARSHIP OPPORTUNITY IN THE REPUBLIC OF SERBIA','World in Serbia Scholarship Programme 2026/2027','Ghana Scholarships Authority','Foreign scholarship','https://scholarships.gov.gh/opportunities/scholarship-opportunity-in-the-republic-of-serbia','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Scholarship opportunity for higher education at accredited public institutions in Serbia.','See official notice for current eligibility.','Higher education','Ghanaian','June 26, 2026',true,now()),
('2027 LEARN AFRICA PROGRAM FOR AFRICAN WOMEN','Learn Africa Scholarship Programme 2026/2027','Ghana Scholarships Authority','Foreign scholarship','https://scholarships.gov.gh/opportunities/2027-learn-africa-program-for-african-women','https://scholarships.gov.gh/','https://mujeresporafrica.es/en/programme-learn-africa-2026','Postgraduate scholarship pathway at participating Spanish academic institutions.','See official notice for current eligibility.','Postgraduate','Ghanaian','April 19, 2026',true,now()),
('AUSTRALIAN AWARDS SCHOLARSHIP 2027','Australia Awards Scholarship 2027','Ghana Scholarships Authority','Foreign scholarship','https://scholarships.gov.gh/opportunities/australian-awards-scholarship-2027','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Australian Awards scholarship opportunity announced through the Ghana Scholarships Authority.','See official notice for current eligibility.','Postgraduate','Ghanaian','See official notice',true,now()),
('SCHOLARSHIP OPPORTUNITIES AND THAI-FUNDED TRAINING PROGRAMMES 2026/2027','Thailand International Cooperation Agency opportunities','Ghana Scholarships Authority','Foreign scholarship and training','https://scholarships.gov.gh/opportunities/scholarship-opportunities-and-thai-funded-training-programmes-20262027','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Scholarship and training opportunities for Ghanaian public sector workers under TICA.','See official notice for current eligibility.','Professional training','Ghanaian','See official notice',true,now()),
('PARTNERSHIP BETWEEN FANAKA INTERNATIONAL UNIVERSITY COLLEGE AND THE GHANA SCHOLARSHIP AUTHORITY','Fanaka International University College Scholarship Partnership','Ghana Scholarships Authority','Local tertiary scholarship','https://scholarships.gov.gh/opportunities/partnership-between-fanaka-international-university-college-fiuc-and-the-ghana-scholarship-authority','https://scholarships.gov.gh/','https://scholarships.gov.gh/','Scholarship partnership supporting needy but brilliant Ghanaian students in Procurement and Supply Chain Management.','See official notice for current eligibility.','Undergraduate','Ghanaian','See official notice',true,now())
on conflict do nothing;