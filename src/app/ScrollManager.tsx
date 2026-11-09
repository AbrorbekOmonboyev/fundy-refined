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
      // The new page may still be loading (pages load in parts): look for the target for up to 2 s.
      let tries = 0;
      const id = window.setInterval(() => {
        const el = document.getElementById(hash.slice(1));
        if (el || ++tries > 40) {
          window.clearInterval(id);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => window.clearInterval(id);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
