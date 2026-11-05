/**
 * Link previews for shared project links (Telegram, Facebook, WhatsApp, X…).
 *
 * Those apps read the page with a bot that doesn't run JavaScript, so they only
 * see index.html. middleware.ts (project root, runs on Vercel) uses these helpers
 * to put the project's own title, text and photo into the page for such bots.
 *
 * No imports: this file is also bundled into the Vercel middleware.
 */

export const SITE_URL = 'https://www.fundy.uz';

/** Bots that fetch pages to build link previews or search results. */
export function isPreviewBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /telegrambot|facebookexternalhit|facebot|twitterbot|whatsapp|slackbot|linkedinbot|discordbot|vkshare|skypeuripreview|pinterest|redditbot|applebot|googlebot|bingbot|yandex|embedly|bot\b|crawler|spider/i.test(
    userAgent,
  );
}

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
  const image = !path
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
