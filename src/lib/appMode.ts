/**
 * "App mode": the site running inside the Fundy Android app (or installed to a home screen).
 *
 * There the site should feel like an app: a bottom tab bar instead of the big website
 * header and footer. The normal website in a browser is not affected.
 *
 * Detection:
 *  - the browser's display mode is "standalone" (the Android app opens the site this way),
 *  - or the page was opened from the Android app (referrer android-app://uz.fundy.app),
 *  - or ?app=1 for testing on a computer (?app=0 turns it off again).
 * The flag is kept per tab (sessionStorage): the app and Chrome share storage, and the
 * website in Chrome must stay a website.
 */
const KEY = 'fundy_app_mode';

function read(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === '1') sessionStorage.setItem(KEY, '1');
    if (params.get('app') === '0') sessionStorage.removeItem(KEY);
    if (document.referrer.startsWith('android-app://uz.fundy.app')) sessionStorage.setItem(KEY, '1');
    if (sessionStorage.getItem(KEY) === '1') return true;
  } catch {
    /* storage blocked: fall back to the display mode */
  }
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

let cached: boolean | null = null;

export function isAppMode(): boolean {
  if (cached === null) cached = typeof window !== 'undefined' && read();
  return cached;
}

/** Called once at start-up: lets CSS react with `.app-mode` on <html>. */
export function startAppMode() {
  if (isAppMode()) document.documentElement.classList.add('app-mode');
}
