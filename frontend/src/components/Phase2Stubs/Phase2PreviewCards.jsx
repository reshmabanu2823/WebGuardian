import React from 'react';
import { Cpu, Activity, Sparkles, Layers } from 'lucide-react';

export const Phase2PreviewCards = () => {
  return (
    <div className="wg-card p-6 border border-[#343339] space-y-4">
      <div className="flex items-center justify-between border-b border-[#343339] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Phase 2 Architecture Stubs</h3>
        </div>
        <span className="badge-angular-slate">Phase 2 Roadmap</span>
      </div>

      <p className="text-xs text-slate-400">
        Phase 1 core spine (SOS panic button, PostGIS matcher, WebSockets, WebShield privacy profile) is active. The following expansion modules are stubbed for Phase 2:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fall Detection Stub */}
        <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="badge-angular-maroon text-[10px]">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <Activity className="w-4 h-4" /> Fall Detection Engine
          </div>
          <p className="text-xs text-slate-400">
            Accelerometer & Gyroscope freefall detection algorithms with automated countdown triggers.
          </p>
          <div className="text-[11px] font-mono text-slate-300 bg-[#20252C] p-2 border border-[#343339]">
            TODO: Phase2FallDetectionService
          </div>
        </div>

        {/* WebAI Severity Classifier Stub */}
        <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="badge-angular-maroon text-[10px]">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" /> WebAI Severity Scoring
          </div>
          <p className="text-xs text-slate-400">
            NLP emergency triage scoring engine & YOLO computer vision incident analyzer.
          </p>
          <div className="text-[11px] font-mono text-slate-300 bg-[#20252C] p-2 border border-[#343339]">
            TODO: Phase2WebAIEngine.calculate_severity()
          </div>
        </div>

        {/* IoT Wearables Stub */}
        <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="badge-angular-maroon text-[10px]">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Cpu className="w-4 h-4" /> IoT Wearables & Sensors
          </div>
          <p className="text-xs text-slate-400">
            MQTT/BLE vital telemetry receiver (Heart rate, SpO2 blood oxygen stream).
          </p>
          <div className="text-[11px] font-mono text-slate-300 bg-[#20252C] p-2 border border-[#343339]">
            TODO: Phase2IoTWearableReceiver
          </div>
        </div>
      </div>
    </div>
  );
};
