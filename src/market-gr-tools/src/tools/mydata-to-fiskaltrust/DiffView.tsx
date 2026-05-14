import DiffBlock from '../../components/DiffBlock';
import { normalizeXml } from './xmlDiff';

interface Props {
  /** Raw pasted XML (will be normalized for display) */
  original: string;
  /** Raw middleware-generated XML (will be normalized for display) */
  generated: string;
}

export function DiffView({ original, generated }: Props) {
  const normalizedOriginal = normalizeXml(original);
  const normalizedGenerated = normalizeXml(generated);

  if (normalizedOriginal === normalizedGenerated) {
    return (
      <div style={{ padding: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
        No differences after normalization — the middleware regenerated an
        equivalent <code>InvoicesDoc</code>.
      </div>
    );
  }

  const { added, removed } = countLineChanges(normalizedOriginal, normalizedGenerated);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--fg-muted)' }}>
        <span style={{ color: '#2ea043', marginRight: 12 }}>+{added} added</span>
        <span style={{ color: '#d33b3b' }}>−{removed} removed</span>
        {' '}lines (after XML normalization)
      </div>
      <DiffBlock
        original={normalizedOriginal}
        modified={normalizedGenerated}
        language="xml"
        renderSideBySide={false}
        minHeight={360}
      />
    </div>
  );
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

  // Standard LCS DP. Both inputs are normalized XML so they should be small
  // enough for an O(n*m) table.
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
