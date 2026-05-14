import type { RemotePluginSource } from './remotePluginLoader';

/**
 * URL of the JSON manifest list. Resolved against `import.meta.env.BASE_URL`
 * so the same relative path works in `vite dev` and after deploy.
 *
 * The actual catalogue lives at `public/plugins/index.json` — adding a plugin
 * to the apphost means dropping its `public/plugins/<id>/` folder and adding
 * an entry to that JSON file. No apphost rebuild required.
 */
const PLUGIN_INDEX_URL = 'plugins/index.json';

/**
 * Shape of `public/plugins/index.json`. Each entry is a relative URL to a
 * `manifest.json` — same string as `RemotePluginSource.manifestUrl`.
 */
interface PluginIndex {
  plugins: readonly { manifestUrl: string }[];
}

/**
 * Fetch the configured remote-plugin list at boot. Failures (network error,
 * malformed JSON, schema mismatch) are non-fatal — the apphost still renders,
 * just with no plugin cards. We log to the console for diagnostics.
 */
export async function loadRemotePluginSources(): Promise<readonly RemotePluginSource[]> {
  const base = import.meta.env.BASE_URL ?? '/';
  const absBase = new URL(base, window.location.origin).toString();
  const url = new URL(PLUGIN_INDEX_URL, absBase).toString();
  try {
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) {
      console.warn(`[remote-plugin] index.json HTTP ${res.status} at ${url}`);
      return [];
    }
    const raw = (await res.json()) as Partial<PluginIndex>;
    if (!raw || !Array.isArray(raw.plugins)) {
      console.warn(`[remote-plugin] index.json at ${url} is missing a "plugins" array.`);
      return [];
    }
    return raw.plugins
      .filter((p): p is { manifestUrl: string } => typeof p?.manifestUrl === 'string')
      .map((p) => ({ manifestUrl: p.manifestUrl }));
  } catch (err) {
    console.warn(`[remote-plugin] Failed to load plugin index ${url}:`, err);
    return [];
  }
}
