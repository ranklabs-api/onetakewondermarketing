import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { writeFile } from 'node:fs/promises';

const SITE = 'https://onetakewondermarketing.com';

// The sitemap used to be a hand-written file in public/, which meant it listed
// the eight pages someone remembered and none of the twenty-one blog posts, and
// its URLs had no trailing slash while every page's own canonical tag did.
// Building it from the pages Astro just emitted is the only version that cannot
// drift: a new post is in the sitemap because it exists, not because anyone
// remembered. robots.txt points at /sitemap.xml, so that is where it is written.
const sitemapFromPages = () => ({
  name: 'sitemap-from-built-pages',
  hooks: {
    'astro:build:done': async ({ dir, pages }) => {
      const urls = [...new Set(pages
        // The 404 page is built like any other but is not a page to index.
        .filter((p) => !/^\/?404\/?$/.test(p.pathname))
        .map((p) => {
          const path = p.pathname.replace(/^\//, '');
          return `${SITE}/${path}${path === '' || path.endsWith('/') ? '' : '/'}`;
        }))].sort();
      const body = urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join('\n');
      await writeFile(new URL('sitemap.xml', dir),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
    },
  },
});

export default defineConfig({
  integrations: [tailwind(), sitemapFromPages()],
  output: 'static',
  // Pages serves directory URLs, so the slash is part of the real URL; saying
  // so here keeps dev honest and stops links being written to the redirect.
  trailingSlash: 'always',
  site: 'https://onetakewondermarketing.com',
});