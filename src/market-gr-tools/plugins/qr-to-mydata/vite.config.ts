import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Build config for the `qr-to-mydata` remote plugin.
 *
 * Library mode emits a single ES module (`dist/index.js`) whose default export
 * is the factory the apphost calls. We use the **classic** JSX transform with
 * `jsxFactory: 'React.createElement'` so all JSX inside the factory closure
 * compiles down to calls against the `React` instance the apphost injects via
 * `deps.React`. That avoids ever importing `react` or `react/jsx-runtime` from
 * inside the plugin — there is exactly one React in the page, and hooks /
 * context Just Work across the remote-module boundary.
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
      // `react` is provided by the apphost via deps.React. Anything we import
      // statically from 'react' would create a second copy and break hooks.
      // We intentionally do NOT use react/jsx-runtime — see `esbuild` below.
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        // Library mode would otherwise emit named exports; we want exactly
        // one default export (the factory) for the loader to call.
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
