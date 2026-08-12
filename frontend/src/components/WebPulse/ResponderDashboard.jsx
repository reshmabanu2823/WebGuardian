import React, { useState, useEffect } from 'react';
import { Radio, MapPin, CheckCircle, ShieldCheck, Phone, ArrowRight, Activity, AlertOctagon } from 'lucide-react';
import { fetchNearbyResponders, acceptEmergencyRequest, fetchResponderWebShieldView } from '../../services/api';

export const ResponderDashboard = ({ activeRequest, onAcceptSuccess }) => {
  const [responders, setResponders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [acceptedState, setAcceptedState] = useState(null);
  const [shieldData, setShieldData] = useState(null);

  const defaultLat = activeRequest?.victim_latitude || 12.9716;
  const defaultLon = activeRequest?.victim_longitude || 77.5946;

  useEffect(() => {
    loadNearbyResponders();
  }, [defaultLat, defaultLon]);

  const loadNearbyResponders = async () => {
    setIsLoading(true);
    try {
      const candidates = await fetchNearbyResponders(defaultLat, defaultLon, 15000);
      setResponders(candidates);
      if (candidates.length > 0) {
        setSelectedResponder(candidates[0]);
      }
    } catch (err) {
      console.error('Failed to load responders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (respId) => {
    const targetId = activeRequest?.request_id || 'demo-request';
    try {
      const res = await acceptEmergencyRequest(targetId, respId);
      setAcceptedState(res);

      if (activeRequest?.victim_id) {
        try {
          const sData = await fetchResponderWebShieldView(activeRequest.victim_id);
          setShieldData(sData);
        } catch (sErr) {
          console.error('Failed to fetch victim shield view:', sErr);
        }
      }

      if (onAcceptSuccess) {
        onAcceptSuccess(res);
      }
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  // Helper for WebAI Severity Level Indicator
  const getSeverityBadge = (score = 85) => {
    if (score >= 80) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#A32633] bg-[#60262C]/50 px-2.5 py-0.5 border border-[#962333]">
          🔴 CRITICAL (Score: {score})
        </span>
      );
    } else if (score >= 40) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/50 px-2.5 py-0.5 border border-amber-600/50">
          🟠 MODERATE (Score: {score})
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 border border-emerald-600/50">
          🟢 STABLE (Score: {score})
        </span>
      );
    }
  };

  return (
    <div className="wg-card p-6 flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#343339] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#60262C] border border-[#962333] text-white">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              WebPulse Spatial Dispatch Matrix
            </h3>
            <p className="text-xs text-slate-400 font-mono">PostGIS ST_DWithin / ST_Distance Query Engine</p>
          </div>
        </div>

        <button
          onClick={loadNearbyResponders}
          className="btn-angular btn-angular-secondary px-3 py-1.5 text-xs"
        >
          Re-Scan PostGIS Matrix
        </button>
      </div>

      {acceptedState ? (
        <div className="bg-[#60262C]/40 border border-[#962333] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <h4 className="text-lg font-extrabold text-white uppercase">Dispatch Request Accepted</h4>
                <p className="text-xs text-slate-300">En-route live tracking active via WebTrace WebSocket channel</p>
              </div>
            </div>
            <span className="badge-angular-maroon text-xs">
              EN ROUTE
            </span>
          </div>

          {/* Privacy-Filtered WebShield Card for Responder */}
          <div className="bg-[#13171B] p-4 border border-[#343339] space-y-3">
            <div className="flex justify-between items-center border-b border-[#343339] pb-2">
              <h5 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400" /> Victim WebShield Emergency Card (Privacy Screened)
              </h5>
              {getSeverityBadge(85)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#20252C] p-2.5 border border-[#343339]">
                <span className="text-slate-400 block">Victim Name:</span>
                <span className="text-white font-bold">{acceptedState?.victim?.name || 'Emergency Victim'}</span>
              </div>
              <div className="bg-[#20252C] p-2.5 border border-[#343339]">
                <span className="text-slate-400 block">Blood Type:</span>
                <span className="text-red-400 font-bold">{shieldData?.blood_group || 'O Negative'}</span>
              </div>
            </div>

            <div className="bg-[#20252C] p-2.5 border border-[#343339] text-xs">
              <span className="text-slate-400 block mb-1">Clinical Notes & Allergies:</span>
              <p className="text-slate-200">
                {shieldData?.medical_notes || 'Allergies: Penicillin | History of mild asthma; carries inhaler in jacket pocket.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Candidate Response Units ({responders.length} active in matrix)</span>
            <span className="font-mono">Sorted by PostGIS Distance</span>
          </div>

          {/* Data-Dense List of Responders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {responders.map((resp, idx) => (
              <div
                key={resp.responder_id}
                onClick={() => setSelectedResponder(resp)}
                className={`p-4 border cursor-pointer transition flex flex-col justify-between gap-3 ${
                  selectedResponder?.responder_id === resp.responder_id
                    ? 'bg-[#13171B] border-[#962333] shadow-[0_0_20px_rgba(150,35,51,0.3)]'
                    : 'bg-[#13171B] border-[#343339] hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-red-400" />
                      {resp.full_name}
                    </h4>
                    {getSeverityBadge(idx === 0 ? 92 : idx === 1 ? 65 : 30)}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Distance: <strong className="text-white">{resp.distance_meters} meters</strong>
                    </span>
                    <span className="badge-angular-slate text-[10px]">{resp.responder_type}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#343339]">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> {resp.phone_number}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptRequest(resp.responder_id);
                    }}
                    className="btn-angular btn-angular-primary px-3 py-1.5 text-xs flex items-center gap-1"
                  >
                    Accept Alert <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
