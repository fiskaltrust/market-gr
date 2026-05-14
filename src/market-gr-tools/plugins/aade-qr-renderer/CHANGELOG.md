# Changelog — aade-qr-renderer

All notable changes to the **AADE QR renderer** plugin will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- Inputs for invoice MARK (required), issuer UID (optional), and
  authenticationCode (optional). Builds the canonical AADE
  `www1.aade.gr/saadeapps2/bookkeeper-web/qr/<mark>/<authcd>` URL —
  the format the AADE Search portal accepts — and exposes it for copy.
- Alternative "paste a URL" mode that renders any free-form
  `downloadingInvoiceUrl` returned by an E-invoicing provider as a QR.
- Renders the encoded URL as an inline SVG QR code via the `qrcode`
  package — no external image fetch, works offline.
- "Open in AADE portal" link for one-click verification.
- "Download SVG" / "Download PNG" buttons so the rendered QR can be
  embedded in printed receipt templates.
