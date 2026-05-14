# Plugin architecture for market-gr-tools

> **Status:** proposal, with a working proof-of-concept. The recommendation
> at the end of this document needs sign-off before we migrate any in-tree
> plugins.

## 1. Goal and constraints

The `market-gr-tools` apphost is a small Vite + React + TypeScript SPA. Today
it ships every plugin in-tree under `src/tools/<plugin-id>/` and registers
them statically in `src/apphost/tools.tsx`. As the catalogue grows (myDATA
converter, QR decoder, VAT lookup, future plugins) we want plugins to:

1. **Live outside the apphost repo** (or at least outside the apphost build),
   so a plugin can ship a fix without the apphost needing to redeploy and
   vice versa.
2. **Be loaded at runtime** from a configurable URL list, so a plugin can be
   added to the catalogue by editing a JSON file rather than by recompiling
   the apphost.
3. **Support React-only plugins and React + .NET WebAssembly plugins** with
   the same loader contract. The myDATA converter is the existence proof
   that a single plugin can ship a multi-megabyte AppBundle.
4. **Deploy via GitHub Pages**, which is static hosting only. The repo is
   currently private so Pages publishes to an obfuscated subdomain at the
   site root; no SSR, no Edge functions, no per-route rewrites.

Hard constraints:

- The apphost stays on its current React 18 / Vite 5 baseline.
- The existing in-tree plugins keep working unchanged until a dedicated
  migration PR moves them out.
- Plugins may legitimately ship >5 MB (and up to ~30 MB for a .NET AppBundle).
  The loader cannot block apphost startup on those downloads.
- TypeScript strict mode stays clean; `tsc -b` and `vite build` keep passing.

## 2. Candidate approaches

### 2.1 Module Federation (Webpack 5 / `@originjs/vite-plugin-federation`)

The "official" microfrontend story. Each plugin is its own Vite project that
exports a federated module; the apphost is configured as a Module Federation
host that resolves remote names to URLs at runtime.

| Aspect | Notes |
|---|---|
| Shared deps | Module Federation's whole reason to exist: React, react-dom, etc. are deduped across host and remotes via a shared scope. |
| Plugin contract | Plugins expose ESM modules; the host imports them by federated name. Tooling-heavy: every plugin needs the federation plugin and a coordinated `shared` config. |
| WASM/.NET | Module Federation has no opinion on non-JS assets. The plugin's Vite build can copy a `_framework/` directory into its `dist/` and the plugin code can fetch it relative to its own URL. The runtime is per-plugin unless we deliberately share a runtime module (which is hairy with `dotnet.js`). |
| Versioning / discovery | Federation has no manifest schema of its own; we'd still write our own `manifest.json`. Federation only gives us "is the remote up?" |
| Security | Same JS realm as the apphost. A hostile plugin reads anything the apphost can. |
| Deploy story | Each plugin is its own Pages site (or its own subfolder of a Pages site). Apphost stores a list of remote URLs. |
| Effort | High. Adds an experimental Vite plugin, needs careful `shared` config to avoid React-being-bundled-twice bugs, and produces a build pipeline that's noticeably more complex than "run vite build". |

**Verdict:** powerful but oversized for ≤5 plugins built by one team. The
plugin's `shared` config is also a foot-gun: if a plugin and the apphost
disagree about React's version, you get two React instances and silently
broken hooks.

### 2.2 Native ESM remote import + remote `manifest.json`

The apphost fetches a tiny `manifest.json` for each remote source, then does
`await import(/* @vite-ignore */ entryUrl)` on the plugin's ESM bundle. The
plugin exports a factory `(deps) => ({ Component })` and the apphost passes
its own `React` in via `deps`, so there's exactly one React instance.

| Aspect | Notes |
|---|---|
| Shared deps | Apphost-controlled. The factory contract makes dependency injection explicit: today `{ React }`, tomorrow whatever else we want plugins to receive (router helpers, telemetry hooks, design tokens). No bundler magic. |
| Plugin contract | One ESM file with a default-exported factory + a JSON manifest. Easy to write by hand (the POC does), easy to emit from a Vite library build. |
| WASM/.NET | The plugin's bundle resolves its assets relative to its own URL. A .NET plugin imports `dotnet.js` from `new URL('_framework/dotnet.js', import.meta.url)` — exactly the same recipe the in-tree myDATA plugin uses today, just rooted at the plugin's manifest URL instead of `BASE_URL`. Each plugin hosts its own `_framework/`. The runtime is not shared across plugins, but that's fine: the apphost loads at most one .NET plugin per session and the second one would have a different App identity anyway. |
| Versioning / discovery | First-class: the manifest carries `version`, `description`, `changelog`, `apiVersion`. The apphost validates `apiVersion` and refuses unknown values. |
| Security | Same JS realm. A hostile plugin reads window globals. Mitigation: only load from origins/paths the apphost ships in `remotePlugins.ts`. For genuinely hostile plugins, fall back to iframes (2.3). |
| Deploy story | Plugin can be co-hosted under the apphost's Pages site at a subpath (`/poc-remote-plugin/`), or hosted on a separate origin if it sets CORS headers. Co-hosting avoids CORS entirely and is the recommended default. |
| Effort | Tiny. The loader (`remotePluginLoader.ts`, ~150 lines) and a configuration file are the whole apphost-side change. |

**Verdict:** simplest, Pages-native, and the contract is explicit enough to
evolve. The factory pattern sidesteps the "two Reacts" landmine without
needing import maps or Module Federation.

### 2.3 `<iframe sandbox>` + `postMessage`

Each plugin renders in its own iframe with `sandbox="allow-scripts"`. The
apphost talks to the plugin over `postMessage` and a small message protocol.

| Aspect | Notes |
|---|---|
| Shared deps | None — by design. The plugin ships its own React. |
| Plugin contract | A plugin is a static HTML page. The apphost embeds it via `<iframe src=...>` and exchanges messages for state. |
| WASM/.NET | Trivial: the iframe document loads its own `_framework/dotnet.js` exactly like a standalone app. No coupling to the apphost. |
| Versioning / discovery | Same `manifest.json` schema works; just different `entry`. |
| Security | Strongest of the three. With `sandbox` (no `allow-same-origin`), the plugin can't touch the apphost's DOM, cookies, or `window`. `postMessage` is the only channel. Good story for third-party plugins. |
| UX integration | Worst of the three. Iframes have their own scroll/focus/clipboard quirks; styling stays inside the iframe; communicating selection or routing across the boundary needs a message contract per feature. |
| Deploy story | Identical to 2.2 — each plugin is a static site. |
| Effort | Medium for the apphost (message router, ResizeObserver-based height sync, clipboard plumbing); low per-plugin once the harness exists. |

**Verdict:** the right answer if we ever load untrusted plugins. Overkill for
fiskaltrust-internal plugins where we trust the publisher.

### 2.4 (Considered and rejected) Import map + bare ESM

Use an `<script type="importmap">` to make `react`, `react-dom`, etc.
resolvable from the plugin's source. Then the plugin can be a normal Vite
build without externalizing React.

We rejected this because (a) Vite's `import()` analysis doesn't know about
the import map, (b) it produces two-realm bugs when a plugin accidentally
bundles its own React anyway, and (c) it locks the apphost into exposing
internal modules by name forever.

## 3. Recommendation

**Adopt approach 2.2 (Native ESM remote import + `manifest.json`).**

Reasoning:

1. **Pages-friendly.** A plugin is "a folder of static files". That folder
   can live under the same Pages site (cheapest) or on a separate one (still
   trivially static). No CDN, no server-side dependency.
2. **The contract is small and explicit.** The factory pattern means the
   apphost decides what plugins receive. Today `{ React }`; tomorrow
   `{ React, telemetry, useChromeRoute }`. Each addition is a deliberate
   apphost change, not a transitive ambient dependency.
3. **One React instance, no Module Federation `shared`-config gymnastics.**
   The most painful failure mode of Module Federation (silent two-Reacts)
   is structurally impossible here.
4. **Same recipe for React-only and React + .NET WASM plugins.** The .NET
   plugin just adds a `_framework/` directory next to its `index.js`.
5. **Right-sized for ≤5 plugins.** The loader is ~150 lines. Adding Module
   Federation would be ~300 lines of build-config we'd have to maintain
   indefinitely.
6. **Iframe sandboxing is still available** as an opt-in upgrade later for
   any plugin we don't trust. The manifest schema would gain an
   `isolation: 'iframe'` field and the loader would branch — but we don't
   need that on day one.

The POC in this PR proves the path end-to-end with a hand-written ESM
plugin under `public/poc-remote-plugin/`. Replacing that with a separately-
built plugin is purely a "produce the same two files from a different
build" exercise.

## 4. Remote ESM plugin contract (apiVersion 1)

### 4.1 `manifest.json`

```jsonc
{
  // Stable plugin id. Must be unique across the apphost. Used in URLs and
  // React keys. yyyy-MM-dd suffixes are fine; spaces are not.
  "id": "poc-remote-hello",

  // Shown on the home card.
  "name": "Remote Plugin POC",
  "description": "One-paragraph plain-text description.",

  // yyyy.MM.no, matches the in-tree convention. The apphost displays this
  // as v{version} on the home card and in the tool header.
  "version": "2026.05.1",

  // Relative URL of the ESM entry, resolved against the manifest URL.
  "entry": "./index.js",

  // Optional. If present, the apphost will fetch it and show it in the
  // changelog modal. Resolved against the manifest URL.
  "changelog": "./CHANGELOG.md",

  // Loader contract version. Currently 1. Bumping this is how we evolve
  // the contract without breaking older apphosts.
  "apiVersion": 1
}
```

The schema lives in `src/apphost/remotePluginLoader.ts` as
`RemotePluginManifest`; keep them in sync.

### 4.2 Entry module (`index.js`)

The entry module must export a default function with this signature:

```ts
export default function createPlugin(deps: {
  React: typeof import('react');
}): {
  Component: React.ComponentType;
}
```

Rules:

- **Do not** `import 'react'` from inside a plugin. Use the `React` instance
  the apphost passes in. If a plugin bundles its own React, hooks and
  context will silently break.
- The factory may be `async` (return a `Promise<{ Component }>`). The loader
  wraps it in `React.lazy` so plugins are mounted at most once per session.
- The `Component` may use hooks, JSX (after building), portals, error
  boundaries, etc. — anything React 18 supports.
- For .NET WASM plugins, fetch `dotnet.js` from
  `new URL('_framework/dotnet.js', import.meta.url)` inside the factory.
  Each plugin hosts its own AppBundle. The runtime is not shared across
  plugins (see §5).

### 4.3 Manifest URL list

The apphost reads `src/apphost/remotePlugins.ts`, which exports a `readonly`
array of `RemotePluginSource` records:

```ts
export const remotePluginSources: readonly RemotePluginSource[] = [
  { manifestUrl: 'poc-remote-plugin/manifest.json' },
  // { manifestUrl: 'https://other-pages.github.io/plugin/manifest.json' },
];
```

URLs are resolved against `import.meta.env.BASE_URL` so leading `./` and no
scheme both work. Absolute URLs are allowed but require CORS on the remote
origin.

## 5. .NET WebAssembly plugins specifically

The myDATA plugin is the example in-tree today. As an out-of-tree plugin
under this design:

- Its Vite build emits `dist/index.js` (the React factory) plus a copied
  `dist/_framework/` directory (from `dotnet publish` of the WASM project).
- The plugin's `manifest.json` lives next to `dist/`, with
  `"entry": "./index.js"`.
- Inside the factory, `dotnet.js` is fetched via
  `new URL('./_framework/dotnet.js', import.meta.url)`. Because
  `import.meta.url` is the entry's URL, this resolves against the plugin's
  own subpath — never against `BASE_URL`. The apphost doesn't need to know
  the plugin uses .NET.
- Bundle size: a typical AppBundle is ~3-5 MB Brotli'd, ~30 MB uncompressed.
  GitHub Pages serves Brotli automatically for `_framework/` files when the
  client sends `Accept-Encoding: br`. The loader does not block the apphost
  on this download — it only fires when the user navigates into the plugin.

### 5.1 Runtime sharing — explicitly not done

A naive concern is "if every .NET plugin ships its own dotnet runtime, the
user downloads it N times". In practice:

- Users typically open one .NET plugin per session.
- Different plugins compile against different .NET SDK versions; sharing a
  runtime means coordinating SDK upgrades across teams.
- The .NET runtime's `dotnet.js` reads the AppBundle layout relative to
  itself; making one runtime load N AppBundles is non-trivial and
  unsupported.

If runtime sharing becomes important we can revisit by hoisting `dotnet.js`
to the apphost and exposing it via `deps`, but that should be driven by
profiling, not speculation.

## 6. Security

Approach 2.2 puts plugins in the same JS realm as the apphost. The threat
model is **"plugin author is on our team, but a typo or compromised CDN
shouldn't pwn the apphost"**:

- The `remotePluginSources` list is part of the apphost's source. A
  drive-by URL cannot inject a plugin; an attacker would have to land a
  commit. Treat that list as a security boundary in review.
- The apphost never `eval`s the manifest. It is parsed as JSON, validated
  field-by-field, and `apiVersion !== 1` is a hard reject.
- The ESM `import()` call uses the URL from a manifest that itself came
  from a vetted origin. There is no path where untrusted manifest content
  changes the URL we import from outside the manifest origin.
- Plugins can still read `localStorage`, `cookies`, and `window.fetch`. If
  we ever need to block that — for community-contributed plugins, say —
  the upgrade path is approach 2.3 (iframe sandbox) for those plugins
  specifically, opted into via the manifest. Both can coexist.

CSP: the apphost would need `script-src 'self' <plugin-origins>` if we ever
host plugins on a different origin. Pages doesn't let us set per-route CSP
headers, so the simplest path is to keep plugins on the same Pages site.

## 7. Hosting layout

Two reasonable options:

### Option A — all plugins on one Pages site (recommended)

```
https://<apphost>.pages.github.io/
├── index.html                      (the apphost)
├── assets/                          (apphost bundles)
├── poc-remote-plugin/
│   ├── manifest.json
│   ├── index.js
│   └── CHANGELOG.md
├── mydata-to-fiskaltrust/           (future, post-migration)
│   ├── manifest.json
│   ├── index.js
│   └── _framework/                 (.NET AppBundle)
└── qr-to-mydata/                    (future, post-migration)
    ├── manifest.json
    └── index.js
```

Deploy story:

- Each plugin lives in its own folder under the apphost repo (e.g.
  `src/market-gr-tools/plugins/<plugin-id>/`).
- A workflow step builds each plugin and copies its `dist/` into
  `src/market-gr-tools/dist/<plugin-id>/` before the Pages artifact is
  uploaded.
- One Pages site, no CORS, no per-plugin URL list to maintain — the
  manifest URLs are all relative.

Trade-off: a plugin redeploy still bumps the apphost's Pages site. But the
apphost itself isn't rebuilt, so the cycle is fast.

### Option B — each plugin in its own repo / Pages site

```
https://<apphost>.pages.github.io/            (apphost)
https://<mydata-plugin>.pages.github.io/      (plugin 1)
https://<qr-plugin>.pages.github.io/          (plugin 2)
```

Plugin URL list in the apphost references absolute https URLs. Each plugin
sets CORS headers (Pages does for static files served from a Pages domain
under standard `Access-Control-Allow-Origin: *`-style policies, but verify
when you adopt this).

Trade-off: each plugin redeploys independently, but the apphost has to
encode plugin URLs and we accept cross-origin loads (and the CSP that
implies).

**Recommendation:** start with Option A. Move to B per-plugin if and when
a plugin develops a release cadence the apphost can't accommodate.

## 8. Bundle-size impact

The loader code added to the apphost is small:

- `src/apphost/remotePluginLoader.ts`: ~150 lines source.
- `src/apphost/remotePlugins.ts`: ~10 lines source.
- `App.tsx` changes: ~40 added lines.

After minification + gzip this is on the order of **1.5–2 KB gzipped**
added to the apphost's main chunk. Confirmed by inspecting the `dist/`
output in §10.

The POC plugin's own bundle is **~2 KB minified** (one hand-written ESM
file with no dependencies). For a real plugin emitted by Vite library mode,
expect ~5–10 KB plus whatever the plugin's own code weighs.

## 9. Limitations and open questions

1. **CORS.** Co-hosting (Option A) sidesteps it entirely. Cross-origin
   (Option B) needs the plugin's Pages site to send permissive CORS
   headers. GitHub Pages does this for static files served from a Pages
   domain in our experience, but it's worth verifying before committing to
   Option B.
2. **CSP.** None today, but if we ever add one we'd need to allow remote
   plugin origins for `script-src`. Co-hosting sidesteps this.
3. **No HMR for remote plugins.** Plugins built out-of-tree don't get
   apphost-side hot reload. We accept this; plugins develop in their own
   `vite dev` and only the production output is consumed by the apphost.
4. **Source maps.** The loader does not currently fetch source maps for
   remote plugins. If a plugin ships them alongside `index.js`, browsers
   pick them up via the standard `//# sourceMappingURL=` comment.
5. **No retries on transient fetch failures.** A failing manifest just
   means the plugin doesn't show. Acceptable for v1; consider exponential
   backoff if we see flakiness in the field.
6. **Manifest registry.** Today the manifest URL list is in source. We
   could move it to a JSON file in `public/` so updating the catalogue
   doesn't require an apphost build, but that adds a moving part. Defer
   until we feel the pain.

## 10. Verification of the POC

The POC in this PR demonstrates:

- `src/market-gr-tools/public/poc-remote-plugin/` is a static folder with
  `manifest.json`, `index.js`, and `CHANGELOG.md`.
- `src/apphost/remotePluginLoader.ts` fetches the manifest, validates it,
  and returns a `ToolDefinition` whose `component` is a `React.lazy`.
- `src/apphost/remotePlugins.ts` registers the POC source.
- `App.tsx` renders remote plugins alongside static ones, with a "remote"
  badge.
- `tsc -b` and `NODE_ENV=production vite build` both pass.

After deploy, the home page shows three cards (mydata, qr, **poc-remote
[remote]**), and clicking the POC card renders an interactive counter
served from `poc-remote-plugin/index.js`.

## 11. Migration plan for the in-tree plugins

This PR **does not migrate** any of the in-tree plugins. It only adds the
loader. Migration is a follow-up, one plugin at a time, in this order:

### 11.1 `qr-to-mydata` (pure React, easiest)

- **Effort:** ~0.5 day.
- Move `src/tools/qr-to-mydata/` into a sibling folder under
  `src/market-gr-tools/plugins/qr-to-mydata/` with its own
  `package.json`, Vite config (library mode, single ESM entry), and
  `manifest.json`.
- The plugin already has zero non-trivial dependencies beyond `jsqr`. The
  Vite library build bundles `jsqr` into `index.js`. Externalize `react`
  (the apphost provides it via the factory).
- Add a workflow step that runs `npm run build` in the plugin folder and
  copies its `dist/` to `src/market-gr-tools/dist/qr-to-mydata/` after
  the apphost build.
- Remove the static entry from `tools.tsx`. Add `qr-to-mydata/manifest.json`
  to `remotePluginSources`.

### 11.2 `mydata-to-fiskaltrust` (React + .NET WASM, hardest)

- **Effort:** ~1–2 days.
- Move `src/tools/mydata-to-fiskaltrust/` and `plugins/MyDataConverter.Wasm/`
  under a single plugin folder. The `.csproj` already publishes a wwwroot
  AppBundle; the plugin's build copies that to `dist/_framework/`.
- Replace the existing `wasmLoader.ts` URL math: it currently uses
  `${import.meta.env.BASE_URL}mydataconverter/_framework/dotnet.js`.
  Switch to `new URL('./_framework/dotnet.js', import.meta.url).href` so
  it resolves relative to the plugin's own bundle, wherever the apphost
  loaded it from.
- Externalize `react` and `@monaco-editor/react`. Pass `React` via the
  factory; either bundle Monaco into the plugin (heavy but self-contained)
  or expose `useMonaco` as a `deps`-injected helper from the apphost.
  First pass: bundle. Optimize later if size matters.
- Verify the `dist/_framework/` copy step survives the new pipeline and
  the published Pages artifact still serves the AppBundle with Brotli.
- Remove the static `lazy()` entry from `tools.tsx`; register the plugin's
  manifest URL.

### 11.3 `vat-lookup` (pure React, just-landed)

- **Effort:** ~0.5 day, identical recipe to §11.1.
- Wait until the in-flight `vat-lookup` PR merges before migrating.

### 11.4 Cleanup

After all three are migrated:

- Delete `src/tools/`.
- Delete the static-tools branch from `tools.tsx` (leave the exported
  `ToolDefinition` type — the loader still uses it).
- Move `scripts/release.mjs`'s version-bump logic into a per-plugin npm
  script. Each plugin then owns its own changelog and version timeline,
  decoupled from the apphost.
- Consider promoting `remotePluginSources` from a TS array to a JSON file
  in `public/`, so adding a plugin to the catalogue doesn't require an
  apphost rebuild.
