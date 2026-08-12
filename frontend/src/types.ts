export type NavTab = 'COMMAND_CENTRAL' | 'DOSSIER' | 'NETWORK' | 'TACTICAL_COMMAND' | 'SOLUTIONS';

export type SignalLevel = 'L1' | 'L2' | 'L3';

export type SignalStatus = 'UNRESOLVED' | 'ENGAGING' | 'MONITORING' | 'RESOLVED';

export interface SignalItem {
  id: string;
  timestamp: string;
  sector: string;
  locationName: string;
  classification: string;
  status: SignalStatus;
  level: SignalLevel;
  details?: string;
  coordinates?: { lat: number; lng: number };
}

export interface ProceduralNote {
  id: string;
  date: string;
  text: string;
  author?: string;
}

export interface PersonnelDossier {
  id: string;
  clearance: 'CLEARED' | 'RESTRICTED' | 'SUSPENDED';
  photoUrl: string;
  name: string;
  rank: string;
  sector: string;
  biometrics: {
    heartRate: number;
    bloodPressure: string;
    oxygenSat: number;
    temp: number;
  };
  medicalAlerts: string[];
  bloodType: string;
  vaccinationStatus: string;
  physicalEval: string;
  proceduralNotes: ProceduralNote[];
  emergencyProtocols: {
    name: string;
    priority: number;
    icon: string;
    status: 'ACTIVE' | 'LOCKED';
  }[];
}

export interface NetworkUnit {
  id: string;
  name: string;
  eta: string;
  distance: string;
  velocity: string;
  signalStrength: number; // 1 to 5
  status: string;
  targetLocation: string;
  coordinates: { x: number; y: number };
}

export interface EncryptionLog {
  id: string;
  timestamp: string;
  level: 'SYS' | 'NET' | 'WARN' | 'ERR';
  message: string;
}
