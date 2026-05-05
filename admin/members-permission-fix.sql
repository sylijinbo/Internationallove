-- Fix "permission denied for table members" when saving from /admin/.

alter table public.members
  add column if not exists gender text;

update public.members
set gender = case
  when lower(trim(gender)) in ('male', 'man', 'men', 'm') or trim(gender) in ('男', '男性', '男士') then 'male'
  when lower(trim(gender)) in ('female', 'woman', 'women', 'f') or trim(gender) in ('女', '女性', '女士') then 'female'
  when lower(trim(gender)) in ('other', 'nonbinary', 'non-binary') or trim(gender) in ('其他', '其它', '非二元') then 'other'
  when trim(gender) = '' then null
  else gender
end
where gender is not null;

alter table public.members
  drop constraint if exists members_gender_check;

alter table public.members
  add constraint members_gender_check
  check (gender is null or gender in ('male', 'female', 'other')) not valid;

alter table public.members enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.members to anon, authenticated;
grant insert, update on public.members to authenticated;

grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Public can read published members" on public.members;
create policy "Public can read published members"
  on public.members
  for select
  to anon, authenticated
  using (status = 'published');

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

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'members'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'members'
order by policyname;
