# Changelog — mydata-to-fiskaltrust

All notable changes to the **MyData → fiskaltrust ReceiptRequest** plugin will
be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme (e.g. `2026.05.1`, `2026.05.2`).

## [Unreleased]

### Changed
- Migrated out of the apphost source tree into its own plugin folder
  (`plugins/mydata-to-fiskaltrust/`) with its own Vite library build for the
  React side and a sibling `dotnet/` folder housing the `MyDataConverter.Core`
  and `MyDataConverter.Wasm` projects. The plugin is now loaded at runtime via
  the remote-ESM loader contract documented in `docs/plugin-architecture.md`.
- The shared Monaco-backed `CodeBlock` and `DiffBlock` are now injected by the
  apphost via `deps.components` rather than imported directly. Monaco no
  longer ships in this plugin's React bundle.
- `wasmLoader` now resolves `_framework/dotnet.js` via
  `new URL('./_framework/dotnet.js', import.meta.url).href` so the .NET
  AppBundle is fetched relative to the plugin's own subpath, not from
  `import.meta.env.BASE_URL`.
- Upgraded the WebAssembly runtime from .NET 9 to .NET 10.
- `cbReceiptMoment` is no longer mapped from `invoiceHeader/issueDate`; it is
  always set to the current UTC time at conversion. The middleware
  re-fiscalises "now" so the original date would be misleading.
- `cbReceiptReference` is now a fresh UUID per conversion. The pasted
  `series` + `aa` are not propagated.
- `ftReceiptCaseData.GR.Series` and `GR.AA` are no longer emitted. The GR
  middleware assigns its own series + serial when signing.
- Added a collapsible notice above the converter explaining which fields are
  intentionally not mapped, so the user can spot them up front instead of
  inferring from the diff.
- "Convert" now also posts to the middleware and surfaces the diff in one step
  — no more two-button dance. The single action validates the XSD, converts
  locally, calls `/sign`, and renders both a categorized differences summary
  ("only in pasted", "added by middleware", "values changed") plus the full
  Monaco diff against the returned `mydata-xml` signature.

### Fixed
- "Load sample" template emitted `paymentMethods` after `invoiceDetails`, which
  violates the AADE schema sequence. Reordered to
  `invoiceHeader → paymentMethods → invoiceDetails → invoiceSummary`.

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin
- AADE myDATA `InvoicesDoc` XML → fiskaltrust.Middleware `ReceiptRequest` JSON
  conversion running entirely in the browser via .NET WebAssembly
- XSD validation against AADE myDATA v1.0.12 before conversion
- Round-trip diff: sends the converted ReceiptRequest to the GR sandbox
  middleware via `/sign` and diffs the returned `mydata-xml` signature against
  the pasted input
- Plugin-level version + changelog surface in the apphost header
