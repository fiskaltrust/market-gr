import { useState } from 'react';
import DiffBlock from '../../components/DiffBlock';
import { normalizeXml } from './xmlDiff';

const STORAGE_KEY = 'mydata-tool/diff-side-by-side';

interface Props {
  /** Raw pasted XML (will be normalized for display) */
  original: string;
  /** Raw middleware-generated XML (will be normalized for display) */
  generated: string;
}

export function DiffView({ original, generated }: Props) {
  const [sideBySide, setSideBySide] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setMode = (next: boolean) => {
    setSideBySide(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // private mode — ignore
    }
  };

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
          <span style={{ color: '#d33b3b' }}>−{removed} removed</span>
          {' '}lines (after XML normalization)
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

function ViewToggle({ sideBySide, onChange }: { sideBySide: boolean; onChange: (v: boolean) => void }) {
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
  children: React.ReactNode;
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
