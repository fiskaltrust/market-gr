# Changelog — receipt-cookbook

All notable changes to the **Receipt cookbook** plugin will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- Six built-in scenarios:
  1. Retail receipt — cash payment.
  2. Retail receipt — debit-card payment.
  3. B2B invoice (1.1) with counterpart VAT number.
  4. Refund / credit note (negative amounts + Refund flag).
  5. Receipt with tip (main PayItem + Tip-flagged PayItem).
  6. Multi-VAT-rate receipt (one charge line at 24%, one at 13%).
- Each scenario is materialized with a fresh `cbReceiptMoment` and
  `cbReceiptReference` on every generation.
- Editable JSON view backed by the apphost-injected Monaco `CodeBlock`.
- "Copy JSON" button.
- "Send to /sign" button that POSTs to the shared fiskaltrust GR
  sandbox — auth and cashbox values inlined here to keep the plugin
  contract narrow (no import across plugin boundaries).
