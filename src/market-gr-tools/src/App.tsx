import { Suspense, useEffect, useState } from 'react';
import {
  loadRemotePlugins,
  type LoadedRemotePlugin,
} from './apphost/remotePluginLoader';
import { loadRemotePluginSources } from './apphost/remotePlugins';
import { useHashRoute, href } from './apphost/router';
import ChangelogModal from './components/ChangelogModal';

export function App() {
  const route = useHashRoute();
  const [tools, setTools] = useState<LoadedRemotePlugin[]>([]);
  const [state, setState] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sources = await loadRemotePluginSources();
        if (cancelled) return;
        if (sources.length === 0) {
          setTools([]);
          setState('ready');
          return;
        }
        const loaded = await loadRemotePlugins(sources);
        if (cancelled) return;
        setTools(loaded);
        setState('ready');
      } catch (err) {
        // loadRemotePlugins already swallows per-plugin failures; this catch
        // is defensive for unexpected loader errors.
        console.warn('[remote-plugin] Unexpected loader error:', err);
        if (cancelled) return;
        setState('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toolMatch = route.match(/^\/tools\/([^/]+)$/);
  const activeTool = toolMatch ? tools.find((t) => t.id === toolMatch[1]) : undefined;
  const [changelogTool, setChangelogTool] = useState<LoadedRemotePlugin | null>(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>
          <a href={href('/')} style={{ color: 'inherit', textDecoration: 'none' }}>market-gr · tools</a>
        </h1>
        <span style={{ flex: 1 }} />
        <a href="https://github.com/fiskaltrust/market-gr" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <main className="app-main">
        {activeTool ? (
          <>
            <div className="tool-page-title">
              <a href={href('/')} className="btn btn-secondary">← Tools</a>
              <h2>{activeTool.name}</h2>
              <button
                type="button"
                onClick={() => setChangelogTool(activeTool)}
                title={`Show changelog for ${activeTool.name}`}
                aria-label={`Show changelog for ${activeTool.name}`}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-muted)',
                  borderRadius: 999,
                  padding: '2px 10px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                v{activeTool.version}
              </button>
            </div>
            <p style={{ marginTop: 0, color: 'var(--fg-muted)' }}>{activeTool.description}</p>
            <Suspense fallback={<p>Loading tool…</p>}>
              <activeTool.component />
            </Suspense>
          </>
        ) : (
          <Home
            tools={tools}
            remoteLoading={state === 'loading'}
            onShowChangelog={setChangelogTool}
          />
        )}
      </main>

      <ChangelogModal
        open={changelogTool !== null}
        onClose={() => setChangelogTool(null)}
        title={changelogTool?.name ?? ''}
        raw={changelogTool?.changelog ?? ''}
      />
    </div>
  );
}

interface HomeProps {
  tools: LoadedRemotePlugin[];
  remoteLoading: boolean;
  onShowChangelog: (tool: LoadedRemotePlugin) => void;
}

function Home({ tools, remoteLoading, onShowChangelog }: HomeProps) {
  return (
    <>
      <p style={{ color: 'var(--fg-muted)', marginTop: 0 }}>
        Browser-based utilities for working with Greek market (myDATA / fiskaltrust) data.
        Pick a tool below — everything runs locally in your browser, nothing is uploaded.
      </p>
      {tools.map((tool) => (
        <div key={tool.id} style={{ position: 'relative' }}>
          <a href={href(`/tools/${tool.id}`)} className="tool-card">
            <h2>{tool.name}</h2>
            <p>{tool.description}</p>
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowChangelog(tool);
            }}
            title={`Show changelog for ${tool.name}`}
            aria-label={`Show changelog for ${tool.name}`}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--fg-muted)',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            v{tool.version}
          </button>
        </div>
      ))}
      {remoteLoading ? (
        <p style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 16 }}>
          Loading plugins…
        </p>
      ) : null}
    </>
  );
}
