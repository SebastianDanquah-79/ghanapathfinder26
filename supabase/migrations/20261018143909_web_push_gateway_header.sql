-- Include the public Supabase API key when the database queues a Web Push delivery.
-- The per-project webhook secret remains the actual authentication for this internal event.
create or replace function public.enqueue_web_push_for_notification()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
begin
  select webhook_secret into v_secret
  from public.web_push_config
  where id = 1;

  if v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://qcvypvvjzrooqylfvpza.supabase.co/functions/v1/web-push',
    body := jsonb_build_object(
      'kind', 'notification_created',
      'notification_id', new.id
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'sb_publishable_xAO66S4UghstoT-95nyTsA_qqcZM5Uq',
      'x-gpf-webhook-secret', v_secret
    ),
    timeout_milliseconds := 5000
  );

  return new;
exception when others then
  raise log 'GhanaPathFinder could not queue a push notification: %', SQLERRM;
  return new;
end;
$$;
revoke all on function public.enqueue_web_push_for_notification() from public, anon, authenticated;
