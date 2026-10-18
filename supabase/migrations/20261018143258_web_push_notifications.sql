-- Phone push notifications for GhanaPathFinder.
-- Private material is stored in a server-only table with RLS and no anon/authenticated grants.
-- The VAPID key pair is generated at first use and never sent to the browser except for its public key.

create table if not exists public.web_push_config (
  id smallint primary key default 1 check (id = 1),
  public_key text not null,
  private_key text not null,
  webhook_secret text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.web_push_config enable row level security;
revoke all on table public.web_push_config from public, anon, authenticated;
grant all on table public.web_push_config to service_role;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  preferences jsonb not null default '{"breaking_news":true,"top_stories":true,"messages":true,"platform_updates":true,"saved_items":true}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists web_push_subscriptions_user_id_idx on public.web_push_subscriptions(user_id);
alter table public.web_push_subscriptions enable row level security;
revoke all on table public.web_push_subscriptions from public, anon, authenticated;
grant all on table public.web_push_subscriptions to service_role;

create table if not exists public.web_push_news_events (
  dedupe_key text primary key,
  article_id uuid not null references public.news_articles(id) on delete cascade,
  category text not null check (category in ('breaking_news', 'top_stories')),
  created_at timestamptz not null default now()
);
alter table public.web_push_news_events enable row level security;
revoke all on table public.web_push_news_events from public, anon, authenticated;
grant all on table public.web_push_news_events to service_role;

create or replace function public.enqueue_web_push_for_notification()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
begin
  select webhook_secret into v_secret from public.web_push_config where id = 1;
  if v_secret is null then return new; end if;

  perform net.http_post(
    url := 'https://qcvypvvjzrooqylfvpza.supabase.co/functions/v1/web-push',
    body := jsonb_build_object('kind', 'notification_created', 'notification_id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-gpf-webhook-secret', v_secret),
    timeout_milliseconds := 5000
  );
  return new;
exception when others then
  raise log 'GhanaPathFinder could not queue a push notification: %', SQLERRM;
  return new;
end;
$$;
revoke all on function public.enqueue_web_push_for_notification() from public, anon, authenticated;
drop trigger if exists trg_web_push_notification_insert on public.notifications;
create trigger trg_web_push_notification_insert
after insert on public.notifications
for each row execute function public.enqueue_web_push_for_notification();

create or replace function public.create_major_news_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text;
  v_category text;
  v_dedupe_key text;
  v_inserted integer;
begin
  v_text := lower(concat_ws(' ', new.title, new.category, new.excerpt));

  if v_text ~ '\\m(breaking|urgent|developing story|live updates|national emergency|state of emergency|earthquake|tsunami|coup|terror attack|major attack|war begins|invasion|election results|wins election|resigns|resignation|flood warning|storm warning|major outage|explosion)\\M' then
    v_category := 'breaking_news';
  elsif v_text ~ '\\m(major breakthrough|historic|landmark ruling|first-ever|record-breaking|major deal|major agreement|major policy|new president|new prime minister|budget approved|launches national|national launch|wins major|sets a new record|major announcement)\\M' then
    v_category := 'top_stories';
  else
    return new;
  end if;

  v_dedupe_key := coalesce(nullif(new.content_hash, ''), nullif(new.original_url, ''), new.id::text);
  insert into public.web_push_news_events (dedupe_key, article_id, category)
  values (v_dedupe_key, new.id, v_category)
  on conflict (dedupe_key) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return new; end if;

  insert into public.notifications (
    user_id, message, read, type, title, body, action_url, is_read, category, link
  )
  select distinct
    s.user_id,
    case when v_category = 'breaking_news' then 'Breaking news: ' else 'Top story: ' end || left(new.title, 180),
    false,
    v_category,
    new.title,
    left(coalesce(nullif(new.excerpt, ''), new.title), 240),
    new.original_url,
    false,
    v_category,
    new.original_url
  from public.web_push_subscriptions s
  where coalesce((s.preferences -> v_category) = 'true'::jsonb, true);

  return new;
end;
$$;
revoke all on function public.create_major_news_notifications() from public, anon, authenticated;
drop trigger if exists trg_create_major_news_notifications on public.news_articles;
create trigger trg_create_major_news_notifications
after insert on public.news_articles
for each row execute function public.create_major_news_notifications();

create or replace function public.create_employer_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_employer_user_id uuid;
  v_recipient_id uuid;
begin
  select e.created_by into v_employer_user_id
  from public.employers e where e.id = new.employer_id;

  if new.sender_user_id = new.candidate_user_id then
    v_recipient_id := v_employer_user_id;
  else
    v_recipient_id := new.candidate_user_id;
  end if;

  if v_recipient_id is null or v_recipient_id = new.sender_user_id then return new; end if;

  insert into public.notifications (
    user_id, message, read, type, title, body, action_url, is_read, category, link
  )
  values (
    v_recipient_id,
    'You have a new GhanaPathFinder message.',
    false,
    'message',
    'New message',
    'You have a new message. Open GhanaPathFinder to read it.',
    '/notifications',
    false,
    'messages',
    '/notifications'
  );

  return new;
end;
$$;
revoke all on function public.create_employer_message_notification() from public, anon, authenticated;
drop trigger if exists trg_employer_message_notification on public.employer_messages;
create trigger trg_employer_message_notification
after insert on public.employer_messages
for each row execute function public.create_employer_message_notification();
