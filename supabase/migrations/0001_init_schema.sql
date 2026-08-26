-- ==============================================================================
-- TWO-DO SCHEMA MIGRATION: 0001_init_schema.sql
-- ==============================================================================

-- 1. Authorized Users (Allowlist linked to Supabase auth.users)
create table if not exists authorized_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  accent_color text not null default '#B8A9E8'
);

-- 2. Note Folders
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_folder_id uuid references folders(id) on delete cascade,
  created_by uuid references authorized_users(id),
  created_at timestamptz default now()
);

-- 3. Note Tags
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#A7C7E7'
);

-- 4. Tasks (Supports hierarchical subtasks, My Day, recurrence, and drag reordering)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  parent_task_id uuid references tasks(id) on delete cascade,
  due_date date,
  is_my_day_date date,
  priority smallint not null default 0 check (priority between 0 and 3),
  is_completed boolean not null default false,
  completed_at timestamptz,
  recurrence_rule text,           -- e.g. 'DAILY' | 'WEEKLY' | 'MONTHLY' | null
  position float not null default 0,
  created_by uuid references authorized_users(id),
  assigned_to uuid references authorized_users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Notes (Rich Text with Tiptap JSON content & Apple Glassy colors)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content jsonb not null default '{}'::jsonb,   -- Tiptap JSON document
  color text not null default '#F8E1EC',
  folder_id uuid references folders(id) on delete set null,
  is_pinned boolean not null default false,
  created_by uuid references authorized_users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Note <-> Tag Many-to-Many Association
create table if not exists note_tags (
  note_id uuid references notes(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (note_id, tag_id)
);

-- 7. Automatic updated_at trigger function
create or replace function set_updated_at() returns trigger as $$
begin 
  new.updated_at = now(); 
  return new; 
end;
$$ language plpgsql;

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

drop trigger if exists trg_notes_updated_at on notes;
create trigger trg_notes_updated_at before update on notes
  for each row execute function set_updated_at();

-- 8. Enable Supabase Realtime Publication for collaborative sync
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table folders;
alter publication supabase_realtime add table tags;
alter publication supabase_realtime add table note_tags;
alter publication supabase_realtime add table authorized_users;
