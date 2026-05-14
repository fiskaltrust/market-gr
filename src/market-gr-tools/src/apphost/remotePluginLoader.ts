import * as React from 'react';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ToolDefinition } from './tools';

/**
 * Schema of a remote plugin's `manifest.json`. Keep this in sync with the
 * "Remote ESM plugin contract" section of docs/plugin-architecture.md.
 */
export interface RemotePluginManifest {
  /** Stable plugin id. Used in URLs and React keys. Must be unique. */
  id: string;
  /** Human-readable plugin name shown on the home card. */
  name: string;
  /** One-paragraph description shown on the home card. */
  description: string;
  /** yyyy.MM.no version string, matches the in-tree plugin convention. */
  version: string;
  /** Relative URL of the plugin's ESM entry, resolved against the manifest URL. */
  entry: string;
  /** Optional relative URL of a CHANGELOG.md file. */
  changelog?: string;
  /**
   * Loader contract version. The apphost currently only understands `1`.
   * Bumping this is how we evolve the contract without breaking older plugins.
   */
  apiVersion: 1;
}

/**
 * Dependencies the apphost injects into a remote plugin's factory. Keeping
 * this narrow is intentional — it's the public surface area the apphost
 * commits to. Add to it deliberately.
 */
export interface RemotePluginDeps {
  React: typeof React;
}

export interface RemotePluginExports {
  Component: ComponentType;
}

export type RemotePluginFactory = (deps: RemotePluginDeps) => RemotePluginExports;

/**
 * A remote plugin source, as configured in `remotePlugins.ts`. The
 * `manifestUrl` is resolved against `import.meta.env.BASE_URL` at fetch time,
 * so authors can use either site-relative ("/poc-remote-plugin/manifest.json")
 * or app-relative ("poc-remote-plugin/manifest.json") URLs.
 */
export interface RemotePluginSource {
  manifestUrl: string;
}

export interface LoadedRemotePlugin extends ToolDefinition {
  /** Marks this tool as remote so the UI can render a badge. */
  remote: true;
  /** The URL the manifest was fetched from. Useful for diagnostics. */
  manifestUrl: string;
}

/** Result of attempting to load one remote plugin. */
export type RemotePluginLoadResult =
  | { ok: true; plugin: LoadedRemotePlugin }
  | { ok: false; manifestUrl: string; error: string };

/**
 * Resolve a possibly-relative URL against the app's base URL. We accept
 * absolute URLs unchanged so plugins can in theory be hosted on a separate
 * domain (subject to CORS), but the recommended path is co-hosting on the
 * apphost's Pages site under a subpath.
 */
function resolveAgainstBase(url: string): string {
  if (/^[a-z]+:\/\//i.test(url) || url.startsWith('//')) return url;
  const base = import.meta.env.BASE_URL ?? '/';
  const baseAbs = new URL(base, window.location.origin).toString();
  return new URL(url.replace(/^\//, ''), baseAbs).toString();
}

function validateManifest(raw: unknown, manifestUrl: string): RemotePluginManifest {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Manifest at ${manifestUrl} is not a JSON object.`);
  }
  const m = raw as Record<string, unknown>;
  const requireString = (key: string): string => {
    const v = m[key];
    if (typeof v !== 'string' || v.length === 0) {
      throw new Error(`Manifest at ${manifestUrl} is missing required string field "${key}".`);
    }
    return v;
  };
  if (m.apiVersion !== 1) {
    throw new Error(
      `Manifest at ${manifestUrl} has unsupported apiVersion ${String(m.apiVersion)}. ` +
        `This apphost only understands apiVersion === 1.`,
    );
  }
  return {
    id: requireString('id'),
    name: requireString('name'),
    description: requireString('description'),
    version: requireString('version'),
    entry: requireString('entry'),
    changelog: typeof m.changelog === 'string' ? m.changelog : undefined,
    apiVersion: 1,
  };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return await res.text();
}

/**
 * Fetch a single remote plugin's manifest and return a `ToolDefinition`-shaped
 * value whose `component` is a `lazy()` wrapper that does the actual ESM
 * import on first render. We intentionally do not eagerly import the entry
 * module — that keeps the cold-start cost limited to one tiny JSON fetch per
 * remote source, regardless of how many remote plugins are configured.
 */
export async function loadRemotePlugin(
  source: RemotePluginSource,
): Promise<RemotePluginLoadResult> {
  const manifestUrl = resolveAgainstBase(source.manifestUrl);
  try {
    const manifestText = await fetchText(manifestUrl);
    const parsed = JSON.parse(manifestText) as unknown;
    const manifest = validateManifest(parsed, manifestUrl);

    const entryUrl = new URL(manifest.entry, manifestUrl).toString();
    const changelogUrl = manifest.changelog
      ? new URL(manifest.changelog, manifestUrl).toString()
      : null;

    // Lazy-load the changelog text in the background so the changelog modal
    // has something to show. A failure here is non-fatal.
    let changelogText = '';
    if (changelogUrl) {
      try {
        changelogText = await fetchText(changelogUrl);
      } catch (err) {
        console.warn(`[remote-plugin] Failed to fetch changelog for ${manifest.id}:`, err);
      }
    }

    const component: LazyExoticComponent<ComponentType> = lazy(async () => {
      // `@vite-ignore` keeps Vite from trying to statically analyze the URL —
      // it's resolved at runtime against a manifest the user picked.
      const mod = (await import(/* @vite-ignore */ entryUrl)) as {
        default?: RemotePluginFactory;
      };
      if (typeof mod.default !== 'function') {
        throw new Error(
          `Remote plugin ${manifest.id} at ${entryUrl} has no default export ` +
            `or its default export is not a factory function. See docs/plugin-architecture.md.`,
        );
      }
      const exports = mod.default({ React });
      if (!exports || typeof exports.Component !== 'function') {
        throw new Error(
          `Remote plugin ${manifest.id} factory did not return a { Component } object.`,
        );
      }
      return { default: exports.Component };
    });

    return {
      ok: true,
      plugin: {
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        version: manifest.version,
        changelog: changelogText,
        component,
        remote: true,
        manifestUrl,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[remote-plugin] Failed to load ${manifestUrl}:`, err);
    return { ok: false, manifestUrl, error: message };
  }
}

/** Load every configured remote source in parallel. Failures are logged, not thrown. */
export async function loadRemotePlugins(
  sources: readonly RemotePluginSource[],
): Promise<LoadedRemotePlugin[]> {
  const results = await Promise.all(sources.map(loadRemotePlugin));
  return results.filter((r): r is Extract<RemotePluginLoadResult, { ok: true }> => r.ok).map(
    (r) => r.plugin,
  );
}
