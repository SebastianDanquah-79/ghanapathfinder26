create or replace view public.programme_facets
with (security_invoker = true)
as
select 'field'::text as kind, p.field as value, count(*)::bigint as count
from public.programmes p
where p.field is not null and btrim(p.field) <> ''
group by p.field
union all
select 'degree_type'::text, p.degree_type, count(*)::bigint
from public.programmes p
where p.degree_type is not null and btrim(p.degree_type) <> ''
group by p.degree_type
union all
select 'qualification'::text, p.qualification, count(*)::bigint
from public.programmes p
where p.qualification is not null and btrim(p.qualification) <> ''
group by p.qualification
union all
select 'region'::text, u.region, count(*)::bigint
from public.programmes p
join public.universities u on u.id = p.university_id
where u.region is not null and btrim(u.region) <> ''
group by u.region
union all
select 'institution'::text, u.name, count(*)::bigint
from public.programmes p
join public.universities u on u.id = p.university_id
where u.name is not null and btrim(u.name) <> ''
group by u.name;

grant select on public.programme_facets to anon, authenticated;