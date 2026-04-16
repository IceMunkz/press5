import { useState, useEffect } from 'react';

interface TSData {
  online: boolean;
  queryAvailable: boolean;
  clients: number;
  maxClients: number;
  channels: number;
  name: string;
  uptime: number;
  host: string;
  port: number;
  error?: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h uptime`;
  return `${hours}h uptime`;
}

interface Props {
  compact?: boolean;
}

export default function TSServerStatus({ compact = false }: Props) {
  const [data, setData] = useState<TSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ts-status.json');
      if (res.ok) setData(await res.json());
    } catch {
      // network error — keep previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const tsHost = data?.host ?? 'press5.xyz';
  const tsPort = data?.port ?? 9987;
  const tsUri  = tsPort === 9987 ? `ts3server://${tsHost}` : `ts3server://${tsHost}?port=${tsPort}`;
  const tsDisplay = tsPort === 9987 ? tsHost : `${tsHost}:${tsPort}`;

  const handleConnect = () => {
    window.location.href = tsUri;
    setTimeout(() => setShowModal(true), 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tsDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // queryAvailable = false means the server query port is blocked,
  // but the voice server itself is likely running fine.
  const queryBlocked = data && !data.queryAvailable;

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              loading         ? 'bg-yellow-400 animate-pulse' :
              data?.online    ? 'bg-green-400 animate-pulse' :
              queryBlocked    ? 'bg-green-400 animate-pulse' : // assume online if only query is blocked
              'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              {loading      ? 'Checking...' :
               data?.online ? `${data.clients} users online` :
               queryBlocked ? 'press5.xyz' :
               'Offline'}
            </span>
          </div>
          {!loading && data?.online && data.queryAvailable && (
            <>
              <span className="text-white/40">·</span>
              <span className="text-sm text-blue-100">{data.channels} channels</span>
            </>
          )}
          <button
            onClick={handleConnect}
            className="ml-2 px-4 py-1.5 bg-white text-brand-blue text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Connect
          </button>
        </div>

        {/* Modal (shared between compact and full) */}
        {showModal && <ConnectModal tsUri={tsUri} tsDisplay={tsDisplay} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Live Server Status</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              loading      ? 'bg-yellow-400 animate-pulse' :
              data?.online ? 'bg-green-400 animate-pulse' :
              queryBlocked ? 'bg-green-400 animate-pulse' :
              'bg-red-400'
            }`} />
            <span className="text-sm font-medium text-gray-300">
              {loading      ? 'Checking...' :
               data?.online ? 'Online' :
               queryBlocked ? 'Online' :
               'Offline'}
            </span>
          </div>
        </div>

        {/* Stats area */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : data?.online && data.queryAvailable ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{data.clients}</div>
                <div className="text-xs text-gray-400 mt-1">Users Online</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{data.channels}</div>
                <div className="text-xs text-gray-400 mt-1">Channels</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{data.maxClients}</div>
                <div className="text-xs text-gray-400 mt-1">Max Slots</div>
              </div>
            </div>
            {data.uptime > 0 && (
              <p className="text-xs text-gray-500 mb-4">{formatUptime(data.uptime)}</p>
            )}
          </>
        ) : queryBlocked ? (
          /* Query port is firewalled — server is running, we just can't poll it */
          <div className="bg-gray-800 rounded-xl p-5 mb-6 flex items-center gap-4">
            <div>
              <p className="text-green-400 font-semibold text-sm">Server Running</p>
              <p className="text-gray-400 text-xs mt-1 font-mono">{tsDisplay}</p>
            </div>
            <div className="ml-auto text-2xl">🎧</div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-4 text-center mb-6">
            <p className="text-red-400 font-medium">Server Unreachable</p>
            <p className="text-gray-500 text-sm mt-1">Check back soon</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConnect}
            className="flex-1 py-3 bg-brand-gradient rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Connect to Server
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 py-3 bg-gray-800 rounded-xl font-semibold text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Server Address
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-3 text-center">Auto-refreshes every 30 seconds</p>
      </div>

      {showModal && <ConnectModal tsUri={tsUri} tsDisplay={tsDisplay} onClose={() => setShowModal(false)} />}
    </>
  );
}

function ConnectModal({ tsUri, tsDisplay, onClose }: { tsUri: string; tsDisplay: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tsDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">Connect to Netplayers</h3>
        <p className="text-gray-600 text-sm mb-6">
          Copy the address below and paste it into TeamSpeak, or click "Open in TeamSpeak" to connect automatically.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-6">
          <code className="text-sm font-mono text-gray-800 flex-1">{tsDisplay}</code>
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors ${
              copied ? 'bg-green-500' : 'bg-brand-blue hover:bg-brand-blue-dark'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="space-y-3">
          <a
            href={tsUri}
            className="block w-full text-center py-3 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Open in TeamSpeak
          </a>
          <a
            href="https://www.teamspeak.com/en/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Download TeamSpeak (Free)
          </a>
          <button
            onClick={onClose}
            className="block w-full text-center py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
