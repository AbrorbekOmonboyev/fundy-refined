import { useEffect } from 'react';

const SITE = 'Fundy';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/**
 * Sets the browser tab title and the page description.
 * When the page closes, the tab title goes back to plain "Fundy" so the next
 * page never shows a stale title. Link previews for bots: see api/preview.ts.
 */
export function usePageMeta(title: string | null | undefined, description?: string | null) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} · ${SITE}`;
    if (description) {
      const short = description.length > 160 ? `${description.slice(0, 157)}…` : description;
      setMeta('meta[name="description"]', 'name', 'description', short);
      setMeta('meta[property="og:description"]', 'property', 'og:description', short);
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    return () => {
      document.title = SITE;
    };
  }, [title, description]);
}
