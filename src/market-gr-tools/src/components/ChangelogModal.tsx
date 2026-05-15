import { useEffect, useMemo, type CSSProperties } from 'react';

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
  /** Display name of the plugin (shown in the modal header). */
  title: string;
  /** Raw markdown of the plugin's CHANGELOG.md (imported via `?raw`). */
  raw: string;
}

interface VersionSection {
  title: string;
  date?: string;
  content: string;
}

/** Parse changelog markdown into version sections delimited by `## [version]`. */
function parseChangelog(raw: string): VersionSection[] {
  const sections: VersionSection[] = [];
  const lines = raw.split('\n');
  let current: { title: string; date?: string; lines: string[] } | null = null;

  for (const line of lines) {
    const match = line.match(/^## \[(.+?)]/);
    if (match) {
      if (current) {
        sections.push({
          title: current.title,
          date: current.date,
          content: current.lines.join('\n').trim(),
        });
      }
      const rest = line.replace(/^## \[.+?]/, '').replace(/^ - /, '').trim();
      current = { title: match[1], date: rest || undefined, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    sections.push({
      title: current.title,
      date: current.date,
      content: current.lines.join('\n').trim(),
    });
  }
  return sections;
}

const categoryColors: Record<string, string> = {
  Added: '#2ea043',
  Changed: '#1f6feb',
  Removed: '#f85149',
  Fixed: '#d29922',
  Deprecated: '#a371f7',
  Security: '#a371f7',
};

interface CategoryBlock {
  category: string;
  items: string[];
}

function parseSectionContent(content: string): CategoryBlock[] {
  const blocks: CategoryBlock[] = [];
  let current: CategoryBlock | null = null;
  for (const line of content.split('\n')) {
    const catMatch = line.match(/^### (.+)/);
    if (catMatch) {
      if (current) blocks.push(current);
      current = { category: catMatch[1].trim(), items: [] };
    } else if (current && /^- /.test(line)) {
      current.items.push(line.replace(/^- /, ''));
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  zIndex: 100,
  padding: '48px 16px',
};

const dialogStyle: CSSProperties = {
  background: 'var(--bg-elev)',
  color: 'var(--fg)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  width: '100%',
  maxWidth: 640,
  maxHeight: 'calc(100vh - 96px)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
};

const closeBtnStyle: CSSProperties = {
  marginLeft: 'auto',
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: 1,
  padding: 4,
};

const bodyStyle: CSSProperties = {
  overflowY: 'auto',
  padding: 16,
};

export default function ChangelogModal({ open, onClose, title, raw }: ChangelogModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const sections = useMemo(() => parseChangelog(raw), [raw]);

  if (!open) return null;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} changelog`}
      onClick={onClose}
    >
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <strong style={{ fontSize: 14 }}>{title}</strong>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>changelog</span>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close changelog"
          >
            ×
          </button>
        </div>
        <div style={bodyStyle}>
          {sections
            .filter((s) => s.title !== 'Unreleased' || s.content)
            .map((section) => (
              <VersionBlock key={section.title} section={section} />
            ))}
          {sections.length === 0 && (
            <p style={{ color: 'var(--fg-muted)', margin: 0 }}>No changelog entries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionBlock({ section }: { section: VersionSection }) {
  const blocks = parseSectionContent(section.content);
  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>
          {section.title === 'Unreleased' ? 'Unreleased' : `v${section.title}`}
        </h3>
        {section.title === 'Unreleased' && (
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(31,111,235,0.15)',
              color: '#1f6feb',
              fontFamily: 'monospace',
            }}
          >
            dev
          </span>
        )}
        {section.date && (
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
            {section.date}
          </span>
        )}
      </div>
      {blocks.length === 0 && section.content && (
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            color: 'var(--fg-muted)',
            fontFamily: 'inherit',
          }}
        >
          {section.content}
        </pre>
      )}
      {blocks.map((block) => (
        <div key={block.category} style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: categoryColors[block.category] ?? 'var(--fg-muted)',
              marginBottom: 4,
            }}
          >
            {block.category}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {block.items.map((item, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--fg)' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
