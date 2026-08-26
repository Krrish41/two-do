# Design System Specs — "Apple Glassy"

Add to `tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: { 50: '#F5F2FC', 200: '#E4DBF7', 400: '#C4AEF0', 600: '#9B7EDC' },
        skyblue:  { 50: '#F0F6FF', 200: '#D6E8FF', 400: '#A7C7E7', 600: '#6FA8DC' },
        blossom:  { 50: '#FFF3F8', 200: '#FBDDEA', 400: '#F5A9C9', 600: '#E86FA0' },
        ink: '#2B2340',
      },
      backdropBlur: { xs: '4px', glass: '20px' },
      borderRadius: { xl2: '1.5rem' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(80, 60, 130, 0.15)',
        glassInset: 'inset 0 1px 0 0 rgba(255,255,255,0.4)',
      },
      fontFamily: { sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
    },
  },
}
```

Global background (`src/styles/globals.css`) — an animated mesh gradient every glass panel sits on:

```css
body {
  background: linear-gradient(-45deg, #F5F2FC, #F0F6FF, #FFF3F8, #E4DBF7);
  background-size: 400% 400%;
  animation: meshShift 18s ease infinite;
  min-height: 100vh;
}
@keyframes meshShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

Canonical glass surface (use as the base class for `GlassCard`, modals, sheets, and the sidebar):

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(80, 60, 130, 0.15),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
}
```

**Micro-interactions (Framer Motion defaults):** spring transitions (`stiffness: 300, damping: 24`), never linear/ease-in-out for interactive elements. Task completion: checkbox fills + strike-through animates over 200ms, row fades and collapses height on a 400ms delay. Note cards: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`. Modals: scale-and-fade in from `0.95` opacity `0` to `1`/`1`.

**Priority flags:** 0=none (no flag), 1=blossom-400 dot, 2=skyblue-600 dot, 3=lavender-600 dot with a subtle pulse ring for "urgent."

**Note colors:** offer 5 presets from the palette (`lavender-200`, `skyblue-200`, `blossom-200`, soft mint `#DCF3E6`, neutral `#F4F2EF`) — never arbitrary hex from a picker; keep the palette closed so the board always looks cohesive.
