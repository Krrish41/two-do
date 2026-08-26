# Two-Do: Secure Two-Person To-Do & Notes App

Two-Do is a collaborative, ultra-refined productivity web application designed specifically and exclusively for two named users (`krrish4173@gmail.com` and `Gparashar2504@gmail.com`). It combines Apple-inspired glassmorphism aesthetics with real-time bidirectional synchronization, structured task management (My Day, subtasks, recurrence, priorities, and drag-and-drop ordering), and rich-text note taking with Tiptap. The application is designed to be hosted as a static site on GitHub Pages with Supabase serving as the Postgres database, authentication provider, and real-time engine.

## Tech Stack
- **Frontend Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router in Hash mode (`HashRouter` for GitHub Pages static hosting compatibility)
- **Styling**: Tailwind CSS (custom Apple Glassy tokens and glassmorphism utilities)
- **State Management**: Zustand (modular domain stores for Auth, Tasks, Notes with optimistic updates)
- **Animations & Micro-interactions**: Framer Motion (spring-based transitions)
- **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Rich Text Editing**: Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
- **Icons**: Lucide React
- **Date Handling**: `date-fns`
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Realtime Postgres Changes)
- **Deployment**: GitHub Actions -> GitHub Pages

## Non-Negotiable Security Rule
**Supabase's anon key being visible in the built JS bundle is expected and safe.**
The anon key identifies the Supabase project, not a privileged user. All access control, isolation, and security boundaries live entirely in PostgreSQL Row Level Security (RLS) via the `is_authorized()` security definer function checking against the `authorized_users` allowlist. Never attempt to proxy, obfuscate, or "hide" the anon key. No public sign-ups are permitted in the application UI or database.
