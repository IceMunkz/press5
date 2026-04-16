import type { APIRoute } from 'astro';
import * as net from 'net';

export const prerender = false;

export interface TSStatus {
  online: boolean;
  queryAvailable: boolean; // true = we got live stats; false = query port blocked
  clients: number;
  maxClients: number;
  channels: number;
  name: string;
  uptime: number;
  host: string;
  port: number;
  error?: string;
}

function parseKV(line: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of line.trim().split(' ')) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      result[pair.slice(0, idx)] = pair.slice(idx + 1)
        .replace(/\\s/g, ' ')
        .replace(/\\\//g, '/')
        .replace(/\\\\/g, '\\');
    }
  }
  return result;
}

/** Try the TS3 Raw ServerQuery protocol on port 10011 */
async function queryRawSQ(host: string, port: number, virtualServerId: number): Promise<TSStatus | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, 4000);

    const socket = net.createConnection({ host, port });
    let buffer = '';
    let step = 0;

    socket.on('data', (data: Buffer) => {
      buffer += data.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (step === 0 && trimmed.startsWith('TS3')) {
          step = 1;
          socket.write(`use sid=${virtualServerId}\n`);
          continue;
        }
        if (step === 1 && trimmed.startsWith('error id=0')) {
          step = 2;
          socket.write('serverinfo\n');
          continue;
        }
        if (step === 2 && trimmed.startsWith('virtualserver_')) {
          const kv = parseKV(trimmed);
          const clients = Math.max(
            0,
            parseInt(kv['virtualserver_clientsonline'] ?? '0') -
            parseInt(kv['virtualserver_queryclientsonline'] ?? '0')
          );
          clearTimeout(timeout);
          socket.write('quit\n');
          socket.destroy();
          resolve({
            online: true,
            queryAvailable: true,
            clients,
            maxClients: parseInt(kv['virtualserver_maxclients'] ?? '0'),
            channels: parseInt(kv['virtualserver_channelsonline'] ?? '0'),
            uptime: parseInt(kv['virtualserver_uptime'] ?? '0'),
            name: kv['virtualserver_name'] ?? 'press5.xyz',
            host,
            port: parseInt(import.meta.env.TS_VOICE_PORT ?? '9987'),
          });
          return;
        }
        if (step === 1 && trimmed.startsWith('error') && !trimmed.includes('id=0')) {
          clearTimeout(timeout);
          socket.destroy();
          resolve(null);
          return;
        }
      }
    });

    socket.on('error', () => { clearTimeout(timeout); resolve(null); });
  });
}

/** Try the TS3 Web Query HTTP API on port 10080 (TS 3.13+) */
async function queryWebSQ(host: string, webPort: number, user: string, pass: string, virtualServerId: number): Promise<TSStatus | null> {
  try {
    const auth = Buffer.from(`${user}:${pass}`).toString('base64');
    const headers = { Authorization: `Basic ${auth}` };

    // Select the virtual server first
    const useRes = await fetch(`http://${host}:${webPort}/${virtualServerId}/serverinfo`, {
      headers,
      signal: AbortSignal.timeout(4000),
    });

    if (!useRes.ok) return null;
    const text = await useRes.text();
    const kv = parseKV(text.split('\n')[0] ?? '');

    const clients = Math.max(
      0,
      parseInt(kv['virtualserver_clientsonline'] ?? '0') -
      parseInt(kv['virtualserver_queryclientsonline'] ?? '0')
    );

    return {
      online: true,
      queryAvailable: true,
      clients,
      maxClients: parseInt(kv['virtualserver_maxclients'] ?? '0'),
      channels: parseInt(kv['virtualserver_channelsonline'] ?? '0'),
      uptime: parseInt(kv['virtualserver_uptime'] ?? '0'),
      name: kv['virtualserver_name'] ?? 'press5.xyz',
      host,
      port: parseInt(import.meta.env.TS_VOICE_PORT ?? '9987'),
    };
  } catch {
    return null;
  }
}

export const GET: APIRoute = async () => {
  const host       = import.meta.env.TS_QUERY_HOST ?? 'press5.xyz';
  const sqPort     = parseInt(import.meta.env.TS_QUERY_PORT ?? '10011');
  const webPort    = parseInt(import.meta.env.TS_WEB_QUERY_PORT ?? '10080');
  const sqUser     = import.meta.env.TS_QUERY_USER ?? 'serveradmin';
  const sqPass     = import.meta.env.TS_QUERY_PASS ?? '';
  const serverId   = parseInt(import.meta.env.TS_SERVER_ID ?? '1');
  const voicePort  = parseInt(import.meta.env.TS_VOICE_PORT ?? '9987');

  // 1. Try raw ServerQuery (port 10011)
  let status = await queryRawSQ(host, sqPort, serverId);

  // 2. Fall back to Web Query API (port 10080) if credentials are set
  if (!status && sqPass) {
    status = await queryWebSQ(host, webPort, sqUser, sqPass, serverId);
  }

  // 3. If both query methods are blocked, still return the server address
  //    so the widget shows the connect button rather than a dead error state.
  const result: TSStatus = status ?? {
    online: false,
    queryAvailable: false,
    clients: 0,
    maxClients: 0,
    channels: 0,
    name: 'press5.xyz',
    uptime: 0,
    host,
    port: voicePort,
    error: 'query_unavailable',
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
