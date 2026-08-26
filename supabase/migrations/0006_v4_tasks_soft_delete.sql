-- ==============================================================================
-- TWO-DO SCHEMA MIGRATION: 0006_v4_tasks_soft_delete.sql
-- ==============================================================================

-- 1. Add deleted_at column to tasks table for soft-delete & recycle bin
alter table public.tasks add column if not exists deleted_at timestamptz default null;

-- 2. Create index for fast filtering of active vs deleted tasks
create index if not exists idx_tasks_deleted_at on public.tasks(deleted_at);

-- 3. (Optional) pg_cron job for 30-day auto-purge of deleted tasks
-- select cron.schedule(
--   'purge-deleted-tasks',
--   '0 3 * * *',
--   $$ delete from public.tasks where deleted_at is not null and deleted_at < now() - interval '30 days'; $$
-- );
