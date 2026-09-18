-- GhanaPathFinder backend routing architecture
-- 13 language backends plus country-aware admissions data routing.
-- This keeps each language isolated at the backend contract level without
-- creating hundreds of duplicated database projects.

create schema if not exists backend_en;
create schema if not exists backend_fr;
create schema if not exists backend_sw;
create schema if not exists backend_ar;
create schema if not exists backend_pt;
create schema if not exists backend_es;
create schema if not exists backend_ha;
create schema if not exists backend_am;
create schema if not exists backend_yo;
create schema if not exists backend_ig;
create schema if not exists backend_wo;
create schema if not exists backend_tw;
create schema if not exists backend_ee;

create table if not exists public.backend_registry (
  backend_key text primary key,
  backend_type text not null check (backend_type in ('language','country')),
  code text not null,
  locale text,
  country_code text,
  display_name text not null,
  native_name text,
  schema_name text,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists backend_registry_type_code_idx on public.backend_registry(backend_type, code);
create index if not exists backend_registry_country_idx on public.backend_registry(country_code);

insert into public.backend_registry
(backend_key, backend_type, code, locale, display_name, native_name, schema_name, metadata)
values
('lang_en','language','en','en','English','English','backend_en','{"direction":"ltr"}'),
('lang_fr','language','fr','fr','French','Français','backend_fr','{"direction":"ltr"}'),
('lang_sw','language','sw','sw','Kiswahili','Kiswahili','backend_sw','{"direction":"ltr"}'),
('lang_ar','language','ar','ar','Arabic','العربية','backend_ar','{"direction":"rtl"}'),
('lang_pt','language','pt','pt','Portuguese','Português','backend_pt','{"direction":"ltr"}'),
('lang_es','language','es','es','Spanish','Español','backend_es','{"direction":"ltr"}'),
('lang_ha','language','ha','ha','Hausa','Hausa','backend_ha','{"direction":"ltr"}'),
('lang_am','language','am','am','Amharic','አማርኛ','backend_am','{"direction":"ltr"}'),
('lang_yo','language','yo','yo','Yorùbá','Yorùbá','backend_yo','{"direction":"ltr"}'),
('lang_ig','language','ig','ig','Igbo','Igbo','backend_ig','{"direction":"ltr"}'),
('lang_wo','language','wo','wo','Wolof','Wolof','backend_wo','{"direction":"ltr"}'),
('lang_tw','language','tw','ak','Twi','Twi','backend_tw','{"direction":"ltr"}'),
('lang_ee','language','ee','ee','Ewe','Eʋegbe','backend_ee','{"direction":"ltr"}')
on conflict (backend_key) do update set locale=excluded.locale,display_name=excluded.display_name,native_name=excluded.native_name,schema_name=excluded.schema_name,metadata=excluded.metadata,updated_at=now();

create table if not exists public.backend_content (
  backend_key text not null references public.backend_registry(backend_key) on delete cascade,
  content_key text not null,
  content_value text not null,
  content_type text not null default 'ui',
  source_language text not null default 'en',
  verified boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (backend_key, content_key)
);

alter table public.backend_registry enable row level security;
alter table public.backend_content enable row level security;
drop policy if exists "backend_registry_public_read" on public.backend_registry;
create policy "backend_registry_public_read" on public.backend_registry for select to anon, authenticated using (enabled = true);
drop policy if exists "backend_content_public_read" on public.backend_content;
create policy "backend_content_public_read" on public.backend_content for select to anon, authenticated using (
  exists (select 1 from public.backend_registry b where b.backend_key=backend_content.backend_key and b.enabled=true)
);

create or replace function public.resolve_gpf_backend(p_language text default 'en', p_country_code text default null)
returns table(language_backend text,country_code text,language_code text,locale text,direction text)
language sql security invoker stable set search_path=''
as $$
select lb.backend_key,p_country_code,lb.code,lb.locale,coalesce(lb.metadata->>'direction','ltr')
from public.backend_registry lb
where lb.backend_type='language' and lb.code=lower(coalesce(p_language,'en')) and lb.enabled=true limit 1
$$;
revoke execute on function public.resolve_gpf_backend(text,text) from public;
grant execute on function public.resolve_gpf_backend(text,text) to anon, authenticated;

create or replace function public.get_backend_content(p_language text default 'en', p_keys text[] default '{}')
returns table(content_key text,content_value text,verified boolean)
language sql security invoker stable set search_path=''
as $$
select c.content_key,c.content_value,c.verified
from public.backend_content c
join public.backend_registry b on b.backend_key=c.backend_key
where b.backend_type='language' and b.code=lower(coalesce(p_language,'en')) and b.enabled=true
and (cardinality(p_keys)=0 or c.content_key=any(p_keys))
order by c.content_key
$$;
revoke execute on function public.get_backend_content(text,text[]) from public;
grant execute on function public.get_backend_content(text,text[]) to anon, authenticated;
