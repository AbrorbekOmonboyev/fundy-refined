import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * On every navigation: scroll to `#anchor` if the URL has one, otherwise to the top.
 * (Browser back/forward keeps its own scroll position.)
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick so the new page has rendered the target element.
      const id = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => window.clearTimeout(id);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
