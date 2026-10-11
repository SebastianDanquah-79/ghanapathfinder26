-- Enforce moderation at the database boundary, not only in the employer form.
create or replace function public.enforce_opportunity_moderation_fields()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if coalesce(public.is_gpf_admin(), false) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending_review';
    new.is_active := false;
    new.published := false;
    new.verified := false;
    new.last_verified_at := null;
    return new;
  end if;

  if new.status is distinct from old.status
     or new.is_active is distinct from old.is_active
     or new.published is distinct from old.published
     or new.verified is distinct from old.verified
     or new.last_verified_at is distinct from old.last_verified_at then
    raise exception 'Opportunity publication status can only be changed by an authorised reviewer';
  end if;

  return new;
end;
$function$;

drop trigger if exists enforce_opportunity_moderation_fields on public.opportunities;
create trigger enforce_opportunity_moderation_fields
before insert or update on public.opportunities
for each row execute function public.enforce_opportunity_moderation_fields();
