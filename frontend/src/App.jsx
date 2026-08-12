import React, { useState, useEffect } from 'react';
import { Radio, Shield, Zap, Layers } from 'lucide-react';
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

  // Dynamically isolate background web texture to Home SOS tab only
  const backgroundClass = activeTab === 'VICTIM' ? 'bg-web-texture' : 'bg-clean-charcoal';

  return (
    <div className={`min-h-screen flex flex-col justify-between text-slate-100 ${backgroundClass}`}>
      {/* Top Header with Original Geometric Emblem */}
      <header className="border-b border-[#343339] bg-[#13171B]/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Original Geometric Network Emblem SVG */}
            <div className="w-10 h-10 bg-[#60262C] border border-[#962333] flex items-center justify-center text-white" style={{ clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }}>
              <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                WebGuardian
                <span className="badge-angular-maroon text-[10px]">
                  Phase 1 MVP
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Emergency Response Network</p>
            </div>
          </div>

          {/* Role / Tab Navigation Buttons */}
          <nav className="flex items-center gap-1.5 bg-[#20252C] p-1.5 border border-[#343339] text-xs">
            <button
              onClick={() => setActiveTab('VICTIM')}
              className={`btn-angular px-3.5 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'VICTIM'
                  ? 'bg-[#962333] text-white shadow-[0_0_15px_rgba(150,35,51,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> SOS Panic Portal
            </button>

            <button
              onClick={() => setActiveTab('RESPONDER')}
              className={`btn-angular px-3.5 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'RESPONDER'
                  ? 'bg-[#343339] text-white border border-[#962333]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-red-400" /> WebPulse Responders
            </button>

            <button
              onClick={() => setActiveTab('SHIELD')}
              className={`btn-angular px-3.5 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'SHIELD'
                  ? 'bg-[#343339] text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" /> WebShield Profile
            </button>

            <button
              onClick={() => setActiveTab('STUBS')}
              className={`btn-angular px-3.5 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'STUBS'
                  ? 'bg-[#60262C] text-red-200 border border-[#962333]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-400" /> Phase 2 Roadmap
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
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

        {activeTab === 'RESPONDER' && (
          <div className="space-y-6">
            <ResponderDashboard
              activeRequest={activeRequest}
              onAcceptSuccess={(acceptedData) => setActiveRequest(prev => ({ ...prev, ...acceptedData }))}
            />
            <LiveMapView activeRequest={activeRequest} />
          </div>
        )}

        {activeTab === 'SHIELD' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <WebShieldProfileCard />
          </div>
        )}

        {activeTab === 'STUBS' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <Phase2PreviewCards />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#343339] bg-[#13171B] py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span className="uppercase tracking-wider">WebGuardian Emergency Response Platform</span>
          <span className="font-mono text-[11px]">PostGIS • FastAPI • React • WebSockets</span>
        </div>
      </footer>
    </div>
  );
}
