import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Radio, Navigation, Shield, Wifi, Activity } from 'lucide-react';
import { WebTraceSocketManager } from '../../services/websocket';

// Custom Victim Red Marker Icon (Sharp Square Angular HUD Pin)
const victimIcon = new L.DivIcon({
  className: 'custom-victim-marker',
  html: `
    <div style="
      width: 32px; 
      height: 32px; 
      background: #A32633; 
      border: 2px solid #FFFFFF; 
      box-shadow: 0 0 20px #A32633; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 14px;
      clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
    ">🚨</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom Responder Marker Icon (Sharp Angular Polygon Pin)
const responderIcon = new L.DivIcon({
  className: 'custom-responder-marker',
  html: `
    <div style="
      width: 36px; 
      height: 36px; 
      background: #343339; 
      border: 2px solid #962333; 
      box-shadow: 0 0 20px rgba(150, 35, 51, 0.8); 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: #F8FAFC;
      font-weight: 900;
      font-size: 16px;
      clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
    ">⚡</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Helper component to center map on active markers
function MapRecenter({ victimPos, responderPos }) {
  const map = useMap();
  useEffect(() => {
    if (victimPos && responderPos) {
      const bounds = L.latLngBounds([victimPos, responderPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (victimPos) {
      map.setView(victimPos, 14);
    }
  }, [victimPos, responderPos, map]);
  return null;
}

export const LiveMapView = ({ activeRequest }) => {
  const [victimLocation, setVictimLocation] = useState(
    activeRequest ? [activeRequest.victim_latitude, activeRequest.victim_longitude] : [12.9716, 77.5946]
  );

  const [responderLocation, setResponderLocation] = useState(
    activeRequest?.matched_responder
      ? [activeRequest.matched_responder.latitude, activeRequest.matched_responder.longitude]
      : [12.9780, 77.6000]
  );

  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!activeRequest?.request_id) return;

    const reqId = activeRequest.request_id;
    console.log('[WebTrace Map] Initializing live tracking for request:', reqId);

    const socketManager = new WebTraceSocketManager(
      reqId,
      (payload) => {
        setWsStatus('CONNECTED');
        if (payload.type === 'LOCATION_UPDATE') {
          if (payload.sender_role === 'victim') {
            setVictimLocation([payload.latitude, payload.longitude]);
          } else if (payload.sender_role === 'responder') {
            setResponderLocation([payload.latitude, payload.longitude]);
          }
        } else if (payload.type === 'INITIAL_STATE') {
          if (payload.victim_latitude && payload.victim_longitude) {
            setVictimLocation([payload.victim_latitude, payload.victim_longitude]);
          }
          if (payload.responder_latitude && payload.responder_longitude) {
            setResponderLocation([payload.responder_latitude, payload.responder_longitude]);
          }
        }
      },
      () => setWsStatus('ERROR')
    );

    socketManager.connect();
    socketRef.current = socketManager;

    return () => {
      socketManager.disconnect();
    };
  }, [activeRequest]);

  const simulateResponderStep = () => {
    if (!socketRef.current) return;
    
    const nextLat = responderLocation[0] + (victimLocation[0] - responderLocation[0]) * 0.25;
    const nextLon = responderLocation[1] + (victimLocation[1] - responderLocation[1]) * 0.25;

    setResponderLocation([nextLat, nextLon]);
    socketRef.current.sendLocation('responder', nextLat, nextLon);
  };

  return (
    <div className="wg-card p-5 flex flex-col gap-4">
      {/* Top Network HUD Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#343339] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#60262C] border border-[#962333]">
            <Wifi className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              WebTrace Live Telemetry Stream
            </h3>
            <p className="text-xs text-slate-400 font-mono">Bi-Directional WebSocket Node Connection</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Stream Status:</span>
          {wsStatus === 'CONNECTED' ? (
            <span className="badge-angular-maroon flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Channel
            </span>
          ) : (
            <span className="badge-angular-slate text-amber-400">
              Connecting Node...
            </span>
          )}
        </div>
      </div>

      {/* Leaflet Live Tracking Container */}
      <div className="h-[400px] w-full relative border border-[#343339] overflow-hidden">
        <MapContainer
          center={victimLocation}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Dark CartoDB Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapRecenter victimPos={victimLocation} responderPos={responderLocation} />

          {/* Victim Location Node */}
          <Marker position={victimLocation} icon={victimIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-extrabold text-[#A32633] text-sm uppercase">🚨 Victim Emergency Node</p>
                <p className="text-xs text-slate-300 font-mono">GPS: {victimLocation[0].toFixed(4)}, {victimLocation[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>

          {/* Responder En-Route Node */}
          {responderLocation && (
            <Marker position={responderLocation} icon={responderIcon}>
              <Popup>
                <div className="p-1">
                  <p className="font-extrabold text-slate-200 text-sm uppercase">⚡ Verified Response Unit</p>
                  <p className="text-xs text-slate-300 font-mono">
                    {activeRequest?.matched_responder?.full_name || 'Sentinel Response Unit-1'}
                  </p>
                </div>
              </Popup>
            </Popup>
          )}

          {/* Pulsing Web Strand Line Connecting Victim & Responder */}
          {victimLocation && responderLocation && (
            <Polyline
              positions={[victimLocation, responderLocation]}
              pathOptions={{
                color: '#A32633',
                weight: 4,
                opacity: 0.9,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>

        {/* Live Simulation Controls */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-[#13171B]/95 p-3 border border-[#343339] shadow-2xl flex items-center gap-3">
          <div className="text-xs">
            <p className="text-slate-400 font-mono">Simulate Movement</p>
            <p className="text-red-400 font-bold">Web Strand Telemetry</p>
          </div>
          <button
            onClick={simulateResponderStep}
            className="btn-angular btn-angular-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" /> Move Unit Closer
          </button>
        </div>
      </div>
    </div>
  );
};
