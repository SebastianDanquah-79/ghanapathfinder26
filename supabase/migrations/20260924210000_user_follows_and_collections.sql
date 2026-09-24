create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('topic','country','city','organization','company','startup','university','person','event')),
  entity_key text not null check (char_length(entity_key) between 1 and 200),
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_key)
);

create index if not exists idx_user_follows_user on public.user_follows(user_id, created_at desc);
create index if not exists idx_user_follows_entity on public.user_follows(entity_type, entity_key);

alter table public.user_follows enable row level security;
grant select, insert, delete on public.user_follows to authenticated;

drop policy if exists "Users manage own follows" on public.user_follows;
create policy "Users manage own follows"
on public.user_follows
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (description is null or char_length(description) <= 500),
  visibility text not null default 'private' check (visibility in ('private','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_user_collections_user on public.user_collections(user_id, updated_at desc);

alter table public.user_collections enable row level security;
grant select, insert, update, delete on public.user_collections to authenticated;

drop policy if exists "Users manage own collections" on public.user_collections;
create policy "Users manage own collections"
on public.user_collections
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.user_collections(id) on delete cascade,
  entity_type text not null check (entity_type in ('opportunity','job','scholarship','university','programme','company','startup','person','event','article','place','course','project','post')),
  entity_key text not null check (char_length(entity_key) between 1 and 200),
  title text not null check (char_length(title) between 1 and 200),
  subtitle text,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (collection_id, entity_type, entity_key)
);

create index if not exists idx_collection_items_collection on public.collection_items(collection_id, position, created_at);

alter table public.collection_items enable row level security;
grant select, insert, update, delete on public.collection_items to authenticated;

drop policy if exists "Users manage own collection items" on public.collection_items;
create policy "Users manage own collection items"
on public.collection_items
for all to authenticated
using (
  exists (
    select 1 from public.user_collections c
    where c.id = collection_id and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.user_collections c
    where c.id = collection_id and c.user_id = auth.uid()
  )
);
