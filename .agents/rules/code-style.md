# Code Style & Architecture Rules

- **TypeScript Strict Mode**: Enable strict mode. Never use `any` unless followed by an explicit `// justified:` comment explaining why it is strictly necessary.
- **Component Paradigm**: Functional components only. Use named exports exclusively (`export const ComponentName: React.FC<Props> = ...` or `export function ComponentName(...)`).
- **Styling Discipline**: Tailwind utility classes only. Never use inline `style={...}` except for strictly dynamic runtime values (e.g., custom user accent color or note color from data). Use `clsx` and `tailwind-merge` (`cn` helper) for class composition.
- **Component File Structure**: One component per file. Colocate component-specific TypeScript interfaces/types in the same file unless shared globally across domain stores.
- **State Management**: Use Zustand domain stores (`authStore`, `taskStore`, `noteStore`) with optimistic UI updates and real-time reconciliation.
- **Routing**: React Router in `HashRouter` mode to guarantee 100% static routing compatibility on GitHub Pages.
