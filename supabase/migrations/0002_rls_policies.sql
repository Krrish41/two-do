-- ==============================================================================
-- TWO-DO SECURITY & RLS MIGRATION: 0002_rls_policies.sql
-- ==============================================================================

-- Enable Row Level Security (RLS) across all application tables
alter table tasks enable row level security;
alter table notes enable row level security;
alter table folders enable row level security;
alter table tags enable row level security;
alter table note_tags enable row level security;
alter table authorized_users enable row level security;

-- Security Definer function to check if the current user belongs to authorized_users
create or replace function is_authorized() returns boolean as $$
  select exists (
    select 1 
    from authorized_users 
    where id = auth.uid()
  );
$$ language sql security definer stable;

-- ==============================================================================
-- 1. Tasks Policies
-- ==============================================================================
drop policy if exists "authorized_select_tasks" on tasks;
create policy "authorized_select_tasks" on tasks for select using (is_authorized());

drop policy if exists "authorized_insert_tasks" on tasks;
create policy "authorized_insert_tasks" on tasks for insert with check (is_authorized());

drop policy if exists "authorized_update_tasks" on tasks;
create policy "authorized_update_tasks" on tasks for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_tasks" on tasks;
create policy "authorized_delete_tasks" on tasks for delete using (is_authorized());

-- ==============================================================================
-- 2. Notes Policies
-- ==============================================================================
drop policy if exists "authorized_select_notes" on notes;
create policy "authorized_select_notes" on notes for select using (is_authorized());

drop policy if exists "authorized_insert_notes" on notes;
create policy "authorized_insert_notes" on notes for insert with check (is_authorized());

drop policy if exists "authorized_update_notes" on notes;
create policy "authorized_update_notes" on notes for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_notes" on notes;
create policy "authorized_delete_notes" on notes for delete using (is_authorized());

-- ==============================================================================
-- 3. Folders Policies
-- ==============================================================================
drop policy if exists "authorized_select_folders" on folders;
create policy "authorized_select_folders" on folders for select using (is_authorized());

drop policy if exists "authorized_insert_folders" on folders;
create policy "authorized_insert_folders" on folders for insert with check (is_authorized());

drop policy if exists "authorized_update_folders" on folders;
create policy "authorized_update_folders" on folders for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_folders" on folders;
create policy "authorized_delete_folders" on folders for delete using (is_authorized());

-- ==============================================================================
-- 4. Tags Policies
-- ==============================================================================
drop policy if exists "authorized_select_tags" on tags;
create policy "authorized_select_tags" on tags for select using (is_authorized());

drop policy if exists "authorized_insert_tags" on tags;
create policy "authorized_insert_tags" on tags for insert with check (is_authorized());

drop policy if exists "authorized_update_tags" on tags;
create policy "authorized_update_tags" on tags for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_tags" on tags;
create policy "authorized_delete_tags" on tags for delete using (is_authorized());

-- ==============================================================================
-- 5. Note Tags Policies
-- ==============================================================================
drop policy if exists "authorized_select_note_tags" on note_tags;
create policy "authorized_select_note_tags" on note_tags for select using (is_authorized());

drop policy if exists "authorized_insert_note_tags" on note_tags;
create policy "authorized_insert_note_tags" on note_tags for insert with check (is_authorized());

drop policy if exists "authorized_update_note_tags" on note_tags;
create policy "authorized_update_note_tags" on note_tags for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_note_tags" on note_tags;
create policy "authorized_delete_note_tags" on note_tags for delete using (is_authorized());

-- ==============================================================================
-- 6. Authorized Users Policies
-- ==============================================================================
drop policy if exists "authorized_select_users" on authorized_users;
create policy "authorized_select_users" on authorized_users for select using (is_authorized());

drop policy if exists "authorized_insert_users" on authorized_users;
create policy "authorized_insert_users" on authorized_users for insert with check (is_authorized());

drop policy if exists "authorized_update_users" on authorized_users;
create policy "authorized_update_users" on authorized_users for update using (is_authorized()) with check (is_authorized());

drop policy if exists "authorized_delete_users" on authorized_users;
create policy "authorized_delete_users" on authorized_users for delete using (is_authorized());
