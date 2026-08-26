-- ==============================================================================
-- TWO-DO SEED SCRIPT: 0003_seed_authorized_users.sql
-- ==============================================================================

-- Direct insertion with the exact user IDs from Supabase Auth
insert into public.authorized_users (id, display_name, accent_color) values
  ('00000000-0000-0000-0000-000000000001', 'Partner A', '#C4AEF0'),
  ('00000000-0000-0000-0000-000000000002', 'Partner B', '#A7C7E7')
on conflict (id) do update set 
  display_name = excluded.display_name, 
  accent_color = excluded.accent_color;
