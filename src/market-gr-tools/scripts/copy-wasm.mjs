#!/usr/bin/env node
/**
 * Copies the .NET WASM AppBundle produced by src/MyDataConverter.Wasm into
 * src/market-gr-tools/public/mydataconverter so that Vite picks it up as a
 * static asset. Override the source path with WASM_APPBUNDLE.
 */
import { existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');
const defaultBundle = resolve(
  repoRoot,
  'src',
  'MyDataConverter.Wasm',
  'bin',
  'Release',
  'net9.0',
  'browser-wasm',
  'AppBundle',
);

const source = process.env.WASM_APPBUNDLE
  ? resolve(process.env.WASM_APPBUNDLE)
  : defaultBundle;
const destination = resolve(here, '..', 'public', 'mydataconverter');

if (!existsSync(source)) {
  console.error(`[copy-wasm] source not found: ${source}`);
  console.error('[copy-wasm] build the WASM project first:');
  console.error('  dotnet publish src/MyDataConverter.Wasm -c Release');
  process.exit(1);
}

if (existsSync(destination)) {
  rmSync(destination, { recursive: true, force: true });
}
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
console.log(`[copy-wasm] copied ${source} -> ${destination}`);
