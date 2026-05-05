-- Temporary diagnostic fix for Supabase Storage uploads.
-- This allows any signed-in user to upload/update/delete objects in Storage.
-- Use only to confirm that the admin upload flow works, then replace with
-- tighter bucket-specific policies later.

grant usage on schema storage to anon, authenticated;
grant select on storage.objects to authenticated;
revoke select on storage.objects from anon;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists "allow_authenticated_storage_insert_debug" on storage.objects;
drop policy if exists "allow_authenticated_storage_update_debug" on storage.objects;
drop policy if exists "allow_authenticated_storage_delete_debug" on storage.objects;
drop policy if exists "allow_public_storage_read_debug" on storage.objects;

create policy "allow_authenticated_storage_insert_debug"
  on storage.objects
  as permissive
  for insert
  to authenticated
  with check (true);

create policy "allow_authenticated_storage_update_debug"
  on storage.objects
  as permissive
  for update
  to authenticated
  using (true)
  with check (true);

create policy "allow_authenticated_storage_delete_debug"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (true);

select
  policyname,
  permissive,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;
