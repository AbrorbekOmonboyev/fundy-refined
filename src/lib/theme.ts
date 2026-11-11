/**
 * Light / dark theme. The choice is saved in this browser; until someone picks,
 * the site follows the device setting. index.html applies it before the first
 * paint (no white flash), this module keeps it in sync afterwards.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'fundy-theme';
const THEME_COLORS: Record<Theme, string> = { light: '#FAF9F6', dark: '#121413' };
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  listeners.forEach(l => l());
}

/**
 * Switches theme. When the browser supports it, the new theme spreads out
 * in a circle from the point (x, y), e.g. the button that was clicked.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode: just don't remember */
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion || !origin) {
    apply(theme);
    return;
  }
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = document.startViewTransition(() => apply(theme));
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

/** Follows the device setting while the person hasn't picked a theme. */
export function watchSystemTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', e => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });
  apply(getTheme()); // sync the browser bar colour with what index.html chose
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getTheme,
    () => 'light',
  );
}
