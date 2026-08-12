import React, { useState, useEffect, useRef } from 'react';
import { triggerSOS, SOSResponseData } from '../services/api';
import { WebTraceSocketManager } from '../services/websocket';

interface TacticalCommandViewProps {
  onBackToCentral: () => void;
}

export const TacticalCommandView: React.FC<TacticalCommandViewProps> = ({
  onBackToCentral,
}) => {
  const [isSosActive, setIsSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [beaconFrequency] = useState('433.92 MHz');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [sosResult, setSosResult] = useState<SOSResponseData | null>(null);
  const [wsStatus, setWsStatus] = useState('STANDBY');
  
  const socketRef = useRef<WebTraceSocketManager | null>(null);

  // Capture user GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.warn('[GPS Fallback]:', err.message)
      );
    }
  }, []);

  // Countdown handler
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      executeSOS();
    }
  }, [countdown]);

  const executeSOS = async () => {
    setIsSosActive(true);
    setCountdown(null);

    try {
      const res = await triggerSOS(latitude, longitude, 'MANUAL_SOS');
      setSosResult(res);

      // Connect WebSocket live tracking channel
      const socketManager = new WebTraceSocketManager(
        res.request_id,
        (payload) => {
          setWsStatus('CONNECTED');
          if (payload.type === 'LOCATION_UPDATE') {
            if (payload.sender_role === 'victim') {
              setLatitude(payload.latitude);
              setLongitude(payload.longitude);
            }
          }
        },
        () => setWsStatus('ERROR')
      );
      socketManager.connect();
      socketRef.current = socketManager;
    } catch (err) {
      console.error('Failed to trigger backend SOS:', err);
    }
  };

  const handleStartSosSequence = () => {
    setCountdown(3);
  };

  const handleAbortSos = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsSosActive(false);
    setCountdown(null);
    setWsStatus('STANDBY');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-16 font-sans flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-8">
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-2 bg-[#20252C] border border-[#574142] px-4 py-1.5 rounded-full font-mono-tech text-xs tracking-widest text-[#ffb3b5]">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSosActive ? 'bg-[#962333] animate-ping' : 'bg-emerald-400'
          }`}
        />
        <span>{isSosActive ? 'EMERGENCY BROADCAST ACTIVE' : 'SYSTEM STANDBY'}</span>
      </div>

      {/* Main Title Block */}
      <div className="space-y-3 max-w-2xl">
        <h1 className="font-mono-tech text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
          Tactical Command
        </h1>
        <p className="font-mono-tech text-xs md:text-sm text-[#debfbf] leading-relaxed">
          WARNING: Initialization of the SOS protocol will lock all local terminals and broadcast coordinates to network nodes.
        </p>
      </div>

      {/* Countdown Overlay Modal */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-[#13171B]/95 z-50 flex flex-col items-center justify-center p-6 space-y-6 font-mono-tech">
          <div className="w-24 h-24 rounded-full border-4 border-[#962333] flex items-center justify-center text-5xl font-extrabold text-white animate-pulse">
            {countdown}
          </div>
          <div className="text-xl text-[#ffb3b5] font-bold tracking-wider">
            INITIATING EMERGENCY BEACON BROADCAST...
          </div>
          <button
            onClick={handleAbortSos}
            className="bg-[#20252C] hover:bg-[#291d1d] text-white border border-[#962333] px-6 py-2 rounded-xs text-xs font-bold uppercase transition-colors"
          >
            CANCEL / ABORT
          </button>
        </div>
      )}

      {/* SOS Center Interactive Button or Active Emergency State */}
      {!isSosActive ? (
        <div className="relative my-8 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-[#962333]/30 animate-ping pointer-events-none" />
          <div className="absolute w-52 h-52 md:w-64 md:h-64 rounded-full border-2 border-[#962333]/50 animate-pulse pointer-events-none" />

          {/* Central Trigger Button */}
          <button
            onClick={handleStartSosSequence}
            className="relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-[#A32633] hover:bg-[#b02231] text-white font-mono-tech font-extrabold text-lg md:text-xl tracking-widest uppercase shadow-[0_0_50px_rgba(163,38,51,0.6)] border-4 border-[#ffb3b5] flex flex-col items-center justify-center gap-2 group transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-4xl md:text-5xl group-hover:scale-110 transition-transform">
              emergency
            </span>
            <span>INITIATE SOS</span>
          </button>
        </div>
      ) : (
        /* Active Emergency State Box */
        <div className="w-full max-w-xl bg-[#20252C] border-2 border-[#962333] p-6 md:p-8 rounded-sm font-mono-tech text-xs space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-center gap-3 text-[#ffb3b5]">
            <span className="material-symbols-outlined text-3xl animate-bounce text-[#962333]">
              cell_tower
            </span>
            <span className="text-lg font-bold tracking-wider text-white uppercase">
              BEACON BROADCAST IN PROGRESS
            </span>
          </div>

          {/* Coordinates & Details */}
          <div className="bg-[#13171B] border border-[#343339] p-4 rounded-sm space-y-3 text-left">
            <div className="flex justify-between border-b border-[#343339] pb-2">
              <span className="text-[#a68a8a]">REQUEST ID:</span>
              <span className="text-[#ffb3b5] font-bold font-mono">{sosResult?.request_id || '9988-SOS'}</span>
            </div>

            <div className="flex justify-between border-b border-[#343339] pb-2">
              <span className="text-[#a68a8a]">MATCHED RESPONDER:</span>
              <span className="text-emerald-400 font-bold">
                {sosResult?.matched_responder?.full_name || 'Sentinel Unit-1 (Rapid Paramedic)'}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#343339] pb-2">
              <span className="text-[#a68a8a]">LATITUDE:</span>
              <span className="text-white font-bold">{latitude.toFixed(6)}° N</span>
            </div>

            <div className="flex justify-between border-b border-[#343339] pb-2">
              <span className="text-[#a68a8a]">LONGITUDE:</span>
              <span className="text-white font-bold">{longitude.toFixed(6)}° E</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#a68a8a]">WEBSOCKET STREAM:</span>
              <span className="text-cyan-400 font-bold">{wsStatus}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAbortSos}
              className="flex-1 bg-[#291d1d] hover:bg-[#342727] text-white border border-[#962333] py-2.5 rounded-xs font-bold uppercase transition-colors"
            >
              ABORT SOS
            </button>
            <button
              onClick={onBackToCentral}
              className="flex-1 bg-[#962333] hover:bg-[#A32633] text-white py-2.5 rounded-xs font-bold uppercase transition-colors"
            >
              RETURN TO COMMAND
            </button>
          </div>
        </div>
      )}

      {/* System Node Status Bar */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-tech text-xs pt-4">
        <div className="bg-[#20252C] border border-[#343339] p-4 rounded-sm">
          <div className="text-[10px] text-[#a68a8a] uppercase">POSTGIS NODE</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">ONLINE / MATCHED</div>
        </div>

        <div className="bg-[#20252C] border border-[#343339] p-4 rounded-sm">
          <div className="text-[10px] text-[#a68a8a] uppercase">THREAT LEVEL</div>
          <div className="text-sm font-bold text-[#ffb3b5] mt-1">CRITICAL SOS</div>
        </div>

        <div className="bg-[#20252C] border border-[#343339] p-4 rounded-sm">
          <div className="text-[10px] text-[#a68a8a] uppercase">WEBSOCKET CHANNEL</div>
          <div className="text-sm font-bold text-white mt-1">REAL-TIME ACTIVE</div>
        </div>
      </div>
    </div>
  );
};
