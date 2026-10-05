create table if not exists public.path_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, target_type text not null default 'career', target_key text,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'active' check (status in ('active','paused','completed')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.path_actions (
  id uuid primary key default gen_random_uuid(), goal_id uuid references public.path_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text,
  action_type text not null default 'next_step', priority integer not null default 2 check (priority between 1 and 5),
  due_date date, completed_at timestamptz, position integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.path_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade, current_streak integer not null default 0,
  longest_streak integer not null default 0, last_action_date date, total_actions integer not null default 0, updated_at timestamptz not null default now()
);
create table if not exists public.shareable_reports (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
  slug text not null unique, report_type text not null, title text not null, payload jsonb not null default '{}'::jsonb,
  is_public boolean not null default false, created_at timestamptz not null default now(), expires_at timestamptz
);
create index if not exists idx_path_goals_user_status on public.path_goals(user_id,status);
create index if not exists idx_path_actions_user_due on public.path_actions(user_id,due_date,completed_at);
create index if not exists idx_path_actions_goal_position on public.path_actions(goal_id,position);
create index if not exists idx_shareable_reports_slug on public.shareable_reports(slug);
create index if not exists idx_shareable_reports_public on public.shareable_reports(is_public);
alter table public.path_goals enable row level security;
alter table public.path_actions enable row level security;
alter table public.path_streaks enable row level security;
alter table public.shareable_reports enable row level security;
drop policy if exists "path_goals_owner_select" on public.path_goals;
create policy "path_goals_owner_select" on public.path_goals for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "path_goals_owner_insert" on public.path_goals;
create policy "path_goals_owner_insert" on public.path_goals for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "path_goals_owner_update" on public.path_goals;
create policy "path_goals_owner_update" on public.path_goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "path_goals_owner_delete" on public.path_goals;
create policy "path_goals_owner_delete" on public.path_goals for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "path_actions_owner_select" on public.path_actions;
create policy "path_actions_owner_select" on public.path_actions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "path_actions_owner_insert" on public.path_actions;
create policy "path_actions_owner_insert" on public.path_actions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "path_actions_owner_update" on public.path_actions;
create policy "path_actions_owner_update" on public.path_actions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "path_actions_owner_delete" on public.path_actions;
create policy "path_actions_owner_delete" on public.path_actions for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "path_streaks_owner_select" on public.path_streaks;
create policy "path_streaks_owner_select" on public.path_streaks for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "path_streaks_owner_insert" on public.path_streaks;
create policy "path_streaks_owner_insert" on public.path_streaks for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "path_streaks_owner_update" on public.path_streaks;
create policy "path_streaks_owner_update" on public.path_streaks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "shareable_reports_owner_select" on public.shareable_reports;
create policy "shareable_reports_owner_select" on public.shareable_reports for select to authenticated using ((select auth.uid()) = user_id or is_public = true);
drop policy if exists "shareable_reports_public_select" on public.shareable_reports;
create policy "shareable_reports_public_select" on public.shareable_reports for select to anon using (is_public = true and (expires_at is null or expires_at > now()));
drop policy if exists "shareable_reports_owner_insert" on public.shareable_reports;
create policy "shareable_reports_owner_insert" on public.shareable_reports for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "shareable_reports_owner_update" on public.shareable_reports;
create policy "shareable_reports_owner_update" on public.shareable_reports for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "shareable_reports_owner_delete" on public.shareable_reports;
create policy "shareable_reports_owner_delete" on public.shareable_reports for delete to authenticated using ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.path_goals to authenticated;
grant select,insert,update,delete on public.path_actions to authenticated;
grant select,insert,update on public.path_streaks to authenticated;
grant select,insert,update,delete on public.shareable_reports to authenticated;
grant select on public.shareable_reports to anon;