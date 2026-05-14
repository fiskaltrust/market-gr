/**
 * Plugin manifest for `qr-to-mydata`.
 *
 * The `version` literal is rewritten by `scripts/release.mjs` — keep it as a
 * single-quoted string on its own line so the release script's regex can
 * find and patch it without disturbing surrounding code.
 */
import changelog from './CHANGELOG.md?raw';

export const version = '2026.05.1';
export const changelogRaw = changelog;
