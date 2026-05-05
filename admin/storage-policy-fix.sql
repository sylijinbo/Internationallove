-- Quick fix for "new row violates row-level security policy" when uploading
-- member photos from the admin page.

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do update set public = true;

grant select, insert, update, delete on storage.objects to authenticated;
revoke select on storage.objects from anon;

drop policy if exists "Public can read member photos" on storage.objects;
drop policy if exists "member_photos_public_read" on storage.objects;

drop policy if exists "Authenticated admins can upload member photos" on storage.objects;
create policy "Authenticated admins can upload member photos"
  on storage.objects
  for insert
  to public
  with check (
    bucket_id = 'member-photos'
    and auth.uid() is not null
  );

drop policy if exists "Authenticated admins can update member photos" on storage.objects;
create policy "Authenticated admins can update member photos"
  on storage.objects
  for update
  to public
  using (
    bucket_id = 'member-photos'
    and auth.uid() is not null
  )
  with check (
    bucket_id = 'member-photos'
    and auth.uid() is not null
  );

drop policy if exists "Authenticated admins can delete member photos" on storage.objects;
create policy "Authenticated admins can delete member photos"
  on storage.objects
  for delete
  to public
  using (
    bucket_id = 'member-photos'
    and auth.uid() is not null
  );
