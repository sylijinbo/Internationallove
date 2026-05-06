-- AtlasVow admin setup
-- Run this in the Supabase SQL editor after creating the first admin user.

alter table public.members
  add column if not exists gender text;

update public.members
set gender = case
  when lower(trim(gender)) in ('male', 'man', 'men', 'm') or trim(gender) in ('男', '男性', '男士') then 'male'
  when lower(trim(gender)) in ('female', 'woman', 'women', 'f') or trim(gender) in ('女', '女性', '女士') then 'female'
  else null
end
where gender is not null;

alter table public.members
  drop constraint if exists members_gender_check;

alter table public.members
  add constraint members_gender_check
  check (gender is null or gender in ('male', 'female')) not valid;

alter table public.appointments
  add column if not exists interested_member_ids uuid[] not null default '{}';

alter table public.appointments
  add column if not exists customer_name text,
  add column if not exists contact text,
  add column if not exists interested_member text,
  add column if not exists source_url text,
  add column if not exists user_agent text,
  add column if not exists form_payload jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_interested_member_ids_max_3'
  ) then
    alter table public.appointments
      add constraint appointments_interested_member_ids_max_3
      check (coalesce(array_length(interested_member_ids, 1), 0) <= 3);
  end if;
end $$;

alter table public.members enable row level security;
alter table public.appointments enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.members to anon, authenticated;
grant insert, update on public.members to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Public can read published members" on public.members;
create policy "Public can read published members"
  on public.members
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Authenticated admins can manage members" on public.members;
drop policy if exists "Authenticated admins can read all members" on public.members;
create policy "Authenticated admins can read all members"
  on public.members
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can create members" on public.members;
create policy "Authenticated admins can create members"
  on public.members
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update members" on public.members;
create policy "Authenticated admins can update members"
  on public.members
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can create appointments" on public.appointments;
create policy "Public can create appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (coalesce(array_length(interested_member_ids, 1), 0) <= 3);

revoke insert on public.appointments from anon, authenticated;
grant insert (
  customer_name,
  contact,
  interested_member,
  interested_member_ids,
  source_url,
  user_agent,
  form_payload
) on public.appointments to anon, authenticated;

update storage.buckets
set public = true
where id = 'member-photos';

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
