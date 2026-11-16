/**
 * Vercel Function: link previews for shared project links (Telegram, Facebook, WhatsApp, X…).
 *
 * Those apps read the page with a bot that doesn't run JavaScript, so they only see
 * index.html. vercel.json sends ONLY those bots' requests for /projects/:slug here
 * (matched by user agent); everyone else gets the normal site and never runs this code.
 * We put the project's own title, text and photo into index.html and return it.
 *
 * Self-contained on purpose (no imports), so it runs on Vercel without bundling.
 * Only projects the public may see are found (database rules).
 */

export const SITE_URL = 'https://www.fundy.uz';

export type PreviewProject = {
  slug: string;
  cover_image_path: string | null;
  original_language: string;
  project_translations: { language: string; title: string; tagline: string | null }[];
};

export type Preview = { title: string; description: string; image: string; url: string };

/** Title, text and photo for one project. Uzbek text first (the site's default), else the original. */
export function projectPreview(p: PreviewProject, supabaseUrl: string): Preview {
  const text =
    p.project_translations.find(t => t.language === 'uz') ??
    p.project_translations.find(t => t.language === p.original_language) ??
    p.project_translations[0];
  const path = p.cover_image_path;
  // Telegram and Facebook can't show SVG (the ikat pattern covers), so those use the site image.
  const image =
    !path || path.toLowerCase().endsWith('.svg')
      ? `${SITE_URL}/og-image.png`
      : path.startsWith('http')
        ? path
        : path.startsWith('/')
          ? `${SITE_URL}${path}`
          : `${supabaseUrl}/storage/v1/object/public/project-images/${path.split('/').map(encodeURIComponent).join('/')}`;
  const description = (text?.tagline ?? '').trim();
  return {
    title: `${text?.title ?? p.slug} · Fundy`,
    description: description.length > 200 ? `${description.slice(0, 197)}…` : description,
    image,
    url: `${SITE_URL}/projects/${encodeURIComponent(p.slug)}`,
  };
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replaces the site-wide title, description and preview tags in index.html. */
export function injectPreview(html: string, p: Preview): string {
  const title = escape(p.title);
  const description = escape(p.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:site_name" content="Fundy" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${escape(p.image)}" />`,
    `<meta property="og:url" content="${escape(p.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="canonical" href="${escape(p.url)}" />`,
  ].join('\n    ');

  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '')
    .replace(/<meta\s+(property|name)="(og|twitter):[^"]*"[^>]*\/>\s*/gi, '');
  return cleaned.replace('</head>', `    ${tags}\n  </head>`);
}

const DEFAULT_PAGE = `<!doctype html><html lang="uz"><head><meta charset="UTF-8" /><title>Fundy</title></head><body></body></html>`;

/** GET /api/preview?slug=… (reached through the rewrite in vercel.json). */
export async function GET(request: Request): Promise<Response> {
  const html = (body: string) =>
    new Response(body, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300' },
    });

  let page = DEFAULT_PAGE;
  try {
    const res = await fetch(`${SITE_URL}/index.html`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) page = await res.text();
  } catch {
    /* keep the default page */
  }

  try {
    const slug = new URL(request.url).searchParams.get('slug') ?? '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!slug || !supabaseUrl || !key) return html(page);

    const api = new URL(`${supabaseUrl}/rest/v1/projects`);
    api.searchParams.set(
      'select',
      'slug,cover_image_path,original_language,project_translations(language,title,tagline)',
    );
    api.searchParams.set('slug', `eq.${slug}`);
    api.searchParams.set('limit', '1');
    const found = await fetch(api, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(3000),
    });
    const [project] = found.ok ? ((await found.json()) as PreviewProject[]) : [];
    return html(project ? injectPreview(page, projectPreview(project, supabaseUrl)) : page);
  } catch {
    return html(page); // never fail: at worst the bot sees the site-wide preview
  }
}
