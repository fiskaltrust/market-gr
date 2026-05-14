import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  component: LazyExoticComponent<ComponentType>;
}

export const tools: ToolDefinition[] = [
  {
    id: 'mydata-to-fiskaltrust',
    name: 'MyData → fiskaltrust ReceiptRequest',
    description:
      'Paste an AADE myDATA InvoicesDoc XML and convert it back into a fiskaltrust.Middleware ReceiptRequest JSON. Runs entirely in the browser via .NET WebAssembly.',
    component: lazy(() => import('../tools/mydata-to-fiskaltrust/MyDataToFiskaltrust')),
  },
];

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((t) => t.id === id);
}
