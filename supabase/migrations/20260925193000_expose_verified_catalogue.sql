-- Expose the verified catalogue through Supabase Data API.
-- RLS remains enabled; public catalogue reads are intentionally read-only.

grant usage on schema public to anon, authenticated;
grant select on public.institutions, public.programmes, public.internship_providers,
  public.skill_providers, public.universities, public.scholarships, public.source_registry
  to anon, authenticated;
grant insert on public.corrections to anon, authenticated;
grant select on public.corrections to authenticated;

alter table public.institutions enable row level security;
alter table public.programmes enable row level security;
alter table public.universities enable row level security;
alter table public.scholarships enable row level security;
alter table public.internship_providers enable row level security;
alter table public.skill_providers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='institutions' and policyname='public read institutions') then
    create policy "public read institutions" on public.institutions for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='programmes' and policyname='public read programmes') then
    create policy "public read programmes" on public.programmes for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='universities' and policyname='public read universities') then
    create policy "public read universities" on public.universities for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='scholarships' and policyname='public read scholarships') then
    create policy "public read scholarships" on public.scholarships for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='internship_providers' and policyname='public read internship providers') then
    create policy "public read internship providers" on public.internship_providers for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='skill_providers' and policyname='public read skill providers') then
    create policy "public read skill providers" on public.skill_providers for select to anon, authenticated using (true);
  end if;
end $$;

notify pgrst, 'reload schema';
