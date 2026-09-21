-- Private avatar storage.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Avatar owner read" on storage.objects;
create policy "Avatar owner read" on storage.objects for select to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Avatar owner insert" on storage.objects;
create policy "Avatar owner insert" on storage.objects for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Avatar owner update" on storage.objects;
create policy "Avatar owner update" on storage.objects for update to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Avatar owner delete" on storage.objects;
create policy "Avatar owner delete" on storage.objects for delete to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
