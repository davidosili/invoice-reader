import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import http from 'node:http'

function apiServerDevPlugin() {
  let serverProcess: any = null;
  return {
    name: 'api-server-dev-runner',
    configureServer(server: any) {
      // Check if server is already running on port 3001
      const ping = http.get('http://localhost:3001/api/health', () => {
        // already running on 3001
      });
      ping.on('error', () => {
        // Not running on 3001, spawn server/index.mjs
        console.log('[LedgerLens Vite] Auto-starting API server on port 3001 with --watch...');
        serverProcess = spawn('node', ['--watch', 'server/index.mjs'], {
          stdio: 'inherit',
          env: { ...process.env, PORT: '3001' },
        });
        serverProcess.on('error', (e: any) => {
          console.error('[LedgerLens Vite] Failed to start API server:', e);
        });
      });

      const cleanup = () => {
        if (serverProcess) {
          try {
            serverProcess.kill();
          } catch {}
          serverProcess = null;
        }
      };
      server.httpServer?.on('close', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('exit', cleanup);
    },
  };
}

// https://vite.dev/config/
// The /api dev proxy is active during local development (`npm run dev`).
// In production (Vercel), /api/* routes are handled by Vercel Serverless
// Functions defined in the /api directory — no proxy needed.
export default defineConfig({
  plugins: [react(), apiServerDevPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
