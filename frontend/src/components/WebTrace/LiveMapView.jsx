import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Radio, Navigation, ShieldCheck, User, Zap, RefreshCw } from 'lucide-react';
import { WebTraceSocketManager } from '../../services/websocket';

// Custom Victim Red Marker Icon
const victimIcon = new L.DivIcon({
  className: 'custom-victim-marker',
  html: `
    <div style="
      width: 32px; 
      height: 32px; 
      background: #FF1E27; 
      border: 3px solid #FFFFFF; 
      border-radius: 50%; 
      box-shadow: 0 0 20px #FF1E27; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">🚨</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom Responder Cyan Marker Icon
const responderIcon = new L.DivIcon({
  className: 'custom-responder-marker',
  html: `
    <div style="
      width: 36px; 
      height: 36px; 
      background: #00F0FF; 
      border: 3px solid #FFFFFF; 
      border-radius: 50%; 
      box-shadow: 0 0 25px #00F0FF; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: #000;
      font-weight: bold;
      font-size: 16px;
    ">🕷️</div>
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
  const [distanceKm, setDistanceKm] = useState('0.85');
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

  // Simulate responder moving closer to victim for live interactive demo
  const simulateResponderStep = () => {
    if (!socketRef.current) return;
    
    // Nudge responder location 10% closer to victim
    const nextLat = responderLocation[0] + (victimLocation[0] - responderLocation[0]) * 0.25;
    const nextLon = responderLocation[1] + (victimLocation[1] - responderLocation[1]) * 0.25;

    setResponderLocation([nextLat, nextLon]);
    socketRef.current.sendLocation('responder', nextLat, nextLon);
  };

  return (
    <div className="glass-card glass-card-active p-5 rounded-2xl flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">WebTrace Live Location Stream</h3>
          <span className="badge-cyan text-xs">Real-Time WebSockets</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">WS Channel Status:</span>
          {wsStatus === 'CONNECTED' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Connected
            </span>
          ) : (
            <span className="text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/40">
              Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Leaflet Live Map Display */}
      <div className="h-[380px] w-full rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl">
        <MapContainer
          center={victimLocation}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Dark Mode Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapRecenter victimPos={victimLocation} responderPos={responderLocation} />

          {/* Victim Marker */}
          <Marker position={victimLocation} icon={victimIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-red-500 text-sm">🚨 Victim Location (SpiderSense SOS)</p>
                <p className="text-xs text-slate-300">Coords: {victimLocation[0].toFixed(4)}, {victimLocation[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>

          {/* Responder Marker */}
          {responderLocation && (
            <Marker position={responderLocation} icon={responderIcon}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-cyan-400 text-sm">🕷️ Verified Responder En-Route</p>
                  <p className="text-xs text-slate-300">
                    {activeRequest?.matched_responder?.full_name || 'Peter Parker (Spider-Man)'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Connected Web Line between Victim and Responder */}
          {victimLocation && responderLocation && (
            <Polyline
              positions={[victimLocation, responderLocation]}
              pathOptions={{
                color: '#00F0FF',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 8'
              }}
            />
          )}
        </MapContainer>

        {/* Live Simulation Controls Badge */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 shadow-xl flex items-center gap-3">
          <div className="text-xs">
            <p className="text-slate-400">Simulate Movement</p>
            <p className="text-cyan-400 font-bold">En-Route Telemetry</p>
          </div>
          <button
            onClick={simulateResponderStep}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Navigation className="w-3.5 h-3.5" /> Move Responder Closer
          </button>
        </div>
      </div>
    </div>
  );
};
