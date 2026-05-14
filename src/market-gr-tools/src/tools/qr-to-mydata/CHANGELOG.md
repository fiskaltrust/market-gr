# Changelog — qr-to-mydata

All notable changes to the **QR → myDATA payload** plugin will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [Unreleased]

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- Image input via clipboard paste, drag-and-drop, and file picker.
- Local QR decoding via jsQR; the URL is shown and validated.
- Fetches AADE myDATA XML from `<url>/mydata` and opens `<url>/pdf` in a new tab.
- Hand-off to the MyData → fiskaltrust converter via sessionStorage.
