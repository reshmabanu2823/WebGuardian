import React, { useState } from 'react';
import { Radio, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { triggerSOS } from '../../services/api';

export const SpiderSenseButton = ({ onSOSTriggered, userCoords }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [sosState, setSosState] = useState('IDLE'); // IDLE, COUNTDOWN, TRIGGERED, ERROR
  const [countdown, setCountdown] = useState(3);
  const [sosData, setSosData] = useState(null);

  const handlePressStart = () => {
    setSosState('COUNTDOWN');
    setCountdown(3);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current === 0) {
        clearInterval(interval);
        dispatchSOS();
      }
    }, 1000);
  };

  const dispatchSOS = async () => {
    setIsActivating(true);
    setSosState('TRIGGERED');

    const lat = userCoords?.latitude || 12.9716;
    const lon = userCoords?.longitude || 77.5946;

    try {
      const data = await triggerSOS(lat, lon, 'MANUAL_SOS');
      setSosData(data);
      if (onSOSTriggered) {
        onSOSTriggered(data);
      }
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
      setSosState('ERROR');
    } finally {
      setIsActivating(false);
    }
  };

  const cancelSOS = () => {
    setSosState('IDLE');
    setCountdown(3);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Top Emergency Status Header */}
      <div className="flex items-center gap-2 mb-4 bg-maroon-dark/60 border border-[#962333]/50 px-4 py-1.5 rounded-none clip-btn">
        <Radio className="w-4 h-4 text-[#A32633] animate-pulse" />
        <span className="text-xs font-bold text-slate-200 tracking-widest uppercase">
          WebGuardian Emergency Node
        </span>
      </div>

      <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
        CRITICAL SOS TRIGGER
      </h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        Press to broadcast your real-time GPS location to the nearest verified emergency response unit and notify contacts.
      </p>

      {/* Hero Isolated SOS Button */}
      {sosState === 'IDLE' && (
        <div className="sos-hero-wrapper my-8">
          <div className="sos-hero-pulse-ring-outer"></div>
          <div className="sos-hero-pulse-ring"></div>
          <button
            onClick={handlePressStart}
            className="sos-hero-trigger group"
            title="Press to trigger emergency SOS alert"
          >
            {/* Original Geometric Network Vector Emblem */}
            <svg className="w-12 h-12 mb-2 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
              <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
            </svg>
            <span className="tracking-widest">S O S</span>
          </button>
        </div>
      )}

      {/* Countdown State */}
      {sosState === 'COUNTDOWN' && (
        <div className="flex flex-col items-center my-8">
          <div className="w-40 h-40 border-4 border-[#A32633] flex items-center justify-center text-6xl font-black text-[#A32633] animate-pulse bg-[#60262C]/40 mb-6 shadow-[0_0_60px_rgba(163,38,51,0.6)]" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
            {countdown}
          </div>
          <p className="text-red-400 font-bold mb-4 tracking-wider">Broadcasting Emergency Signal in {countdown}s...</p>
          <button
            onClick={cancelSOS}
            className="btn-angular btn-angular-secondary px-6 py-2.5 text-xs"
          >
            Abort Trigger
          </button>
        </div>
      )}

      {/* Triggered Success State */}
      {sosState === 'TRIGGERED' && sosData && (
        <div className="wg-card wg-card-danger p-6 max-w-lg w-full text-left my-4">
          <div className="flex items-center gap-3 mb-4 border-b border-[#962333]/50 pb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            <div>
              <h3 className="text-lg font-extrabold text-white">Emergency Request Dispatched</h3>
              <p className="text-xs text-slate-300">Request Token: <span className="font-mono text-red-400">{sosData.request_id}</span></p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-200">
            <div className="flex justify-between items-center bg-[#13171B] p-3 border border-[#343339]">
              <span className="text-slate-400">Target Coordinates:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {sosData.victim_latitude.toFixed(4)}, {sosData.victim_longitude.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#13171B] p-3 border border-[#343339]">
              <span className="text-slate-400">Assigned Response Unit:</span>
              {sosData.matched_responder ? (
                <span className="text-red-400 font-extrabold">
                  {sosData.matched_responder.full_name} ({sosData.matched_responder.responder_type})
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Searching PostGIS Matrix...</span>
              )}
            </div>

            <div className="flex justify-between items-center bg-[#13171B] p-3 border border-[#343339]">
              <span className="text-slate-400">WebPulse SMS Broadcast:</span>
              <span className="text-emerald-400 font-bold">{sosData.notified_contacts_count} Contacts Notified</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {sosState === 'ERROR' && (
        <div className="p-4 bg-[#60262C]/60 border border-[#A32633] text-red-200 max-w-md my-4 flex items-center gap-3 text-left">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Failed to dispatch emergency request</p>
            <p className="opacity-90">Verify server endpoint or try again.</p>
          </div>
          <button onClick={() => setSosState('IDLE')} className="ml-auto btn-angular btn-angular-primary px-3 py-1.5 text-xs">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
