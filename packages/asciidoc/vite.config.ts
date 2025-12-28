/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TpLabAsciidoc',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // externalize node: builtins and other runtime deps
      external: [/^node:/, '@asciidoctor/core', 'prettier'],
      output: {
        globals: {
          '@asciidoctor/core': 'Asciidoctor',
          prettier: 'prettier',
        },
      },
    },
    target: 'es2022',
    sourcemap: true,
  },
  resolve: {
    conditions: ['node', 'browser'],
  },

});