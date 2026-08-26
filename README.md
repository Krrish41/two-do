# Two-Do

> **Yours, mine, ours.**

Two-Do is an ultra-refined, private collaborative productivity web application designed for a private duo workspace. It combines Apple-inspired glassmorphism aesthetics with real-time bidirectional synchronization, structured task management (My Day, subtasks, recurrence, priorities, and drag-and-drop ordering), and rich-text note taking with Tiptap.

The application is hosted as a static site on GitHub Pages with Supabase serving as the PostgreSQL database, authentication provider, and real-time engine.

## Tech Stack
- **Frontend Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router in Hash mode (`HashRouter` for GitHub Pages static hosting compatibility)
- **Styling**: Tailwind CSS (CSS variables, Apple Glassy tokens, and glassmorphism utilities)
- **State Management**: Zustand (modular domain stores for Auth, Tasks, Notes, Filter/Sort with optimistic updates)
- **Animations & Micro-interactions**: Framer Motion (spring-based transitions)
- **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Rich Text Editing**: Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
- **Icons**: Lucide React
- **Date Handling**: `date-fns`
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Realtime Postgres Changes)
- **Deployment**: GitHub Actions -> GitHub Pages

## Database Setup & Migrations
Run the SQL migrations in order in your Supabase SQL Editor:
1. `supabase/migrations/0001_init_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_seed_authorized_users.sql`
4. `supabase/migrations/0004_v2_features.sql`
5. `supabase/migrations/0005_v3_consistency.sql`

## Operational Note on Free-Tier Supabase Inactivity
Free-tier Supabase projects pause after a period of inactivity. When resuming, the first request after a pause may take a few seconds while the database container warms up — this is expected behavior.
