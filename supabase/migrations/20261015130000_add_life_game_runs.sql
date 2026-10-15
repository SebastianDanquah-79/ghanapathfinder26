create table if not exists public.life_game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null,
  game_type text not null,
  starting_stage text not null,
  weekly_hours integer not null default 10 check (weekly_hours between 1 and 80),
  risk_profile text not null default 'balanced' check (risk_profile in ('low', 'balanced', 'high')),
  time_horizon_years integer not null default 5 check (time_horizon_years in (1, 3, 5, 10)),
  current_round integer not null default 0 check (current_round between 0 and 6),
  metrics jsonb not null default '{}'::jsonb,
  decisions jsonb not null default '[]'::jsonb,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists life_game_runs_user_updated_idx
  on public.life_game_runs (user_id, updated_at desc);

alter table public.life_game_runs enable row level security;
grant select, insert, update, delete on public.life_game_runs to authenticated;

drop policy if exists "Users can read their life game runs" on public.life_game_runs;
create policy "Users can read their life game runs"
  on public.life_game_runs for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their life game runs" on public.life_game_runs;
create policy "Users can create their life game runs"
  on public.life_game_runs for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their life game runs" on public.life_game_runs;
create policy "Users can update their life game runs"
  on public.life_game_runs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their life game runs" on public.life_game_runs;
create policy "Users can delete their life game runs"
  on public.life_game_runs for delete to authenticated
  using ((select auth.uid()) = user_id);
