-- Fix Supabase warning:
-- "Clients can list all files in this bucket".
--
-- member-photos stays public, so image URLs continue to work.
-- This only removes broad SELECT/list policies from storage.objects.

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do update set public = true;

revoke select on storage.objects from anon;

drop policy if exists "member_photos_public_read" on storage.objects;
drop policy if exists "Public can read member photos" on storage.objects;
drop policy if exists "allow_public_storage_read_debug" on storage.objects;

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
