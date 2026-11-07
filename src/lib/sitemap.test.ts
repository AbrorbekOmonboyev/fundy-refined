import { describe, expect, it } from 'vitest';
import { buildSitemap, STATIC_PAGES } from '../../api/sitemap';

describe('sitemap', () => {
  it('lists the fixed public pages even with no projects', () => {
    const xml = buildSitemap([]);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml.match(/<url>/g)).toHaveLength(STATIC_PAGES.length);
    expect(xml).toContain('<loc>https://www.fundy.uz/</loc>');
    expect(xml).not.toContain('/admin');
  });

  it('adds projects with their last change date, safely encoded', () => {
    const xml = buildSitemap([{ slug: "farg'ona & co", updated_at: '2026-11-07T10:00:00Z' }]);
    expect(xml).toContain("<loc>https://www.fundy.uz/projects/farg'ona%20%26%20co</loc>".replace("'", '&apos;'));
    expect(xml).toContain('<lastmod>2026-11-07</lastmod>');
  });
});
