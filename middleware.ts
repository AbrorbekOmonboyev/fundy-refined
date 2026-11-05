/**
 * Vercel Routing Middleware — runs on the server before a project page is served.
 *
 * Only for link-preview bots (Telegram, Facebook…): puts the project's own title,
 * text and photo into the page so shared links look right. Everyone else gets the
 * normal site with no delay. Only projects the public may see are found (database rules).
 */
import { next } from '@vercel/functions';
import { injectPreview, isPreviewBot, projectPreview, type PreviewProject } from './src/lib/linkPreview';

export const config = { matcher: ['/projects/:slug'] };

export default async function middleware(request: Request) {
  if (!isPreviewBot(request.headers.get('user-agent'))) return next();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const slug = decodeURIComponent(new URL(request.url).pathname.split('/')[2] ?? '');
  if (!supabaseUrl || !key || !slug) return next();

  try {
    const api = new URL(`${supabaseUrl}/rest/v1/projects`);
    api.searchParams.set(
      'select',
      'slug,cover_image_path,original_language,project_translations(language,title,tagline)',
    );
    api.searchParams.set('slug', `eq.${slug}`);
    api.searchParams.set('limit', '1');

    const [found, page] = await Promise.all([
      fetch(api, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3000) }),
      fetch(new URL('/index.html', request.url), { signal: AbortSignal.timeout(3000) }),
    ]);
    if (!found.ok || !page.ok) return next();
    const [project] = (await found.json()) as PreviewProject[];
    if (!project) return next();

    const html = injectPreview(await page.text(), projectPreview(project, supabaseUrl));
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300' },
    });
  } catch {
    return next(); // never block the page because of a preview
  }
}
