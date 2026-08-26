/** @type {import('tailwindcss').Config} */
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
  plugins: [],
}
