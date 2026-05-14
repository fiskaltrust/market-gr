import { type DiffSummary } from './diffSummary';

interface Props {
  summary: DiffSummary;
}

export function DiffSummaryPanel({ summary }: Props) {
  if (summary.identical) {
    return (
      <div style={summaryWrap}>
        <div style={{ ...badge, background: 'rgba(46,160,67,0.15)', color: '#2ea043' }}>✓ Equivalent</div>
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
          <span style={{ ...badge, background: 'rgba(248,81,73,0.15)', color: '#f85149' }}>
            {summary.onlyOriginal.length} only in pasted
          </span>
        )}
        {summary.onlyGenerated.length > 0 && (
          <span style={{ ...badge, background: 'rgba(46,160,67,0.15)', color: '#2ea043' }}>
            {summary.onlyGenerated.length} added by middleware
          </span>
        )}
        {summary.valueChanges.length > 0 && (
          <span style={{ ...badge, background: 'rgba(210,153,34,0.15)', color: '#d29922' }}>
            {summary.valueChanges.length} value{summary.valueChanges.length === 1 ? '' : 's'} changed
          </span>
        )}
      </div>

      {summary.onlyGenerated.length > 0 && (
        <Group title="Added by middleware" tone="#2ea043" hint="Fields the middleware injects on its own — typically AADE submission metadata or normalised defaults.">
          {summary.onlyGenerated.map((p) => <PathLine key={p} path={p} />)}
        </Group>
      )}

      {summary.onlyOriginal.length > 0 && (
        <Group title="Only in pasted XML" tone="#f85149" hint="Fields present in your input that the middleware did not re-emit — either dropped, renamed, or filtered out.">
          {summary.onlyOriginal.map((p) => <PathLine key={p} path={p} />)}
        </Group>
      )}

      {summary.valueChanges.length > 0 && (
        <Group title="Values changed" tone="#d29922" hint="Same path on both sides but different content — usually formatting (e.g. ISO dates) or middleware-side recalculation.">
          {summary.valueChanges.map((c) => (
            <div key={c.path} style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ color: 'var(--fg)' }}>{c.path}</div>
              <div style={{ color: '#f85149', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>− {c.original || '(empty)'}</div>
              <div style={{ color: '#2ea043', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>+ {c.generated || '(empty)'}</div>
            </div>
          ))}
        </Group>
      )}
    </div>
  );
}

interface GroupProps {
  title: string;
  tone: string;
  hint: string;
  children: React.ReactNode;
}

function Group({ title, tone, hint, children }: GroupProps) {
  return (
    <details open style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-elev)' }}>
      <summary style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: tone }}>
        {title}
      </summary>
      <p style={{ margin: '0 12px 4px', fontSize: 12, color: 'var(--fg-muted)' }}>{hint}</p>
      <div>{children}</div>
    </details>
  );
}

function PathLine({ path }: { path: string }) {
  return (
    <div style={{ padding: '4px 12px', borderTop: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 12, color: 'var(--fg)', wordBreak: 'break-all' }}>
      {path}
    </div>
  );
}

const summaryWrap: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--bg-elev)',
};

const badge: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};
