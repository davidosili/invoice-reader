import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The /api dev proxy is only active during local development (`npm run dev`).
// In production (Vercel), /api/* routes are handled by Vercel Serverless
// Functions defined in the /api directory — no proxy needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
