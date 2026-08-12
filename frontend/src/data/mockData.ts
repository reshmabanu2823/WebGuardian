import { PersonnelDossier, SignalItem, NetworkUnit, EncryptionLog } from '../types';

export const initialSignals: SignalItem[] = [
  {
    id: 'SIG-990-AX',
    timestamp: '14:22:10 UTC',
    sector: 'Sector 7G',
    locationName: 'North Grid, Alpha Point',
    classification: 'Unauthorized Access Attempt',
    status: 'UNRESOLVED',
    level: 'L1',
    details: 'Multiple failed biometric handshakes recorded at primary airlock entrance. Security node 07 isolated.',
    coordinates: { lat: 40.7128, lng: -74.006 }
  },
  {
    id: 'SIG-812-BQ',
    timestamp: '14:21:45 UTC',
    sector: 'Sector 3B',
    locationName: 'Eastern Perimeter',
    classification: 'Thermal Spike Detected',
    status: 'ENGAGING',
    level: 'L2',
    details: 'Thermal sensor array registering +18°C above threshold. Drone unit sent for visual verification.',
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: 'SIG-104-CR',
    timestamp: '14:15:02 UTC',
    sector: 'Sector 9F',
    locationName: 'Sub-level Comms',
    classification: 'Routine Bandwidth Fluctuation',
    status: 'MONITORING',
    level: 'L3',
    details: 'Sub-level repeater experiencing 12ms packet jitter during heavy relay synchronization.',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: 'SIG-774-DF',
    timestamp: '13:59:22 UTC',
    sector: 'Sector 1A',
    locationName: 'Main Gate',
    classification: 'Identity Verification Failure',
    status: 'RESOLVED',
    level: 'L2',
    details: 'Badge scan expired for visiting logistical transport. Secondary verification cleared by Commander Vance.',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: 'SIG-519-KX',
    timestamp: '13:40:11 UTC',
    sector: 'Sector 4C',
    locationName: 'Western Substation',
    classification: 'Frequency Anomaly',
    status: 'UNRESOLVED',
    level: 'L1',
    details: 'Unidentified short-burst RF transmission detected on emergency spectrum.',
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: 'SIG-302-MM',
    timestamp: '12:10:05 UTC',
    sector: 'Sector 2D',
    locationName: 'Data Core Alpha',
    classification: 'Cryptographic Resync',
    status: 'MONITORING',
    level: 'L3',
    details: 'Automated rotation of AES-256 keys across outer perimeter relay stations.',
    coordinates: { lat: 1.3521, lng: 103.8198 }
  }
];

export const commanderDossier: PersonnelDossier = {
  id: 'WGD-77X-992',
  clearance: 'CLEARED',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  name: 'VANCE, K.',
  rank: 'Commander',
  sector: 'Sector 4',
  biometrics: {
    heartRate: 68,
    bloodPressure: '118/75',
    oxygenSat: 99,
    temp: 98.4
  },
  medicalAlerts: [
    'Severe allergy to Penicillin class antibiotics. Causes anaphylaxis.',
    'Previous trauma to left knee (ACL reconstruction, 2021). Monitor for stress degradation.'
  ],
  bloodType: '0-Negative',
  vaccinationStatus: 'Current (Protocol Alpha)',
  physicalEval: 'Cleared for field duty. Superior endurance metrics noted in last cycle.',
  proceduralNotes: [
    {
      id: 'note-1',
      date: '10/24/23',
      text: 'Subject underwent standard neurological debriefing after operation "SILVER HOUND". No signs of cognitive degradation. Prescribed 48 hours mandatory rest cycle.'
    },
    {
      id: 'note-2',
      date: '05/12/23',
      text: 'Treatment for minor laceration on right forearm. Sutured in field. Healed without complication or infection.'
    }
  ],
  emergencyProtocols: [
    {
      name: 'HQ Medical Wing',
      priority: 1,
      icon: 'call',
      status: 'ACTIVE'
    },
    {
      name: 'REDACTED',
      priority: 2,
      icon: 'lock',
      status: 'LOCKED'
    }
  ]
};

export const activeUnit7: NetworkUnit = {
  id: 'UNIT_7',
  name: 'Tactical Recon Unit 7',
  eta: '04:22',
  distance: '1.2 KM',
  velocity: '85 KM/H',
  signalStrength: 4,
  status: 'ELEVATED THREAT ENCOUNTER',
  targetLocation: 'TARGET_LOC (Grid 44-B)',
  coordinates: { x: 450, y: 320 }
};

export const initialEncryptionLogs: EncryptionLog[] = [
  { id: '1', timestamp: '14:22:15', level: 'SYS', message: 'Handshake initiated with Central Relay Node-X...' },
  { id: '2', timestamp: '14:22:18', level: 'SYS', message: 'Key exchange successful. AES-256 session established.' },
  { id: '3', timestamp: '14:22:21', level: 'NET', message: 'Rerouting packet through Node_X (Sector 7G).' },
  { id: '4', timestamp: '14:22:25', level: 'WARN', message: 'Latency spike detected (+45ms) on perimeter telemetry stream.' },
  { id: '5', timestamp: '14:22:28', level: 'NET', message: 'Connection stabilized. Re-syncing signal buffers.' },
  { id: '6', timestamp: '14:22:31', level: 'NET', message: 'Scanning frequencies... No unauthorized interference found.' }
];
