-- International qualification foundation for GhanaPathFinder.
-- Keeps WASSCE support intact while allowing country-specific and international exams.

create table if not exists public.student_qualifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text not null default 'GH',
  qualification_code text not null,
  qualification_name text not null,
  grading_scale text,
  overall_score text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.student_qualification_results (
  id uuid primary key default gen_random_uuid(),
  qualification_id uuid not null references public.student_qualifications(id) on delete cascade,
  subject text not null,
  grade text not null,
  level text,
  subject_code text,
  created_at timestamptz not null default now()
);

create index if not exists student_qualifications_user_id_idx
  on public.student_qualifications(user_id);

create index if not exists student_qualification_results_qualification_id_idx
  on public.student_qualification_results(qualification_id);

alter table public.student_qualifications enable row level security;
alter table public.student_qualification_results enable row level security;

drop policy if exists "Users can view own qualification" on public.student_qualifications;
create policy "Users can view own qualification"
  on public.student_qualifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own qualification" on public.student_qualifications;
create policy "Users can insert own qualification"
  on public.student_qualifications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own qualification" on public.student_qualifications;
create policy "Users can update own qualification"
  on public.student_qualifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own qualification" on public.student_qualifications;
create policy "Users can delete own qualification"
  on public.student_qualifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own qualification results" on public.student_qualification_results;
create policy "Users can view own qualification results"
  on public.student_qualification_results for select
  using (
    exists (
      select 1 from public.student_qualifications q
      where q.id = qualification_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own qualification results" on public.student_qualification_results;
create policy "Users can insert own qualification results"
  on public.student_qualification_results for insert
  with check (
    exists (
      select 1 from public.student_qualifications q
      where q.id = qualification_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own qualification results" on public.student_qualification_results;
create policy "Users can update own qualification results"
  on public.student_qualification_results for update
  using (
    exists (
      select 1 from public.student_qualifications q
      where q.id = qualification_id and q.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.student_qualifications q
      where q.id = qualification_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own qualification results" on public.student_qualification_results;
create policy "Users can delete own qualification results"
  on public.student_qualification_results for delete
  using (
    exists (
      select 1 from public.student_qualifications q
      where q.id = qualification_id and q.user_id = auth.uid()
    )
  );

create or replace function public.touch_student_qualification_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_qualifications_updated_at on public.student_qualifications;
create trigger student_qualifications_updated_at
before update on public.student_qualifications
for each row execute function public.touch_student_qualification_updated_at();
