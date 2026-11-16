import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { injectPreview, projectPreview, type PreviewProject } from '../../api/preview';

const SUPABASE = 'https://abc.supabase.co';
const project = (over: Partial<PreviewProject> = {}): PreviewProject => ({
  slug: 'fargona-issiqxonasi',
  cover_image_path: 'user1/proj1/cover photo.jpg',
  original_language: 'en',
  project_translations: [
    { language: 'en', title: 'Fergana greenhouse', tagline: 'Fresh vegetables all year' },
    { language: 'uz', title: 'Farg‘ona issiqxonasi', tagline: 'Yil bo‘yi yangi sabzavot' },
  ],
  ...over,
});

describe('project preview', () => {
  it('prefers the Uzbek text and builds a full photo address', () => {
    const p = projectPreview(project(), SUPABASE);
    expect(p.title).toBe('Farg‘ona issiqxonasi · Fundy');
    expect(p.description).toBe('Yil bo‘yi yangi sabzavot');
    expect(p.image).toBe(`${SUPABASE}/storage/v1/object/public/project-images/user1/proj1/cover%20photo.jpg`);
    expect(p.url).toBe('https://www.fundy.uz/projects/fargona-issiqxonasi');
  });

  it('falls back to the original language and to site images', () => {
    const p = projectPreview(
      project({ cover_image_path: '/images/hero.jpg', project_translations: [project().project_translations[0]] }),
      SUPABASE,
    );
    expect(p.title).toBe('Fergana greenhouse · Fundy');
    expect(p.image).toBe('https://www.fundy.uz/images/hero.jpg');
    expect(projectPreview(project({ cover_image_path: null }), SUPABASE).image).toBe(
      'https://www.fundy.uz/og-image.png',
    );
  });
});

describe('putting the preview into index.html', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const out = injectPreview(html, {
    title: 'Tom & "Jerry" <script>',
    description: 'Best',
    image: 'https://x/y.jpg',
    url: 'https://www.fundy.uz/projects/a',
  });

  it('replaces the site-wide tags, once each', () => {
    expect(out.match(/<title>/g)).toHaveLength(1);
    expect(out.match(/property="og:title"/g)).toHaveLength(1);
    expect(out.match(/property="og:image"/g)).toHaveLength(1);
    expect(out.match(/name="description"/g)).toHaveLength(1);
    expect(out).toContain('content="https://x/y.jpg"');
    expect(out).not.toContain('og-image.png');
  });

  it('escapes text so it cannot break the page', () => {
    expect(out).toContain('<title>Tom &amp; &quot;Jerry&quot; &lt;script&gt;</title>');
    expect(out).not.toContain('<script>"');
  });

  it('keeps the rest of the page', () => {
    expect(out).toContain('<div id="root"></div>');
    expect(out).toContain('theme-color');
  });
});
