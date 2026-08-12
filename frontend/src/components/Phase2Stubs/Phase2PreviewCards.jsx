import React from 'react';
import { Cpu, Activity, Sparkles, Layers, Lock, AlertOctagon } from 'lucide-react';

export const Phase2PreviewCards = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Phase 2 Architecture Stubs</h3>
        </div>
        <span className="badge-phase2">Phase 2 TODO Preview</span>
      </div>

      <p className="text-xs text-slate-400">
        The Phase 1 spine (SOS trigger, PostGIS matcher, WebSockets, WebShield) is fully active. The following modules are stubbed for Phase 2 deployment:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fall Detection Stub */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 opacity-75 hover:opacity-100 transition space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Activity className="w-4 h-4" /> Fall Detection Engine
          </div>
          <p className="text-xs text-slate-400">
            Accelerometer & Gyroscope freefall detection algorithms with automated countdown triggers.
          </p>
          <div className="text-[11px] font-mono text-purple-300 bg-purple-950/40 p-2 rounded border border-purple-900/50">
            TODO: Phase2FallDetectionService
          </div>
        </div>

        {/* WebAI Severity Classifier Stub */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 opacity-75 hover:opacity-100 transition space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" /> WebAI Severity Scoring
          </div>
          <p className="text-xs text-slate-400">
            NLP emergency triage scoring engine & YOLO computer vision incident analyzer.
          </p>
          <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-900/50">
            TODO: Phase2WebAIEngine.calculate_severity()
          </div>
        </div>

        {/* IoT Wearables Stub */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 opacity-75 hover:opacity-100 transition space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="bg-purple-950 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
              PHASE 2 TODO
            </span>
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Cpu className="w-4 h-4" /> IoT Wearables & Sensors
          </div>
          <p className="text-xs text-slate-400">
            MQTT/BLE vital telemetry receiver (Heart rate, SpO2 blood oxygen stream).
          </p>
          <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-900/50">
            TODO: Phase2IoTWearableReceiver
          </div>
        </div>
      </div>
    </div>
  );
};
