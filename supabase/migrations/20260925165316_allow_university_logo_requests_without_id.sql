-- Logo requests may be submitted for organisations not yet linked to a university record.
alter table public.logo_requests alter column university_id drop not null;
