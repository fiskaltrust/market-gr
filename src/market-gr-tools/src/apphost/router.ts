import { useEffect, useState } from 'react';

/**
 * Tiny hash-based router. We use hash routing because GitHub Pages serves
 * static files only — without a server-side fallback, deep links to
 * /tools/mydata-to-fiskaltrust would 404 on refresh. Hash routing dodges that.
 */
export function useHashRoute(): string {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function navigate(route: string): void {
  window.location.hash = route;
}

export function href(route: string): string {
  return `#${route}`;
}

function parseHash(hash: string): string {
  if (!hash || hash === '#') return '/';
  return hash.startsWith('#') ? hash.slice(1) : hash;
}
