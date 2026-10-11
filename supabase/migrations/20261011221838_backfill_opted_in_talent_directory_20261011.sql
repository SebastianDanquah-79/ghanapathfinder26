insert into public.talent_directory (
  user_id,
  full_name,
  professional_title,
  years_experience,
  linkedin_url,
  city,
  preferred_locations,
  preferred_industries,
  skills,
  bio,
  discoverable,
  updated_at
)
select
  ep.user_id,
  nullif(btrim(p.full_name), ''),
  nullif(btrim(ep.professional_title), ''),
  ep.years_experience,
  ep.linkedin_url,
  ep.location,
  coalesce(ep.preferred_locations, '{}'::text[]),
  coalesce(ep.preferred_industries, '{}'::text[]),
  coalesce(ep.skills, '{}'::text[]),
  ep.bio,
  true,
  now()
from public.employee_profiles ep
join public.profiles p on p.id = ep.user_id
where ep.discoverable = true
  and nullif(btrim(p.full_name), '') is not null
on conflict (user_id) do update set
  full_name = excluded.full_name,
  professional_title = excluded.professional_title,
  years_experience = excluded.years_experience,
  linkedin_url = excluded.linkedin_url,
  city = excluded.city,
  preferred_locations = excluded.preferred_locations,
  preferred_industries = excluded.preferred_industries,
  skills = excluded.skills,
  bio = excluded.bio,
  discoverable = true,
  updated_at = now();
