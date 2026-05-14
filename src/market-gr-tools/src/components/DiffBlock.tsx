import { DiffEditor } from '@monaco-editor/react';

interface DiffBlockProps {
  /** Left-hand / "original" text */
  original: string;
  /** Right-hand / "modified" text */
  modified: string;
  /** Monaco language id (e.g. "xml", "json") */
  language: string;
  /** When false, renders a unified (inline) diff. Default: false. */
  renderSideBySide?: boolean;
  /** Height of the editor area (number = px, string passed through) */
  height?: number | string;
  /** Minimum height of the editor area */
  minHeight?: number | string;
  /** CSS class for the outer wrapper */
  className?: string;
  /** Inline style for the outer wrapper */
  style?: React.CSSProperties;
}

/**
 * Monaco-backed diff viewer — wraps `DiffEditor` from `@monaco-editor/react`
 * with the same theming/options as `CodeBlock`. Always read-only.
 */
export default function DiffBlock({
  original,
  modified,
  language,
  renderSideBySide = false,
  height,
  minHeight,
  className,
  style,
}: DiffBlockProps) {
  const containerStyle: React.CSSProperties = {
    flex: '1 1 0',
    minHeight: minHeight ?? 240,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    background: 'var(--code-bg)',
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      <div style={containerStyle}>
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme="vs-dark"
          height={height}
          options={{
            readOnly: true,
            renderSideBySide,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            wordWrap: 'on',
            folding: false,
            glyphMargin: false,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 8, bottom: 8 },
            contextmenu: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
