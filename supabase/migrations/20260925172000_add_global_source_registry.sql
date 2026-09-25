create table if not exists public.source_registry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  canonical_url text not null,
  country_code text,
  category text,
  description text,
  verified_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','paused','broken','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists source_registry_canonical_url_key on public.source_registry(canonical_url);
create index if not exists source_registry_type_status_idx on public.source_registry(source_type,status);
create index if not exists source_registry_country_idx on public.source_registry(country_code);
create index if not exists source_registry_category_idx on public.source_registry(category);

alter table public.source_registry enable row level security;

drop policy if exists "Public can read active source registry" on public.source_registry;
create policy "Public can read active source registry"
on public.source_registry for select
using (status = 'active');

insert into public.source_registry (name,source_type,canonical_url,country_code,category,description)
values
('Techpoint Africa','news','https://techpoint.africa/','AF','technology','African technology, startup and business publication'),
('Disrupt Africa','news','https://disruptafrica.com/','AF','startups','African startup and investment publication'),
('VC4A','startup','https://www.vc4a.com/','AF','entrepreneurship','African entrepreneurship, venture and investor network'),
('WeeTracker','news','https://weetracker.com/','AF','business','African startup, business and venture publication'),
('Africanews','news','https://www.africanews.com/','AF','news','Pan-African news publication'),
('Graphic Online Technology','news','https://www.graphic.com.gh/tech-news.html','GH','technology','Ghana technology news section'),
('BusinessDay Nigeria Technology','news','https://businessday.ng/category/technology/','NG','technology','Nigerian business and technology publication'),
('University of Ghana','university','https://ug.edu.gh/','GH','education','Official University of Ghana website'),
('University of Cape Town','university','https://uct.ac.za/','ZA','education','Official University of Cape Town website'),
('Wits University','university','https://www.wits.ac.za/','ZA','education','Official University of the Witwatersrand website'),
('University of Lagos','university','https://unilag.edu.ng/','NG','education','Official University of Lagos website'),
('Makerere University','university','https://www.mak.ac.ug/','UG','education','Official Makerere University website'),
('M-KOPA','company','https://www.m-kopa.com/','KE','fintech','Official M-KOPA website'),
('African Union','organization','https://au.int/','AF','public affairs','Official African Union website'),
('World Bank Africa','organization','https://www.worldbank.org/en/region/afr','AF','development','World Bank Africa regional information'),
('African Development Bank','organization','https://www.afdb.org/','AF','development','Official African Development Bank website'),
('Smart Africa','organization','https://smartafrica.org/','AF','technology','Pan-African digital transformation alliance'),
('GSMA','organization','https://www.gsma.com/','AF','technology','Global mobile ecosystem organization with extensive Africa activity'),
('Google Africa','company','https://africa.google/','AF','technology','Google Africa regional information'),
('Microsoft Africa','company','https://www.microsoft.com/en-africa','AF','technology','Microsoft Africa regional site')
on conflict (canonical_url) do update set last_checked_at=now(),updated_at=now(),status='active';
