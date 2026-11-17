create table if not exists public.ai_tutor_notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My study notebook',
  course text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_tutor_notebooks_title_length check (char_length(btrim(title)) between 2 and 120),
  constraint ai_tutor_notebooks_course_length check (course is null or char_length(course) <= 120)
);

create index if not exists ai_tutor_notebooks_user_updated_idx
  on public.ai_tutor_notebooks(user_id, updated_at desc);

create table if not exists public.ai_tutor_sources (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.ai_tutor_notebooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  constraint ai_tutor_sources_filename_length check (char_length(filename) between 1 and 220),
  constraint ai_tutor_sources_mime_check check (mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  constraint ai_tutor_sources_size_check check (size_bytes between 1 and 2097152),
  constraint ai_tutor_sources_path_owner check (split_part(storage_path, '/', 1) = user_id::text)
);

create index if not exists ai_tutor_sources_notebook_idx
  on public.ai_tutor_sources(user_id, notebook_id, created_at desc);

alter table public.ai_tutor_notebooks enable row level security;
alter table public.ai_tutor_sources enable row level security;

drop policy if exists "Users manage their own AI tutor notebooks" on public.ai_tutor_notebooks;
create policy "Users manage their own AI tutor notebooks"
  on public.ai_tutor_notebooks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own AI tutor sources" on public.ai_tutor_sources;
create policy "Users manage their own AI tutor sources"
  on public.ai_tutor_sources
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.ai_tutor_notebooks n
      where n.id = notebook_id and n.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.ai_tutor_notebooks to authenticated;
grant select, insert, update, delete on public.ai_tutor_sources to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-tutor-sources', 'ai-tutor-sources', false, 2097152,
        array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users read their own AI tutor source files" on storage.objects;
create policy "Users read their own AI tutor source files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'ai-tutor-sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users upload their own AI tutor source files" on storage.objects;
create policy "Users upload their own AI tutor source files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ai-tutor-sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users delete their own AI tutor source files" on storage.objects;
create policy "Users delete their own AI tutor source files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'ai-tutor-sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );