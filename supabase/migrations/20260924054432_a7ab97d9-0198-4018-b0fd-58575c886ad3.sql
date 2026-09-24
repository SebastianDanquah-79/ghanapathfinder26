-- Profiles: workspace/onboarding columns used by dashboards and onboarding
alter table public.profiles
  add column if not exists role text,
  add column if not exists account_role text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists university text,
  add column if not exists program text,
  add column if not exists graduation_year integer,
  add column if not exists company text,
  add column if not exists job_title text,
  add column if not exists linkedin_url text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists is_discoverable boolean not null default false,
  add column if not exists avatar_url text,
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists preferred_opportunity_types text[] not null default '{}';

-- Notifications: action link + read flags
alter table public.notifications
  add column if not exists action_url text,
  add column if not exists is_read boolean not null default false,
  add column if not exists type text not null default 'general',
  add column if not exists message text,
  add column if not exists read boolean not null default false;

-- Opportunities: job-board columns used by employer/employee/founder workspaces
alter table public.opportunities
  add column if not exists company_name text,
  add column if not exists country_code text,
  add column if not exists opportunity_type text not null default 'job',
  add column if not exists deadline timestamptz,
  add column if not exists source_name text,
  add column if not exists is_active boolean not null default true,
  add column if not exists remote boolean not null default false,
  add column if not exists source text,
  add column if not exists source_id text,
  add column if not exists posted_at timestamptz,
  add column if not exists status text not null default 'active',
  add column if not exists skills_required text[] not null default '{}',
  add column if not exists posted_by uuid references auth.users(id) on delete set null;

create unique index if not exists opportunities_source_source_id_key on public.opportunities(source, source_id) where source is not null and source_id is not null;

-- Employers can publish their own opportunities; everyone can read active ones
drop policy if exists "Authenticated users can post own opportunities" on public.opportunities;
create policy "Authenticated users can post own opportunities"
  on public.opportunities for insert to authenticated
  with check (posted_by = auth.uid());

drop policy if exists "Users can read own postings" on public.opportunities;
create policy "Users can read own postings"
  on public.opportunities for select to authenticated
  using (posted_by = auth.uid());

drop policy if exists "Active opportunities are readable" on public.opportunities;
create policy "Active opportunities are readable"
  on public.opportunities for select to anon, authenticated
  using (is_active = true or published = true);

-- News articles (populated by the sync-news function)
create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  image_url text,
  source_name text,
  source_id text,
  original_url text unique,
  category text,
  country_code text,
  published_at timestamptz,
  fetched_at timestamptz default now()
);
grant select on public.news_articles to anon, authenticated;
grant all on public.news_articles to service_role;
alter table public.news_articles enable row level security;
drop policy if exists "News articles are public" on public.news_articles;
create policy "News articles are public" on public.news_articles for select to anon, authenticated using (true);

-- Innovation video feed
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  title text,
  description text,
  video_url text,
  youtube_url text,
  thumbnail_url text,
  tags text[] not null default '{}',
  category text not null default 'general',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  views_count integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.feed_posts to anon, authenticated;
grant insert on public.feed_posts to authenticated;
grant all on public.feed_posts to service_role;
alter table public.feed_posts enable row level security;
drop policy if exists "Published feed posts are public" on public.feed_posts;
create policy "Published feed posts are public" on public.feed_posts for select to anon, authenticated using (is_published = true or author_id = auth.uid());
drop policy if exists "Users can create own feed posts" on public.feed_posts;
create policy "Users can create own feed posts" on public.feed_posts for insert to authenticated with check (author_id = auth.uid());

create table if not exists public.feed_likes (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.feed_likes to authenticated;
grant all on public.feed_likes to service_role;
alter table public.feed_likes enable row level security;
drop policy if exists "Users manage own feed likes" on public.feed_likes;
create policy "Users manage own feed likes" on public.feed_likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.toggle_feed_like(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  liked boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from public.feed_likes where post_id = p_post_id and user_id = auth.uid()) then
    delete from public.feed_likes where post_id = p_post_id and user_id = auth.uid();
    liked := false;
  else
    insert into public.feed_likes (post_id, user_id) values (p_post_id, auth.uid());
    liked := true;
  end if;
  update public.feed_posts
    set likes_count = (select count(*) from public.feed_likes where post_id = p_post_id)
    where id = p_post_id;
  return liked;
end;
$$;
revoke all on function public.toggle_feed_like(uuid) from public, anon;
grant execute on function public.toggle_feed_like(uuid) to authenticated;

-- African leaders directory
create table if not exists public.africa_leaders (
  id uuid primary key default gen_random_uuid(),
  country_name text,
  country_code text not null,
  country_code_alpha2 text,
  name text not null,
  title text,
  biography text,
  official_source_url text,
  took_office date,
  left_office date,
  is_current boolean default true,
  photo_url text,
  key_policies text[],
  notable_achievements text[]
);
grant select on public.africa_leaders to anon, authenticated;
grant all on public.africa_leaders to service_role;
alter table public.africa_leaders enable row level security;
drop policy if exists "African leaders are public" on public.africa_leaders;
create policy "African leaders are public" on public.africa_leaders for select to anon, authenticated using (true);

-- Opt-in international student directory
create table if not exists public.international_students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  country_code text,
  university_name text,
  programme_name text,
  academic_level text,
  graduation_year integer,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  linkedin_url text,
  github_url text,
  portfolio_url text,
  open_to_collaboration boolean not null default false,
  open_to_mentorship boolean not null default false,
  looking_for_opportunities boolean not null default false,
  visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.international_students to anon, authenticated;
grant insert, update, delete on public.international_students to authenticated;
grant all on public.international_students to service_role;
alter table public.international_students enable row level security;
drop policy if exists "Visible international profiles are public" on public.international_students;
create policy "Visible international profiles are public" on public.international_students for select to anon, authenticated using (visible = true or user_id = auth.uid());
drop policy if exists "Users manage own international profile" on public.international_students;
create policy "Users manage own international profile" on public.international_students for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users update own international profile" on public.international_students;
create policy "Users update own international profile" on public.international_students for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users delete own international profile" on public.international_students;
create policy "Users delete own international profile" on public.international_students for delete to authenticated using (user_id = auth.uid());

-- Verified investor directory
create table if not exists public.investors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  country_code text,
  description text,
  website_url text,
  sectors text[] not null default '{}',
  stages text[] not null default '{}',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.investors to anon, authenticated;
grant all on public.investors to service_role;
alter table public.investors enable row level security;
drop policy if exists "Verified investors are public" on public.investors;
create policy "Verified investors are public" on public.investors for select to anon, authenticated using (verified = true);

-- Live platform analytics summary (real counts only)
create or replace function public.platform_analytics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'active_users', (select count(distinct user_id) from public.active_sessions where last_seen > now() - interval '15 minutes'),
    'website_visits', (select count(*) from public.analytics_events),
    'recommendation_runs', (select count(*) from public.analytics_events where event_type = 'recommendation'),
    'countries', (select count(distinct region) from public.profiles where region is not null),
    'countries_list', (select coalesce(jsonb_agg(distinct region), '[]'::jsonb) from public.profiles where region is not null),
    'user_country_counts', (select coalesce(jsonb_agg(jsonb_build_object('country', region, 'users', n) order by n desc), '[]'::jsonb) from (select region, count(*) as n from public.profiles where region is not null group by region) s),
    'university_count', (select count(*) from public.universities),
    'programme_count', (select count(*) from public.programmes),
    'scholarship_count', (select count(*) from public.scholarships),
    'opportunity_count', (select count(*) from public.opportunities where is_active),
    'internship_count', (select count(*) from public.internships),
    'international_student_count', (select count(*) from public.international_students where visible),
    'international_university_count', (select count(*) from public.universities where country is not null and country <> 'Ghana')
  );
$$;
revoke all on function public.platform_analytics() from public;
grant execute on function public.platform_analytics() to anon, authenticated;