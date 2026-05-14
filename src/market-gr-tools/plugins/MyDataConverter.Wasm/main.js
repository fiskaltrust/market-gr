// The React apphost (src/market-gr-tools) bootstraps the runtime itself
// using the dotnet.js shipped next to this file. This file is required by
// Microsoft.NET.Sdk.WebAssembly but intentionally does nothing on its own.
import { dotnet } from './_framework/dotnet.js';

await dotnet.create();
