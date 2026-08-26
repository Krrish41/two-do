-- ==============================================================================
-- TWO-DO SEED SCRIPT: 0003_seed_authorized_users.sql
-- ==============================================================================
-- NOTE FOR USER:
-- 1. Create the two accounts in Supabase Dashboard -> Authentication -> Users:
--    - krrish4173@gmail.com
--    - Gparashar2504@gmail.com
-- 2. Then run this SQL query in the Supabase SQL Editor.
-- ==============================================================================

-- Method 1: Automatic seeding by email directly from auth.users
insert into authorized_users (id, display_name, accent_color)
select id, 'Krrish', '#C4AEF0' 
from auth.users 
where lower(email) = lower('krrish4173@gmail.com')
on conflict (id) do update set 
  display_name = excluded.display_name, 
  accent_color = excluded.accent_color;

insert into authorized_users (id, display_name, accent_color)
select id, 'Gparashar', '#A7C7E7' 
from auth.users 
where lower(email) = lower('Gparashar2504@gmail.com')
on conflict (id) do update set 
  display_name = excluded.display_name, 
  accent_color = excluded.accent_color;

-- Method 2 (Manual): If you prefer to copy the UUIDs manually from Authentication -> Users:
-- insert into authorized_users (id, display_name, accent_color) values
--   ('PASTE-UUID-FOR-KRRISH-HERE', 'Krrish', '#C4AEF0'),
--   ('PASTE-UUID-FOR-GPARASHAR-HERE', 'Gparashar', '#A7C7E7')
-- on conflict (id) do update set display_name = excluded.display_name, accent_color = excluded.accent_color;
