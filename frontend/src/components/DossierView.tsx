import React, { useState, useEffect } from 'react';
import { PersonnelDossier } from '../types';
import { fetchMedicalProfile, updateMedicalProfile } from '../services/api';

interface DossierViewProps {
  dossier: PersonnelDossier;
  onUpdateDossier?: (updated: PersonnelDossier) => void;
  onTriggerEmergency?: (protocolName: string) => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
  dossier,
  onTriggerEmergency,
}) => {
  const [notes, setNotes] = useState(dossier.proceduralNotes);
  const [newNoteText, setNewNoteText] = useState('');
  const [isRetinalScanning, setIsRetinalScanning] = useState(false);
  const [unlockedRedacted, setUnlockedRedacted] = useState(false);
  
  // Backend WebShield state
  const [backendProfile, setBackendProfile] = useState<{
    blood_group: string;
    allergies: string;
    medical_notes: string;
    share_blood_group: boolean;
    share_allergies: boolean;
    share_medical_notes: boolean;
  }>({
    blood_group: 'O Negative',
    allergies: 'Penicillin, Peanuts',
    medical_notes: 'History of mild asthma; carries inhaler in jacket pocket.',
    share_blood_group: true,
    share_allergies: true,
    share_medical_notes: true
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWebShieldProfile();
  }, []);

  const loadWebShieldProfile = async () => {
    try {
      const data = await fetchMedicalProfile();
      if (data) {
        setBackendProfile({
          blood_group: data.blood_group || 'O Negative',
          allergies: data.allergies || 'Penicillin, Peanuts',
          medical_notes: data.medical_notes || 'History of mild asthma; carries inhaler in jacket pocket.',
          share_blood_group: data.share_blood_group ?? true,
          share_allergies: data.share_allergies ?? true,
          share_medical_notes: data.share_medical_notes ?? true
        });
      }
    } catch (err) {
      console.warn('[DossierView] WebShield backend load:', err);
    }
  };

  const handleToggleConsent = async (field: string) => {
    const updated = {
      ...backendProfile,
      [field]: !backendProfile[field as keyof typeof backendProfile]
    };
    setBackendProfile(updated);
    setIsSaving(true);
    try {
      await updateMedicalProfile(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today
      .getDate()
      .toString()
      .padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;

    const newNote = {
      id: `note-${Date.now()}`,
      date: formattedDate,
      text: newNoteText.trim(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);

    // Save to medical notes in backend
    const updatedProfile = {
      ...backendProfile,
      medical_notes: `${newNoteText.trim()} | ${backendProfile.medical_notes}`
    };
    setBackendProfile(updatedProfile);
    setNewNoteText('');

    try {
      await updateMedicalProfile(updatedProfile);
    } catch (err) {
      console.warn('Backend update failed:', err);
    }
  };

  const handleTriggerRetinalScan = () => {
    setIsRetinalScanning(true);
    setTimeout(() => {
      setIsRetinalScanning(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12 font-sans space-y-6">
      {/* Dossier Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#343339] pb-4">
        <div>
          <div className="font-mono-tech text-xs text-[#ffb3b5] tracking-widest uppercase">
            WEBSHIELD MEDICAL & BIOMETRIC PROFILE
          </div>
          <h1 className="font-mono-tech text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight">
            CLINICAL DOSSIER & CONSENT ENGINE
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-xs text-[#debfbf]">PRIVACY ENCRYPTION:</span>
          <span className="font-mono-tech text-xs bg-[#962333] text-white px-2.5 py-1 rounded-xs uppercase font-extrabold tracking-widest border border-[#ffb3b5]">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personnel Card & Biometric Telemetry (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Personnel ID Card */}
          <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm relative space-y-4">
            <div className="flex justify-between items-center font-mono-tech text-xs">
              <span className="text-[#a68a8a]">ID: {dossier.id}</span>
              <span className="bg-[#962333] text-white text-[10px] px-2 py-0.5 rounded-xs font-bold tracking-widest">
                VERIFIED
              </span>
            </div>

            {/* Subject Name & Rank */}
            <div className="space-y-1 border-t border-[#343339] pt-3">
              <h2 className="font-mono-tech text-3xl font-extrabold text-white tracking-wider">
                {dossier.name}
              </h2>
              <div className="font-mono-tech text-xs text-[#debfbf]">
                Rank: <span className="text-white font-bold">{dossier.rank}</span> | Sector: <span className="text-[#ffb3b5]">{dossier.sector}</span>
              </div>
            </div>
          </div>

          {/* Biometric Telemetry Block */}
          <div className="bg-[#20252C] border border-[#343339] p-5 rounded-sm space-y-4">
            <div className="font-mono-tech text-xs text-[#a68a8a] uppercase tracking-widest font-bold">
              BIOMETRIC TELEMETRY
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono-tech">
              {/* Heart Rate */}
              <div className="bg-[#13171B] border border-[#343339] p-3 rounded-sm">
                <div className="text-[10px] text-[#a68a8a] uppercase">Heart Rate</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-white">{dossier.biometrics.heartRate}</span>
                  <span className="text-[10px] text-[#962333] font-bold animate-pulse">BPM</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-[#13171B] border border-[#343339] p-3 rounded-sm">
                <div className="text-[10px] text-[#a68a8a] uppercase">Blood Pres.</div>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {dossier.biometrics.bloodPressure}
                </div>
              </div>

              {/* O2 Saturation */}
              <div className="bg-[#13171B] border border-[#343339] p-3 rounded-sm">
                <div className="text-[10px] text-[#a68a8a] uppercase">O2 Sat.</div>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {dossier.biometrics.oxygenSat}%
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-[#13171B] border border-[#343339] p-3 rounded-sm">
                <div className="text-[10px] text-[#a68a8a] uppercase">Temp</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">{dossier.biometrics.temp}</span>
                  <span className="text-[10px] text-[#ffb3b5]">°F</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medical Alerts, Consent Toggles, Clinical Notes & Emergency Protocols */}
        <div className="lg:col-span-8 space-y-6">
          {/* WebShield Patient Consent Toggles */}
          <div className="bg-[#20252C] border-2 border-[#962333] p-5 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#343339] pb-3">
              <div className="font-mono-tech text-xs text-[#ffb3b5] uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#962333]">shield</span>
                WEBSHIELD RESPONDER RELEASE CONSENT
              </div>
              <span className="text-[10px] font-mono-tech text-emerald-400 font-bold">
                {isSaving ? 'SYNCING...' : 'LIVE ENCRYPTED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-tech text-xs">
              {/* Blood Group Release Toggle */}
              <div className="bg-[#13171B] p-3 border border-[#343339] flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] text-[#a68a8a] uppercase block">BLOOD TYPE RELEASE</span>
                  <span className="text-red-400 font-extrabold text-sm">{backendProfile.blood_group}</span>
                </div>
                <button
                  onClick={() => handleToggleConsent('share_blood_group')}
                  className={`py-1 px-2 text-[10px] font-bold uppercase border transition ${
                    backendProfile.share_blood_group
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#291d1d] text-slate-400 border-slate-700'
                  }`}
                >
                  {backendProfile.share_blood_group ? '✓ ALLOWED' : '🔒 RESTRICTED'}
                </button>
              </div>

              {/* Allergies Release Toggle */}
              <div className="bg-[#13171B] p-3 border border-[#343339] flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] text-[#a68a8a] uppercase block">ALLERGIES RELEASE</span>
                  <span className="text-amber-400 font-bold text-xs">{backendProfile.allergies}</span>
                </div>
                <button
                  onClick={() => handleToggleConsent('share_allergies')}
                  className={`py-1 px-2 text-[10px] font-bold uppercase border transition ${
                    backendProfile.share_allergies
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#291d1d] text-slate-400 border-slate-700'
                  }`}
                >
                  {backendProfile.share_allergies ? '✓ ALLOWED' : '🔒 RESTRICTED'}
                </button>
              </div>

              {/* Notes Release Toggle */}
              <div className="bg-[#13171B] p-3 border border-[#343339] flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] text-[#a68a8a] uppercase block">NOTES RELEASE</span>
                  <span className="text-slate-200 font-bold text-[11px] truncate block">
                    {backendProfile.medical_notes}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleConsent('share_medical_notes')}
                  className={`py-1 px-2 text-[10px] font-bold uppercase border transition ${
                    backendProfile.share_medical_notes
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#291d1d] text-slate-400 border-slate-700'
                  }`}
                >
                  {backendProfile.share_medical_notes ? '✓ ALLOWED' : '🔒 RESTRICTED'}
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Dossier Section */}
          <div className="bg-[#20252C] border border-[#343339] p-5 md:p-6 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#343339] pb-3">
              <div className="font-mono-tech text-xs text-white uppercase tracking-widest font-bold">
                CLINICAL PROCEDURAL NOTES
              </div>
              <button
                onClick={() => {
                  const inputEl = document.getElementById('new-log-input');
                  if (inputEl) inputEl.focus();
                }}
                className="bg-[#291d1d] hover:bg-[#342727] text-[#ffb3b5] border border-[#574142] px-3 py-1 font-mono-tech text-[11px] font-bold uppercase rounded-xs transition-colors flex items-center gap-1"
              >
                <span>+</span> ADD ENTRY
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Details */}
              <div className="space-y-4 font-mono-tech text-xs">
                <div>
                  <div className="text-[10px] text-[#a68a8a] uppercase">BLOOD TYPE</div>
                  <div className="text-2xl font-extrabold text-white mt-0.5">{backendProfile.blood_group}</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#a68a8a] uppercase">VACCINATION STATUS</div>
                  <div className="text-sm font-semibold text-[#f4dddd] mt-0.5">{dossier.vaccinationStatus}</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#a68a8a] uppercase">PHYSICAL EVAL</div>
                  <div className="text-xs text-[#debfbf] mt-0.5 leading-relaxed">{dossier.physicalEval}</div>
                </div>
              </div>

              {/* Right Procedural Notes */}
              <div className="space-y-3 font-mono-tech text-xs">
                <div className="text-[10px] text-[#a68a8a] uppercase font-bold">
                  PROCEDURAL NOTES
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-[#13171B] border border-[#343339] p-3 rounded-sm">
                      <span className="text-[#962333] font-bold mr-1">[{note.date}]</span>
                      <span className="text-[#debfbf]">{note.text}</span>
                    </div>
                  ))}
                </div>

                {/* New Log Input Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    id="new-log-input"
                    type="text"
                    placeholder="> Enter new clinical log..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-[#13171B] border border-[#343339] text-[#f4dddd] text-xs font-mono-tech px-3 py-2 rounded-sm focus:outline-none focus:border-[#962333] placeholder-[#a68a8a]"
                  />
                  <button
                    type="submit"
                    className="bg-[#962333] hover:bg-[#A32633] text-white px-3 py-2 font-mono-tech text-xs font-bold uppercase rounded-sm transition-colors"
                  >
                    SAVE
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Emergency Protocols */}
          <div className="space-y-3">
            <div className="font-mono-tech text-xs text-[#a68a8a] uppercase tracking-widest font-bold">
              EMERGENCY PROTOCOLS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onTriggerEmergency?.('HQ Medical Wing')}
                className="bg-[#20252C] hover:bg-[#291d1d] border border-[#343339] p-4 rounded-sm flex items-center justify-between text-left transition-colors group cursor-pointer"
              >
                <div>
                  <div className="font-mono-tech text-sm font-bold text-white group-hover:text-[#ffb3b5]">
                    HQ Medical Wing Dispatch
                  </div>
                  <div className="font-mono-tech text-[10px] text-[#a68a8a]">Priority 1</div>
                </div>
                <span className="material-symbols-outlined text-xl text-[#debfbf] group-hover:text-[#ffb3b5]">
                  call
                </span>
              </button>

              <div className="bg-[#20252C] border border-[#343339] p-4 rounded-sm flex items-center justify-between">
                <div>
                  <div className="font-mono-tech text-sm font-bold text-[#a68a8a]">
                    {unlockedRedacted ? 'OVR-PROTOCOL: OMEGA BLACK' : 'REDACTED PROTOCOL'}
                  </div>
                  <div className="font-mono-tech text-[10px] text-[#574142]">Priority 2</div>
                </div>
                <button
                  onClick={() => setUnlockedRedacted(!unlockedRedacted)}
                  className="text-[#574142] hover:text-[#ffb3b5] transition-colors"
                  title="Override Security Lock"
                >
                  <span className="material-symbols-outlined text-xl">
                    {unlockedRedacted ? 'lock_open' : 'lock'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
