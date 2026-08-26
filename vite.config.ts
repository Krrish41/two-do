import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    fs: {
      strict: false,
    },
    watch: {
      ignored: ['**/dist/**', '**/.git/**'],
    },
  },
})
