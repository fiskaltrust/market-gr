# market-gr-tools

Browser-based utilities for the market-gr project, hosted at
`https://fiskaltrust.github.io/market-gr/tools/`.

The page is an apphost — a tiny React shell that fetches a list of remote
ESM plugins at boot, loads each plugin's `manifest.json`, and renders a card
per plugin. Every tool is now a standalone Vite library build that ships its
own `index.js`; the apphost is just the shell. See
[`docs/plugin-architecture.md`](docs/plugin-architecture.md) for the loader
contract.

## Plugins

The plugin catalogue lives in
[`public/plugins/index.json`](public/plugins/index.json). Each entry points
at a `manifest.json` under `public/plugins/<id>/`. Today's plugins:

| ID | Description |
| --- | --- |
| `mydata-to-fiskaltrust` | Converts an AADE myDATA `InvoicesDoc` XML back into a fiskaltrust.Middleware `ReceiptRequest` JSON. Runs the existing `MyDataConverter.Core` library in the browser via .NET WebAssembly. |
| `qr-to-mydata` | Decodes a Greek receipt QR locally, fetches the AADE myDATA XML / PDF for the encoded URL, and hands the XML off to the converter. |
| `vat-lookup` | Validates the format of an EU VAT number and looks it up against the public VIES service. |
| `aade-qr-renderer` | Builds the canonical AADE myDATA receipt URL from an invoice MARK and renders the QR locally. |

## Local development

The apphost depends on each plugin being staged under `public/plugins/<id>/`
before `vite dev` or `vite build` runs. For a full local build of every
plugin in the tree:

```pwsh
# 1. Install the apphost's deps:
npm install

# 2. Build the .NET WASM AppBundle (one-time setup + per-rebuild publish):
dotnet workload install wasm-tools   # one-time, needs admin on Windows
dotnet publish plugins/mydata-to-fiskaltrust/dotnet/MyDataConverter.Wasm -c Release -o ../../../artifacts/wasm

# 3. Build each plugin and stage it under public/plugins/<id>/:
(cd plugins/qr-to-mydata && npm ci && npm run build)
node scripts/copy-plugin.mjs qr-to-mydata

(cd plugins/vat-lookup && npm ci && npm run build)
node scripts/copy-plugin.mjs vat-lookup

(cd plugins/mydata-to-fiskaltrust && npm ci && npm run build)
node scripts/copy-plugin.mjs mydata-to-fiskaltrust
cp -R ../../artifacts/wasm/wwwroot/. public/plugins/mydata-to-fiskaltrust/

(cd plugins/aade-qr-renderer && npm ci && npm run build)
node scripts/copy-plugin.mjs aade-qr-renderer

# 4. Start the dev server:
npm run dev
```

`npm run dev` serves the app at <http://localhost:5173/>. The first time the
mydata plugin is opened, the browser downloads the .NET runtime (~3 MB);
subsequent navigations are instant.

The GitHub Pages workflow does the same dance end-to-end —
[`.github/workflows/tools-pages.yml`](../../.github/workflows/tools-pages.yml)
is the canonical reference.

## Production build

```pwsh
npm run build
```

Output lands in `dist/`. The base path defaults to `/market-gr/tools/` for
production builds — override with `VITE_BASE=/ npm run build` for previews.

## Adding a new tool

1. Create `plugins/<your-tool>/` with the standard plugin layout:

   ```
   plugins/<your-tool>/
   ├── package.json        # type=module, scripts.build = tsc -b && vite build
   ├── tsconfig.json
   ├── vite.config.ts      # library mode, classic JSX, externalised react
   ├── manifest.json       # id, name, description, version, entry, apiVersion
   ├── CHANGELOG.md        # Keep a Changelog with an [Unreleased] section
   └── src/
       └── index.tsx       # default export: (deps) => ({ Component })
   ```

   Copy the layout from `plugins/qr-to-mydata/` and adapt — that's the
   smallest pure-React example.

2. Add a line to `public/plugins/index.json` pointing at the new
   `manifest.json`.

3. Add a build + stage pair of steps to
   `.github/workflows/tools-pages.yml`:

   ```yaml
   - name: Build <your-tool> plugin
     working-directory: src/market-gr-tools/plugins/<your-tool>
     run: |
       npm ci
       npm run build

   - name: Stage <your-tool> plugin into public/
     working-directory: src/market-gr-tools
     run: node scripts/copy-plugin.mjs <your-tool>
   ```

4. Link to it with `#/tools/<your-tool>`.

The apphost itself does not need to be rebuilt to add a plugin — only the
Pages workflow needs to know how to build the plugin's static assets. Once
deployed, the plugin shows up next time the apphost is opened.

## Per-plugin versioning

Each plugin under `plugins/<plugin-id>/` carries its own version + changelog
— the apphost shell itself is unversioned. Versions follow `yyyy.MM.no`
(`2026.05.1`, `2026.05.2`, …) and the active version is rendered next to the
tool title in the apphost header. Clicking the badge opens the plugin's
changelog.

The source of truth is:

- `plugins/<plugin-id>/manifest.json` — the `version` field
- `plugins/<plugin-id>/CHANGELOG.md` — Keep a Changelog format

### Changelog rule

**If your change is user-facing, add a bullet under `## [Unreleased]` in the
plugin's CHANGELOG.md in the same commit.** Internal refactors, dependency
bumps and CI tweaks don't need a changelog entry.
