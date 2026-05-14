# Changelog — mydata-to-fiskaltrust

All notable changes to the **MyData → fiskaltrust ReceiptRequest** plugin will
be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme (e.g. `2026.05.1`, `2026.05.2`).

## [Unreleased]

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
