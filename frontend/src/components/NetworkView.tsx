import React, { useState, useEffect } from 'react';
import { NetworkUnit, EncryptionLog } from '../types';
import { fetchNearbyResponders, ResponderCandidate } from '../services/api';

interface NetworkViewProps {
  unit: NetworkUnit;
  logs: EncryptionLog[];
  onAddLogMessage?: (msg: string) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ unit, logs }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isScrambled, setIsScrambled] = useState(false);
  const [isPinged, setIsPinged] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<EncryptionLog[]>(logs);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [postgisResponders, setPostgisResponders] = useState<ResponderCandidate[]>([]);

  // Fetch PostGIS nearest responders on mount
  useEffect(() => {
    loadPostgisNodes();
  }, []);

  const loadPostgisNodes = async () => {
    try {
      const candidates = await fetchNearbyResponders(12.9716, 77.5946, 15000);
      setPostgisResponders(candidates);
    } catch (err) {
      console.warn('[NetworkView] PostGIS fetch error:', err);
    }
  };

  // Auto-generate live network logs
  useEffect(() => {
    if (isStreamPaused) return;

    const interval = setInterval(() => {
      const messages = [
        'PostGIS ST_DWithin query matched 3 verified nodes.',
        'Ping response from Sentinel Relay_North (4ms).',
        'Packet integrity verified: 100%. Encryption key match.',
        'Unit location update received: Grid 44-B (12.9716, 77.5946).',
        'Frequency hop executed on sub-band 4.8 GHz.',
        'WebTrace WebSocket telemetry heartbeat nominal.'
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newLog: EncryptionLog = {
        id: String(Date.now()),
        timestamp: timeStr,
        level: 'NET',
        message: randomMsg
      };

      setTerminalLogs((prev) => [newLog, ...prev.slice(0, 15)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreamPaused]);

  const handlePingTarget = () => {
    setIsPinged(true);
    setTimeout(() => setIsPinged(false), 2000);
  };

  const handleScrambleComm = () => {
    setIsScrambled(true);
    setTimeout(() => setIsScrambled(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#343339] pb-4">
        <div>
          <div className="font-mono-tech text-xs text-[#ffb3b5] tracking-widest uppercase">
            POSTGIS SENTINEL GRID NETWORK
          </div>
          <h1 className="font-mono-tech text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight">
            LIVE SPATIAL NODE TRACKER & TELEMETRY
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span className="text-[#a68a8a]">AES-256 SESSION:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 border border-emerald-800 rounded-xs">
            SECURE
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-7 bg-[#20252C] border border-[#343339] p-5 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#343339] pb-3">
            <div className="font-mono-tech text-xs text-white uppercase font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ffb3b5] rounded-full animate-ping" />
              NODE GRID // POSTGIS ST_DWITHIN MATCHER
            </div>
            <div className="font-mono-tech text-[10px] text-[#debfbf]">
              ZOOM: {(zoomLevel * 100).toFixed(0)}%
            </div>
          </div>

          {/* Map Display */}
          <div className="relative w-full h-[380px] md:h-[440px] bg-[#13171B] border border-[#343339] rounded-sm overflow-hidden flex items-center justify-center">
            {/* Scramble Overlay Animation */}
            {isScrambled && (
              <div className="absolute inset-0 bg-[#962333]/40 z-30 backdrop-blur-xs flex items-center justify-center flex-col font-mono-tech text-white">
                <span className="material-symbols-outlined text-4xl animate-spin text-[#ffb3b5]">
                  sync
                </span>
                <span className="font-extrabold tracking-widest text-sm mt-2">
                  SCRAMBLING COMMUNICATIONS...
                </span>
                <span className="text-[10px] text-[#ffb3b5]">CYPHER SHIFT IN PROGRESS</span>
              </div>
            )}

            {/* Radar Canvas / Map Grid */}
            <div
              className="w-full h-full relative transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg className="w-full h-full opacity-30" width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#574142" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Sonar Ping Wave */}
              {isPinged && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#ffb3b5] rounded-full animate-ping pointer-events-none" />
              )}

              {/* Victim Location Node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="w-7 h-7 border-2 border-[#962333] bg-[#A32633] rounded-full flex items-center justify-center shadow-[0_0_20px_#A32633]">
                  <span className="text-white text-xs font-bold">🚨</span>
                </div>
                <span className="font-mono-tech text-[9px] text-[#ffb3b5] font-bold bg-[#13171B]/90 px-1.5 py-0.5 border border-[#962333] mt-1 rounded-xs">
                  VICTIM_SOS_NODE
                </span>
              </div>

              {/* Matched PostGIS Responder Nodes */}
              {postgisResponders.map((resp, i) => (
                <div
                  key={resp.responder_id}
                  style={{
                    top: `${30 + i * 20}%`,
                    left: `${25 + i * 25}%`
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
                    <div className="relative w-6 h-6 bg-[#343339] border-2 border-emerald-400 text-white rounded-full flex items-center justify-center font-mono-tech font-bold text-[10px]">
                      ⚡
                    </div>
                  </div>
                  <span className="font-mono-tech text-[9px] text-emerald-300 font-bold bg-[#13171B] px-1.5 py-0.5 border border-emerald-700 mt-1 rounded-xs">
                    {resp.full_name.split(' ')[0]} ({resp.distance_meters}m)
                  </span>
                </div>
              ))}
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-20 font-mono-tech text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
                className="bg-[#20252C] hover:bg-[#291d1d] text-white p-2 rounded-xs border border-[#343339] transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                className="bg-[#20252C] hover:bg-[#291d1d] text-white p-2 rounded-xs border border-[#343339] transition-colors"
                title="Zoom Out"
              >
                -
              </button>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2 z-20 font-mono-tech text-xs">
              <button
                onClick={handlePingTarget}
                className="bg-[#291d1d] hover:bg-[#342727] text-[#ffb3b5] px-3 py-1.5 border border-[#574142] font-bold uppercase rounded-xs transition-colors"
              >
                PING MATRIX
              </button>
              <button
                onClick={handleScrambleComm}
                className="bg-[#962333] hover:bg-[#A32633] text-white px-3 py-1.5 font-bold uppercase rounded-xs transition-colors shadow"
              >
                SCRAMBLE COMM
              </button>
            </div>
          </div>
        </div>

        {/* System Status & Encryption Stream */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-mono-tech text-base font-extrabold text-white">
                POSTGIS_RADAR_09
              </div>
              <span className="bg-[#962333] text-white text-[10px] font-mono-tech font-bold px-2.5 py-0.5 rounded-xs tracking-wider animate-pulse border border-[#ffb3b5]">
                {postgisResponders.length} NODES MATCHED
              </span>
            </div>

            <p className="font-mono-tech text-xs text-[#debfbf] leading-relaxed border-b border-[#343339] pb-3">
              Nearest verified responder candidates retrieved directly from PostGIS spatial geography index.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
              <div className="bg-[#13171B] p-2.5 rounded-sm border border-[#343339]">
                <div className="text-[10px] text-[#a68a8a]">CLOSEST UNIT</div>
                <div className="text-sm font-bold text-white mt-0.5 truncate">
                  {postgisResponders[0]?.full_name || 'Sentinel Unit-1'}
                </div>
              </div>

              <div className="bg-[#13171B] p-2.5 rounded-sm border border-[#343339]">
                <div className="text-[10px] text-[#a68a8a]">PROXIMITY</div>
                <div className="text-sm font-bold text-[#ffb3b5] mt-0.5">
                  {postgisResponders[0]?.distance_meters || 850}m
                </div>
              </div>
            </div>
          </div>

          {/* Encryption Stream Terminal */}
          <div className="bg-[#13171B] border border-[#343339] p-4 rounded-sm font-mono-tech text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#343339] pb-2 text-[10px] text-[#a68a8a]">
              <span className="text-[#ffb3b5] font-bold">&gt; ENCRYPTION_STREAM.LOG</span>
              <button
                onClick={() => setIsStreamPaused(!isStreamPaused)}
                className="hover:text-white transition-colors"
              >
                {isStreamPaused ? '[RESUME]' : '[PAUSE]'}
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 text-[11px] pr-1">
              {terminalLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-[#a68a8a]">[{log.timestamp}]</span>
                  <span
                    className={`font-bold ${
                      log.level === 'WARN'
                        ? 'text-[#ffb3b5]'
                        : log.level === 'ERR'
                        ? 'text-[#962333]'
                        : 'text-emerald-400'
                    }`}
                  >
                    {log.level}:
                  </span>
                  <span className="text-[#debfbf]">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
