import { useEffect, useRef, useState } from 'react';
import { loadConverter } from './wasmLoader';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<InvoicesDoc xmlns="http://www.aade.gr/myDATA/invoice/v1.0">
  <invoice>
    <invoiceHeader>
      <series>A</series>
      <aa>1</aa>
      <issueDate>2024-01-15</issueDate>
      <invoiceType>11.1</invoiceType>
      <currency>EUR</currency>
    </invoiceHeader>
    <invoiceDetails>
      <lineNumber>1</lineNumber>
      <quantity>2</quantity>
      <itemDescr>Sample item</itemDescr>
      <netValue>100.00</netValue>
      <vatCategory>1</vatCategory>
      <vatAmount>24.00</vatAmount>
    </invoiceDetails>
    <paymentMethods>
      <type>3</type>
      <amount>124.00</amount>
    </paymentMethods>
    <invoiceSummary>
      <totalNetValue>100.00</totalNetValue>
      <totalVatAmount>24.00</totalVatAmount>
      <totalWithheldAmount>0</totalWithheldAmount>
      <totalFeesAmount>0</totalFeesAmount>
      <totalStampDutyAmount>0</totalStampDutyAmount>
      <totalOtherTaxesAmount>0</totalOtherTaxesAmount>
      <totalDeductionsAmount>0</totalDeductionsAmount>
      <totalGrossValue>124.00</totalGrossValue>
    </invoiceSummary>
  </invoice>
</InvoicesDoc>
`;

type ConverterState =
  | { kind: 'loading' }
  | { kind: 'ready'; convert: (xml: string) => string }
  | { kind: 'error'; message: string };

export default function MyDataToFiskaltrust() {
  const [converter, setConverter] = useState<ConverterState>({ kind: 'loading' });
  const [xml, setXml] = useState(SAMPLE_XML);
  const [output, setOutput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const outputRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConverter()
      .then((convert) => {
        if (!cancelled) setConverter({ kind: 'ready', convert });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setConverter({
            kind: 'error',
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runConvert = () => {
    if (converter.kind !== 'ready') return;
    setErrorText(null);
    try {
      const json = converter.convert(xml);
      setOutput(json);
    } catch (err: unknown) {
      setErrorText(err instanceof Error ? err.message : String(err));
      setOutput('');
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={runConvert} disabled={converter.kind !== 'ready'}>
          Convert
        </button>
        <button className="btn btn-secondary" onClick={() => setXml(SAMPLE_XML)}>
          Load sample
        </button>
        <button className="btn btn-secondary" onClick={() => { setXml(''); setOutput(''); setErrorText(null); }}>
          Clear
        </button>
        <button className="btn btn-secondary" onClick={copyOutput} disabled={!output}>
          Copy JSON
        </button>
        <span className="status" style={{ marginLeft: 'auto' }}>
          {converter.kind === 'loading' && 'Loading .NET runtime…'}
          {converter.kind === 'ready' && 'Ready'}
          {converter.kind === 'error' && (
            <span className="status error">Runtime failed: {converter.message}</span>
          )}
        </span>
      </div>

      <div className="converter-grid">
        <div className="editor">
          <div className="editor-header">
            <span>InvoicesDoc XML</span>
            <span>{xml.length.toLocaleString()} chars</span>
          </div>
          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            spellCheck={false}
            placeholder="Paste your AADE myDATA InvoicesDoc XML here…"
          />
        </div>

        <div className="editor">
          <div className="editor-header">
            <span>fiskaltrust ReceiptRequest JSON</span>
            <span>{output.length.toLocaleString()} chars</span>
          </div>
          <pre ref={outputRef}>{errorText ? `// Error\n${errorText}` : output || '// click Convert'}</pre>
        </div>
      </div>
    </>
  );
}
