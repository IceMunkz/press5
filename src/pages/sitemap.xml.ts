import type { APIRoute } from 'astro';

export const prerender = true;

const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/web-hosting', priority: '0.9', changefreq: 'weekly' },
  { url: '/game-servers', priority: '0.9', changefreq: 'weekly' },
  { url: '/teamspeak', priority: '0.9', changefreq: 'weekly' },
  { url: '/discord-bots', priority: '0.9', changefreq: 'weekly' },
  { url: '/lavalink', priority: '0.9', changefreq: 'weekly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/status', priority: '0.7', changefreq: 'daily' },
  { url: '/legal/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/legal/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const base = 'https://press5.xyz';
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
