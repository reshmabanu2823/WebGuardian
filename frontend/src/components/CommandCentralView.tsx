import React, { useState, useEffect } from 'react';
import { SignalItem, SignalLevel } from '../types';

interface CommandCentralViewProps {
  signals: SignalItem[];
  onSelectSignal: (signal: SignalItem) => void;
  onFilterLevel?: (level: SignalLevel | 'ALL') => void;
}

export const CommandCentralView: React.FC<CommandCentralViewProps> = ({
  signals,
  onSelectSignal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<SignalLevel | 'ALL'>('ALL');
  const [activePin, setActivePin] = useState<SignalItem | null>(null);

  // Live Uptime counter
  const [uptimeSeconds, setUptimeSeconds] = useState(519790); // ~144:23:10 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSignals = signals.filter((sig) => {
    const matchesSearch =
      sig.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.classification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === 'ALL' || sig.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'UNRESOLVED':
        return 'bg-[#962333] text-white border border-[#ffb3b5] animate-pulse';
      case 'ENGAGING':
        return 'bg-[#8d1425] text-[#ff989a] border border-[#7c3c42]';
      case 'MONITORING':
        return 'bg-[#3f3132] text-[#debfbf] border border-[#574142]';
      case 'RESOLVED':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-700';
      default:
        return 'bg-[#291d1d] text-[#debfbf]';
    }
  };

  const getLevelBadgeClass = (level: SignalLevel) => {
    switch (level) {
      case 'L1':
        return 'bg-[#962333] text-white font-bold';
      case 'L2':
        return 'bg-[#8d1425] text-[#ffacaf] font-bold';
      case 'L3':
        return 'bg-[#3f3132] text-[#debfbf]';
    }
  };

  // Map Threat Nodes
  const threatNodes = [
    { id: 'pin-1', top: '35%', left: '22%', signal: signals[0], label: 'NORTH GRID' },
    { id: 'pin-2', top: '48%', left: '49%', signal: signals[1], label: 'EASTERN PERIMETER' },
    { id: 'pin-3', top: '30%', left: '78%', signal: signals[2], label: 'SUB-LEVEL' },
    { id: 'pin-4', top: '65%', left: '82%', signal: signals[3], label: 'MAIN GATE' },
    { id: 'pin-5', top: '42%', left: '15%', signal: signals[4] || signals[0], label: 'WEST SUBSTATION' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12 space-y-8 font-sans">
      {/* Top Header & Uptime */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#343339] pb-4">
        <div>
          <h1 className="font-mono-tech text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase">
            Command Central
          </h1>
          <p className="font-mono-tech text-xs text-[#debfbf] tracking-wider mt-1">
            SECURE LINK ESTABLISHED // SYSTEM NOMINAL // WAITING FOR DIRECTIVES
          </p>
        </div>

        <div className="font-mono-tech text-right text-xs space-y-0.5">
          <div className="text-[#debfbf]">
            CURRENT UPTIME:{' '}
            <span className="text-[#ffb3b5] font-bold">{formatUptime(uptimeSeconds)}</span>
          </div>
          <div className="text-[11px] text-[#a68a8a]">LAST SYNC: JUST NOW</div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm flex flex-col justify-between h-32 hover:border-[#ff3b53]/50 transition-all spider-web-card">
          <div className="flex justify-between items-center text-[#debfbf] font-mono-tech text-xs tracking-wider uppercase font-semibold">
            <span>TOTAL ACTIVE</span>
            <span className="material-symbols-outlined text-base">show_chart</span>
          </div>
          <div className="font-mono-tech text-4xl font-bold text-white tracking-tight">
            1,204
          </div>
        </div>

        {/* Metric 2 (Critical L1) */}
        <div className="bg-[#20252C] border-2 border-[#962333] p-5 rounded-sm flex flex-col justify-between h-32 relative overflow-hidden bg-gradient-to-b from-[#20252C] to-[#291d1d] spider-web-glow spider-web-card">
          <div className="flex justify-between items-center text-[#ffb3b5] font-mono-tech text-xs tracking-wider uppercase font-bold">
            <span className="flex items-center gap-1">
              CRITICAL (L1)
            </span>
            <span className="material-symbols-outlined text-base text-[#ff3b53] animate-pulse">
              warning
            </span>
          </div>
          <div className="font-mono-tech text-4xl font-extrabold text-[#ff3b53] tracking-tight drop-shadow">
            14
          </div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#962333] rounded-full animate-ping" />
        </div>

        {/* Metric 3 (High Priority L2) */}
        <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm flex flex-col justify-between h-32 hover:border-[#962333]/50 transition-colors spider-web-card">
          <div className="flex justify-between items-center text-[#debfbf] font-mono-tech text-xs tracking-wider uppercase font-semibold">
            <span>HIGH PRIORITY (L2)</span>
            <span className="material-symbols-outlined text-base text-[#ffb3b5]">priority_high</span>
          </div>
          <div className="font-mono-tech text-4xl font-bold text-[#ffb3b5] tracking-tight">
            42
          </div>
        </div>

        {/* Metric 4 (Monitor L3) */}
        <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm flex flex-col justify-between h-32 hover:border-[#574142] transition-colors spider-web-card">
          <div className="flex justify-between items-center text-[#debfbf] font-mono-tech text-xs tracking-wider uppercase font-semibold">
            <span>MONITOR (L3)</span>
            <span className="material-symbols-outlined text-base">visibility</span>
          </div>
          <div className="font-mono-tech text-4xl font-bold text-white tracking-tight">
            118
          </div>
        </div>
      </div>

      {/* Global Threat Vector Map Section */}
      <div className="bg-[#20252C] border border-[#343339] rounded-sm p-4 md:p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-[#343339] pb-3">
          <div className="font-mono-tech text-xs tracking-widest uppercase text-white font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-[#962333] inline-block rounded-xs animate-pulse"></span>
            GLOBAL THREAT VECTOR
          </div>
          <div className="font-mono-tech text-[10px] text-[#debfbf]">
            MAP GRID // SECURE TRANSMISSION
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[320px] md:h-[380px] bg-[#13171B] border border-[#343339] rounded-sm overflow-hidden flex items-center justify-center">
          {/* World Map SVG Canvas */}
          <svg
            className="w-full h-full opacity-40 object-cover"
            viewBox="0 0 1000 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* World Grid Lines */}
            <path
              d="M0 100 H1000 M0 200 H1000 M0 300 H1000 M0 400 H1000"
              stroke="#343339"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <path
              d="M200 0 V500 M400 0 V500 M600 0 V500 M800 0 V500"
              stroke="#343339"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Stylized Tactical Continent Silhouettes */}
            {/* North America */}
            <path
              d="M150 120 L280 110 L320 220 L240 280 L180 220 L120 180 Z"
              fill="#3f3132"
              stroke="#574142"
            />
            {/* South America */}
            <path
              d="M280 300 L340 320 L310 440 L260 410 L250 340 Z"
              fill="#3f3132"
              stroke="#574142"
            />
            {/* Europe & Asia */}
            <path
              d="M450 100 L750 90 L880 180 L820 300 L650 280 L520 240 L440 180 Z"
              fill="#3f3132"
              stroke="#574142"
            />
            {/* Africa */}
            <path
              d="M480 230 L580 240 L600 360 L520 420 L460 320 Z"
              fill="#3f3132"
              stroke="#574142"
            />
            {/* Australia */}
            <path
              d="M780 340 L880 330 L900 420 L800 430 Z"
              fill="#3f3132"
              stroke="#574142"
            />
          </svg>

          {/* Glowing Red Radar Sweeper */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(150,35,51,0.15),transparent_70%)] pointer-events-none" />

          {/* Threat Interactive Markers */}
          {threatNodes.map((node) => (
            <div
              key={node.id}
              style={{ top: node.top, left: node.left }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              onClick={() => setActivePin(node.signal)}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#962333] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#A32633] border-2 border-[#ffb3b5] shadow-lg"></span>
              </div>

              {/* Hover Badge */}
              <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#20252C] text-[#ffb3b5] text-[10px] font-mono-tech border border-[#962333] px-2 py-1 rounded whitespace-nowrap shadow-xl z-30">
                <div className="font-bold">{node.label}</div>
                <div className="text-white text-[9px]">{node.signal?.id}</div>
              </div>
            </div>
          ))}

          {/* Selected Pin Popover Modal */}
          {activePin && (
            <div className="absolute bottom-4 right-4 max-w-sm bg-[#20252C] border-2 border-[#962333] p-4 rounded-sm shadow-2xl z-40 font-mono-tech text-xs animate-in fade-in">
              <div className="flex justify-between items-center border-b border-[#343339] pb-2 mb-2">
                <span className="font-bold text-[#ffb3b5] flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#962333] rounded-full animate-ping" />
                  {activePin.id}
                </span>
                <button
                  onClick={() => setActivePin(null)}
                  className="text-[#debfbf] hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="text-white font-bold mb-1">{activePin.classification}</div>
              <div className="text-[#debfbf] text-[11px] mb-2">{activePin.sector} — {activePin.locationName}</div>
              <p className="text-[10px] text-[#a68a8a] mb-3 leading-relaxed">{activePin.details}</p>

              <button
                onClick={() => {
                  onSelectSignal(activePin);
                  setActivePin(null);
                }}
                className="w-full bg-[#962333] hover:bg-[#A32633] text-white py-1.5 px-3 rounded-sm font-bold uppercase tracking-wider text-[10px] transition-colors"
              >
                Inspect Signal Stream
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Signals Stream Table Section */}
      <div className="bg-[#20252C] border border-[#343339] rounded-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#343339] pb-4">
          <div className="font-mono-tech text-sm tracking-widest uppercase text-white font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#ffb3b5]">list_alt</span>
            INCOMING SIGNALS STREAM
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="FILTER BY ID/SECTOR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#13171B] border border-[#343339] text-[#f4dddd] text-xs font-mono-tech pl-8 pr-3 py-1.5 rounded-sm focus:outline-none focus:border-[#962333] placeholder-[#a68a8a]"
              />
              <span className="material-symbols-outlined text-base text-[#a68a8a] absolute left-2 top-2">
                search
              </span>
            </div>

            {/* Level Filter Dropdown */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as SignalLevel | 'ALL')}
              className="bg-[#13171B] border border-[#343339] text-[#debfbf] text-xs font-mono-tech px-3 py-1.5 rounded-sm focus:outline-none focus:border-[#962333]"
            >
              <option value="ALL">FILTER LEVEL: ALL</option>
              <option value="L1">L1 CRITICAL</option>
              <option value="L2">L2 HIGH</option>
              <option value="L3">L3 MONITOR</option>
            </select>
          </div>
        </div>

        {/* Signals Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono-tech text-xs">
            <thead>
              <tr className="border-b border-[#343339] text-[#a68a8a] text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">LVL</th>
                <th className="py-2.5 px-3">ID / TIMESTAMP</th>
                <th className="py-2.5 px-3">SECTOR / LOCATION</th>
                <th className="py-2.5 px-3">CLASSIFICATION</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343339]">
              {filteredSignals.map((signal) => (
                <tr
                  key={signal.id}
                  className="hover:bg-[#291d1d] transition-colors group cursor-pointer"
                  onClick={() => onSelectSignal(signal)}
                >
                  {/* LVL Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] rounded-xs uppercase font-extrabold ${getLevelBadgeClass(
                        signal.level
                      )}`}
                    >
                      {signal.level}
                    </span>
                  </td>

                  {/* ID / Timestamp */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white group-hover:text-[#ffb3b5] transition-colors">
                      {signal.id}
                    </div>
                    <div className="text-[10px] text-[#a68a8a]">{signal.timestamp}</div>
                  </td>

                  {/* Sector / Location */}
                  <td className="py-3 px-3">
                    <div className="text-[#debfbf] font-medium">{signal.sector}</div>
                    <div className="text-[10px] text-[#a68a8a]">{signal.locationName}</div>
                  </td>

                  {/* Classification */}
                  <td className="py-3 px-3 text-[#f4dddd] font-medium">
                    {signal.classification}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] rounded-xs uppercase tracking-wider font-extrabold ${getStatusBadgeClass(
                        signal.status
                      )}`}
                    >
                      {signal.status}
                    </span>
                  </td>

                  {/* Action Icon */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSignal(signal);
                      }}
                      className="p-1.5 text-[#debfbf] hover:text-[#ffb3b5] hover:bg-[#342727] rounded transition-colors"
                      title="Inspect Signal"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSignals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#a68a8a] font-mono-tech">
                    NO ACTIVE SIGNALS MATCHING CURRENT CRITERIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
