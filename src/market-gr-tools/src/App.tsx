import { Suspense } from 'react';
import { tools, findTool } from './apphost/tools';
import { useHashRoute, href } from './apphost/router';

export function App() {
  const route = useHashRoute();
  const toolMatch = route.match(/^\/tools\/([^/]+)$/);
  const activeTool = toolMatch ? findTool(toolMatch[1]) : undefined;

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
            </div>
            <p style={{ marginTop: 0, color: 'var(--fg-muted)' }}>{activeTool.description}</p>
            <Suspense fallback={<p>Loading tool…</p>}>
              <activeTool.component />
            </Suspense>
          </>
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
}

function Home() {
  return (
    <>
      <p style={{ color: 'var(--fg-muted)', marginTop: 0 }}>
        Browser-based utilities for working with Greek market (myDATA / fiskaltrust) data.
        Pick a tool below — everything runs locally in your browser, nothing is uploaded.
      </p>
      {tools.map((tool) => (
        <a key={tool.id} href={href(`/tools/${tool.id}`)} className="tool-card">
          <h2>{tool.name}</h2>
          <p>{tool.description}</p>
        </a>
      ))}
    </>
  );
}
