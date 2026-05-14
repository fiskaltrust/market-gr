/**
 * Loads the MyDataConverter .NET WebAssembly runtime once and exposes the
 * Convert(xml) export. The .NET runtime is large (~3 MB), so we memoize the
 * promise to make sure it's only created once even under React StrictMode
 * double-mounts.
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
      };
    };
  };
}

type DotnetEntry = {
  create(): Promise<DotnetRuntime>;
  withApplicationArguments(...args: string[]): DotnetEntry;
};

let runtimePromise: Promise<(xml: string) => string> | null = null;

export function loadConverter(): Promise<(xml: string) => string> {
  if (!runtimePromise) {
    runtimePromise = initialize();
  }
  return runtimePromise;
}

async function initialize(): Promise<(xml: string) => string> {
  const dotnetUrl = `${import.meta.env.BASE_URL}mydataconverter/_framework/dotnet.js`;
  const mod = (await import(/* @vite-ignore */ dotnetUrl)) as { dotnet: DotnetEntry };

  const runtime = await mod.dotnet.withApplicationArguments().create();
  const config = runtime.getConfig();
  const exports = await runtime.getAssemblyExports(config.mainAssemblyName);
  return (xml) => exports.MyDataConverter.Wasm.Interop.Convert(xml);
}
