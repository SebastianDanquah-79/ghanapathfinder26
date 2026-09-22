-- Remove the deprecated contact-number requirement from profiles.
alter table public.profiles drop column if exists whatsapp_number;
