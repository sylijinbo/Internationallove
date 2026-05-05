-- Diagnose Supabase Storage upload policies for the admin member photo flow.
-- Run this in the same Supabase project used by the website.

select
  id,
  name,
  public,
  allowed_mime_types,
  file_size_limit
from storage.buckets
where id = 'member-photos';

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

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'storage'
  and table_name = 'objects'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;
