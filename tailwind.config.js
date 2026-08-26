/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          mesh1: 'var(--color-bg-mesh-1)',
          mesh2: 'var(--color-bg-mesh-2)',
          mesh3: 'var(--color-bg-mesh-3)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
          subtle: 'var(--color-ink-subtle)',
        },
        surface: {
          DEFAULT: 'var(--color-glass-surface)',
          subtle: 'var(--color-glass-subtle)',
          elevated: 'var(--color-glass-elevated)',
        },
        glass: {
          border: 'var(--color-glass-border)',
          'border-subtle': 'var(--color-glass-border-subtle)',
          input: 'var(--color-glass-input)',
          'input-focus': 'var(--color-glass-input-focus)',
        },
        'lavender-accent': 'var(--color-lavender-accent)',
        'skyblue-accent': 'var(--color-skyblue-accent)',
        'blossom-accent': 'var(--color-blossom-accent)',
        'mint-accent': 'var(--color-mint-accent)',
        'amber-accent': 'var(--color-amber-accent)',
        lavender: {
          50: '#F5F2FC',
          100: '#EBE4F9',
          200: '#E4DBF7',
          400: '#C4AEF0',
          500: 'var(--color-lavender-accent)',
          600: 'var(--color-lavender-accent)',
          700: '#7E5DBE',
          accent: 'var(--color-lavender-accent)',
        },
        skyblue: {
          50: '#F0F6FF',
          100: '#E0EEFF',
          200: '#D6E8FF',
          400: '#A7C7E7',
          500: 'var(--color-skyblue-accent)',
          600: 'var(--color-skyblue-accent)',
          700: '#4E88C0',
          accent: 'var(--color-skyblue-accent)',
        },
        blossom: {
          50: '#FFF3F8',
          100: '#FFE6F1',
          200: '#FBDDEA',
          400: '#F5A9C9',
          500: 'var(--color-blossom-accent)',
          600: 'var(--color-blossom-accent)',
          700: '#C64F82',
          accent: 'var(--color-blossom-accent)',
        },
        mint: {
          DEFAULT: 'var(--color-mint-accent)',
          light: '#D9F5E3',
          accent: 'var(--color-mint-accent)',
        },
        amber: {
          accent: 'var(--color-amber-accent)',
        },
      },
      backdropBlur: { xs: '4px', glass: '20px' },
      borderRadius: { xl2: '1.5rem', xl3: '1.75rem' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        glassSubtle: '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
      },
      fontFamily: { sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
    },
  },
  plugins: [],
}
