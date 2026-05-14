import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In production we deploy to https://fiskaltrust.github.io/market-gr/tools/
// so the base path needs to match. Override with VITE_BASE for previews.
const base = process.env.VITE_BASE ?? (process.env.NODE_ENV === 'production' ? '/market-gr/tools/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    fs: {
      // The .NET WASM AppBundle is copied into public/mydataconverter at build
      // time. Allow Vite's dev server to read it from there.
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
