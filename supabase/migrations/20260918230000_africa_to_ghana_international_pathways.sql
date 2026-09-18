-- Africa-first international-to-Ghana pathway catalog.
-- Source-backed Ghana institution and immigration links are stored as URLs for verification.
create table if not exists public.africa_country_catalog (
  code text primary key, name text not null, region text not null,
  official_languages text[] not null default '{}', common_languages text[] not null default '{}',
  enabled boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.ghana_institution_guides (
  id uuid primary key default gen_random_uuid(), institution_name text not null unique,
  institution_type text, admissions_url text, international_url text, application_url text,
  scholarship_url text, notes text, verification_status text not null default 'verified',
  last_verified_at timestamptz default now()
);
create table if not exists public.country_qualification_mapping (
  country_code text not null references public.africa_country_catalog(code) on delete cascade,
  qualification_code text not null references public.qualification_catalog(code) on delete cascade,
  notes text, source_url text, verification_status text not null default 'review_required',
  primary key(country_code, qualification_code)
);
create table if not exists public.ghana_student_visa_guides (
  country_code text primary key references public.africa_country_catalog(code) on delete cascade,
  destination_country text not null default 'GH', title text not null,
  steps jsonb not null default '[]', required_documents jsonb not null default '[]',
  source_url text, last_verified_at timestamptz default now()
);
create table if not exists public.cross_border_opportunities (
  id uuid primary key default gen_random_uuid(), employer text not null, country_code text,
  opportunity_type text not null, role_family text, title text,
  eligibility jsonb not null default '{}', application_url text, source_url text,
  verified boolean not null default false, last_verified_at timestamptz default now()
);
create table if not exists public.platform_languages (
  code text primary key, name text not null, native_name text not null,
  rtl boolean not null default false, african_scope text not null default 'major',
  enabled boolean not null default true
);
create table if not exists public.platform_translations (
  language_code text not null references public.platform_languages(code) on delete cascade,
  translation_key text not null, translation_value text not null,
  primary key(language_code, translation_key)
);
alter table public.africa_country_catalog enable row level security;
alter table public.ghana_institution_guides enable row level security;
alter table public.country_qualification_mapping enable row level security;
alter table public.ghana_student_visa_guides enable row level security;
alter table public.cross_border_opportunities enable row level security;
alter table public.platform_languages enable row level security;
alter table public.platform_translations enable row level security;
create policy "Public catalog read" on public.africa_country_catalog for select to anon,authenticated using (true);
create policy "Public institution guide read" on public.ghana_institution_guides for select to anon,authenticated using (true);
create policy "Public qualification mapping read" on public.country_qualification_mapping for select to anon,authenticated using (true);
create policy "Public visa guide read" on public.ghana_student_visa_guides for select to anon,authenticated using (true);
create policy "Public opportunity read" on public.cross_border_opportunities for select to anon,authenticated using (true);
create policy "Public language read" on public.platform_languages for select to anon,authenticated using (true);
create policy "Public translation read" on public.platform_translations for select to anon,authenticated using (true);

-- The catalogue is based on the African Union's 55-member country list.
insert into public.africa_country_catalog(code,name,region,official_languages,common_languages) values
('DZ','Algeria','North Africa','{Arabic,Tamazight}','{French}'),('AO','Angola','Southern Africa','{Portuguese}','{Umbundu,Kimbundu}'),('BJ','Benin','West Africa','{French}','{Fon,Yoruba}'),('BW','Botswana','Southern Africa','{English,Setswana}','{Setswana}'),('BF','Burkina Faso','West Africa','{French}','{Mossi,Dioula}'),('BI','Burundi','East Africa','{Kirundi,French,English}','{Kirundi}'),('CV','Cabo Verde','West Africa','{Portuguese}','{Cape Verdean Creole}'),('CM','Cameroon','Central Africa','{French,English}','{Fulfulde}'),('CF','Central African Republic','Central Africa','{French,Sango}','{Sango}'),('TD','Chad','Central Africa','{French,Arabic}','{Chadian Arabic}'),('KM','Comoros','East Africa','{Comorian,Arabic,French}','{Comorian}'),('CG','Congo','Central Africa','{French}','{Lingala,Kituba}'),('CD','DR Congo','Central Africa','{French}','{Lingala,Swahili}'),('CI','Côte d’Ivoire','West Africa','{French}','{Dioula}'),('DJ','Djibouti','East Africa','{Arabic,French}','{Somali,Afari}'),('EG','Egypt','North Africa','{Arabic}','{Egyptian Arabic}'),('GQ','Equatorial Guinea','Central Africa','{Spanish,French,Portuguese}','{Fang}'),('ER','Eritrea','East Africa','{Tigrinya,Arabic,English}','{Tigrinya,Tigre}'),('SZ','Eswatini','Southern Africa','{English,siSwati}','{siSwati}'),('ET','Ethiopia','East Africa','{Amharic}','{Oromo,Tigrinya,Somali}'),('GA','Gabon','Central Africa','{French}','{Fang}'),('GM','Gambia','West Africa','{English}','{Mandinka,Wolof,Fula}'),('GH','Ghana','West Africa','{English}','{Twi,Ewe,Ga,Hausa}'),('GN','Guinea','West Africa','{French}','{Pular,Maninka,Susu}'),('GW','Guinea-Bissau','West Africa','{Portuguese}','{Guinea-Bissau Creole}'),('KE','Kenya','East Africa','{English,Kiswahili}','{Kikuyu,Luo}'),('LS','Lesotho','Southern Africa','{Sesotho,English}','{Sesotho}'),('LR','Liberia','West Africa','{English}','{Liberian English,Kpelle}'),('LY','Libya','North Africa','{Arabic}','{Libyan Arabic}'),('MG','Madagascar','East Africa','{Malagasy,French}','{Malagasy}'),('MW','Malawi','East Africa','{English,Chichewa}','{Chichewa,Tumbuka}'),('ML','Mali','West Africa','{French}','{Bambara,Fulfulde}'),('MR','Mauritania','North Africa','{Arabic}','{Hassaniya Arabic,Pulaar,Wolof}'),('MU','Mauritius','East Africa','{English,French}','{Mauritian Creole}'),('MA','Morocco','North Africa','{Arabic,Amazigh}','{Moroccan Arabic,French}'),('MZ','Mozambique','Southern Africa','{Portuguese}','{Makhuwa,Tsonga}'),('NA','Namibia','Southern Africa','{English}','{Oshiwambo,Afrikaans}'),('NE','Niger','West Africa','{French}','{Hausa,Zarma}'),('NG','Nigeria','West Africa','{English}','{Hausa,Yoruba,Igbo}'),('RW','Rwanda','East Africa','{Kinyarwanda,English,French,Swahili}','{Kinyarwanda,Swahili}'),('ST','São Tomé and Príncipe','Central Africa','{Portuguese}','{Forro}'),('SN','Senegal','West Africa','{French}','{Wolof,Pulaar}'),('SC','Seychelles','East Africa','{Seychellois Creole,English,French}','{Seychellois Creole}'),('SL','Sierra Leone','West Africa','{English}','{Krio,Temne,Mende}'),('SO','Somalia','East Africa','{Somali,Arabic}','{Somali}'),('ZA','South Africa','Southern Africa','{Afrikaans,English,isiNdebele,isiXhosa,isiZulu,Sepedi,Setswana,siSwati,Tshivenda,Xitsonga,South African Sign Language}','{English,isiZulu,isiXhosa,Afrikaans}'),('SS','South Sudan','East Africa','{English}','{Juba Arabic,Dinka,Nuer}'),('SD','Sudan','North Africa','{Arabic,English}','{Sudanese Arabic}'),('TZ','Tanzania','East Africa','{Kiswahili,English}','{Kiswahili}'),('TG','Togo','West Africa','{French}','{Ewe,Kabye}'),('TN','Tunisia','North Africa','{Arabic}','{Tunisian Arabic,French}'),('UG','Uganda','East Africa','{English,Kiswahili}','{Luganda,Acholi}'),('ZM','Zambia','Southern Africa','{English}','{Bemba,Nyanja,Tonga}'),('ZW','Zimbabwe','Southern Africa','{English,Shona,Ndebele}','{Shona,Ndebele}'),('EH','Sahrawi Republic','North Africa','{Arabic}','{Hassaniya Arabic}')
on conflict(code) do update set name=excluded.name,region=excluded.region,official_languages=excluded.official_languages,common_languages=excluded.common_languages,enabled=true;

insert into public.platform_languages(code,name,native_name,rtl,african_scope) values
('en','English','English',false,'AU working'),('fr','French','Français',false,'AU working'),('ar','Arabic','العربية',true,'AU working'),('sw','Kiswahili','Kiswahili',false,'AU working'),('pt','Portuguese','Português',false,'AU working'),('es','Spanish','Español',false,'African official-language context'),('ha','Hausa','Hausa',false,'major African language'),('am','Amharic','አማርኛ',false,'major African language'),('yo','Yoruba','Yorùbá',false,'major African language'),('ig','Igbo','Igbo',false,'major African language'),('wo','Wolof','Wolof',false,'major African language'),('tw','Twi','Twi',false,'major Ghanaian language'),('ee','Ewe','Eʋegbe',false,'major Ghanaian language')
on conflict(code) do update set name=excluded.name,native_name=excluded.native_name,rtl=excluded.rtl,african_scope=excluded.african_scope,enabled=true;

insert into public.ghana_student_visa_guides(country_code,title,steps,required_documents,source_url) values
('GH','Ghana student residence pathway','["Get admission from a Ghanaian institution","Follow the institution international-student instructions","Prepare passport, admission letter and fee evidence","Apply through the Ghana Immigration Service student residence process","Complete institutional and immigration registration"]','["Passport","Admission letter","School fees receipt","Passport photos","Birth certificate where applicable","Non-Citizen ID where applicable"]','https://gis.gov.gh/service/residence-permit-student/')
on conflict(country_code) do update set steps=excluded.steps,required_documents=excluded.required_documents,source_url=excluded.source_url,last_verified_at=now();

insert into public.cross_border_opportunities(employer,country_code,opportunity_type,role_family,title,eligibility,application_url,source_url,verified) values
('Vodacom','ZA','internship','Technology','Vodacom Internship Programme','{"degree":"B-degree or equivalent","academic":"programme-specific","work_authorization":"programme-specific"}','https://opportunities.vodafone.com/Vodacom/job/Midrand-2027-Vodacom-Early-Careers-Programmes/1398615433/','https://www.vodacom.com/internship-programme.php',true),
('MTN Group','ZA','graduate_programme','Technology','MTN Global Graduate Programme','{"academic":"programme-specific","market":"target-country eligibility applies"}','https://www.mtn.com/join-our-yello-family-people-and-culture/','https://www.mtn.com/join-our-yello-family-people-and-culture/',true),
('MTN Skills Academy','AFRICA','skills_and_jobs','Technology','Digital skills and job discovery','{"audience":"students and job seekers","markets":"multiple African markets"}','https://skillsacademy.mtn.com/','https://www.mtn.com/mtn-launches-ai-powered-job-board-to-connect-africas-youth-to-the-opportunities-of-the-digital-economy/',true)
on conflict do nothing;