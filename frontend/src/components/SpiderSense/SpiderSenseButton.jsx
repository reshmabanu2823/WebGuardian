import React, { useState } from 'react';
import { ShieldAlert, MapPin, Zap, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
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

    // Default to captured browser GPS or test fallback coords (12.9716, 77.5946)
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
      <div className="flex items-center gap-2 mb-4 bg-red-950/40 border border-red-500/30 px-4 py-1.5 rounded-full">
        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
          SpiderSense Manual SOS Network
        </span>
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2">
        Emergency Response Trigger
      </h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        Pressing the button will immediately broadcast your GPS location to the nearest verified responder and send alerts to your emergency contacts.
      </p>

      {sosState === 'IDLE' && (
        <div className="sos-button-wrapper my-6">
          <div className="sos-pulse-ring-outer"></div>
          <div className="sos-pulse-ring"></div>
          <button
            onClick={handlePressStart}
            className="sos-button group"
            title="Press to trigger SOS alert"
          >
            <ShieldAlert className="w-12 h-12 mb-1 group-hover:scale-110 transition-transform" />
            <span>S O S</span>
          </button>
        </div>
      )}

      {sosState === 'COUNTDOWN' && (
        <div className="flex flex-col items-center my-6">
          <div className="w-36 h-36 rounded-full border-4 border-red-500 flex items-center justify-center text-5xl font-black text-red-500 animate-pulse bg-red-950/50 mb-4 shadow-[0_0_50px_rgba(255,30,39,0.5)]">
            {countdown}
          </div>
          <p className="text-red-400 font-semibold mb-4">Triggering SpiderSense SOS in {countdown}s...</p>
          <button
            onClick={cancelSOS}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-600 transition"
          >
            Cancel Alert
          </button>
        </div>
      )}

      {sosState === 'TRIGGERED' && sosData && (
        <div className="glass-card glass-card-danger p-6 max-w-lg w-full text-left rounded-2xl animate-fade-in my-4">
          <div className="flex items-center gap-3 mb-4 border-b border-red-500/30 pb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-white">SpiderSense SOS Dispatched!</h3>
              <p className="text-xs text-slate-300">Request ID: <span className="font-mono text-red-400">{sosData.request_id}</span></p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-200">
            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Captured GPS Coords:</span>
              <span className="font-mono text-cyan-400 font-medium">
                {sosData.victim_latitude.toFixed(4)}, {sosData.victim_longitude.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Matched Responder:</span>
              {sosData.matched_responder ? (
                <span className="text-red-400 font-bold">
                  {sosData.matched_responder.full_name} ({sosData.matched_responder.responder_type})
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Searching nearby...</span>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">WebPulse SMS Alerts Sent:</span>
              <span className="text-emerald-400 font-bold">{sosData.notified_contacts_count} Emergency Contacts</span>
            </div>
          </div>
        </div>
      )}

      {sosState === 'ERROR' && (
        <div className="p-4 bg-red-900/40 border border-red-500 text-red-200 rounded-xl max-w-md my-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div className="text-left text-sm">
            <p className="font-bold">Failed to dispatch SOS</p>
            <p className="text-xs opacity-90">Check backend connection or try again.</p>
          </div>
          <button onClick={() => setSosState('IDLE')} className="ml-auto text-xs bg-red-800 px-3 py-1.5 rounded-md font-semibold">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
