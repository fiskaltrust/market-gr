#!/usr/bin/env node
/**
 * Stage a built plugin's artifacts into the apphost's `public/plugins/<id>/`
 * folder. Vite then copies everything under `public/` verbatim into `dist/`
 * during the apphost build, so the deployed Pages site ends up with:
 *
 *   /plugins/<id>/index.js
 *   /plugins/<id>/manifest.json
 *   /plugins/<id>/CHANGELOG.md
 *   /plugins/<id>/_framework/...      (only for .NET plugins)
 *
 * Each plugin must have run its own `npm run build` first. The script copies:
 *
 *  - everything from `plugins/<id>/dist/` (the Vite output: index.js, source
 *    maps, anything else the plugin's build emits), and
 *  - the static `manifest.json` and `CHANGELOG.md` from the plugin root.
 *
 * Additional source dirs (e.g. a `_framework/` from a `dotnet publish`) can
 * be specified with --include=<relativePath>. The argument is relative to
 * `plugins/<id>/` and is copied recursively into the destination.
 *
 * Usage:
 *   node scripts/copy-plugin.mjs <plugin-id> [--include=<relPath> ...]
 */
import { existsSync, rmSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const includes = args
  .filter((a) => a.startsWith('--include='))
  .map((a) => a.slice('--include='.length));

if (positional.length !== 1) {
  console.error('Usage: node scripts/copy-plugin.mjs <plugin-id> [--include=<relPath> ...]');
  process.exit(1);
}

const pluginId = positional[0];
const pluginRoot = resolve(repoRoot, 'plugins', pluginId);
const pluginDist = resolve(pluginRoot, 'dist');
const destination = resolve(repoRoot, 'public', 'plugins', pluginId);

if (!existsSync(pluginRoot)) {
  console.error(`[copy-plugin] plugin folder not found: ${pluginRoot}`);
  process.exit(1);
}
if (!existsSync(pluginDist)) {
  console.error(`[copy-plugin] plugin dist not found: ${pluginDist}`);
  console.error('[copy-plugin] run `npm run build` inside the plugin folder first.');
  process.exit(1);
}

// Wipe the staging folder so stale files from a prior build don't leak through.
if (existsSync(destination)) {
  rmSync(destination, { recursive: true, force: true });
}
mkdirSync(destination, { recursive: true });

// 1. Copy every entry under `dist/` into the destination.
for (const entry of readdirSync(pluginDist)) {
  const src = join(pluginDist, entry);
  const dst = join(destination, entry);
  cpSync(src, dst, { recursive: true });
}

// 2. Copy the static manifest + changelog from the plugin root.
for (const file of ['manifest.json', 'CHANGELOG.md']) {
  const src = join(pluginRoot, file);
  if (existsSync(src)) {
    cpSync(src, join(destination, file));
  } else {
    console.warn(`[copy-plugin] WARN: ${file} not found at ${src}`);
  }
}

// 3. Copy any extra include paths verbatim. Used by the .NET plugin to stage
//    the published `_framework/` directory next to `index.js`.
for (const rel of includes) {
  const src = resolve(pluginRoot, rel);
  if (!existsSync(src)) {
    console.error(`[copy-plugin] --include path does not exist: ${src}`);
    process.exit(1);
  }
  const stat = statSync(src);
  const dst = join(destination, rel.split(/[\\/]/).pop());
  cpSync(src, dst, { recursive: stat.isDirectory() });
}

console.log(`[copy-plugin] staged ${pluginRoot} -> ${destination}`);
