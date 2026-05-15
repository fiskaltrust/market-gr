# Changelog — qr-to-mydata

All notable changes to the **QR → myDATA payload** plugin will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [Unreleased]

### Changed
- Migrated out of the apphost source tree into its own plugin folder
  (`plugins/qr-to-mydata/`) with its own Vite library build. The plugin is now
  loaded at runtime via the remote-ESM loader contract documented in
  `docs/plugin-architecture.md`.
- The shared Monaco-backed `CodeBlock` is now injected by the apphost via
  `deps.components.CodeBlock` rather than imported directly. Monaco no longer
  ships in this plugin's bundle.
- The hand-off to the MyData → fiskaltrust converter now drives navigation by
  setting `window.location.hash` directly instead of importing the apphost's
  router helper — the plugin contract stays narrow.

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- Image input via clipboard paste, drag-and-drop, and file picker.
- Local QR decoding via jsQR; the URL is shown and validated.
- Fetches AADE myDATA XML from `<url>/mydata` and opens `<url>/pdf` in a new tab.
- Hand-off to the MyData → fiskaltrust converter via sessionStorage.
