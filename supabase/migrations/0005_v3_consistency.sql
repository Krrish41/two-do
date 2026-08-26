-- ==============================================================================
-- TWO-DO SCHEMA MIGRATION: 0005_v3_consistency.sql
-- ==============================================================================

-- 1. Add slug column to folders for reliable identifier lookups
alter table public.folders add column if not exists slug text unique;

-- 2. Populate slug for system folders
update public.folders 
set slug = 'bucket-list' 
where is_system = true and name = 'Bucket List';

-- 3. Set personalized nicknames for authorized users
update public.authorized_users 
set display_name = 'Dr. Bubs' 
where id = 'b842bd20-3246-4d9b-b4f1-5340d3d02d7c';

update public.authorized_users 
set display_name = 'Miss Mickey 🎀' 
where id = '3e68344c-8643-4a56-a24a-5bb4c403f765';
