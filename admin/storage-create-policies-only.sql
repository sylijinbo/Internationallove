-- Minimal Storage policies for AtlasVow member photo uploads.
-- Run this if pg_policies returns no rows for storage.objects.

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "member_photos_public_read" on storage.objects;
drop policy if exists "Public can read member photos" on storage.objects;
drop policy if exists "member_photos_authenticated_insert" on storage.objects;
drop policy if exists "member_photos_authenticated_update" on storage.objects;
drop policy if exists "member_photos_authenticated_delete" on storage.objects;

create policy "member_photos_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'member-photos');

create policy "member_photos_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'member-photos')
  with check (bucket_id = 'member-photos');

create policy "member_photos_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'member-photos');

select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;
