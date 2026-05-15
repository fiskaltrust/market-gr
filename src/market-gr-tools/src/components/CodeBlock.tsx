import { type ReactNode, useCallback, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { registerFormatters } from './formatters';

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

/** Slim editor instance interface — avoids pulling in monaco-editor types. */
interface MonacoEditor {
  getAction(id: string): { run(): Promise<void> } | null;
}

/**
 * Monaco-backed code viewer/editor — mirrors the JsonBlock pattern from
 * service-developer-platform but with `language` as a required prop so
 * callers can render JSON, XML, or anything else Monaco supports. When the
 * editor is editable, a tiny "Format" overlay button triggers Monaco's
 * format-document action (Shift+Alt+F keybinding also works).
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
  const editorRef = useRef<MonacoEditor | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange?.(val ?? '');
    },
    [onChange],
  );

  const handleMount = useCallback((instance: MonacoEditor) => {
    editorRef.current = instance;
    setMounted(true);
  }, []);

  const formatNow = useCallback(() => {
    void editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

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
    position: 'relative',
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
          beforeMount={registerFormatters}
          onMount={handleMount}
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
        {editable && mounted && (
          <button
            type="button"
            onClick={formatNow}
            title="Format document (Shift+Alt+F)"
            style={formatButtonStyle}
          >
            Format
          </button>
        )}
      </div>
      {footer}
    </div>
  );
}

const formatButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  right: 18,
  zIndex: 5,
  background: 'rgba(255,255,255,0.06)',
  color: '#c8d0d8',
  border: '1px solid rgba(255,255,255,0.10)',
  padding: '2px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'inherit',
  cursor: 'pointer',
  letterSpacing: 0.2,
};
