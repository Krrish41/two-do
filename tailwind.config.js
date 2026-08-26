/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: { 50: '#F5F2FC', 100: '#EBE4F9', 200: '#E4DBF7', 400: '#C4AEF0', 600: '#9B7EDC', 700: '#7E5DBE' },
        skyblue:  { 50: '#F0F6FF', 100: '#E0EEFF', 200: '#D6E8FF', 400: '#A7C7E7', 600: '#6FA8DC', 700: '#4E88C0' },
        blossom:  { 50: '#FFF3F8', 100: '#FFE6F1', 200: '#FBDDEA', 400: '#F5A9C9', 600: '#E86FA0', 700: '#C64F82' },
        ink: '#2B2340',
        obsidian: '#120F1D',
        darkSurface: '#1C162E',
      },
      backdropBlur: { xs: '4px', glass: '20px' },
      borderRadius: { xl2: '1.5rem' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(80, 60, 130, 0.15)',
        glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glassInset: 'inset 0 1px 0 0 rgba(255,255,255,0.4)',
        glassInsetDark: 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      fontFamily: { sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
    },
  },
  plugins: [],
}
