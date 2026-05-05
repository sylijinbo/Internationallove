-- Reset Storage policies for member photo uploads.
-- Use this when uploads still fail with:
-- "new row violates row-level security policy"
--
-- This resets policies on storage.objects. If this Supabase project has other
-- buckets with custom private policies, review before running.

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do update set public = true;

grant select on storage.objects to authenticated;
revoke select on storage.objects from anon;
grant insert, update, delete on storage.objects to authenticated;
revoke insert, update, delete on storage.objects from anon;

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
