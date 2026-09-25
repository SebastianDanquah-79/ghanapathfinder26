-- Make restored compatibility fields safe for the existing application contract.
alter table public.scholarship_applications alter column scholarship_id drop not null;
alter table public.logo_requests alter column suggested_url drop not null;

update public.programmes set name=coalesce(name,slug,id::text), verified=coalesce(verified,false),
 career_opportunities=coalesce(career_opportunities,'{}'::text[]),
 relevant_subjects=coalesce(relevant_subjects,'{}'::text[]), slug=coalesce(slug,id::text)
where name is null or verified is null or career_opportunities is null or relevant_subjects is null or slug is null;
alter table public.programmes alter column name set not null;
alter table public.programmes alter column verified set not null;
alter table public.programmes alter column career_opportunities set not null;
alter table public.programmes alter column relevant_subjects set not null;
alter table public.programmes alter column slug set not null;

update public.programme_sources set source_type=coalesce(source_type,'official_institution') where source_type is null;
alter table public.programme_sources alter column source_type set not null;
