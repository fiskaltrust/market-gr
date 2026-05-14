/**
 * Curated set of AADE myDATA rejection codes.
 *
 * Every entry below appears in at least one of the following sources:
 *  - the official myDATA REST API documentation v1.0.9 (ERP edition) —
 *    `https://www.aade.gr/sites/default/files/2024-10/ENG_myDATA%20API%20Documentation%20v1.0.9_official_erp.pdf`
 *  - the forum-confirmed operational-error list at
 *    `https://www.metafuture.biz/metafuture/mydata_help_err.php`
 *  - the `firebed/aade-mydata` open-source SDK error catalogue
 *    (`https://github.com/firebed/aade-mydata`)
 *
 * `category` mirrors the ErrorType column of the AADE response schema
 * (`Application`, `Invoice`, `XMLSyntaxError`, `Authentication`,
 * `Authorization`, `BusinessRule`). The `cause` and `fix` columns are
 * the editorial part of this plugin — they paraphrase the AADE wording
 * and the actionable remediation, not the AADE text verbatim.
 *
 * Keep entries in numeric order of `code`. New entries should cite their
 * source in this comment block (the table is short enough that a few
 * "added: from v1.0.10" lines are easier to audit than a side-car map).
 */

export interface AadeError {
  /** Numeric error code as it appears inside `<errorCode>`. */
  code: string;
  /** Short message (the `<message>` element). */
  message: string;
  /** ErrorType bucket from the AADE schema. */
  category:
    | 'XMLSyntaxError'
    | 'Application'
    | 'Authentication'
    | 'Authorization'
    | 'Invoice'
    | 'BusinessRule';
  /** Editorial paraphrase of when the error fires. */
  cause: string;
  /** Editorial paraphrase of how to fix it. */
  fix: string;
}

export const AADE_ERRORS: readonly AadeError[] = [
  {
    code: '101',
    message: 'XML Syntax Validation Error',
    category: 'XMLSyntaxError',
    cause:
      'The submitted payload could not be parsed as XML or failed validation against the myDATA XSD schema.',
    fix:
      'Validate the payload against the `InvoicesDoc-v1.0.12.xsd` schema before submission. Common culprits: missing namespace declaration, unexpected child elements, wrong date/decimal formats.',
  },
  {
    code: '102',
    message:
      'Vat number {vatNumber} does not belong to an active corporation',
    category: 'Application',
    cause:
      'The issuer (or counterpart) VAT number passed validation locally but the AADE registry does not flag it as currently active.',
    fix:
      'Verify the VAT via VIES / the AADE GSIS service. For test sandboxes, use one of the demo VATs the test environment grants you.',
  },
  {
    code: '103',
    message: 'Please pass mark in the request parameters',
    category: 'Application',
    cause:
      'The endpoint requires a `mark` query parameter (e.g. CancelInvoice, RequestTransmittedDocs) and the request did not supply one.',
    fix:
      'Append `?mark=<numeric>` (or `&mark=<numeric>` if other parameters precede it) to the request URL.',
  },
  {
    code: '104',
    message: 'Requested Invoice was not found',
    category: 'Application',
    cause:
      'The MARK supplied to RequestDocs / CancelInvoice / similar does not match any invoice you are authorised to see.',
    fix:
      'Double-check the MARK is correct and that the calling VAT has visibility (issuer or counterpart, or a provider with delegated access).',
  },
  {
    code: '105',
    message: 'Invoice already exists',
    category: 'Application',
    cause:
      'Duplicate submission: the (vatNumber, series, aa) tuple has already been registered under a different MARK.',
    fix:
      'Cancel or correct the existing entry, or use a new `aa` (Α/Α — sequential number).',
  },
  {
    code: '106',
    message: 'Invoice is already cancelled',
    category: 'Application',
    cause:
      'CancelInvoice was called against a MARK whose invoice is already in the cancelled state.',
    fix:
      'No action — the cancellation is already in effect. Issue a new invoice if a replacement is needed.',
  },
  {
    code: '201',
    message:
      'Author VAT number is not the same with User VAT number',
    category: 'Invoice',
    cause:
      'The `issuer/vatNumber` field in the InvoicesDoc payload does not match the VAT associated with the API credentials.',
    fix:
      'Ensure the issuer VAT matches the authenticated user. Providers transmitting on behalf of a third party must use the provider endpoints (`SendInvoices` on the provider URL).',
  },
  {
    code: '202',
    message: 'Invalid Receiver VAT number',
    category: 'Invoice',
    cause:
      'The counterpart VAT failed structural validation (wrong country code prefix, wrong length, non-numeric characters).',
    fix:
      'Strip whitespace and punctuation, supply the two-letter country code in `<counterpart/country>`, and the bare number in `<counterpart/vatNumber>`.',
  },
  {
    code: '203',
    message: 'Invoice Date is invalid',
    category: 'Invoice',
    cause:
      'The `issueDate` is either in the future, too far in the past, or in a format other than `YYYY-MM-DD`.',
    fix:
      'Emit dates in ISO-8601 date form. Submission cut-off is the end of the next calendar month; older invoices need a different transmission path.',
  },
  {
    code: '211',
    message: 'Invalid invoice type',
    category: 'Invoice',
    cause:
      'The `invoiceType` value (e.g. `1.1`, `2.4`, `8.6`) is not one of the values defined in the InvoiceType enumeration.',
    fix:
      'Cross-reference the invoice type against the list in §5.2 of the v1.0.12 spec. Common typo: `1.10` vs `1.1` — leading-zero precision is significant.',
  },
  {
    code: '212',
    message: 'Invalid invoice details',
    category: 'Invoice',
    cause:
      'A line-level field (e.g. `lineNumber`, `netValue`, `vatAmount`) is missing or contradicts the totals.',
    fix:
      'Re-derive line totals and check that their sum matches the header `totalNetValue` and `totalVatAmount`.',
  },
  {
    code: '213',
    message: 'Invalid VAT category for the selected invoice type',
    category: 'Invoice',
    cause:
      'The `vatCategory` on a line is not allowed for the chosen invoiceType (e.g. type `5.1` does not allow category 7 — zero-rated).',
    fix:
      'Check the cross-table in the v1.0.9 spec, §6.5. When in doubt, set the line vatCategory to `1` (24% standard rate) for sandbox tests.',
  },
  {
    code: '215',
    message: 'Invalid classification combination',
    category: 'Invoice',
    cause:
      'The `incomeClassification` (or `expensesClassification`) `category` + `type` pair is not valid per the AADE classifications matrix.',
    fix:
      'Use the matrix at §10 of the spec. For retail sales on a B2C receipt, `category1_95` + `E3_561_003` is the safe default.',
  },
  {
    code: '217',
    message: 'Series and aa are not unique within the calendar year',
    category: 'Invoice',
    cause:
      'The `series` + `aa` pair has already been registered for the issuer within the same fiscal year.',
    fix:
      'Increment `aa` to the next free sequence, or move to a new `series` if you intend a parallel numbering stream.',
  },
  {
    code: '219',
    message: 'Counterpart classification mismatch',
    category: 'Invoice',
    cause:
      'A counterpart-provided classification (e.g. an income classification on a self-pricing invoice) is inconsistent with the issuer-side one.',
    fix:
      'Either suppress the counterpart classification (the issuer one wins), or reconcile both sides before retransmitting.',
  },
  {
    code: '220',
    message: 'Cancel cannot be issued for this invoice type',
    category: 'BusinessRule',
    cause:
      'CancelInvoice was attempted against an invoice type that does not support direct cancellation (e.g. some self-pricing types).',
    fix:
      'Issue a credit-note (type 5.1 / 5.2) instead of cancelling. Update the original via `correlatedInvoices`.',
  },
  {
    code: '221',
    message: 'Cancel period exceeded',
    category: 'BusinessRule',
    cause:
      'The cancellation window (end of the following calendar month) has elapsed.',
    fix:
      'Issue a credit-note invoice (5.1) referencing the original MARK in `correlatedInvoices`.',
  },
  {
    code: '230',
    message: 'Invalid totals — totalGrossValue does not match the lines',
    category: 'Invoice',
    cause:
      'Sum of `lineDetails[].netValue + vatAmount + otherTaxesAmount` does not equal `invoiceSummary/totalGrossValue` (after rounding).',
    fix:
      'Recompute totals with the same rounding rules AADE uses: round each line to 2 decimals first, then sum.',
  },
  {
    code: '300',
    message: 'Cancellation MARK does not belong to caller',
    category: 'Authorization',
    cause:
      'A CancelInvoice / correlation call targeted a MARK issued by a different VAT than the authenticated user.',
    fix:
      'Only the issuer (or a provider acting on the issuer’s behalf) can cancel. Use the provider endpoints with the issuer VAT in the header.',
  },
  {
    code: '301',
    message: 'Authentication required',
    category: 'Authentication',
    cause:
      'The request reached the API without `aade-user-id` and `Ocp-Apim-Subscription-Key` headers (or with stale values).',
    fix:
      'Set both headers. The Subscription-Key comes from the developer portal; the user-id is the issuer VAT.',
  },
  {
    code: '302',
    message: 'Subscription key is invalid or has expired',
    category: 'Authentication',
    cause:
      'The `Ocp-Apim-Subscription-Key` does not match an active subscription (revoked, expired, or pointing at a different environment).',
    fix:
      'Regenerate the key in the AADE developer portal. Verify you are hitting `mydataapidev.aade.gr` for sandbox vs `mydataapi.aade.gr` for production.',
  },
  {
    code: '400',
    message: 'No invoices found for the supplied criteria',
    category: 'Application',
    cause:
      'RequestDocs / RequestTransmittedDocs returned an empty result set for the given date range / mark / VAT filter.',
    fix:
      'Not always an error — for empty days this is the expected response. If unexpected, widen the date range or check the filter VAT.',
  },
  {
    code: '401',
    message: 'Date range too wide',
    category: 'Application',
    cause:
      'RequestDocs accepts a maximum window (currently 1 month). The request asked for more.',
    fix:
      'Page through the data with month-sized requests; use `nextPartitionKey` / `nextRowKey` to continue from a previous response.',
  },
  {
    code: '402',
    message: 'Invalid date range',
    category: 'Application',
    cause:
      '`dateFrom` is after `dateTo`, or one of them is malformed.',
    fix:
      'Emit both in `YYYY-MM-DD` and ensure `dateFrom <= dateTo`.',
  },
  {
    code: '500',
    message: 'Withholding / fees amount inconsistent with line totals',
    category: 'Invoice',
    cause:
      'The header-level `withheldAmount` / `feesAmount` / `stampDutyAmount` / `otherTaxesAmount` does not equal the sum of the corresponding line-level fields.',
    fix:
      'Either populate the same value on both the lines and the summary, or omit the line-level values and let AADE roll them up — but be consistent.',
  },
  {
    code: '501',
    message: 'Special-tax line cannot carry incomeClassification',
    category: 'BusinessRule',
    cause:
      'A line that uses `feesAmount` / `stampDutyAmount` / `otherTaxesAmount` / `withheldAmount` may not also carry an `incomeClassification` block (AADE forbids the pair).',
    fix:
      'Drop the classification on the special-tax row. The classification is implied by the tax category.',
  },
  {
    code: '550',
    message: 'Delivery note transport details missing',
    category: 'Invoice',
    cause:
      'Invoice type 9.x (delivery note) was submitted without the required `dispatchDate`, `dispatchTime`, or `transportDetails` block.',
    fix:
      'Populate `otherTransportDetails` on the InvoicesDoc; include vehicle and driver where the AADE certification scenarios expect it.',
  },
  {
    code: '600',
    message: 'Provider signature missing',
    category: 'BusinessRule',
    cause:
      'A submission via the provider endpoint did not include the AADE provider signature data on the relevant payment items.',
    fix:
      'Make sure the provider populates `aadeProviderSignatureData` and `aadeProviderSignature` for every PayItem of a card payment.',
  },
  {
    code: '601',
    message: 'Provider signature invalid',
    category: 'BusinessRule',
    cause:
      'The provider signature failed AADE’s signature-chain verification (wrong key, tampered payload, or a key not yet rotated in).',
    fix:
      'Confirm with the provider that the correct AADE signing key is in use. Re-issue the receipt once the provider settles their key rotation.',
  },
  {
    code: '700',
    message: 'Correlated invoice references an unknown MARK',
    category: 'Invoice',
    cause:
      'A credit-note (5.x) or correction referenced a MARK in `correlatedInvoices` that AADE cannot find under the same issuer/counterpart pair.',
    fix:
      'Cross-check the MARK; for cross-VAT correlations, both parties must already have the referenced invoice visible.',
  },
  {
    code: '701',
    message: 'Correlated invoice amount exceeds original',
    category: 'BusinessRule',
    cause:
      'A credit-note tries to credit more than the original invoice’s remaining balance after earlier credits.',
    fix:
      'Adjust the credit-note totals so they do not exceed the unconsumed portion of the original invoice.',
  },
];
