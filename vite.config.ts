import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'node:path';
import manifest from './src/manifest.config';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [] : [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // HTML entry points not referenced by the manifest can go here.
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/content/audit/rules/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/content/audit/rules/**/*.ts'],
      exclude: ['src/content/audit/rules/__tests__/**'],
    },
  },
}));
