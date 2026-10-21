-- Run ONLY after sabbirhowlader68@gmail.com has registered through Mysvex/Supabase Auth.
-- This promotes that exact authenticated account to admin. It does not expose the secret key.
begin;
insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', 'Mysvex Admin'), 'admin'
from auth.users
where lower(email) = lower('sabbirhowlader68@gmail.com')
on conflict (id) do update set role = 'admin';
commit;

-- Verify the role was assigned:
select u.email, p.id, p.full_name, p.role
from auth.users u join public.profiles p on p.id = u.id
where lower(u.email) = lower('sabbirhowlader68@gmail.com');
