import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import * as myDataManifest from '../tools/mydata-to-fiskaltrust/manifest';
import * as vatLookupManifest from '../tools/vat-lookup/manifest';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  component: LazyExoticComponent<ComponentType>;
  /** Plugin version (yyyy.MM.no). Edited by `scripts/release.mjs`. */
  version: string;
  /** Raw CHANGELOG.md contents, imported via Vite's `?raw` suffix. */
  changelog: string;
}

export const tools: ToolDefinition[] = [
  {
    id: 'mydata-to-fiskaltrust',
    name: 'MyData → fiskaltrust ReceiptRequest',
    description:
      'Paste an AADE myDATA InvoicesDoc XML and convert it back into a fiskaltrust.Middleware ReceiptRequest JSON. Runs entirely in the browser via .NET WebAssembly.',
    component: lazy(() => import('../tools/mydata-to-fiskaltrust/MyDataToFiskaltrust')),
    version: myDataManifest.version,
    changelog: myDataManifest.changelogRaw,
  },
  {
    id: 'vat-lookup',
    name: 'VAT lookup',
    description:
      'Validate the format of a Greek (or any EU) VAT number and look it up against the public VIES service. Runs entirely in the browser — no proxy, no API key — with a graceful fallback to the official VIES web form when CORS blocks the direct fetch.',
    component: lazy(() => import('../tools/vat-lookup/VatLookup')),
    version: vatLookupManifest.version,
    changelog: vatLookupManifest.changelogRaw,
  },
];

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((t) => t.id === id);
}
