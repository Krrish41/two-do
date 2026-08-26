-- ==============================================================================
-- TWO-DO SEED SCRIPT: 0003_seed_authorized_users.sql
-- ==============================================================================

-- Direct insertion with the exact user IDs from Supabase Auth
insert into public.authorized_users (id, display_name, accent_color) values
  ('b842bd20-3246-4d9b-b4f1-5340d3d02d7c', 'Krrish', '#C4AEF0'),
  ('3e68344c-8643-4a56-a24a-5bb4c403f765', 'Gparashar', '#A7C7E7')
on conflict (id) do update set 
  display_name = excluded.display_name, 
  accent_color = excluded.accent_color;
