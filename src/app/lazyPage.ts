import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG = 'fundy_chunk_reload';

// sessionStorage can be blocked (private mode); then we simply don't remember.
const store = {
  get: () => {
    try {
      return sessionStorage.getItem(RELOAD_FLAG);
    } catch {
      return null;
    }
  },
  set: () => {
    try {
      sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      /* ignore */
    }
  },
};

/**
 * A page that is downloaded only when it is first opened.
 *
 * After a new version is deployed, a visitor with the old site still open asks for
 * page files that no longer exist. Then we reload once to get the new version.
 */
export function page<M extends Record<string, unknown>, K extends keyof M>(load: () => Promise<M>, name: K) {
  return lazy(async () => {
    try {
      const module = await load();
      store.clear();
      return { default: module[name] as ComponentType };
    } catch (error) {
      if (!store.get()) {
        store.set();
        window.location.reload();
        return new Promise<never>(() => {}); // wait for the reload
      }
      throw error;
    }
  });
}
