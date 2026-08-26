# Two-Do: Secure Two-Person To-Do & Notes App 🔮✨

A private, collaborative web application built with **React 18 + TypeScript + Vite**, **Tailwind CSS (Apple Glassy design system)**, **Zustand**, **Framer Motion**, **@dnd-kit**, **Tiptap**, and **Supabase (PostgreSQL, Auth & Realtime)**.

Specifically tailored for **Krrish** (`krrish4173@gmail.com`) and **Gparashar** (`Gparashar2504@gmail.com`).

---

## 🔒 Security Architecture & RLS Guarantee

- **No Public Sign-Up**: Sign-up is disabled on the backend. No sign-up button exists in the app.
- **Postgres Row Level Security (RLS)**: Access control is enforced at the database layer using the `is_authorized()` security definer function.
- **Anon Key Safety**: Supabase's `anon` key being visible in the built client JS bundle is **expected and safe** — all access boundaries are validated against the `authorized_users` allowlist in Postgres.

---

## 📋 Human Setup Checklist (Supabase & GitHub)

Please complete the following one-time steps:

### 1. Supabase Dashboard: Disable Public Sign-Up
1. Go to **Supabase Dashboard** → Select your Project.
2. Navigate to **Authentication** → **Providers** → **Email**.
3. Toggle **OFF** `"Allow new users to sign up"`.
4. Click **Save**.

### 2. Supabase Dashboard: Create the Two Accounts
1. Navigate to **Authentication** → **Users**.
2. Click **Add user** → **Create user**.
3. Create the 2 accounts and set a secure password for each:
   - `krrish4173@gmail.com`
   - `Gparashar2504@gmail.com`

### 3. Supabase Dashboard: Run SQL Migrations
Go to **SQL Editor** in Supabase and run the migration scripts located in `./supabase/migrations/`:
1. `0001_init_schema.sql` (Creates tables, triggers, and realtime publications)
2. `0002_rls_policies.sql` (Enables RLS and creates security definer policies)
3. `0003_seed_authorized_users.sql` (Seeds `krrish4173@gmail.com` and `Gparashar2504@gmail.com` into `authorized_users`)

---

### 4. GitHub Secrets & Pages Deployment Setup
1. Go to your GitHub Repository: `https://github.com/Krrish41/two-do-c`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Add the following **Repository Secrets**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key (`eyJhbGciOi...`)
4. Navigate to **Settings** → **Pages**:
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
5. Push to `main` or trigger the `Deploy Two-Do to GitHub Pages` workflow manually from the **Actions** tab.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment (Optional for Realtime Sync)
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(Note: If `.env` is omitted, the app will automatically boot in interactive **Demo Mode** for local visual inspection)*

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎨 Design System ("Apple Glassy")
- **Color Palette**: Lavender (`#9B7EDC`, `#C4AEF0`), Sky Blue (`#6FA8DC`, `#A7C7E7`), Blossom (`#E86FA0`, `#F5A9C9`), Ink (`#2B2340`).
- **Surface**: `backdrop-filter: blur(20px) saturate(180%)`, soft glass border with inset highlight (`inset 0 1px 0 0 rgba(255,255,255,0.4)`).
- **Micro-interactions**: Framer Motion spring curves (`stiffness: 300, damping: 24`).
- **Rich Text Notes**: Tiptap editor with 5 aesthetic color presets, checklists, bullet lists, formatting, tags, and folder organization.
