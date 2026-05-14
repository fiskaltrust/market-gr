import type { RemotePluginSource } from './remotePluginLoader';

/**
 * Remote plugin manifests the apphost should try to load at startup.
 *
 * URLs are resolved against `import.meta.env.BASE_URL`, so a leading `./` or
 * no scheme is fine. Absolute https URLs work too, but they require the
 * remote origin to send permissive CORS headers and they widen the security
 * surface — prefer co-hosting plugins under this same Pages site.
 *
 * Failures are non-fatal: a broken manifest is logged to the console and the
 * apphost continues to render the static, in-tree plugins.
 *
 * See `docs/plugin-architecture.md` for the manifest schema and the plugin
 * entry-module contract.
 */
export const remotePluginSources: readonly RemotePluginSource[] = [
  // POC: a tiny hand-written ESM module living under public/, exercised by
  // CI to prove the loader path end-to-end. Once a real out-of-tree plugin
  // exists, this entry can stay (it's harmless) or be replaced.
  { manifestUrl: 'poc-remote-plugin/manifest.json' },
];
