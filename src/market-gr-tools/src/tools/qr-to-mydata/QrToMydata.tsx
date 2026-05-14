import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import CodeBlock from '../../components/CodeBlock';
import { navigate } from '../../apphost/router';

/** Key used to hand the fetched XML over to the mydata-to-fiskaltrust plugin. */
const HANDOFF_STORAGE_KEY = 'qr-to-mydata:lastXml';

interface DecodedState {
  /** Data URL of the image the user supplied (used for the preview). */
  previewUrl: string;
  /** Decoded text from the QR. */
  rawText: string;
  /** `true` when `rawText` is a syntactically-valid http(s) URL. */
  isUrl: boolean;
}

interface FetchState {
  busy: boolean;
  xml?: string;
  status?: number;
  durationMs?: number;
  error?: string;
  /** True when the failure smells like CORS (TypeError with empty message). */
  corsLikely?: boolean;
}

export default function QrToMydata() {
  const [decoded, setDecoded] = useState<DecodedState | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>({ busy: false });
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------------
  // Image -> QR pipeline
  // ------------------------------------------------------------------
  const decodeImage = useCallback(async (file: Blob) => {
    setDecodeError(null);
    setFetchState({ busy: false });

    let previewUrl: string;
    try {
      previewUrl = await readAsDataUrl(file);
    } catch (err) {
      setDecoded(null);
      setDecodeError(err instanceof Error ? err.message : String(err));
      return;
    }

    let imageData: ImageData;
    try {
      imageData = await loadImageData(previewUrl);
    } catch (err) {
      setDecoded(null);
      setDecodeError(err instanceof Error ? err.message : String(err));
      return;
    }

    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (!result || !result.data) {
      setDecoded({ previewUrl, rawText: '', isUrl: false });
      setDecodeError('No QR code could be found in this image. Try a sharper or larger crop.');
      return;
    }

    const trimmed = result.data.trim();
    setDecoded({
      previewUrl,
      rawText: trimmed,
      isUrl: looksLikeHttpUrl(trimmed),
    });
  }, []);

  // ------------------------------------------------------------------
  // Input bindings: clipboard paste (scoped to mount), drop, file picker.
  // ------------------------------------------------------------------
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void decodeImage(file);
            return;
          }
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [decodeImage]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('image/'));
      if (file) {
        void decodeImage(file);
      } else {
        setDecodeError('That drop did not contain an image file.');
      }
    },
    [decodeImage],
  );

  const onFilePicked = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void decodeImage(file);
      // Reset so the same file can be re-picked.
      event.target.value = '';
    },
    [decodeImage],
  );

  // ------------------------------------------------------------------
  // AADE fetch buttons.
  // ------------------------------------------------------------------
  const fetchMyDataXml = useCallback(async () => {
    if (!decoded?.isUrl) return;
    const url = `${decoded.rawText}/mydata`;
    setFetchState({ busy: true });
    const start = performance.now();
    try {
      const response = await fetch(url);
      const duration = Math.round(performance.now() - start);
      const text = await response.text();
      if (!response.ok) {
        setFetchState({
          busy: false,
          status: response.status,
          durationMs: duration,
          error: `HTTP ${response.status} ${response.statusText}`,
          xml: text,
        });
        return;
      }
      setFetchState({
        busy: false,
        status: response.status,
        durationMs: duration,
        xml: text,
      });
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const message = err instanceof Error ? err.message : String(err);
      // Browsers throw a `TypeError` with an empty / "Failed to fetch" message
      // when a CORS preflight is rejected. We can't distinguish CORS from a
      // hard network failure, so flag it as "likely CORS" and offer escape.
      const corsLikely =
        err instanceof TypeError &&
        (!message || /failed to fetch|networkerror|load failed/i.test(message));
      setFetchState({
        busy: false,
        durationMs: duration,
        error: message || 'Network request failed (likely blocked by CORS).',
        corsLikely,
      });
    }
  }, [decoded]);

  const openPdf = useCallback(() => {
    if (!decoded?.isUrl) return;
    window.open(`${decoded.rawText}/pdf`, '_blank', 'noopener,noreferrer');
  }, [decoded]);

  const openInConverter = useCallback(() => {
    if (!fetchState.xml) return;
    try {
      sessionStorage.setItem(HANDOFF_STORAGE_KEY, fetchState.xml);
    } catch {
      // sessionStorage can be unavailable in private modes — ignore, the user
      // can still copy/paste manually.
    }
    navigate('/tools/mydata-to-fiskaltrust');
  }, [fetchState.xml]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const xmlUrl = decoded?.isUrl ? `${decoded.rawText}/mydata` : undefined;
  const pdfUrl = decoded?.isUrl ? `${decoded.rawText}/pdf` : undefined;

  return (
    <>
      <p style={{ marginTop: 0, color: 'var(--fg-muted)', fontSize: 14 }}>
        Paste, drop, or pick an image of a Greek receipt QR code. The image is
        decoded locally — only the AADE fetches below leave your browser.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8,
          background: isDragOver ? 'rgba(78,161,255,0.05)' : 'var(--bg-elev)',
          padding: 20,
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: 'pointer',
          transition: 'border-color 120ms ease, background 120ms ease',
        }}
      >
        {decoded?.previewUrl ? (
          <img
            src={decoded.previewUrl}
            alt="QR preview"
            style={{
              maxWidth: '100%',
              maxHeight: 240,
              borderRadius: 4,
              background: '#fff',
            }}
          />
        ) : (
          <>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
              Drop an image here, click to pick a file, or press <kbd>Ctrl/Cmd</kbd>+<kbd>V</kbd> to
              paste from the clipboard.
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>PNG, JPEG, WebP — anything the browser can decode.</div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFilePicked}
          style={{ display: 'none' }}
        />
      </div>

      {decodeError && (
        <p className="status error" style={{ marginTop: 12 }}>
          {decodeError}
        </p>
      )}

      {decoded && decoded.rawText && (
        <section style={{ marginTop: 20 }}>
          <div className="editor-header" style={{ padding: 0, marginBottom: 6 }}>
            <span>Decoded QR contents</span>
            <span>{decoded.isUrl ? 'looks like a URL' : 'not a URL'}</span>
          </div>
          <div
            style={{
              padding: '10px 12px',
              border: `1px solid ${decoded.isUrl ? 'var(--border)' : '#d29922'}`,
              borderRadius: 6,
              background: 'var(--bg-elev)',
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: 13,
              wordBreak: 'break-all',
            }}
          >
            {decoded.isUrl ? (
              <a href={decoded.rawText} target="_blank" rel="noreferrer">
                {decoded.rawText}
              </a>
            ) : (
              decoded.rawText
            )}
          </div>
          {!decoded.isUrl && (
            <p className="status" style={{ marginTop: 8, color: '#d29922' }}>
              The QR did not encode an http(s) URL. AADE receipt QRs always do — double-check
              the image is the right one.
            </p>
          )}
        </section>
      )}

      {decoded?.isUrl && (
        <div className="toolbar" style={{ marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => void fetchMyDataXml()}
            disabled={fetchState.busy}
            title={xmlUrl}
          >
            {fetchState.busy ? 'Fetching…' : 'Fetch myDATA XML'}
          </button>
          <button className="btn btn-secondary" onClick={openPdf} title={pdfUrl}>
            Open PDF in new tab
          </button>
          {fetchState.xml && !fetchState.error && (
            <button className="btn btn-secondary" onClick={openInConverter}>
              Open in MyData → fiskaltrust converter
            </button>
          )}
          <span className="status" style={{ marginLeft: 'auto' }}>
            {fetchState.status && !fetchState.error && (
              <>HTTP {fetchState.status} · {fetchState.durationMs} ms</>
            )}
          </span>
        </div>
      )}

      {fetchState.error && xmlUrl && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            border: '1px solid #f8514980',
            borderRadius: 6,
            background: 'rgba(248,81,73,0.08)',
            fontSize: 13,
          }}
        >
          <strong style={{ color: '#f85149' }}>Fetch failed</strong>
          <div style={{ marginTop: 4, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12 }}>
            {fetchState.error}
          </div>
          {fetchState.corsLikely && (
            <p style={{ margin: '8px 0 0', color: 'var(--fg-muted)' }}>
              AADE may block browser fetches from this origin. Try opening the URL directly in a
              new tab:{' '}
              <a href={xmlUrl} target="_blank" rel="noreferrer">
                {xmlUrl}
              </a>
            </p>
          )}
        </div>
      )}

      {fetchState.xml && !fetchState.error && (
        <section style={{ marginTop: 16 }}>
          <div className="editor">
            <div className="editor-header">
              <span>myDATA XML response</span>
              <span>{fetchState.xml.length.toLocaleString()} chars</span>
            </div>
            <CodeBlock
              value={fetchState.xml}
              language="xml"
              style={{ flex: 1 }}
              minHeight={360}
            />
          </div>
        </section>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Unexpected FileReader result type.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

function loadImageData(src: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Browser refused to allocate a 2D canvas context.'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    img.onerror = () => reject(new Error('The browser could not decode this image.'));
    img.src = src;
  });
}

function looksLikeHttpUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
