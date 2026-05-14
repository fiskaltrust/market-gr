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

The React app loads a .NET 9 WebAssembly bundle produced by
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
2. Register it in `src/apphost/tools.tsx`.
3. Link to it with `#/tools/<your-tool>`.
