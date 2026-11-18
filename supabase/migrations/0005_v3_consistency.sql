-- ==============================================================================
-- TWO-DO SCHEMA MIGRATION: 0005_v3_consistency.sql
-- ==============================================================================

-- 1. Add slug column to folders for reliable identifier lookups
alter table public.folders add column if not exists slug text unique;

-- 2. Populate slug for system folders
update public.folders 
set slug = 'bucket-list' 
where is_system = true and name = 'Bucket List';

-- 3. (Removed) Per-user nicknames are now set per deployment, e.g.:
--    update public.authorized_users set display_name = 'Your Name' where id = '<your-auth-uid>';
