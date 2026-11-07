/**
 * Vercel Function: /sitemap.xml (rewrite in vercel.json) — the list of pages search engines
 * should know about. Always current: the fixed public pages plus every project the public
 * may see (database rules decide which ones; drafts and hidden projects never appear).
 *
 * Self-contained on purpose (no imports), like api/preview.ts.
 */

const SITE_URL = 'https://www.fundy.uz';

/** Public pages that are always there, most important first. */
export const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/explore', priority: '0.9', changefreq: 'daily' },
  { path: '/start', priority: '0.8', changefreq: 'monthly' },
  { path: '/learn', priority: '0.6', changefreq: 'monthly' },
  { path: '/trust-and-safety', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms', priority: '0.2', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
];

export type SitemapProject = { slug: string; updated_at: string | null };

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function buildSitemap(projects: SitemapProject[]): string {
  const url = (loc: string, extra: string) => `  <url>\n    <loc>${escape(loc)}</loc>\n${extra}  </url>`;
  const pages = STATIC_PAGES.map(p =>
    url(
      `${SITE_URL}${p.path}`,
      `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n`,
    ),
  );
  const projectPages = projects.map(p =>
    url(
      `${SITE_URL}/projects/${encodeURIComponent(p.slug)}`,
      `${p.updated_at ? `    <lastmod>${p.updated_at.slice(0, 10)}</lastmod>\n` : ''}    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n`,
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages,
    ...projectPages,
    '</urlset>',
    '',
  ].join('\n');
}

/** GET /api/sitemap (reached as /sitemap.xml). Never fails: at worst only the fixed pages are listed. */
export async function GET(): Promise<Response> {
  let projects: SitemapProject[] = [];
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (supabaseUrl && key) {
      const api = new URL(`${supabaseUrl}/rest/v1/projects`);
      api.searchParams.set('select', 'slug,updated_at');
      api.searchParams.set('order', 'updated_at.desc');
      api.searchParams.set('limit', '5000');
      const res = await fetch(api, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) projects = ((await res.json()) as SitemapProject[]).filter(p => p.slug);
    }
  } catch {
    /* keep only the fixed pages */
  }
  return new Response(buildSitemap(projects), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
