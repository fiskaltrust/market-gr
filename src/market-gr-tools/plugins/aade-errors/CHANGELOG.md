# Changelog — aade-errors

All notable changes to the **AADE error codes** plugin will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions use the `yyyy.MM.no` scheme.

## [2026.05.1] - 2026-05-14

### Added
- Initial release of the plugin.
- 30 hand-curated AADE myDATA rejection codes covering the most common
  validation, authorisation, schema, and business-rule rejections.
  Codes are sourced from:
  - the published myDATA API documentation (v1.0.9 ERP),
  - the forum-confirmed validation-error list at
    `metafuture.biz/metafuture/mydata_help_err.php`, and
  - the `firebed/aade-mydata` open-source SDK error catalogue.
- Free-text search across code, message, and category.
- "Paste an AADE response" textarea that extracts every `errorCode`
  element from a pasted XML response and highlights the matching rows.
- Click a row to reveal a longer cause/fix description.
