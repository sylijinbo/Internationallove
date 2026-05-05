-- Fix "new row for relation members violates check constraint members_gender_check".
-- Run this in the Supabase SQL editor, then refresh /admin/ and save again.

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

select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.members'::regclass
  and conname = 'members_gender_check';
