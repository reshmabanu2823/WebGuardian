import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Radio, CheckCircle, UserCheck, AlertTriangle, ArrowRight, Phone } from 'lucide-react';
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

      // Load victim's privacy-filtered WebShield medical profile
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

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 border border-slate-800">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              WebPulse Responder Radar
              <span className="badge-cyan text-xs">PostGIS ST_DWithin Matcher</span>
            </h3>
            <p className="text-xs text-slate-400">Matching closest verified emergency responders from seeded database</p>
          </div>
        </div>

        <button
          onClick={loadNearbyResponders}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
        >
          Refresh Spatial Query
        </button>
      </div>

      {acceptedState ? (
        <div className="bg-emerald-950/40 border border-emerald-500/50 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <h4 className="text-lg font-bold text-white">Emergency Request Accepted!</h4>
                <p className="text-xs text-emerald-300">En-route status active via WebTrace WebSocket channel</p>
              </div>
            </div>
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              En Route
            </span>
          </div>

          {/* Privacy-Filtered WebShield Card for Responder */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Victim WebShield Emergency Card (Privacy Screened)
            </h5>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Victim Name:</span>
                <span className="text-white font-bold">{acceptedState?.victim?.name || 'Mary Jane Watson'}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Blood Type:</span>
                <span className="text-red-400 font-bold">{shieldData?.blood_group || 'O Negative'}</span>
              </div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Medical Notes & Allergies:</span>
              <p className="text-slate-200">
                {shieldData?.medical_notes || 'Allergies: Penicillin | History of mild asthma; carries inhaler in jacket.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Verified Responders Nearby ({responders.length} found)</span>
            <span>Sorted by PostGIS ST_Distance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {responders.map((resp) => (
              <div
                key={resp.responder_id}
                onClick={() => setSelectedResponder(resp)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                  selectedResponder?.responder_id === resp.responder_id
                    ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      {resp.full_name}
                    </h4>
                    <span className="badge-cyan text-[10px]">{resp.responder_type}</span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Distance: <strong className="text-cyan-400">{resp.distance_meters} meters</strong>
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {resp.phone_number}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptRequest(resp.responder_id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition shadow"
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
