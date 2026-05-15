/**
 * Remote-ESM entry point for the `aade-qr-renderer` plugin.
 *
 * All JSX and React hooks live inside the factory closure so the classic JSX
 * transform compiles against the apphost-provided `React`. See
 * docs/plugin-architecture.md for the contract.
 */
import QRCode from 'qrcode';
import type * as ReactNS from 'react';
import type CodeBlockType from '../../../src/components/CodeBlock';

interface PluginDeps {
  React: typeof ReactNS;
  components: {
    CodeBlock: typeof CodeBlockType;
  };
}

interface PluginExports {
  Component: ReactNS.ComponentType;
}

// ----------------------------------------------------------------------
// URL building — pure data, lives at module scope.
// ----------------------------------------------------------------------

/**
 * Canonical AADE myDATA invoice-search URL pattern. AADE's `bookkeeper-web`
 * portal exposes invoices by MARK (with the authenticationCode as the second
 * path segment when provided by a provider). E-invoicing providers may
 * return a fully-formed `downloadingInvoiceUrl` of their own — for that
 * case the "Paste URL" mode encodes the URL verbatim.
 *
 * Format:
 *   https://www1.aade.gr/saadeapps2/bookkeeper-web/qr/<mark>/<authcd>
 *
 * If `authenticationCode` is omitted, the second segment is dropped. The
 * `uid` is appended as a query parameter only when supplied — the AADE
 * portal ignores it for lookups but it round-trips through the SHA-1
 * issuer-unique identifier so downstream tools can recover it.
 */
const AADE_QR_BASE = 'https://www1.aade.gr/saadeapps2/bookkeeper-web/qr';

function buildAadeUrl(mark: string, authCode: string, uid: string): string {
  const trimmedMark = mark.trim();
  const trimmedAuth = authCode.trim();
  const trimmedUid = uid.trim();

  let path = `${AADE_QR_BASE}/${encodeURIComponent(trimmedMark)}`;
  if (trimmedAuth) {
    path += `/${encodeURIComponent(trimmedAuth)}`;
  }
  if (trimmedUid) {
    path += `?uid=${encodeURIComponent(trimmedUid)}`;
  }
  return path;
}

function isValidMark(mark: string): boolean {
  // AADE marks are 15-digit numeric identifiers; we accept any sane-length
  // numeric string so test fixtures and historic short marks still work.
  const trimmed = mark.trim();
  if (!trimmed) return false;
  return /^\d{6,20}$/.test(trimmed);
}

function triggerDownload(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}

export default function createPlugin(deps: PluginDeps): PluginExports {
  const { React, components } = deps;
  const { CodeBlock } = components;
  const { useCallback, useEffect, useMemo, useRef, useState } = React;

  type Mode = 'build' | 'paste';

  interface FieldProps {
    label: string;
    hint: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string | null;
    multiline?: boolean;
  }

  function Field(props: FieldProps): ReactNS.ReactElement {
    const { label, hint, value, onChange, placeholder, error, multiline } = props;
    const inputStyle: ReactNS.CSSProperties = {
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px 10px',
      border: `1px solid ${error ? '#f85149' : 'var(--border)'}`,
      borderRadius: 6,
      background: 'var(--bg-elev)',
      color: 'var(--fg)',
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      fontSize: 13,
    };
    return (
      <label style={{ display: 'block' }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={inputStyle}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={inputStyle}
          />
        )}
        <div
          style={{
            fontSize: 11,
            marginTop: 4,
            color: error ? '#f85149' : 'var(--fg-muted)',
          }}
        >
          {error ?? hint}
        </div>
      </label>
    );
  }

  function AadeQrRenderer() {
    const [mode, setMode] = useState<Mode>('build');

    // build-mode inputs
    const [invoiceMark, setInvoiceMark] = useState('400001234567890');
    const [uid, setUid] = useState('');
    const [authCode, setAuthCode] = useState('');

    // paste-mode input
    const [pastedUrl, setPastedUrl] = useState('');

    // rendered QR
    const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const computedUrl = useMemo(() => {
      if (mode === 'paste') return pastedUrl.trim();
      if (!isValidMark(invoiceMark)) return '';
      return buildAadeUrl(invoiceMark, authCode, uid);
    }, [mode, invoiceMark, uid, authCode, pastedUrl]);

    const markError = useMemo(() => {
      if (mode !== 'build') return null;
      if (!invoiceMark.trim()) return 'invoiceMark is required.';
      if (!isValidMark(invoiceMark))
        return 'invoiceMark should be a numeric string (AADE marks are 15-digit).';
      return null;
    }, [mode, invoiceMark]);

    const pasteError = useMemo(() => {
      if (mode !== 'paste') return null;
      if (!pastedUrl.trim()) return 'Paste a URL to render.';
      try {
        const u = new URL(pastedUrl.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:')
          return 'Only http(s) URLs are supported.';
      } catch {
        return 'Not a valid URL.';
      }
      return null;
    }, [mode, pastedUrl]);

    // Render the QR whenever the inputs settle on a valid URL.
    useEffect(() => {
      let cancelled = false;
      if (!computedUrl || markError || pasteError) {
        setSvgMarkup(null);
        setRenderError(null);
        return;
      }

      (async () => {
        try {
          const svg = await QRCode.toString(computedUrl, {
            type: 'svg',
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 320,
            color: { dark: '#000000', light: '#ffffff' },
          });
          if (!cancelled) {
            setSvgMarkup(svg);
            setRenderError(null);
          }

          // Also paint a canvas copy so we can offer a PNG download. The
          // canvas is the same QR rendered at higher pixel density so the
          // PNG export stays crisp at print size.
          const canvas = canvasRef.current;
          if (canvas) {
            await QRCode.toCanvas(canvas, computedUrl, {
              errorCorrectionLevel: 'M',
              margin: 1,
              width: 640,
              color: { dark: '#000000', light: '#ffffff' },
            });
          }
        } catch (err) {
          if (!cancelled) {
            setSvgMarkup(null);
            setRenderError(err instanceof Error ? err.message : String(err));
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [computedUrl, markError, pasteError]);

    const copyUrl = useCallback(() => {
      if (!computedUrl) return;
      void navigator.clipboard?.writeText(computedUrl).catch(() => {
        /* clipboard write can fail under privacy mode — ignore */
      });
    }, [computedUrl]);

    const downloadSvg = useCallback(() => {
      if (!svgMarkup) return;
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(blob, 'aade-qr.svg');
    }, [svgMarkup]);

    const downloadPng = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, 'aade-qr.png');
      }, 'image/png');
    }, []);

    return (
      <>
        <p style={{ marginTop: 0, color: 'var(--fg-muted)', fontSize: 14 }}>
          Inverse of the QR → myDATA plugin: build the canonical AADE myDATA receipt URL
          from an invoice MARK (and optional UID / authenticationCode) and render its QR
          code locally. Switch to <em>Paste a URL</em> mode if you already have a
          provider-issued <code>downloadingInvoiceUrl</code>.
        </p>

        <div className="toolbar" style={{ marginBottom: 12 }}>
          <button
            className={`btn ${mode === 'build' ? '' : 'btn-secondary'}`}
            onClick={() => setMode('build')}
          >
            Build from MARK
          </button>
          <button
            className={`btn ${mode === 'paste' ? '' : 'btn-secondary'}`}
            onClick={() => setMode('paste')}
          >
            Paste a URL
          </button>
        </div>

        {mode === 'build' ? (
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <Field
              label="invoiceMark (required)"
              hint="The AADE MARK returned from SendInvoices — a numeric identifier, typically 15 digits."
              value={invoiceMark}
              onChange={setInvoiceMark}
              placeholder="400001234567890"
              error={markError}
            />
            <Field
              label="uid (optional)"
              hint="SHA-1 issuer-unique identifier. Ignored by the AADE portal lookup but useful for round-tripping."
              value={uid}
              onChange={setUid}
              placeholder="A1B2C3D4E5F6…"
            />
            <Field
              label="authenticationCode (optional)"
              hint="Returned by SendInvoices when the submission goes through an E-invoicing provider."
              value={authCode}
              onChange={setAuthCode}
              placeholder="provider-assigned auth code"
            />
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <Field
              label="downloadingInvoiceUrl"
              hint="Paste the full URL returned by the provider (or scanned off a receipt). It is encoded verbatim."
              value={pastedUrl}
              onChange={setPastedUrl}
              placeholder="https://provider.example.com/invoice/abc123"
              error={pasteError}
              multiline
            />
          </div>
        )}

        {computedUrl && !markError && !pasteError && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 320px',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div>
              <div className="editor-header" style={{ padding: 0, marginBottom: 6 }}>
                <span>Encoded URL</span>
                <span>{computedUrl.length} chars</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <CodeBlock value={computedUrl} language="plaintext" minHeight={80} />
              </div>
              <div className="toolbar">
                <button className="btn btn-secondary" onClick={copyUrl}>
                  Copy URL
                </button>
                <a
                  className="btn btn-secondary"
                  href={computedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in AADE portal
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={downloadSvg}
                  disabled={!svgMarkup}
                >
                  Download SVG
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={downloadPng}
                  disabled={!svgMarkup}
                >
                  Download PNG
                </button>
              </div>
              {renderError && (
                <p className="status error" style={{ marginTop: 8 }}>
                  Could not render QR: {renderError}
                </p>
              )}
            </div>
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {svgMarkup ? (
                <div
                  // The SVG comes straight from the `qrcode` library — pure
                  // generated markup, no user input lives inside it.
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  style={{ width: 280, height: 280 }}
                />
              ) : (
                <div style={{ width: 280, height: 280, background: 'var(--bg-elev)' }} />
              )}
              <div style={{ fontSize: 11, color: '#666' }}>error correction level M</div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </section>
        )}
      </>
    );
  }

  return { Component: AadeQrRenderer };
}
