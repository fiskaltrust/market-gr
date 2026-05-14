import { useEffect, useState } from 'react';
import { loadConverter, type ConverterApi, type ValidationIssue } from './wasmLoader';
import { DiffView } from './DiffView';
import {
  type MiddlewareResponse,
  extractMyDataXmlFromSignResponse,
  signReceipt,
} from './middleware';
import { type DiffResult, diffXml } from './xmlDiff';

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
      <itemDescr>Sample item</itemDescr>
      <quantity>2</quantity>
      <netValue>100.00</netValue>
      <vatCategory>1</vatCategory>
      <vatAmount>24.00</vatAmount>
    </invoiceDetails>
    <paymentMethods>
      <paymentMethodDetails>
        <type>3</type>
        <amount>124.00</amount>
        <paymentMethodInfo>Cash</paymentMethodInfo>
      </paymentMethodDetails>
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
  | { kind: 'ready'; api: ConverterApi }
  | { kind: 'error'; message: string };

interface ValidationState {
  busy: boolean;
  signResponse?: MiddlewareResponse;
  signError?: string;
  generatedXml?: string;
  diff?: DiffResult;
}

export default function MyDataToFiskaltrust() {
  const [converter, setConverter] = useState<ConverterState>({ kind: 'loading' });
  const [xml, setXml] = useState(SAMPLE_XML);
  const [output, setOutput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [xsdIssues, setXsdIssues] = useState<ValidationIssue[] | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ busy: false });

  useEffect(() => {
    let cancelled = false;
    loadConverter()
      .then((api) => {
        if (!cancelled) setConverter({ kind: 'ready', api });
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
    setValidation({ busy: false });
    try {
      setXsdIssues(converter.api.validate(xml));
    } catch (err: unknown) {
      // Validation failure shouldn't block conversion — surface it but proceed.
      setXsdIssues([
        { severity: 'error', line: 0, column: 0, message: err instanceof Error ? err.message : String(err) },
      ]);
    }
    try {
      const json = converter.api.convert(xml);
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

  const sendToMiddleware = async () => {
    if (!output) return;
    setValidation({ busy: true });
    try {
      const signResponse = await signReceipt(output);
      const generatedXml = signResponse.ok
        ? extractMyDataXmlFromSignResponse(signResponse.body)
        : null;
      const diff = generatedXml ? diffXml(xml, generatedXml) : undefined;
      setValidation({
        busy: false,
        signResponse,
        generatedXml: generatedXml ?? undefined,
        diff,
      });
    } catch (err: unknown) {
      setValidation({
        busy: false,
        signError: err instanceof Error ? err.message : String(err),
      });
    }
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
        <button className="btn btn-secondary" onClick={() => { setXml(''); setOutput(''); setErrorText(null); setValidation({ busy: false }); setXsdIssues(null); }}>
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
          <pre>{errorText ? `// Error\n${errorText}` : output || '// click Convert'}</pre>
        </div>
      </div>

      {xsdIssues && <XsdIssuesPanel issues={xsdIssues} />}

      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Validate against the Greek Middleware</h3>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 12px' }}>
          Sends the converted ReceiptRequest to the shared GR sandbox cashbox via <code>/sign</code>.
          The middleware attaches the generated AADE InvoicesDoc as a <code>mydata-xml</code>
          signature on the response — we pull it from there and diff against the XML you pasted.
        </p>

        <div className="toolbar">
          <button
            className="btn"
            onClick={sendToMiddleware}
            disabled={!output || validation.busy}
            title={!output ? 'Run Convert first' : ''}
          >
            Send to Middleware
          </button>
          {validation.busy && <span className="status">Working…</span>}
        </div>

        {validation.signError && (
          <p className="status error" style={{ marginTop: 12 }}>Sign request failed: {validation.signError}</p>
        )}
        {validation.signResponse && (
          <ResponseBlock title={`/sign response — HTTP ${validation.signResponse.status} (${validation.signResponse.durationMs}ms)`} response={validation.signResponse} />
        )}

        {validation.diff && (
          <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, background: 'var(--bg-elev)' }}>
              Diff: pasted XML vs middleware-generated XML (from <code>ftSignatures[Caption=mydata-xml]</code>)
            </div>
            <DiffView diff={validation.diff} />
          </div>
        )}
        {validation.signResponse?.ok && !validation.generatedXml && (
          <p className="status" style={{ marginTop: 12 }}>
            No <code>mydata-xml</code> signature in the response. Inspect <code>ftSignatures</code> above.
          </p>
        )}
      </section>
    </>
  );
}

function ResponseBlock({ title, response, collapsedByDefault }: { title: string; response: MiddlewareResponse; collapsedByDefault?: boolean }) {
  return (
    <details open={!collapsedByDefault} style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <summary style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'var(--bg-elev)' }}>
        {title}
      </summary>
      <pre style={{ margin: 0, padding: 12, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: 1.45, maxHeight: 360, overflow: 'auto', background: 'var(--code-bg)', color: 'var(--code-fg)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {tryPretty(response.body)}
      </pre>
    </details>
  );
}

function tryPretty(body: string): string {
  const trimmed = body.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      // fall through
    }
  }
  return body;
}

function XsdIssuesPanel({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) {
    return (
      <div style={{ marginTop: 16, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'rgba(46,160,67,0.10)', color: '#2ea043', fontSize: 13 }}>
        XSD validation passed — input matches AADE myDATA v1.0.12.
      </div>
    );
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;

  return (
    <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elev)', fontSize: 13, fontWeight: 600 }}>
        XSD validation — {errors} error{errors === 1 ? '' : 's'}{warnings ? `, ${warnings} warning${warnings === 1 ? '' : 's'}` : ''}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: 1.5 }}>
        {issues.map((issue, i) => (
          <li key={i} style={{ display: 'flex', gap: 12, padding: '6px 12px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
            <span style={{ color: issue.severity === 'error' ? '#f85149' : '#d29922', minWidth: 56, fontWeight: 600 }}>
              {issue.severity}
            </span>
            <span style={{ color: 'var(--fg-muted)', minWidth: 60 }}>
              {issue.line ? `${issue.line}:${issue.column}` : '—'}
            </span>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
