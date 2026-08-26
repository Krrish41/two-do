-- ==============================================================================
-- TWO-DO SECURITY & RLS MIGRATION: 0002_rls_policies.sql
-- ==============================================================================

-- Grant schema usage
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;

-- Enable Row Level Security (RLS) across all application tables
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.folders enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.authorized_users enable row level security;

-- Security Definer function to check if current user is in authorized_users allowlist
create or replace function public.is_authorized() returns boolean as $$
  select exists (
    select 1 
    from public.authorized_users 
    where id = auth.uid()
  );
$$ language sql security definer stable set search_path = public;

-- Grant execution to authenticated users
grant execute on function public.is_authorized() to authenticated, anon;

-- ==============================================================================
-- 1. Tasks Policies
-- ==============================================================================
drop policy if exists "authorized_select_tasks" on public.tasks;
create policy "authorized_select_tasks" on public.tasks for select using (public.is_authorized());

drop policy if exists "authorized_insert_tasks" on public.tasks;
create policy "authorized_insert_tasks" on public.tasks for insert with check (public.is_authorized());

drop policy if exists "authorized_update_tasks" on public.tasks;
create policy "authorized_update_tasks" on public.tasks for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_tasks" on public.tasks;
create policy "authorized_delete_tasks" on public.tasks for delete using (public.is_authorized());

-- ==============================================================================
-- 2. Notes Policies
-- ==============================================================================
drop policy if exists "authorized_select_notes" on public.notes;
create policy "authorized_select_notes" on public.notes for select using (public.is_authorized());

drop policy if exists "authorized_insert_notes" on public.notes;
create policy "authorized_insert_notes" on public.notes for insert with check (public.is_authorized());

drop policy if exists "authorized_update_notes" on public.notes;
create policy "authorized_update_notes" on public.notes for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_notes" on public.notes;
create policy "authorized_delete_notes" on public.notes for delete using (public.is_authorized());

-- ==============================================================================
-- 3. Folders Policies
-- ==============================================================================
drop policy if exists "authorized_select_folders" on public.folders;
create policy "authorized_select_folders" on public.folders for select using (public.is_authorized());

drop policy if exists "authorized_insert_folders" on public.folders;
create policy "authorized_insert_folders" on public.folders for insert with check (public.is_authorized());

drop policy if exists "authorized_update_folders" on public.folders;
create policy "authorized_update_folders" on public.folders for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_folders" on public.folders;
create policy "authorized_delete_folders" on public.folders for delete using (public.is_authorized());

-- ==============================================================================
-- 4. Tags Policies
-- ==============================================================================
drop policy if exists "authorized_select_tags" on public.tags;
create policy "authorized_select_tags" on public.tags for select using (public.is_authorized());

drop policy if exists "authorized_insert_tags" on public.tags;
create policy "authorized_insert_tags" on public.tags for insert with check (public.is_authorized());

drop policy if exists "authorized_update_tags" on public.tags;
create policy "authorized_update_tags" on public.tags for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_tags" on public.tags;
create policy "authorized_delete_tags" on public.tags for delete using (public.is_authorized());

-- ==============================================================================
-- 5. Note Tags Policies
-- ==============================================================================
drop policy if exists "authorized_select_note_tags" on public.note_tags;
create policy "authorized_select_note_tags" on public.note_tags for select using (public.is_authorized());

drop policy if exists "authorized_insert_note_tags" on public.note_tags;
create policy "authorized_insert_note_tags" on public.note_tags for insert with check (public.is_authorized());

drop policy if exists "authorized_update_note_tags" on public.note_tags;
create policy "authorized_update_note_tags" on public.note_tags for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_note_tags" on public.note_tags;
create policy "authorized_delete_note_tags" on public.note_tags for delete using (public.is_authorized());

-- ==============================================================================
-- 6. Authorized Users Policies
-- ==============================================================================
drop policy if exists "authorized_select_users" on public.authorized_users;
create policy "authorized_select_users" on public.authorized_users for select using (auth.uid() is not null);

drop policy if exists "authorized_insert_users" on public.authorized_users;
create policy "authorized_insert_users" on public.authorized_users for insert with check (public.is_authorized());

drop policy if exists "authorized_update_users" on public.authorized_users;
create policy "authorized_update_users" on public.authorized_users for update using (public.is_authorized()) with check (public.is_authorized());

drop policy if exists "authorized_delete_users" on public.authorized_users;
create policy "authorized_delete_users" on public.authorized_users for delete using (public.is_authorized());
