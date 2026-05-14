/**
 * Remote-ESM entry point for the `aade-errors` plugin.
 *
 * All JSX and React hooks live inside the factory closure so the classic JSX
 * transform compiles against the apphost-provided `React`. See
 * docs/plugin-architecture.md for the contract.
 */
import type * as ReactNS from 'react';
import { AADE_ERRORS, type AadeError } from './errors';

interface PluginDeps {
  React: typeof ReactNS;
  components: {
    // CodeBlock is not used here; declaring it documents the contract
    // and keeps the tsconfig in `noUnusedLocals` happy if a future
    // refactor wires it back in.
    CodeBlock: unknown;
  };
}

interface PluginExports {
  Component: ReactNS.ComponentType;
}

/** Pull every `<errorCode>...</errorCode>` value out of a pasted AADE XML response. */
function extractErrorCodes(xml: string): string[] {
  if (!xml.trim()) return [];
  const codes: string[] = [];
  const regex = /<errorCode>\s*([0-9]+)\s*<\/errorCode>/gi;
  for (const match of xml.matchAll(regex)) {
    if (match[1]) codes.push(match[1]);
  }
  // Also accept lone numeric codes pasted by the user (e.g. "211").
  if (codes.length === 0) {
    const bare = xml.trim();
    if (/^\d{1,4}$/.test(bare)) codes.push(bare);
  }
  return Array.from(new Set(codes));
}

function matchesQuery(err: AadeError, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    err.code.includes(needle) ||
    err.message.toLowerCase().includes(needle) ||
    err.category.toLowerCase().includes(needle) ||
    err.cause.toLowerCase().includes(needle) ||
    err.fix.toLowerCase().includes(needle)
  );
}

const CATEGORY_COLOR: Record<AadeError['category'], string> = {
  XMLSyntaxError: '#d29922',
  Application: '#4ea1ff',
  Authentication: '#f85149',
  Authorization: '#f85149',
  Invoice: '#3fb950',
  BusinessRule: '#bc8cff',
};

export default function createPlugin(deps: PluginDeps): PluginExports {
  const { React } = deps;
  const { useMemo, useState, useCallback } = React;

  function AadeErrors() {
    const [query, setQuery] = useState('');
    const [pasted, setPasted] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const highlighted = useMemo(() => new Set(extractErrorCodes(pasted)), [pasted]);

    const filtered = useMemo(() => {
      const q = query.trim();
      const base = q ? AADE_ERRORS.filter((e) => matchesQuery(e, q)) : AADE_ERRORS;
      // When highlighting from a pasted response, surface the matched rows
      // at the top.
      if (highlighted.size === 0) return base;
      const hits: AadeError[] = [];
      const rest: AadeError[] = [];
      for (const e of base) {
        if (highlighted.has(e.code)) hits.push(e);
        else rest.push(e);
      }
      return [...hits, ...rest];
    }, [query, highlighted]);

    const toggle = useCallback((code: string) => {
      setExpanded((current) => (current === code ? null : code));
    }, []);

    const unmatched = useMemo(() => {
      if (highlighted.size === 0) return [] as string[];
      const known = new Set(AADE_ERRORS.map((e) => e.code));
      return Array.from(highlighted).filter((c) => !known.has(c));
    }, [highlighted]);

    return (
      <>
        <p style={{ marginTop: 0, color: 'var(--fg-muted)', fontSize: 14 }}>
          Searchable dictionary of AADE myDATA rejection codes — type a code,
          a message keyword, or paste a full AADE XML response below to
          highlight the matching rows. {AADE_ERRORS.length} codes curated from
          the v1.0.9 ERP spec and the firebed/aade-mydata catalogue.
        </p>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <label style={{ display: 'block' }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Search</div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 211, invoiceType, VAT category"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--bg-elev)',
                color: 'var(--fg)',
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                fontSize: 13,
              }}
            />
          </label>
          <label style={{ display: 'block' }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>
              Paste an AADE response (or just an error code)
            </div>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="<response><errorCode>211</errorCode>...</response>"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--bg-elev)',
                color: 'var(--fg)',
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                fontSize: 12,
              }}
            />
          </label>
        </section>

        {highlighted.size > 0 && (
          <p
            className="status"
            style={{
              margin: '4px 0 12px',
              color:
                unmatched.length > 0 ? '#d29922' : 'var(--fg-muted)',
            }}
          >
            Pasted response contains {highlighted.size} error code
            {highlighted.size === 1 ? '' : 's'}:{' '}
            {Array.from(highlighted).join(', ')}
            {unmatched.length > 0 && (
              <>
                {' '}
                ·{' '}
                <strong style={{ color: '#d29922' }}>
                  {unmatched.length} not in dictionary
                </strong>
                : {unmatched.join(', ')}
              </>
            )}
          </p>
        )}

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-elev)' }}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, width: '100%' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const hit = highlighted.has(e.code);
                const isExpanded = expanded === e.code;
                return (
                  <React.Fragment key={e.code}>
                    <tr
                      onClick={() => toggle(e.code)}
                      style={{
                        cursor: 'pointer',
                        background: hit
                          ? 'rgba(248,81,73,0.10)'
                          : isExpanded
                            ? 'rgba(78,161,255,0.06)'
                            : undefined,
                      }}
                    >
                      <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, Consolas, monospace' }}>
                        {e.code}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 11,
                            color: CATEGORY_COLOR[e.category],
                            border: `1px solid ${CATEGORY_COLOR[e.category]}`,
                          }}
                        >
                          {e.category}
                        </span>
                      </td>
                      <td style={tdStyle}>{e.message}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={3} style={{ ...tdStyle, background: 'var(--bg-elev)' }}>
                          <div style={{ marginBottom: 8 }}>
                            <strong style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                              Cause
                            </strong>
                            <div style={{ marginTop: 4 }}>{e.cause}</div>
                          </div>
                          <div>
                            <strong style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                              Suggested fix
                            </strong>
                            <div style={{ marginTop: 4 }}>{e.fix}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>
                    No matches for &ldquo;{query}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return { Component: AadeErrors };
}

const thStyle: ReactNS.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '1px solid var(--border)',
  fontSize: 12,
  color: 'var(--fg-muted)',
  fontWeight: 600,
};

const tdStyle: ReactNS.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top',
};
