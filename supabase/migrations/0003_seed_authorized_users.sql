-- ==============================================================================
-- TWO-DO SEED SCRIPT: 0003_seed_authorized_users.sql
-- ==============================================================================
-- TEMPLATE: replace the two UUIDs below with the IDs of YOUR two accounts
-- (Supabase Dashboard -> Authentication -> Users -> copy "User UID"), and pick
-- display names + accent colours. Keep the accent colours below if you want the
-- two built-in avatar mascots to match (#C4AEF0 = variant A, #A7C7E7 = variant B).
-- Real IDs and names are intentionally NOT stored in this public repository.

insert into public.authorized_users (id, display_name, accent_color) values
  ('00000000-0000-0000-0000-000000000001', 'Partner A', '#C4AEF0'),
  ('00000000-0000-0000-0000-000000000002', 'Partner B', '#A7C7E7')
on conflict (id) do update set
  display_name = excluded.display_name,
  accent_color = excluded.accent_color;