import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  let clients = 0;
  let maxClients = 0;
  let online = false;

  try {
    const reqUrl = new URL(request.url);
    const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
    const res = await fetch(`${baseUrl}/api/ts-status.json`);
    if (res.ok) {
      const data = await res.json() as { online: boolean; queryAvailable: boolean; clients: number; maxClients: number };
      clients = data.clients;
      maxClients = data.maxClients;
      // If query port is blocked (queryAvailable=false) we assume server is running
      online = data.online || !data.queryAvailable;
    }
  } catch {
    // Server might not be available
  }

  const statusColor = online ? '#22c55e' : '#ef4444';
  const statusText = online
    ? (clients > 0 ? `${clients}/${maxClients} online` : 'Online')
    : 'Offline';
  const badgeWidth = 180;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${badgeWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="90" height="20" fill="#555"/>
    <rect x="90" width="90" height="20" fill="${statusColor}"/>
    <rect width="${badgeWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text x="455" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="790" lengthAdjust="spacing">Netplayers</text>
    <text x="455" y="140" transform="scale(.1)" textLength="790" lengthAdjust="spacing">Netplayers</text>
    <text x="1345" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="790" lengthAdjust="spacing">${statusText}</text>
    <text x="1345" y="140" transform="scale(.1)" textLength="790" lengthAdjust="spacing">${statusText}</text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
    },
  });
};
