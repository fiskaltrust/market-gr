/**
 * Remote-ESM entry point for the `vat-lookup` plugin.
 *
 * All JSX and React hooks live inside the factory closure so the classic JSX
 * transform compiles against the apphost-provided `React`. See
 * docs/plugin-architecture.md for the contract.
 */
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
// Country / format reference — pure data, lives at module scope.
// ----------------------------------------------------------------------

interface CountryDef {
  code: string;
  name: string;
  pattern: RegExp;
  hint: string;
}

const COUNTRIES: readonly CountryDef[] = [
  { code: 'EL', name: 'Greece', pattern: /^\d{9}$/, hint: '9 digits' },
  { code: 'AT', name: 'Austria', pattern: /^U\d{8}$/, hint: 'U + 8 digits' },
  { code: 'BE', name: 'Belgium', pattern: /^[01]\d{9}$/, hint: '10 digits starting with 0 or 1' },
  { code: 'BG', name: 'Bulgaria', pattern: /^\d{9,10}$/, hint: '9 or 10 digits' },
  { code: 'CY', name: 'Cyprus', pattern: /^\d{8}[A-Z]$/, hint: '8 digits + 1 letter' },
  { code: 'CZ', name: 'Czechia', pattern: /^\d{8,10}$/, hint: '8, 9 or 10 digits' },
  { code: 'DE', name: 'Germany', pattern: /^\d{9}$/, hint: '9 digits' },
  { code: 'DK', name: 'Denmark', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'EE', name: 'Estonia', pattern: /^\d{9}$/, hint: '9 digits' },
  { code: 'ES', name: 'Spain', pattern: /^[A-Z0-9]\d{7}[A-Z0-9]$/, hint: '9 chars (digits + letters)' },
  { code: 'FI', name: 'Finland', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'FR', name: 'France', pattern: /^[A-Z0-9]{2}\d{9}$/, hint: '2 chars + 9 digits' },
  { code: 'HR', name: 'Croatia', pattern: /^\d{11}$/, hint: '11 digits' },
  { code: 'HU', name: 'Hungary', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'IE', name: 'Ireland', pattern: /^(\d{7}[A-W][A-I]?|\d[A-Z*+]\d{5}[A-W])$/, hint: '8 or 9 chars (mixed)' },
  { code: 'IT', name: 'Italy', pattern: /^\d{11}$/, hint: '11 digits' },
  { code: 'LT', name: 'Lithuania', pattern: /^(\d{9}|\d{12})$/, hint: '9 or 12 digits' },
  { code: 'LU', name: 'Luxembourg', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'LV', name: 'Latvia', pattern: /^\d{11}$/, hint: '11 digits' },
  { code: 'MT', name: 'Malta', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'NL', name: 'Netherlands', pattern: /^\d{9}B\d{2}$/, hint: '9 digits + B + 2 digits' },
  { code: 'PL', name: 'Poland', pattern: /^\d{10}$/, hint: '10 digits' },
  { code: 'PT', name: 'Portugal', pattern: /^\d{9}$/, hint: '9 digits' },
  { code: 'RO', name: 'Romania', pattern: /^\d{2,10}$/, hint: '2 to 10 digits' },
  { code: 'SE', name: 'Sweden', pattern: /^\d{12}$/, hint: '12 digits' },
  { code: 'SI', name: 'Slovenia', pattern: /^\d{8}$/, hint: '8 digits' },
  { code: 'SK', name: 'Slovakia', pattern: /^\d{10}$/, hint: '10 digits' },
  { code: 'XI', name: 'Northern Ireland', pattern: /^(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/, hint: '9 or 12 digits' },
];

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c] as const));

function parseVatInput(
  raw: string,
  fallbackCountry: string,
): { country: string; digits: string } | null {
  const cleaned = raw.toUpperCase().replace(/[\s.\-_/]/g, '');
  if (!cleaned) return null;

  const prefixMatch = /^([A-Z]{2})(.+)$/.exec(cleaned);
  if (prefixMatch) {
    let [, prefix, digits] = prefixMatch;
    if (prefix === 'GR') prefix = 'EL';
    if (COUNTRY_BY_CODE.has(prefix)) {
      return { country: prefix, digits };
    }
  }
  return { country: fallbackCountry, digits: cleaned };
}

interface ViesResponse {
  isValid: boolean;
  requestDate?: string;
  userError?: string;
  name?: string;
  address?: string;
  requestIdentifier?: string;
  vatNumber?: string;
  viesApproximate?: {
    name?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    companyType?: string;
    matchName?: number;
    matchStreet?: number;
    matchPostalCode?: number;
    matchCity?: number;
    matchCompanyType?: number;
  };
}

interface LookupResult {
  countryCode: string;
  vatNumber: string;
  payload?: ViesResponse;
  rawText?: string;
  status?: number;
  durationMs: number;
  networkError?: string;
  corsLikely?: boolean;
}

const VIES_REST_BASE = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';
const VIES_WEB_FORM = 'https://ec.europa.eu/taxation_customs/vies/#/vat-validation';

function viesRestUrl(country: string, digits: string): string {
  return `${VIES_REST_BASE}/${country}/vat/${digits}`;
}

function viesWebFormUrl(country: string, digits: string): string {
  const params = new URLSearchParams({ memberStateCode: country, number: digits });
  return `${VIES_WEB_FORM}?${params.toString()}`;
}

function splitAddress(address: string | undefined): string[] | undefined {
  if (!address) return undefined;
  return address
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildApproxAddress(
  approx: NonNullable<ViesResponse['viesApproximate']> | undefined,
): string[] | undefined {
  if (!approx) return undefined;
  const lines = [
    approx.street,
    [approx.postalCode, approx.city].filter(Boolean).join(' ').trim() || undefined,
  ].filter((v): v is string => !!v);
  return lines.length ? lines : undefined;
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

// ----------------------------------------------------------------------
// Inline styles (mirrors the in-tree version).
// ----------------------------------------------------------------------

const labelStyle: ReactNS.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: 'var(--fg-muted)',
};

const selectStyle: ReactNS.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--bg-elev)',
  color: 'var(--fg)',
  fontSize: 14,
  minWidth: 200,
};

const inputStyle: ReactNS.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--bg-elev)',
  color: 'var(--fg)',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  letterSpacing: 0.4,
  transition: 'border-color 120ms ease',
};

const codeStyle: ReactNS.CSSProperties = {
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  fontSize: 12,
  background: 'var(--bg-elev)',
  border: '1px solid var(--border)',
  padding: '1px 6px',
  borderRadius: 4,
};

const statusBadgeRow: ReactNS.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 14,
  flexWrap: 'wrap',
};

const badgeStyle: ReactNS.CSSProperties = {
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.3,
};

const gridStyle: ReactNS.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
};

const fieldLabelStyle: ReactNS.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'var(--fg-muted)',
  marginBottom: 4,
};

const fieldValueStyle: ReactNS.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.4,
  wordBreak: 'break-word',
};

// ----------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------

export default function createPlugin(deps: PluginDeps): PluginExports {
  const { React, components } = deps;
  const { CodeBlock } = components;
  const { useCallback, useMemo, useRef, useState } = React;

  function VatLookup() {
    const [country, setCountry] = useState<string>('EL');
    const [input, setInput] = useState<string>('');
    const [busy, setBusy] = useState<boolean>(false);
    const [result, setResult] = useState<LookupResult | null>(null);
    const [formatError, setFormatError] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState<boolean>(false);

    const cache = useRef(new Map<string, LookupResult>());

    const parsed = useMemo(() => parseVatInput(input, country), [input, country]);

    const validation = useMemo(() => {
      if (!parsed || !parsed.digits) {
        return { ok: false, country: COUNTRY_BY_CODE.get(country), message: '' };
      }
      const def = COUNTRY_BY_CODE.get(parsed.country);
      if (!def) {
        return {
          ok: false,
          country: undefined,
          message: `Unknown country code "${parsed.country}".`,
        };
      }
      if (!def.pattern.test(parsed.digits)) {
        return {
          ok: false,
          country: def,
          message: `Doesn't match the expected ${def.name} format (${def.hint}).`,
        };
      }
      return { ok: true, country: def, message: '' };
    }, [parsed, country]);

    const submit = useCallback(async () => {
      if (!parsed || !validation.ok || !validation.country) {
        setFormatError(validation.message || 'Enter a VAT number first.');
        return;
      }
      setFormatError(null);

      const key = `${parsed.country}:${parsed.digits}`;
      const cached = cache.current.get(key);
      if (cached) {
        setResult(cached);
        return;
      }

      setBusy(true);
      setResult(null);
      const start = performance.now();
      try {
        const response = await fetch(viesRestUrl(parsed.country, parsed.digits), {
          headers: { Accept: 'application/json' },
        });
        const duration = Math.round(performance.now() - start);
        const rawText = await response.text();
        let payload: ViesResponse | undefined;
        try {
          payload = rawText ? (JSON.parse(rawText) as ViesResponse) : undefined;
        } catch {
          payload = undefined;
        }
        const lookup: LookupResult = {
          countryCode: parsed.country,
          vatNumber: parsed.digits,
          payload,
          rawText,
          status: response.status,
          durationMs: duration,
        };
        cache.current.set(key, lookup);
        setResult(lookup);
      } catch (err: unknown) {
        const duration = Math.round(performance.now() - start);
        const message = err instanceof Error ? err.message : String(err);
        const corsLikely =
          err instanceof TypeError &&
          (!message || /failed to fetch|networkerror|load failed/i.test(message));
        setResult({
          countryCode: parsed.country,
          vatNumber: parsed.digits,
          durationMs: duration,
          networkError: message || 'Network request failed (likely blocked by CORS).',
          corsLikely,
        });
      } finally {
        setBusy(false);
      }
    }, [parsed, validation]);

    const onKeyDown = useCallback(
      (e: ReactNS.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void submit();
        }
      },
      [submit],
    );

    const canSubmit = validation.ok && !busy;
    const showFormatHint = parsed && parsed.digits && !validation.ok;
    const webFormUrl =
      parsed && parsed.digits
        ? viesWebFormUrl(parsed.country, parsed.digits)
        : VIES_WEB_FORM;

    return (
      <>
        <p style={{ marginTop: 0, color: 'var(--fg-muted)', fontSize: 14 }}>
          Validate the format of a VAT number from any EU member state and, when
          the browser permits, look it up against the EU's <strong>VIES</strong>
          {' '}service. Greek (EL) VAT numbers are the primary target. The lookup
          runs entirely from your browser — no proxy, no API key. Some EU
          deployments of VIES do not send CORS headers; when that's the case the
          UI falls back to a direct deep-link to the official VIES web form.
        </p>

        <div className="toolbar" style={{ flexWrap: 'wrap', marginTop: 8 }}>
          <label style={labelStyle}>
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={selectStyle}
              disabled={busy}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ ...labelStyle, flex: 1, minWidth: 240 }}>
            VAT number
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="e.g. EL094014201 or 094014201"
              spellCheck={false}
              autoCapitalize="characters"
              autoComplete="off"
              style={{
                ...inputStyle,
                borderColor: showFormatHint ? '#d29922' : 'var(--border)',
              }}
              disabled={busy}
            />
          </label>

          <button
            type="button"
            className="btn"
            onClick={() => void submit()}
            disabled={!canSubmit}
            style={{ alignSelf: 'flex-end' }}
          >
            {busy ? 'Looking up…' : 'Look up'}
          </button>
        </div>

        {parsed && parsed.digits && validation.country && (
          <p style={{ margin: '4px 2px 0', fontSize: 12, color: 'var(--fg-muted)' }}>
            {validation.country.code} ({validation.country.name}) ·{' '}
            {validation.country.hint}
            {' · '}
            will request:{' '}
            <code style={codeStyle}>
              {validation.country.code}
              {parsed.digits}
            </code>
          </p>
        )}

        {(formatError || showFormatHint) && (
          <p className="status" style={{ marginTop: 6, color: '#d29922' }}>
            {formatError || validation.message}
          </p>
        )}

        {result && (
          <ResultPanel
            result={result}
            showRaw={showRaw}
            onToggleRaw={() => setShowRaw((v) => !v)}
            webFormUrl={webFormUrl}
          />
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--fg-muted)' }}>
          Fallback:{' '}
          <a href={webFormUrl} target="_blank" rel="noreferrer">
            Open in the VIES web form
          </a>
          . Some member states (e.g. NL, ES) only return validity — no name or
          address — even from the official portal.
        </p>
      </>
    );
  }

  interface ResultPanelProps {
    result: LookupResult;
    showRaw: boolean;
    onToggleRaw: () => void;
    webFormUrl: string;
  }

  function ResultPanel({ result, showRaw, onToggleRaw, webFormUrl }: ResultPanelProps) {
    const { payload, networkError, status, durationMs } = result;

    if (networkError) {
      return (
        <section style={{ marginTop: 20 }}>
          <div
            style={{
              padding: '12px 14px',
              border: '1px solid #f8514980',
              borderRadius: 6,
              background: 'rgba(248,81,73,0.08)',
              fontSize: 13,
            }}
          >
            <strong style={{ color: '#f85149' }}>Lookup failed</strong>
            <div
              style={{
                marginTop: 6,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                fontSize: 12,
                wordBreak: 'break-word',
              }}
            >
              {networkError}
            </div>
            {result.corsLikely && (
              <p style={{ margin: '8px 0 0', color: 'var(--fg-muted)' }}>
                The VIES REST API does not appear to set CORS headers for this
                origin, so a direct browser fetch is blocked. The format check
                above already confirmed the VAT number is well-formed — open it
                in the official VIES web form to get the name + address:
                <br />
                <a href={webFormUrl} target="_blank" rel="noreferrer">
                  {webFormUrl}
                </a>
              </p>
            )}
            <p style={{ margin: '8px 0 0', color: 'var(--fg-muted)', fontSize: 12 }}>
              Took {durationMs} ms.
            </p>
          </div>
        </section>
      );
    }

    const approx = payload?.viesApproximate;
    const name = payload?.name || approx?.name;
    const addressLines = splitAddress(payload?.address) || buildApproxAddress(approx);

    return (
      <section style={{ marginTop: 20 }}>
        <div className="editor-header" style={{ padding: 0, marginBottom: 8 }}>
          <span>VIES response</span>
          <span>
            {status ? `HTTP ${status}` : ''}
            {status ? ' · ' : ''}
            {durationMs} ms
          </span>
        </div>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-elev)',
            padding: 16,
          }}
        >
          <div style={statusBadgeRow}>
            <StatusBadge isValid={payload?.isValid} />
            <code style={codeStyle}>
              {result.countryCode}
              {result.vatNumber}
            </code>
          </div>

          <div style={gridStyle}>
            <Field label="Company name" value={name} muted={!name} />
            <Field
              label="Address"
              value={addressLines && addressLines.length ? addressLines : undefined}
              muted={!addressLines || addressLines.length === 0}
            />
            <Field label="Request date" value={payload?.requestDate} muted={!payload?.requestDate} />
            <Field
              label="Request identifier"
              value={payload?.requestIdentifier}
              muted={!payload?.requestIdentifier}
              mono
            />
            {payload?.userError && (
              <Field label="VIES note" value={payload.userError} muted={false} />
            )}
          </div>

          {!payload && (
            <p style={{ margin: '8px 0 0', color: 'var(--fg-muted)', fontSize: 13 }}>
              VIES returned no parsable payload. See the raw response below.
            </p>
          )}

          {result.rawText && (
            <details
              open={showRaw}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open !== showRaw) onToggleRaw();
              }}
              style={{ marginTop: 16 }}
            >
              <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--fg-muted)' }}>
                Raw response ({result.rawText.length.toLocaleString()} chars)
              </summary>
              <div style={{ marginTop: 8 }}>
                <CodeBlock
                  value={prettyJson(result.rawText)}
                  language="json"
                  minHeight={180}
                  height={240}
                />
              </div>
            </details>
          )}
        </div>
      </section>
    );
  }

  function StatusBadge({ isValid }: { isValid: boolean | undefined }) {
    if (isValid === true) {
      return (
        <span style={{ ...badgeStyle, background: '#1f8a3a', color: '#fff' }}>
          Active
        </span>
      );
    }
    if (isValid === false) {
      return (
        <span style={{ ...badgeStyle, background: '#b3261e', color: '#fff' }}>
          Invalid
        </span>
      );
    }
    return (
      <span style={{ ...badgeStyle, background: 'var(--border)', color: 'var(--fg-muted)' }}>
        Unknown
      </span>
    );
  }

  interface FieldProps {
    label: string;
    value: string | string[] | undefined;
    muted: boolean;
    mono?: boolean;
  }

  function Field({ label, value, muted, mono }: FieldProps) {
    const display = (() => {
      if (value == null) return '—';
      if (Array.isArray(value)) return value.length ? value : ['—'];
      return value;
    })();
    return (
      <div>
        <div style={fieldLabelStyle}>{label}</div>
        <div
          style={{
            ...fieldValueStyle,
            color: muted ? 'var(--fg-muted)' : 'var(--fg)',
            fontFamily: mono ? 'JetBrains Mono, Consolas, monospace' : 'inherit',
            fontSize: mono ? 12 : 14,
          }}
        >
          {Array.isArray(display)
            ? display.map((line, idx) => <div key={idx}>{line}</div>)
            : display}
        </div>
      </div>
    );
  }

  return { Component: VatLookup };
}
