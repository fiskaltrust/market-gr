# market-gr-tools

Browser-based utilities for the market-gr project, hosted at
`https://fiskaltrust.github.io/market-gr/tools/`.

The page is an apphost — a tiny React shell that lists tools and routes to
them via hash links. New tools register themselves in
[`src/apphost/tools.tsx`](src/apphost/tools.tsx).

## Tools

| ID | Description |
| --- | --- |
| `mydata-to-fiskaltrust` | Converts an AADE myDATA `InvoicesDoc` XML back into a fiskaltrust.Middleware `ReceiptRequest` JSON. Runs the existing `MyDataConverter.Core` library in the browser via .NET WebAssembly. |

## Local development

The React app loads a .NET 10 WebAssembly bundle produced by
`plugins/MyDataConverter.Wasm`. You need both pieces to run locally.

```pwsh
# 1. Build the WASM AppBundle (requires the wasm-tools workload):
dotnet workload install wasm-tools   # one-time, needs admin on Windows
dotnet publish plugins/MyDataConverter.Wasm -c Release

# 2. Copy the AppBundle into this project's public/ folder:
npm install
npm run wasm:copy

# 3. Start the dev server:
npm run dev
```

`npm run dev` serves the app at <http://localhost:5173/>. The first request
downloads the .NET runtime (~3 MB); subsequent navigations are instant.

## Production build

```pwsh
npm run build
```

Output lands in `dist/`. The base path defaults to `/market-gr/tools/` for
production builds — override with `VITE_BASE=/ npm run build` for previews.

## Adding a new tool

1. Create `src/tools/<your-tool>/<YourTool>.tsx` exporting a default React
   component.
2. Create `src/tools/<your-tool>/manifest.ts` exporting `version` (yyyy.MM.no
   string) and `changelogRaw` (`import changelog from './CHANGELOG.md?raw'`).
3. Create `src/tools/<your-tool>/CHANGELOG.md` with the standard
   [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) layout — start
   with a `## [Unreleased]` section.
4. Register the tool in `src/apphost/tools.tsx` (import the manifest and
   pass through `version` + `changelog`).
5. Link to it with `#/tools/<your-tool>`.

## Per-plugin versioning

Each plugin under `src/tools/<plugin-id>/` carries its own version + changelog
— the apphost shell itself is unversioned. Versions follow `yyyy.MM.no`
(`2026.05.1`, `2026.05.2`, …) and the active version is rendered next to the
tool title in the apphost header. Clicking the badge opens the plugin's
changelog.

The source of truth is:

- `src/tools/<plugin-id>/manifest.ts` — the `version` literal
- `src/tools/<plugin-id>/CHANGELOG.md` — Keep a Changelog format

### Changelog rule

**If your change is user-facing, add a bullet under `## [Unreleased]` in the
plugin's CHANGELOG.md in the same commit.** Internal refactors, dependency
bumps and CI tweaks don't need a changelog entry.

### Releasing a plugin

```pwsh
# List every plugin and its current version
npm run release:list

# Auto-bump: increments yyyy.MM.no within the current month, no-op when
# [Unreleased] is empty. This is what CI runs on push to main.
npm run release -- mydata-to-fiskaltrust --auto

# Pin an explicit version (must match yyyy.MM.no)
npm run release -- mydata-to-fiskaltrust 2026.06.1
```

The script rewrites `manifest.ts` (version literal) and rotates the
`[Unreleased]` section of `CHANGELOG.md` into a dated `[version]` section,
leaving a fresh empty `[Unreleased]` block on top.

On push to `main`, the Pages workflow runs `node scripts/release.mjs --auto-all`
and commits any resulting version bumps back to the branch with `[skip ci]`
before building.
