-- GhanaPathFinder Path OS foundation
-- Additive migration. All user-owned rows are protected by RLS.

create table if not exists public.user_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_career text not null default 'AI Engineer',
  financial_priority text not null default 'low' check (financial_priority in ('low','medium','high')),
  monthly_capacity numeric(12,2) not null default 0,
  target_start_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.path_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid references public.user_paths(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  due_date date,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.path_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid references public.user_paths(id) on delete cascade,
  item_type text not null check (item_type in ('programme','scholarship','skill','project','internship','research','employer')),
  item_id text not null,
  title text not null,
  status text not null default 'planned' check (status in ('planned','active','done','dismissed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.path_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid references public.user_paths(id) on delete cascade,
  outcome_type text not null,
  outcome_value text,
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.data_quality_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  issue_type text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists user_paths_user_id_idx on public.user_paths(user_id);
create index if not exists path_tasks_user_id_idx on public.path_tasks(user_id);
create index if not exists path_tasks_due_date_idx on public.path_tasks(due_date);
create index if not exists path_items_user_id_idx on public.path_items(user_id);
create index if not exists path_items_type_idx on public.path_items(item_type);
create index if not exists path_outcomes_user_id_idx on public.path_outcomes(user_id);
create index if not exists data_quality_reports_status_idx on public.data_quality_reports(status);
create index if not exists data_quality_reports_entity_idx on public.data_quality_reports(entity_type, entity_id);

alter table public.user_paths enable row level security;
alter table public.path_tasks enable row level security;
alter table public.path_items enable row level security;
alter table public.path_outcomes enable row level security;
alter table public.data_quality_reports enable row level security;

create policy "Users can read own path" on public.user_paths for select using (auth.uid() = user_id);
create policy "Users can insert own path" on public.user_paths for insert with check (auth.uid() = user_id);
create policy "Users can update own path" on public.user_paths for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own path" on public.user_paths for delete using (auth.uid() = user_id);

create policy "Users can manage own tasks" on public.path_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own items" on public.path_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own outcomes" on public.path_outcomes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Anyone can report data issues" on public.data_quality_reports for insert with check (reporter_id is null or auth.uid() = reporter_id);
create policy "Users can read own reports" on public.data_quality_reports for select using (reporter_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists user_paths_updated_at on public.user_paths;
create trigger user_paths_updated_at before update on public.user_paths for each row execute function public.set_updated_at();
drop trigger if exists path_items_updated_at on public.path_items;
create trigger path_items_updated_at before update on public.path_items for each row execute function public.set_updated_at();
