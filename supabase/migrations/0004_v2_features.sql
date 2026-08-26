-- ==============================================================================
-- TWO-DO SCHEMA MIGRATION: 0004_v2_features.sql
-- ==============================================================================

-- 1. Recycle bin: soft-delete support for notes
alter table public.notes add column if not exists deleted_at timestamptz;

-- 2. Shared color-coded and emoji folders for both notes and tasks
alter table public.folders add column if not exists color text not null default '#C4AEF0';
alter table public.folders add column if not exists icon text not null default '📁';
alter table public.folders add column if not exists is_system boolean not null default false;

-- 3. Link tasks to folders (shared organization)
alter table public.tasks add column if not exists folder_id uuid references public.folders(id) on delete set null;

-- 4. Permanent Bucket List folder — seeded once, protected from rename/delete in UI
insert into public.folders (name, color, icon, is_system, created_by)
select 'Bucket List', '#E86FA0', '💕', true, null
where not exists (
  select 1 from public.folders where name = 'Bucket List' and is_system = true
);
