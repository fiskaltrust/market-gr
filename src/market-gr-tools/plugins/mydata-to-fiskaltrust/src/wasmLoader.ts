/**
 * Loads the MyDataConverter .NET WebAssembly runtime once and exposes the
 * Convert(xml) and Validate(xml) exports.
 *
 * The .NET AppBundle is staged alongside this plugin's `index.js` by the
 * apphost's build pipeline (see `scripts/copy-plugin.mjs`). We resolve
 * `dotnet.js` from a URL relative to **this module** so it works no matter
 * what subpath the apphost mounted the plugin under — i.e. exactly the
 * pattern documented in docs/plugin-architecture.md §5.
 */

interface DotnetRuntime {
  getConfig: () => { mainAssemblyName: string };
  getAssemblyExports: (assemblyName: string) => Promise<DotnetExports>;
}

interface DotnetExports {
  MyDataConverter: {
    Wasm: {
      Interop: {
        Convert(xml: string): string;
        Validate(xml: string): string;
      };
    };
  };
}

type DotnetEntry = {
  create(): Promise<DotnetRuntime>;
  withApplicationArguments(...args: string[]): DotnetEntry;
};

export interface ValidationIssue {
  severity: 'error' | 'warning';
  line: number;
  column: number;
  message: string;
}

export interface ConverterApi {
  convert: (xml: string) => string;
  validate: (xml: string) => ValidationIssue[];
}

let runtimePromise: Promise<ConverterApi> | null = null;

export function loadConverter(): Promise<ConverterApi> {
  if (!runtimePromise) {
    runtimePromise = initialize();
  }
  return runtimePromise;
}

async function initialize(): Promise<ConverterApi> {
  // `import.meta.url` is the URL of this plugin's `index.js` after the
  // apphost imports it. `_framework/` is staged next to that file by
  // copy-plugin.mjs, so the relative resolution lines up regardless of where
  // the plugin is mounted (`/plugins/mydata-to-fiskaltrust/` today, anywhere
  // tomorrow).
  const dotnetUrl = new URL(/* @vite-ignore */ './_framework/dotnet.js', import.meta.url).href;
  const mod = (await import(/* @vite-ignore */ dotnetUrl)) as { dotnet: DotnetEntry };

  const runtime = await mod.dotnet.withApplicationArguments().create();
  const config = runtime.getConfig();
  const exports = await runtime.getAssemblyExports(config.mainAssemblyName);
  return {
    convert: (xml) => exports.MyDataConverter.Wasm.Interop.Convert(xml),
    validate: (xml) =>
      JSON.parse(exports.MyDataConverter.Wasm.Interop.Validate(xml)) as ValidationIssue[],
  };
}
