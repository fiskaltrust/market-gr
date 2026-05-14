/**
 * Remote-ESM entry for the `mydata-to-fiskaltrust` plugin.
 *
 * The factory destructures the apphost-provided `React`, `CodeBlock` and
 * `DiffBlock` from `deps` and returns a `{ Component }` that the apphost
 * mounts under `/#/tools/mydata-to-fiskaltrust`.
 *
 * The .NET WebAssembly AppBundle is fetched lazily from
 * `./_framework/dotnet.js` (relative to this module's own URL), so the
 * plugin works no matter what subpath the apphost mounts it under.
 */
import type * as ReactNS from 'react';
import type CodeBlockType from '../../../src/components/CodeBlock';
import type DiffBlockType from '../../../src/components/DiffBlock';
import { loadConverter, type ConverterApi, type ValidationIssue } from './wasmLoader';
import { normalizeXml } from './xmlDiff';
import { type DiffSummary, summarizeXmlDiff } from './diffSummary';
import {
  type MiddlewareResponse,
  extractMyDataXmlFromSignResponse,
  signReceipt,
} from './middleware';

interface PluginDeps {
  React: typeof ReactNS;
  components: {
    CodeBlock: typeof CodeBlockType;
    DiffBlock: typeof DiffBlockType;
  };
}

interface PluginExports {
  Component: ReactNS.ComponentType;
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<InvoicesDoc xmlns="http://www.aade.gr/myDATA/invoice/v1.0">
  <invoice>
    <issuer>
      <vatNumber>098000979</vatNumber>
      <country>GR</country>
      <branch>5</branch>
    </issuer>
    <invoiceHeader>
      <series>A</series>
      <aa>1</aa>
      <issueDate>2024-01-15</issueDate>
      <invoiceType>11.1</invoiceType>
      <currency>EUR</currency>
    </invoiceHeader>
    <paymentMethods>
      <paymentMethodDetails>
        <type>3</type>
        <amount>124.00</amount>
        <paymentMethodInfo>Cash</paymentMethodInfo>
      </paymentMethodDetails>
    </paymentMethods>
    <invoiceDetails>
      <lineNumber>1</lineNumber>
      <netValue>100.00</netValue>
      <vatCategory>1</vatCategory>
      <vatAmount>24.00</vatAmount>
      <incomeClassification>
        <classificationCategory xmlns="https://www.aade.gr/myDATA/incomeClassificaton/v1.0">category1_95</classificationCategory>
        <amount xmlns="https://www.aade.gr/myDATA/incomeClassificaton/v1.0">100.00</amount>
      </incomeClassification>
    </invoiceDetails>
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
  summary?: DiffSummary;
}

const DIFF_SIDE_BY_SIDE_KEY = 'mydata-tool/diff-side-by-side';

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

/**
 * Lightweight line-level change counter using a longest-common-subsequence
 * walk. We only need approximate "+N added / −M removed" labels — Monaco's
 * DiffEditor does the actual visual diff.
 */
function countLineChanges(a: string, b: string): { added: number; removed: number } {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const n = aLines.length;
  const m = bLines.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (aLines[i - 1] === bLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  const lcs = dp[n][m];
  return { added: m - lcs, removed: n - lcs };
}

export default function createPlugin(deps: PluginDeps): PluginExports {
  const { React, components } = deps;
  const { CodeBlock, DiffBlock } = components;
  const { useEffect, useState } = React;

  function MyDataToFiskaltrust() {
    const [converter, setConverter] = useState<ConverterState>({ kind: 'loading' });
    const [xml, setXml] = useState(SAMPLE_XML);
    const [output, setOutput] = useState('');
    const [errorText, setErrorText] = useState<string | null>(null);
    const [xsdIssues, setXsdIssues] = useState<ValidationIssue[] | null>(null);
    const [validation, setValidation] = useState<ValidationState>({ busy: false });

    useEffect(() => {
      try {
        const handoff = sessionStorage.getItem('qr-to-mydata:lastXml');
        if (handoff) {
          sessionStorage.removeItem('qr-to-mydata:lastXml');
          setXml(handoff);
        }
      } catch {
        // sessionStorage may be unavailable (private mode) — ignore.
      }
    }, []);

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

    const runConvert = async () => {
      if (converter.kind !== 'ready') return;
      setErrorText(null);
      setValidation({ busy: false });

      try {
        setXsdIssues(converter.api.validate(xml));
      } catch (err: unknown) {
        setXsdIssues([
          {
            severity: 'error',
            line: 0,
            column: 0,
            message: err instanceof Error ? err.message : String(err),
          },
        ]);
      }

      let json: string;
      try {
        json = converter.api.convert(xml);
        setOutput(json);
      } catch (err: unknown) {
        setErrorText(err instanceof Error ? err.message : String(err));
        setOutput('');
        return;
      }

      setValidation({ busy: true });
      try {
        const signResponse = await signReceipt(json);
        const generatedXml = signResponse.ok
          ? extractMyDataXmlFromSignResponse(signResponse.body)
          : null;
        const summary = generatedXml ? summarizeXmlDiff(xml, generatedXml) : undefined;
        setValidation({
          busy: false,
          signResponse,
          generatedXml: generatedXml ?? undefined,
          summary,
        });
      } catch (err: unknown) {
        setValidation({
          busy: false,
          signError: err instanceof Error ? err.message : String(err),
        });
      }
    };

    const copyOutput = async () => {
      if (!output) return;
      await navigator.clipboard.writeText(output);
    };

    const jsonViewBody = errorText ? `// Error\n${errorText}` : output;

    return (
      <>
        <div className="toolbar">
          <button
            className="btn"
            onClick={runConvert}
            disabled={converter.kind !== 'ready' || validation.busy}
          >
            {validation.busy ? 'Working…' : 'Convert & validate'}
          </button>
          <button className="btn btn-secondary" onClick={() => setXml(SAMPLE_XML)}>
            Load sample
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setXml('');
              setOutput('');
              setErrorText(null);
              setValidation({ busy: false });
              setXsdIssues(null);
            }}
          >
            Clear
          </button>
          <button className="btn btn-secondary" onClick={copyOutput} disabled={!output}>
            Copy JSON
          </button>
          <span className="status" style={{ marginLeft: 'auto' }}>
            {converter.kind === 'loading' && 'Loading .NET runtime…'}
            {converter.kind === 'ready' && !validation.busy && 'Ready'}
            {converter.kind === 'error' && (
              <span className="status error">Runtime failed: {converter.message}</span>
            )}
          </span>
        </div>

        <NonMappedFieldsNote />

        <div className="converter-grid">
          <div className="editor">
            <div className="editor-header">
              <span>InvoicesDoc XML</span>
              <span>{xml.length.toLocaleString()} chars</span>
            </div>
            <CodeBlock
              value={xml}
              language="xml"
              editable
              onChange={setXml}
              style={{ flex: 1 }}
              minHeight="100%"
            />
          </div>

          <div className="editor">
            <div className="editor-header">
              <span>fiskaltrust ReceiptRequest JSON</span>
              <span>{output.length.toLocaleString()} chars</span>
            </div>
            <CodeBlock
              value={jsonViewBody}
              language="json"
              placeholder="// click Convert"
              style={{ flex: 1 }}
              minHeight="100%"
            />
          </div>
        </div>

        {xsdIssues && <XsdIssuesPanel issues={xsdIssues} />}

        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Middleware round-trip</h3>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 12px' }}>
            <em>Convert &amp; validate</em> also posts the generated ReceiptRequest to the shared GR
            sandbox via <code>/sign</code>. The middleware re-emits an AADE <code>InvoicesDoc</code>
            as a <code>mydata-xml</code> signature on the response — the summary below tells you
            which elements were added, removed, or changed compared to what you pasted.
          </p>

          {validation.signError && (
            <p className="status error" style={{ marginTop: 12 }}>
              Sign request failed: {validation.signError}
            </p>
          )}
          {validation.signResponse && (
            <ResponseBlock
              title={`/sign response — HTTP ${validation.signResponse.status} (${validation.signResponse.durationMs}ms)`}
              response={validation.signResponse}
              collapsedByDefault
            />
          )}

          {validation.summary && <DiffSummaryPanel summary={validation.summary} />}

          {validation.generatedXml && (
            <div
              style={{
                marginTop: 16,
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'var(--bg-elev)',
                }}
              >
                Full diff: pasted XML vs middleware-generated XML (from{' '}
                <code>ftSignatures[Caption=mydata-xml]</code>)
              </div>
              <DiffView original={xml} generated={validation.generatedXml} />
            </div>
          )}
          {validation.signResponse?.ok && !validation.generatedXml && (
            <p className="status" style={{ marginTop: 12 }}>
              No <code>mydata-xml</code> signature in the response. Inspect{' '}
              <code>ftSignatures</code> above.
            </p>
          )}
        </section>
      </>
    );
  }

  function ResponseBlock({
    title,
    response,
    collapsedByDefault,
  }: {
    title: string;
    response: MiddlewareResponse;
    collapsedByDefault?: boolean;
  }) {
    return (
      <details
        open={!collapsedByDefault}
        style={{
          marginTop: 16,
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            background: 'var(--bg-elev)',
          }}
        >
          {title}
        </summary>
        <div style={{ padding: 8, background: 'var(--code-bg)' }}>
          <CodeBlock value={tryPretty(response.body)} language="json" minHeight={240} />
        </div>
      </details>
    );
  }

  function NonMappedFieldsNote() {
    return (
      <details
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          border: '1px solid var(--border)',
          borderLeft: '3px solid #d29922',
          borderRadius: 6,
          background: 'var(--bg-elev)',
          fontSize: 13,
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          Fields the converter intentionally does <em>not</em> map from your XML
        </summary>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
          <li>
            <code>cbReceiptMoment</code> — always set to the current UTC time at conversion. The
            pasted <code>invoiceHeader/issueDate</code> is ignored because the GR middleware
            re-fiscalises the receipt "now".
          </li>
          <li>
            <code>cbReceiptReference</code> — a fresh UUID per conversion. The pasted
            <code> series</code> + <code>aa</code> are not propagated.
          </li>
          <li>
            <code>ftReceiptCaseData.GR.Series</code> / <code>AA</code> — not set. The Greek
            middleware assigns its own series and serial when signing the receipt.
          </li>
        </ul>
      </details>
    );
  }

  function XsdIssuesPanel({ issues }: { issues: ValidationIssue[] }) {
    if (issues.length === 0) {
      return (
        <div
          style={{
            marginTop: 16,
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'rgba(46,160,67,0.10)',
            color: '#2ea043',
            fontSize: 13,
          }}
        >
          XSD validation passed — input matches AADE myDATA v1.0.12.
        </div>
      );
    }

    const errors = issues.filter((i) => i.severity === 'error').length;
    const warnings = issues.length - errors;

    return (
      <div
        style={{
          marginTop: 16,
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-elev)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          XSD validation — {errors} error{errors === 1 ? '' : 's'}
          {warnings ? `, ${warnings} warning${warnings === 1 ? '' : 's'}` : ''}
        </div>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {issues.map((issue, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                padding: '6px 12px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  color: issue.severity === 'error' ? '#f85149' : '#d29922',
                  minWidth: 56,
                  fontWeight: 600,
                }}
              >
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

  function DiffView({ original, generated }: { original: string; generated: string }) {
    const [sideBySide, setSideBySide] = useState<boolean>(() => {
      try {
        return localStorage.getItem(DIFF_SIDE_BY_SIDE_KEY) === 'true';
      } catch {
        return false;
      }
    });

    const setMode = (next: boolean) => {
      setSideBySide(next);
      try {
        localStorage.setItem(DIFF_SIDE_BY_SIDE_KEY, String(next));
      } catch {
        // private mode — ignore
      }
    };

    const normalizedOriginal = normalizeXml(original);
    const normalizedGenerated = normalizeXml(generated);

    if (normalizedOriginal === normalizedGenerated) {
      return (
        <div style={{ padding: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
          No differences after normalization — the middleware regenerated an equivalent{' '}
          <code>InvoicesDoc</code>.
        </div>
      );
    }

    const { added, removed } = countLineChanges(normalizedOriginal, normalizedGenerated);

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            borderBottom: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--fg-muted)',
          }}
        >
          <span>
            <span style={{ color: '#2ea043', marginRight: 12 }}>+{added} added</span>
            <span style={{ color: '#d33b3b' }}>−{removed} removed</span> lines (after XML
            normalization)
          </span>
          <ViewToggle sideBySide={sideBySide} onChange={setMode} />
        </div>
        <DiffBlock
          original={normalizedOriginal}
          modified={normalizedGenerated}
          language="xml"
          renderSideBySide={sideBySide}
          minHeight={360}
        />
      </div>
    );
  }

  function ViewToggle({
    sideBySide,
    onChange,
  }: {
    sideBySide: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <div
        role="tablist"
        aria-label="Diff layout"
        style={{
          display: 'inline-flex',
          border: '1px solid var(--border)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <ToggleButton active={!sideBySide} onClick={() => onChange(false)}>
          Unified
        </ToggleButton>
        <ToggleButton active={sideBySide} onClick={() => onChange(true)}>
          Side-by-side
        </ToggleButton>
      </div>
    );
  }

  function ToggleButton({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: ReactNS.ReactNode;
  }) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={onClick}
        style={{
          background: active ? 'var(--accent)' : 'transparent',
          color: active ? 'var(--accent-fg)' : 'var(--fg-muted)',
          border: 0,
          padding: '4px 10px',
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: active ? 'default' : 'pointer',
        }}
      >
        {children}
      </button>
    );
  }

  function DiffSummaryPanel({ summary }: { summary: DiffSummary }) {
    if (summary.identical) {
      return (
        <div style={summaryWrap}>
          <div style={{ ...badgeStyle, background: 'rgba(46,160,67,0.15)', color: '#2ea043' }}>
            ✓ Equivalent
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--fg-muted)' }}>
            After normalization, the middleware-generated InvoicesDoc matches the XML you pasted.
          </p>
        </div>
      );
    }

    return (
      <div style={summaryWrap}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {summary.onlyOriginal.length > 0 && (
            <span style={{ ...badgeStyle, background: 'rgba(248,81,73,0.15)', color: '#f85149' }}>
              {summary.onlyOriginal.length} only in pasted
            </span>
          )}
          {summary.onlyGenerated.length > 0 && (
            <span style={{ ...badgeStyle, background: 'rgba(46,160,67,0.15)', color: '#2ea043' }}>
              {summary.onlyGenerated.length} added by middleware
            </span>
          )}
          {summary.valueChanges.length > 0 && (
            <span style={{ ...badgeStyle, background: 'rgba(210,153,34,0.15)', color: '#d29922' }}>
              {summary.valueChanges.length} value
              {summary.valueChanges.length === 1 ? '' : 's'} changed
            </span>
          )}
        </div>

        {summary.onlyGenerated.length > 0 && (
          <Group
            title="Added by middleware"
            tone="#2ea043"
            hint="Fields the middleware injects on its own — typically AADE submission metadata or normalised defaults."
          >
            {summary.onlyGenerated.map((p) => <PathLine key={p} path={p} />)}
          </Group>
        )}

        {summary.onlyOriginal.length > 0 && (
          <Group
            title="Only in pasted XML"
            tone="#f85149"
            hint="Fields present in your input that the middleware did not re-emit — either dropped, renamed, or filtered out."
          >
            {summary.onlyOriginal.map((p) => <PathLine key={p} path={p} />)}
          </Group>
        )}

        {summary.valueChanges.length > 0 && (
          <Group
            title="Values changed"
            tone="#d29922"
            hint="Same path on both sides but different content — usually formatting (e.g. ISO dates) or middleware-side recalculation."
          >
            {summary.valueChanges.map((c) => (
              <div
                key={c.path}
                style={{
                  padding: '6px 12px',
                  borderTop: '1px solid var(--border)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: 'var(--fg)' }}>{c.path}</div>
                <div style={{ color: '#f85149', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  − {c.original || '(empty)'}
                </div>
                <div style={{ color: '#2ea043', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  + {c.generated || '(empty)'}
                </div>
              </div>
            ))}
          </Group>
        )}
      </div>
    );
  }

  function Group({
    title,
    tone,
    hint,
    children,
  }: {
    title: string;
    tone: string;
    hint: string;
    children: ReactNS.ReactNode;
  }) {
    return (
      <details
        open
        style={{
          marginTop: 12,
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--bg-elev)',
        }}
      >
        <summary
          style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: tone }}
        >
          {title}
        </summary>
        <p style={{ margin: '0 12px 4px', fontSize: 12, color: 'var(--fg-muted)' }}>{hint}</p>
        <div>{children}</div>
      </details>
    );
  }

  function PathLine({ path }: { path: string }) {
    return (
      <div
        style={{
          padding: '4px 12px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'var(--fg)',
          wordBreak: 'break-all',
        }}
      >
        {path}
      </div>
    );
  }

  return { Component: MyDataToFiskaltrust };
}

const summaryWrap: ReactNS.CSSProperties = {
  marginTop: 16,
  padding: 12,
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--bg-elev)',
};

const badgeStyle: ReactNS.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};
