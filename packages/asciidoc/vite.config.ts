/// <reference types="vitest" />

import { defineConfig } from 'vite';
import path from 'node:path';
import { glob } from 'glob'
import dts from 'vite-plugin-dts';

const entries = [
  './src/tp-asciidoc.ts',
  ...(await glob('./src/converter/**/!(*.(styles|test|spec)).ts')),
  ...(await glob('./src/nodes/**/!(*.(styles|test|spec)).ts')),
  ...(await glob('./src/utilities/**/!(*.(styles|test|spec)).ts')),
  ...(await glob('./src/extensions/**/!(*.(styles|test|spec)).ts')),
  ...(await glob('./src/engine/**/!(*.(styles|test|spec)).ts')),
];

function sanitizeChunkName(name: string): string {
  return name
    .replaceAll('\\', '/')
    .replace(/^(\.\.\/)+/g, '')
    .replace(/^\/+/g, '')
    .replace(/[:]/g, '_')
    .replace(/\0/g, '');
}

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    lib: {
      entry: entries,
      name: 'TpAsciidoc',
      cssFileName: 'tp-asciidoc',
      formats: ['es']
    },
    rollupOptions: {
      external: [/^node:/],
      output: {
        format: 'es',
        entryFileNames: (chunk) =>
          chunk.name === 'index' ? 'tp-asciidoc.js' : `${sanitizeChunkName(chunk.name)}.js`,
        chunkFileNames: (chunk) => `${sanitizeChunkName(chunk.name)}.js`,
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/')) {
            const rel = path
              .relative(path.resolve(__dirname, 'src'), id)
              .replaceAll(path.sep, '/')
              .replace(/\.[^.]+$/, '');
            return sanitizeChunkName(rel);
          }
          return undefined;
        },
      },
    },
    target: 'es2022',
    sourcemap: true,
  },
  
  resolve: {
    conditions: ['module', 'import', 'browser'], // Forcer l'utilisation d'ES Modules pour les navigateurs
  },
});