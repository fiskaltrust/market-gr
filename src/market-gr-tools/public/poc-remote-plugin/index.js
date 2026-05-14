// Remote Plugin POC — proof-of-concept ESM module.
//
// This file is intentionally hand-written (no bundler, no JSX) so it can ship
// as a single static asset under `public/poc-remote-plugin/` and be loaded by
// the apphost at runtime via `await import(url)`. In a real plugin repo we'd
// run a Vite library build that emits a single `index.js` with the same
// contract.
//
// Contract (see docs/plugin-architecture.md, "Remote ESM plugin contract"):
//   export default function createPlugin(deps) -> { Component }
//
// `deps.React` is the apphost's React instance. We never import React from
// inside the plugin — that would either pull in a second copy or require an
// import map. Passing it in as a dep keeps everything in one realm and means
// hooks/context Just Work.

/**
 * @typedef {object} PluginDeps
 * @property {typeof import('react')} React
 */

/**
 * @typedef {object} PluginExports
 * @property {import('react').ComponentType} Component
 */

/**
 * @param {PluginDeps} deps
 * @returns {PluginExports}
 */
export default function createPlugin(deps) {
  const { React } = deps;
  const { useState, useEffect } = React;
  const h = React.createElement;

  function HelloRemote() {
    const [count, setCount] = useState(0);
    const [loadedAt] = useState(() => new Date().toISOString());

    useEffect(() => {
      // Trivial effect to prove hooks work via the shared React instance.
      document.title = `POC remote plugin · ${count} clicks`;
      return () => {
        document.title = 'market-gr · tools';
      };
    }, [count]);

    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
      h(
        'p',
        { style: { marginTop: 0, color: 'var(--fg-muted)' } },
        'This component was fetched at runtime from ',
        h('code', null, 'public/poc-remote-plugin/index.js'),
        '. The apphost discovered it via ',
        h('code', null, 'manifest.json'),
        ' and rendered it alongside the static, in-tree plugins.',
      ),
      h(
        'div',
        {
          style: {
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          },
        },
        h(
          'button',
          {
            type: 'button',
            className: 'btn',
            onClick: () => setCount((c) => c + 1),
          },
          'Click me',
        ),
        h(
          'span',
          { style: { fontFamily: 'monospace' } },
          'count = ',
          String(count),
        ),
      ),
      h(
        'p',
        { style: { color: 'var(--fg-muted)', fontSize: 12, margin: 0 } },
        'Module loaded at ',
        loadedAt,
        '. React instance is ',
        h('code', null, 'apphost-shared'),
        ' — verifying that hooks and context work across the remote-module boundary.',
      ),
    );
  }

  return { Component: HelloRemote };
}
