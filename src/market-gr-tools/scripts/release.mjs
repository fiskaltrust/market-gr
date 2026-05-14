#!/usr/bin/env node

/**
 * Per-plugin release script for the market-gr-tools apphost.
 *
 * Each plugin in `src/tools/<plugin-id>/` owns its own version + CHANGELOG.
 * The version literal lives in `manifest.ts` as a single-quoted string and
 * the CHANGELOG is a sibling `CHANGELOG.md` (Keep a Changelog style with a
 * `## [Unreleased]` block on top).
 *
 * Version format: yyyy.MM.no (e.g. 2026.05.1, 2026.05.2).
 *
 * Usage:
 *   node scripts/release.mjs --list
 *       Print every plugin id with its current version (exit 0).
 *   node scripts/release.mjs <plugin-id> [--auto | <version>]
 *       Bump <plugin-id>. With --auto, skips (exit 0) when [Unreleased] is
 *       empty; otherwise increments the patch within the current yyyy.MM
 *       window. Pass a literal yyyy.MM.no to set an explicit version.
 *
 * Discovery: any directory under `src/tools/` that contains both a
 * `manifest.ts` and a `CHANGELOG.md` is treated as a plugin. The directory
 * name is the plugin id.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const toolsDir = resolve(root, 'src/tools');

const VERSION_RE = /^\d{4}\.\d{2}\.\d+$/;
// Match `export const version = '2026.05.1';` (single-quoted, on one line).
const MANIFEST_VERSION_RE = /(export\s+const\s+version\s*=\s*)'([^']+)'(\s*;?)/m;

function discoverPlugins() {
  if (!existsSync(toolsDir)) return [];
  return readdirSync(toolsDir)
    .filter((name) => {
      const dir = join(toolsDir, name);
      if (!statSync(dir).isDirectory()) return false;
      return existsSync(join(dir, 'manifest.ts')) && existsSync(join(dir, 'CHANGELOG.md'));
    })
    .map((id) => ({
      id,
      dir: join(toolsDir, id),
      manifestPath: join(toolsDir, id, 'manifest.ts'),
      changelogPath: join(toolsDir, id, 'CHANGELOG.md'),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function readManifestVersion(manifestPath) {
  const src = readFileSync(manifestPath, 'utf-8');
  const m = src.match(MANIFEST_VERSION_RE);
  if (!m) {
    throw new Error(
      `Could not find a single-quoted \`export const version = '...';\` in ${manifestPath}`,
    );
  }
  return { source: src, current: m[2] };
}

function writeManifestVersion(manifestPath, oldSource, newVersion) {
  const next = oldSource.replace(MANIFEST_VERSION_RE, (_, lhs, _v, tail) => `${lhs}'${newVersion}'${tail}`);
  writeFileSync(manifestPath, next);
}

function nextAutoVersion(currentVersion) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}.${month}`;
  if (VERSION_RE.test(currentVersion)) {
    const [curYear, curMonth, curNo] = currentVersion.split('.');
    if (`${curYear}.${curMonth}` === prefix) {
      return `${prefix}.${Number(curNo) + 1}`;
    }
  }
  return `${prefix}.1`;
}

function rewriteChangelog(changelogPath, newVersion, isAuto) {
  let changelog = readFileSync(changelogPath, 'utf-8');
  const today = new Date().toISOString().slice(0, 10);
  const unreleasedHeader = '## [Unreleased]';

  if (!changelog.includes(unreleasedHeader)) {
    if (isAuto) {
      console.log(`  ${changelogPath}: no [Unreleased] section — skipping.`);
      return { skipped: true };
    }
    throw new Error(`${changelogPath} does not contain an [Unreleased] section.`);
  }

  const unreleasedIdx = changelog.indexOf(unreleasedHeader);
  const nextSectionIdx = changelog.indexOf('\n## [', unreleasedIdx + 1);
  const unreleasedContent = nextSectionIdx === -1
    ? changelog.slice(unreleasedIdx + unreleasedHeader.length)
    : changelog.slice(unreleasedIdx + unreleasedHeader.length, nextSectionIdx);

  if (!unreleasedContent.trim()) {
    if (isAuto) {
      console.log(`  ${changelogPath}: [Unreleased] is empty — skipping.`);
      return { skipped: true };
    }
    throw new Error(`${changelogPath}: [Unreleased] is empty. Nothing to release.`);
  }

  const before = changelog.slice(0, unreleasedIdx);
  const after = nextSectionIdx === -1 ? '' : changelog.slice(nextSectionIdx);
  changelog = `${before}${unreleasedHeader}\n\n## [${newVersion}] - ${today}\n${unreleasedContent}\n${after}`;
  writeFileSync(changelogPath, changelog);
  return { skipped: false, today };
}

function releasePlugin(plugin, requestedVersion, isAuto) {
  const { current, source } = readManifestVersion(plugin.manifestPath);
  const newVersion = requestedVersion ?? nextAutoVersion(current);
  if (!VERSION_RE.test(newVersion)) {
    throw new Error(`Invalid version "${newVersion}". Expected yyyy.MM.no.`);
  }

  const result = rewriteChangelog(plugin.changelogPath, newVersion, isAuto);
  if (result.skipped) return { plugin, skipped: true };

  writeManifestVersion(plugin.manifestPath, source, newVersion);
  console.log(`  ${plugin.manifestPath}: ${current} → ${newVersion}`);
  console.log(`  ${plugin.changelogPath}: [Unreleased] → [${newVersion}] - ${result.today}`);
  return { plugin, skipped: false, from: current, to: newVersion };
}

// ─── CLI ───
const args = process.argv.slice(2);
const plugins = discoverPlugins();

if (args.length === 0 || args[0] === '--list' || args[0] === '-l') {
  if (plugins.length === 0) {
    console.log('No plugins found under src/tools/.');
    process.exit(0);
  }
  for (const p of plugins) {
    const { current } = readManifestVersion(p.manifestPath);
    console.log(`${p.id}\tv${current}`);
  }
  process.exit(0);
}

if (args[0] === '--auto-all') {
  // Convenience for CI: --auto every plugin. Exit 0 even if all are no-ops.
  let bumped = 0;
  for (const p of plugins) {
    console.log(`[${p.id}]`);
    const r = releasePlugin(p, undefined, true);
    if (!r.skipped) bumped += 1;
  }
  console.log(`\nDone. ${bumped} plugin(s) bumped.`);
  process.exit(0);
}

const pluginId = args[0];
const second = args[1];
const isAuto = second === '--auto';
const explicitVersion = second && !isAuto ? second : undefined;

if (pluginId.startsWith('-')) {
  console.error(`Unknown flag: ${pluginId}`);
  console.error('Usage: node scripts/release.mjs <plugin-id> [--auto | <version>]');
  console.error('       node scripts/release.mjs --list');
  console.error('       node scripts/release.mjs --auto-all');
  process.exit(1);
}

const plugin = plugins.find((p) => p.id === pluginId);
if (!plugin) {
  console.error(`Unknown plugin id "${pluginId}".`);
  console.error(`Known plugins: ${plugins.map((p) => p.id).join(', ') || '(none)'}`);
  process.exit(1);
}

if (!isAuto && !explicitVersion) {
  console.error(`Usage: node scripts/release.mjs ${pluginId} --auto`);
  console.error(`       node scripts/release.mjs ${pluginId} <version>`);
  process.exit(1);
}

console.log(`[${plugin.id}]`);
releasePlugin(plugin, explicitVersion, isAuto);
