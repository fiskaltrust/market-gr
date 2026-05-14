# Changelog — vat-lookup

All notable changes to the **VAT lookup** plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [Unreleased]

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- Client-side VAT number format validation for all 27 EU member states
  (Greek/EL VAT numbers are the primary target).
- Attempts a live lookup against the public VIES REST API
  (`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{cc}/vat/{vat}`)
  and renders the returned name + address when the browser permits it.
- Detects CORS-blocked responses and falls back to a "Look up at VIES"
  deep-link the user can click. No server-side proxy is introduced.
- In-memory cache of successful lookups so the same VAT number doesn't hit
  the network twice in the same session.
- Raw JSON response is exposed under a collapsible details element via the
  shared Monaco-backed `CodeBlock` viewer.
