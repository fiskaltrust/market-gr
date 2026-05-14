import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Build config for the `mydata-to-fiskaltrust` remote plugin.
 *
 * Same shape as the other remote plugins (classic JSX transform,
 * factory-injected React, library mode emitting a single default ES module).
 * The .NET WebAssembly AppBundle is produced separately by `dotnet publish`
 * of the sibling `dotnet/MyDataConverter.Wasm/` project; the staging script
 * copies its `wwwroot/` contents alongside this build's `index.js`.
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
