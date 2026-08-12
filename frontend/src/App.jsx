import React, { useState, useEffect } from 'react';
import { Radio, Shield, MapPin, User, CheckCircle2, Zap, Layers, AlertCircle, PhoneCall } from 'lucide-react';
import { SpiderSenseButton } from './components/SpiderSense/SpiderSenseButton';
import { LiveMapView } from './components/WebTrace/LiveMapView';
import { WebShieldProfileCard } from './components/WebShield/WebShieldProfileCard';
import { ResponderDashboard } from './components/WebPulse/ResponderDashboard';
import { Phase2PreviewCards } from './components/Phase2Stubs/Phase2PreviewCards';

export default function App() {
  const [activeTab, setActiveTab] = useState('VICTIM'); // VICTIM, RESPONDER, SHIELD, STUBS
  const [userCoords, setUserCoords] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    // Capture user geolocation if permitted by browser
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          console.log('[GPS Capture] Location acquired:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('[GPS Capture] Geolocation fallback used (default coordinates):', err.message);
        }
      );
    }
  }, []);

  const handleSOSTriggered = (sosData) => {
    setActiveRequest(sosData);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white font-extrabold shadow-[0_0_20px_rgba(255,30,39,0.5)] border border-red-400">
              🕸️
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                WebGuardian
                <span className="text-xs bg-red-950 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                  Phase 1 MVP
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Emergency Response Network</p>
            </div>
          </div>

          {/* Role / Tab Navigation Buttons */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('VICTIM')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'VICTIM'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(255,30,39,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Victim SOS Portal
            </button>

            <button
              onClick={() => setActiveTab('RESPONDER')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'RESPONDER'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> WebPulse Responders
            </button>

            <button
              onClick={() => setActiveTab('SHIELD')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'SHIELD'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-red-400" /> WebShield Profile
            </button>

            <button
              onClick={() => setActiveTab('STUBS')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'STUBS'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Phase 2 TODOs
            </button>
          </nav>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Victim SOS Mode */}
        {activeTab === 'VICTIM' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <SpiderSenseButton onSOSTriggered={handleSOSTriggered} userCoords={userCoords} />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <LiveMapView activeRequest={activeRequest} />
              <WebShieldProfileCard />
            </div>
          </div>
        )}

        {/* Responder Radar Mode */}
        {activeTab === 'RESPONDER' && (
          <div className="space-y-6">
            <ResponderDashboard
              activeRequest={activeRequest}
              onAcceptSuccess={(acceptedData) => setActiveRequest(prev => ({ ...prev, ...acceptedData }))}
            />
            <LiveMapView activeRequest={activeRequest} />
          </div>
        )}

        {/* WebShield Privacy Settings Mode */}
        {activeTab === 'SHIELD' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <WebShieldProfileCard />
          </div>
        )}

        {/* Phase 2 TODO Preview Mode */}
        {activeTab === 'STUBS' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <Phase2PreviewCards />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>WebGuardian Emergency Network — Spider-Man Inspired Safety Platform</span>
          <span className="font-mono text-[11px]">PostGIS • FastAPI • React • WebSockets</span>
        </div>
      </footer>
    </div>
  );
}
