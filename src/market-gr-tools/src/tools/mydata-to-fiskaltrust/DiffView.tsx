import { type DiffResult } from './xmlDiff';

interface Props {
  diff: DiffResult;
}

export function DiffView({ diff }: Props) {
  if (diff.identical) {
    return (
      <div style={{ padding: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
        No differences after normalization — the middleware regenerated an
        equivalent <code>InvoicesDoc</code>.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--fg-muted)' }}>
        <span style={{ color: '#2ea043', marginRight: 12 }}>+{diff.added} added</span>
        <span style={{ color: '#d33b3b' }}>−{diff.removed} removed</span>
        {' '}lines (after XML normalization)
      </div>
      <pre style={{ margin: 0, padding: 12, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: 1.45, overflow: 'auto', background: 'var(--code-bg)', color: 'var(--code-fg)' }}>
        {diff.changes.map((change, i) => {
          const lines = change.value.replace(/\n$/, '').split('\n');
          const prefix = change.added ? '+ ' : change.removed ? '- ' : '  ';
          const color = change.added ? '#2ea043' : change.removed ? '#f85149' : 'inherit';
          const bg = change.added ? 'rgba(46,160,67,0.12)' : change.removed ? 'rgba(248,81,73,0.12)' : 'transparent';
          return (
            <span key={i} style={{ color, background: bg, display: 'block' }}>
              {lines.map((line, j) => (
                <span key={j} style={{ display: 'block' }}>{prefix}{line}</span>
              ))}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
