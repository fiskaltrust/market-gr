import { type ReactNode, useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface CodeBlockProps {
  /** Code string to display */
  value: string;
  /** Monaco language id (e.g. "json", "xml") */
  language: string;
  /** When true, renders an editable editor */
  editable?: boolean;
  onChange?: (value: string) => void;
  /** Red border + error state */
  error?: boolean;
  /** Placeholder shown when value is empty and editor is read-only */
  placeholder?: string;
  /** Extra content rendered after the block (e.g. error message) */
  footer?: ReactNode;
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
 * Monaco-backed code viewer/editor — mirrors the JsonBlock pattern from
 * service-developer-platform but with `language` as a required prop so
 * callers can render JSON, XML, or anything else Monaco supports.
 */
export default function CodeBlock({
  value,
  language,
  editable = false,
  onChange,
  error = false,
  placeholder,
  footer,
  height,
  minHeight,
  className,
  style,
}: CodeBlockProps) {
  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange?.(val ?? '');
    },
    [onChange],
  );

  const display = !value && !editable && placeholder ? placeholder : value;

  const editorContainerStyle: React.CSSProperties = {
    flex: '1 1 0',
    minHeight: minHeight ?? (editable ? 200 : 60),
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 6,
    overflow: 'hidden',
    border: `1px solid ${error ? '#f8514980' : 'var(--border)'}`,
    background: 'var(--code-bg)',
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      <div style={editorContainerStyle}>
        <Editor
          value={display}
          language={language}
          theme="vs-dark"
          height={height}
          onChange={editable ? handleChange : undefined}
          options={{
            readOnly: !editable,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            tabSize: 2,
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
            domReadOnly: !editable,
            contextmenu: editable,
            automaticLayout: true,
          }}
        />
      </div>
      {footer}
    </div>
  );
}
