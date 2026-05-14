import { Suspense, useEffect, useState } from 'react';
import { tools as staticTools, findTool, type ToolDefinition } from './apphost/tools';
import {
  loadRemotePlugins,
  type LoadedRemotePlugin,
} from './apphost/remotePluginLoader';
import { remotePluginSources } from './apphost/remotePlugins';
import { useHashRoute, href } from './apphost/router';
import ChangelogModal from './components/ChangelogModal';

/**
 * Combined tool entry. Static, in-tree plugins are plain `ToolDefinition`s;
 * runtime-loaded plugins additionally carry a `remote: true` flag so the UI
 * can render a small badge.
 */
type CombinedTool = ToolDefinition & { remote?: boolean };

export function App() {
  const route = useHashRoute();
  const [remoteTools, setRemoteTools] = useState<LoadedRemotePlugin[]>([]);
  const [remoteState, setRemoteState] = useState<'loading' | 'ready'>(
    remotePluginSources.length === 0 ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (remotePluginSources.length === 0) return;
    let cancelled = false;
    loadRemotePlugins(remotePluginSources)
      .then((loaded) => {
        if (cancelled) return;
        setRemoteTools(loaded);
        setRemoteState('ready');
      })
      .catch((err) => {
        // loadRemotePlugins already swallows per-plugin failures; this catch
        // is defensive for the Promise.all itself.
        console.warn('[remote-plugin] Unexpected loader error:', err);
        if (cancelled) return;
        setRemoteState('ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allTools: CombinedTool[] = [...staticTools, ...remoteTools];
  const toolMatch = route.match(/^\/tools\/([^/]+)$/);
  const activeTool: CombinedTool | undefined = toolMatch
    ? allTools.find((t) => t.id === toolMatch[1]) ?? findTool(toolMatch[1])
    : undefined;
  const [changelogTool, setChangelogTool] = useState<CombinedTool | null>(null);

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
              {activeTool.remote ? <RemoteBadge /> : null}
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
            tools={allTools}
            remoteLoading={remoteState === 'loading'}
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

function RemoteBadge() {
  return (
    <span
      title="Loaded at runtime from a remote manifest. See docs/plugin-architecture.md."
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--fg-muted)',
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 11,
        fontFamily: 'monospace',
      }}
    >
      remote
    </span>
  );
}

interface HomeProps {
  tools: CombinedTool[];
  remoteLoading: boolean;
  onShowChangelog: (tool: CombinedTool) => void;
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
            <h2>
              {tool.name}
              {tool.remote ? (
                <span
                  title="Loaded at runtime from a remote manifest."
                  style={{
                    marginLeft: 8,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--fg-muted)',
                    borderRadius: 999,
                    padding: '1px 8px',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    verticalAlign: 'middle',
                  }}
                >
                  remote
                </span>
              ) : null}
            </h2>
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
          Loading remote plugins…
        </p>
      ) : null}
    </>
  );
}
