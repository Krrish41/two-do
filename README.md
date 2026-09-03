# ✨ Two-Do

<div align="center">

> **"Yours, mine, ours."**  
> An ultra-refined, private collaborative workspace designed for a private duo.

[![Live Application](https://img.shields.io/badge/Live%20App-krrish41.github.io%2Ftwo--do-8B5CF6?style=for-the-badge&logo=githubpages&logoColor=white)](https://krrish41.github.io/two-do/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime%20%26%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

### 🌐 Live Application
### **[👉 Launch Two-Do (krrish41.github.io/two-do)](https://krrish41.github.io/two-do/)**

---

</div>

## 📖 Overview

**Two-Do** is a high-craft, end-to-end synchronized web application built specifically for a two-person team or couple. It bridges structured task management with rich-text documentation in a cohesive, Apple-inspired glassmorphic environment.

Every interaction is designed with fluid micro-interactions, optimistic state updates, and real-time bidirectional replication so both users always stay perfectly in sync.

---

## ✨ Key Features

### 🪟 Apple-Inspired Glassmorphic Design
- **Frosted Glass Paneling**: Layered translucent surfaces using high-fidelity blur filters, ambient border illumination, and specular highlights.
- **Dynamic Ambient Gradient Mesh**: Soft, organic background gradients that smoothly react to light and dark theme toggling.
- **Spring Micro-Interactions**: Fluid transitions, hover states, sheet slides, and modal entries powered by **Framer Motion**.
- **Adaptive Typography & Themes**: Seamless switching between Dark Mode and Light Mode with curated pastel tokens.

### 🎯 Intelligent Task Management
- **My Day Planner**: Curate daily priority lists with automated date tracking and quick-add actions.
- **Hierarchical Subtasks**: Break complex tasks into subtasks with completion tallies and checklist tracking.
- **Drag & Drop Reordering**: Natural reordering and manual priority sorting powered by `@dnd-kit`.
- **Recurrence Engine**: Support for recurring schedules (Daily, Weekly, Monthly) that automatically regenerate when completed.
- **Priority & Due Date Flags**: Visual urgency flags (Urgent, High, Medium, Low) and custom glass calendar picker.
- **Folder Categorization**: Group tasks into custom folders featuring selectable Lucide icons and accent swatches.

### 📝 Rich-Text Notes Studio
- **Tiptap WYSIWYG Engine**: Full-featured rich text editing with headers, bold, italics, highlight badges, blockquotes, interactive checklists, and code snippets.
- **Note Color Coding**: Custom pastel card backgrounds (Lavender, Rose, Mint, Sky, Butter, Peach).
- **Nested Folder Architecture**: Organize notes into hierarchical folder trees with expand/collapse navigation.
- **Tagging & Filtering**: Fast multi-tag pills for labeling and instant tag filtering.
- **Pinning**: Pin critical notes to the top of your workspace for immediate access.

### 👥 Duo Co-Presence & Assignment
- **Creator & Assignee Filters**: Quickly switch between **"All"**, **"Mine"**, and **"Partner's"** items with dedicated tabs.
- **Partner Avatars**: Visual presence indicators displaying personalized accent colors and display names.
- **Pair Exclusivity**: Engineered specifically for two authorized users — zero noise from outside accounts.

### 🗑️ Recycle Bin & Data Safety
- **Soft Deletes**: Deleting a task or note preserves it in the Recycle Bin with `deleted_at` metadata.
- **Full Restoration**: Restore accidentally deleted tasks or notes with all subtasks and folder links intact.
- **Permanent Shredding**: One-click option to permanently purge items when no longer needed.

### ⚡ Real-Time Engine & Offline Resilience
- **Postgres Changes Replication**: Listens to Supabase Realtime websocket channels for instant multi-device updates.
- **Optimistic UI Updates**: State changes reflect instantly on screen via Zustand domain stores before server roundtrips confirm them.

### ⏱️ Automated Keep-Alive System
- Built-in GitHub Actions scheduled workflow ([`supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml)) that queries the database every 3 days to prevent Supabase Free Tier projects from auto-pausing.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 + TypeScript + Vite | Ultra-fast build toolchain and strict type safety |
| **Routing** | React Router 7 (`HashRouter`) | Client-side routing with static GitHub Pages hosting |
| **State Management**| Zustand 5 | Decoupled modular domain stores (Auth, Tasks, Notes, Filters) |
| **Styling** | Tailwind CSS 3.4 + Custom Tokens | Glassmorphism styling, CSS variables, and design tokens |
| **Animations** | Framer Motion 12 | Spring-physics transitions and layout animations |
| **Drag & Drop** | `@dnd-kit` (Core + Sortable) | Smooth, accessible drag-and-drop task reordering |
| **Rich Text** | Tiptap 2 (`@tiptap/react`, StarterKit)| Structured JSON document editing and rich-text rendering |
| **Icons & Dates** | Lucide React + `date-fns` | Clean iconography and localized date formatting |
| **Backend / DB** | Supabase (PostgreSQL 15) | Relational database, Supabase Auth, and Realtime engine |
| **Hosting & CI/CD** | GitHub Actions + GitHub Pages | Automated build, testing, and continuous deployment |

---

## 📂 Project Structure

```text
two-do/
├── .github/
│   └── workflows/
│       ├── deploy.yml               # Automated GitHub Pages build & deploy
│       └── supabase-keepalive.yml   # 3-day cron ping to prevent DB auto-pause
├── public/                          # Static assets and favicons
├── src/
│   ├── components/
│   │   ├── common/                  # Shared UI (Avatars, Modals, Filter tabs)
│   │   ├── glass/                   # Glassmorphic primitives (Button, Card, Sheet, etc.)
│   │   ├── icons/                   # Custom icon sets
│   │   ├── layout/                  # Shell, Sidebar, MobileNav, ThemeToggle, Mesh
│   │   ├── notes/                   # NoteCard, NoteEditor, FolderTree, TagPicker
│   │   └── tasks/                   # TaskList, TaskItem, TaskDetailSheet, PriorityFlag
│   ├── constants/                   # Palette colors, priority maps, navigation items
│   ├── hooks/                       # Custom React hooks (realtime sync, keyboard shortcuts)
│   ├── lib/                         # Supabase client singleton & utilities
│   ├── pages/                       # TodayPage, TasksPage, NotesPage, RecycleBin, Login, Menu
│   ├── stores/                      # Zustand domain stores (taskStore, noteStore, authStore)
│   ├── styles/                      # globals.css with custom Glassy CSS utilities
│   ├── App.tsx                      # App root with providers and HashRouter routes
│   └── main.tsx                     # React DOM entrypoint
├── supabase/
│   └── migrations/                  # Ordered SQL migrations for schema & security
├── index.html                       # HTML template
├── tailwind.config.js               # Tailored glassmorphism theme extensions
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite build configuration (base: './')
```

---

## 🗄️ Database Setup & Migrations

All database schemas, foreign keys, triggers, and Row Level Security (RLS) rules are tracked under [`supabase/migrations`](supabase/migrations). Run them in order within your Supabase SQL Editor:

1. **`0001_init_schema.sql`**: Core tables (`authorized_users`, `folders`, `tags`, `tasks`, `notes`, `note_tags`).
2. **`0002_rls_policies.sql`**: Row Level Security enforcement and `is_authorized()` security definer function.
3. **`0003_seed_authorized_users.sql`**: Seeds the allowlist linking authorized user UUIDs.
4. **`0004_v2_features.sql`**: Folder customizations (icons, colors) and task sorting extensions.
5. **`0005_v3_consistency.sql`**: Foreign key cascade cleanup and note-folder data integrity.
6. **`0006_v4_tasks_soft_delete.sql`**: Adds `deleted_at` columns and soft-deletion tracking for the Recycle Bin.

---

## 🔒 Security Architecture

> [!NOTE]
> **Supabase Anon Key in Client Bundles**:
> The `VITE_SUPABASE_ANON_KEY` is a public client identifier required to connect to the Supabase gateway.
> All data authorization, isolation, and access control are strictly enforced at the PostgreSQL database level via Row Level Security (RLS).

* **Strict Two-Person Allowlist**: Every query evaluates `is_authorized()` against the `authorized_users` table.
* **No Public Registration**: Sign-ups are restricted to the pre-seeded duo allowlist.
* **Unauthenticated Isolation**: Any unauthenticated query receives an empty result set (`[]`) without exposing data.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: Version 18.x or 20.x+
- **npm**: Version 9.x+
- A [Supabase](https://supabase.com) project with migrations applied.

### 1. Clone the Repository
```bash
git clone https://github.com/Krrish41/two-do.git
cd two-do
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
The compiled static assets will be output to the `dist/` directory.

---

## 🚀 Deployment & CI/CD

### Automatic GitHub Pages Deployment
This repository includes a continuous deployment workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Whenever code is pushed to the `main` branch:
1. GitHub Actions sets up Node.js.
2. Dependencies are cleanly installed via `npm ci`.
3. The production bundle is compiled with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` injected from **GitHub Repository Secrets**.
4. The static `dist/` folder is deployed directly to **GitHub Pages**.

### Supabase Keep-Alive Automation
To ensure the free-tier Supabase database is never paused due to periods of inactivity:
* [`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml) runs on a cron schedule every 3 days at 06:00 UTC.
* It sends a lightweight read request to PostgREST, logging user database activity and keeping the database awake continuously.

---

## 📄 License

This project is privately developed for personal duo productivity.
Feel free to reference the patterns and architecture for your own projects!
