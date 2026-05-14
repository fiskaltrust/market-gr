import { type ComponentType, type LazyExoticComponent } from 'react';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  component: LazyExoticComponent<ComponentType>;
  /** Plugin version (yyyy.MM.no). Edited by `scripts/release.mjs`. */
  version: string;
  /** Raw CHANGELOG.md contents. */
  changelog: string;
}

/**
 * The static `tools` array is now empty — every in-tree plugin has been
 * migrated to a remote-ESM plugin (see `remotePlugins.ts`). The exported
 * `ToolDefinition` type is still used by the remote loader and by `App.tsx`.
 *
 * The array itself stays (empty) until the Phase 4 cleanup removes the
 * static-tools code path from `App.tsx`. Keeping it around for one
 * intermediate commit means Phase 3 is a pure migration with no apphost
 * code restructuring on top.
 */
export const tools: ToolDefinition[] = [];

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((t) => t.id === id);
}
