import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Build config for the `aade-qr-renderer` remote plugin. Mirror of the
 * qr-to-mydata / vat-lookup setup: classic JSX transform, factory-injected
 * React, library mode emitting a single default-exported ES module.
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        exports: 'default',
      },
    },
  },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
});
