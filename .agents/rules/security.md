# Security & RLS — Read This Section Fully Before Writing Any Policy

**Core principle:** the Supabase anon key ships inside the public JS bundle on GitHub Pages. This is expected and safe — it identifies your *project*, not a *user*. All actual access control happens in Postgres via Row Level Security, enforced per authenticated request regardless of who holds the anon key.

**Step 1 — Disable public sign-up (manual, human-only step):**
> Antigravity: you cannot do this yourself. Output this as an instruction to the human:
> In the Supabase Dashboard → Authentication → Providers → Email, turn OFF "Allow new users to sign up." Then go to Authentication → Users → "Add user" and manually create exactly two users (the two real email addresses), setting a password for each. No sign-up form should ever exist in the app's UI — build only a login form.

**Step 2 — Seed the allowlist (`supabase/migrations/0003_seed_authorized_users.sql`, human runs after Step 1 in the SQL editor):**
```sql
-- Replace the UUIDs below with the two real user IDs from
-- Authentication → Users in the Supabase dashboard.
insert into authorized_users (id, display_name, accent_color) values
  ('00000000-0000-0000-0000-000000000001', 'User One', '#C4AEF0'),
  ('00000000-0000-0000-0000-000000000002', 'User Two', '#A7C7E7');
```

**Step 3 — RLS policies (`supabase/migrations/0002_rls_policies.sql`):**
```sql
alter table tasks enable row level security;
alter table notes enable row level security;
alter table folders enable row level security;
alter table tags enable row level security;
alter table note_tags enable row level security;
alter table authorized_users enable row level security;

create or replace function is_authorized() returns boolean as $$
  select exists (select 1 from authorized_users where id = auth.uid());
$$ language sql security definer stable;

-- Repeat this pattern for tasks, notes, folders, tags, note_tags, authorized_users:
create policy "authorized_select" on tasks for select using (is_authorized());
create policy "authorized_insert" on tasks for insert with check (is_authorized());
create policy "authorized_update" on tasks for update using (is_authorized()) with check (is_authorized());
create policy "authorized_delete" on tasks for delete using (is_authorized());
```
> Apply the same four-policy pattern
