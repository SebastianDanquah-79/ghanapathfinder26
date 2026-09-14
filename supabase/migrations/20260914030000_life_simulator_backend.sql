create table if not exists public.life_simulation_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  education_score integer not null default 50,
  career_score integer not null default 50,
  funding_score integer not null default 50,
  skills_score integer not null default 50,
  experience_score integer not null default 20,
  wellbeing_score integer not null default 70,
  decision_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.life_simulation_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_key text not null,
  question text not null,
  choices jsonb not null,
  selected_index integer,
  consequence jsonb,
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists life_simulation_decisions_user_created_idx
  on public.life_simulation_decisions(user_id, created_at desc);

alter table public.life_simulation_profiles enable row level security;
alter table public.life_simulation_decisions enable row level security;

drop policy if exists "life simulator profile owner" on public.life_simulation_profiles;
create policy "life simulator profile owner"
  on public.life_simulation_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "life simulator decisions owner" on public.life_simulation_decisions;
create policy "life simulator decisions owner"
  on public.life_simulation_decisions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.ensure_life_simulation_profile()
returns public.life_simulation_profiles
language plpgsql
security invoker
set search_path = public
as $$
declare result public.life_simulation_profiles;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  insert into public.life_simulation_profiles(user_id)
  values (auth.uid()) on conflict (user_id) do nothing;
  select * into result from public.life_simulation_profiles where user_id = auth.uid();
  return result;
end;
$$;

grant execute on function public.ensure_life_simulation_profile() to authenticated;
