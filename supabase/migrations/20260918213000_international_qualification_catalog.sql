-- Country, qualification, and programme requirement catalog for international recommendations.
create table if not exists public.country_catalog (
  code text primary key, name text not null, region text not null, primary_language text not null,
  enabled boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.qualification_catalog (
  code text primary key, name text not null, country_code text, family text not null,
  grading_scale text, levels text[] not null default '{}', grades text[] not null default '{}',
  score_min numeric, score_max numeric, metadata jsonb not null default '{}',
  enabled boolean not null default true, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.programme_qualification_requirements (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  qualification_code text not null references public.qualification_catalog(code),
  minimum_overall_score numeric, minimum_score_operator text,
  required_subjects jsonb not null default '[]'::jsonb, notes text, source_url text,
  verification_status text not null default 'unverified', last_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(programme_id, qualification_code)
);
create index if not exists qualification_catalog_country_idx on public.qualification_catalog(country_code);
create index if not exists programme_qualification_requirements_programme_idx on public.programme_qualification_requirements(programme_id);
create index if not exists programme_qualification_requirements_qualification_idx on public.programme_qualification_requirements(qualification_code);
alter table public.country_catalog enable row level security;
alter table public.qualification_catalog enable row level security;
alter table public.programme_qualification_requirements enable row level security;
drop policy if exists "Authenticated users can view countries" on public.country_catalog;
create policy "Authenticated users can view countries" on public.country_catalog for select to authenticated using (enabled);
drop policy if exists "Authenticated users can view qualifications" on public.qualification_catalog;
create policy "Authenticated users can view qualifications" on public.qualification_catalog for select to authenticated using (enabled);
drop policy if exists "Authenticated users can view programme qualification requirements" on public.programme_qualification_requirements;
create policy "Authenticated users can view programme qualification requirements" on public.programme_qualification_requirements for select to authenticated using (true);

insert into public.country_catalog(code,name,region,primary_language) values
('GH','Ghana','West Africa','en'),('TD','Chad','Central Africa','fr'),('CI','Côte d''Ivoire','West Africa','fr'),
('SN','Senegal','West Africa','fr'),('BJ','Benin','West Africa','fr'),('TG','Togo','West Africa','fr'),
('CM','Cameroon','Central Africa','fr'),('GN','Guinea','West Africa','fr'),('BF','Burkina Faso','West Africa','fr'),
('ML','Mali','West Africa','fr'),('NG','Nigeria','West Africa','en'),('KE','Kenya','East Africa','en'),
('ZA','South Africa','Southern Africa','en'),('US','United States','North America','en'),('GB','United Kingdom','Europe','en')
on conflict (code) do update set name=excluded.name, region=excluded.region, primary_language=excluded.primary_language, enabled=true;

insert into public.qualification_catalog(code,name,country_code,family,grading_scale,levels,grades,score_min,score_max,metadata) values
('WASSCE','WASSCE','GH','National','A1–F9','{}','{A1,B2,B3,C4,C5,C6,D7,E8,F9}',1,9,'{"type":"secondary_leaving"}'),
('IB_DP','IB Diploma Programme',null,'International','1–7','{HL,SL}','{7,6,5,4,3,2,1}',1,7,'{"type":"secondary_leaving"}'),
('IGCSE','Cambridge IGCSE',null,'Cambridge','A*–G','{}','{A*,A,B,C,D,E,F,G}',null,null,'{"type":"secondary"}'),
('O_LEVEL','Cambridge O Level',null,'Cambridge','A*–E','{}','{A*,A,B,C,D,E}',null,null,'{"type":"secondary"}'),
('AS_LEVEL','Cambridge International AS Level',null,'Cambridge','A–E','{}','{A,B,C,D,E}',null,null,'{"type":"secondary"}'),
('A_LEVEL','Cambridge International A Level',null,'Cambridge','A*–E','{}','{A*,A,B,C,D,E}',null,null,'{"type":"secondary_leaving"}'),
('EDEXCEL_IGCSE','Pearson Edexcel International GCSE',null,'Pearson','9–1 / A*–G','{}','{9,8,7,6,5,4,3,2,1}',null,null,'{"type":"secondary"}'),
('EDEXCEL_A_LEVEL','Pearson Edexcel International A Level',null,'Pearson','A*–E','{}','{A*,A,B,C,D,E}',null,null,'{"type":"secondary_leaving"}'),
('AP','Advanced Placement','US','United States','1–5','{}','{5,4,3,2,1}',1,5,'{"type":"advanced_secondary"}'),
('SAT','SAT',null,'Standardized Test','400–1600','{}','{}',400,1600,'{"type":"standardized_test"}'),
('ACT','ACT',null,'Standardized Test','1–36','{}','{}',1,36,'{"type":"standardized_test"}'),
('FRENCH_BAC','French Baccalauréat',null,'Francophone','0–20','{}','{}',0,20,'{"type":"secondary_leaving","language":"fr"}'),
('GERMAN_ABITUR','German Abitur','DE','National','1.0–6.0','{}','{}',1,6,'{"type":"secondary_leaving"}'),
('EUROPEAN_BAC','European Baccalaureate',null,'International','0–100','{}','{}',0,100,'{"type":"secondary_leaving"}'),
('KCSE','KCSE','KE','National','A–E','{}','{A,A-,B+,B,B-,C+,C,C-,D+,D,D-,E}',null,null,'{"type":"secondary_leaving"}'),
('NSC','South African National Senior Certificate','ZA','National','Level 1–7','{}','{7,6,5,4,3,2,1}',1,7,'{"type":"secondary_leaving"}'),
('WAEC_NIGERIA','WAEC / NECO','NG','National','A1–F9','{}','{A1,B2,B3,C4,C5,C6,D7,E8,F9}',1,9,'{"type":"secondary_leaving"}'),
('CAMBRIDGE_GCE','Cambridge GCE',null,'Cambridge','A*–E','{}','{A*,A,B,C,D,E}',null,null,'{"type":"secondary_leaving"}')
on conflict (code) do update set name=excluded.name, country_code=excluded.country_code, family=excluded.family, grading_scale=excluded.grading_scale, levels=excluded.levels, grades=excluded.grades, score_min=excluded.score_min, score_max=excluded.score_max, metadata=excluded.metadata, enabled=true;