import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, type CrxPlugin } from '@crxjs/vite-plugin';
import { resolve } from 'node:path';
import manifest from './src/manifest.config';

/** On-demand injection loads chunks from the page; WAR must allow real origins, not the dummy CS match. */
function contentScriptWebAccessibleResources(): CrxPlugin {
  return {
    name: 'a11yfix:content-script-war',
    enforce: 'post',
    renderCrxManifest(manifest) {
      for (const entry of manifest.web_accessible_resources ?? []) {
        if (
          'matches' in entry &&
          entry.resources.some((resource: string) => resource.includes('content-script'))
        ) {
          entry.matches = ['<all_urls>'];
        }
      }
      return manifest;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins:
    mode === 'test'
      ? []
      : [react(), crx({ manifest }), contentScriptWebAccessibleResources()],
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
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/axe-core')) return 'axe-core';
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/content/audit/rules/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'e2e/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/content/audit/rules/**/*.ts'],
      exclude: ['src/content/audit/rules/__tests__/**'],
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 95,
        lines: 90,
      },
    },
  },
}));
