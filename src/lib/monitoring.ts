/**
 * Error tracking (Sentry). Off unless VITE_SENTRY_DSN is set in the environment
 * (Vercel → Settings → Environment Variables). The Sentry code is downloaded only
 * when it is switched on, so it costs visitors nothing otherwise.
 *
 * Privacy: no IP addresses, cookies or form contents are sent — only the error,
 * the page address and the browser type.
 */
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

type Sentry = typeof import('@sentry/react');
let sentry: Promise<Sentry | null> | null = null;

function load(): Promise<Sentry | null> {
  if (!DSN) return Promise.resolve(null);
  sentry ??= import('@sentry/react')
    .then(s => {
      s.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        // Send only the error itself: no user info, cookies, headers, bodies or
        // query strings (login links carry one-time codes in the address).
        dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
        tracesSampleRate: 0,
      });
      return s;
    })
    .catch(() => null);
  return sentry;
}

/** Start error tracking (call once at startup). */
export function startMonitoring() {
  void load();
}

/** Send an error we caught ourselves (e.g. a page that crashed). */
export function reportError(error: unknown, extra?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.error(error, extra);
  void load().then(s => s?.captureException(error, extra ? { extra } : undefined));
}
