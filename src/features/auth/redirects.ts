/**
 * Helpers for "where to go after signing in".
 * Only paths inside this site are allowed, so a link like
 * /login?next=https://evil.example can't send people elsewhere.
 */

export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}

/** Full URL of a page on this site, for links inside emails. */
export function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

/** /auth/callback URL that continues to `next` once the email link is opened. */
export function callbackUrl(next: string): string {
  return absoluteUrl(`/auth/callback?next=${encodeURIComponent(safeNext(next))}`);
}
