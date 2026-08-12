import React, { useState } from 'react';

interface SolutionsViewProps {
  onNavigate: (tab: 'COMMAND_CENTRAL' | 'DOSSIER' | 'NETWORK' | 'TACTICAL_COMMAND') => void;
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({ onNavigate }) => {
  const [activeDiagnostic, setActiveDiagnostic] = useState<string | null>(null);

  const handleRunDemo = (moduleName: string) => {
    setActiveDiagnostic(moduleName);
    setTimeout(() => {
      setActiveDiagnostic(null);
    }, 2000);
  };

  const modules = [
    {
      id: 'firewall',
      title: 'Sentinel Perimeter Firewall',
      code: 'MODULE-DEF-01',
      description:
        'Continuous deep packet inspection with automated hardware isolation across sub-level relays.',
      icon: 'security',
      actionText: 'TEST FIREWALL SHIELD',
      onClick: () => handleRunDemo('firewall'),
    },
    {
      id: 'radar',
      title: 'Neural Vector Radar',
      code: 'MODULE-AI-02',
      description:
        'Machine learning algorithms analyzing RF signals and biometric handshakes to predict intrusion vectors.',
      icon: 'radar',
      actionText: 'LAUNCH RADAR DIAGNOSTIC',
      onClick: () => handleRunDemo('radar'),
    },
    {
      id: 'vault',
      title: 'Biometric Personnel Vault',
      code: 'MODULE-BIO-03',
      description:
        'Encrypted database housing retinal matches, vocal prints, and emergency medical debriefing notes.',
      icon: 'fingerprint',
      actionText: 'OPEN DOSSIER VAULT',
      onClick: () => onNavigate('DOSSIER'),
    },
    {
      id: 'sos',
      title: 'Emergency SOS Beacon',
      code: 'MODULE-SOS-04',
      description:
        'Multi-frequency emergency broadcast protocol that locks local terminals and dispatches recon units.',
      icon: 'emergency',
      actionText: 'CONFIG TACTICAL SOS',
      onClick: () => onNavigate('TACTICAL_COMMAND'),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16 font-sans space-y-8">
      {/* Header */}
      <div className="border-b border-[#343339] pb-4">
        <div className="font-mono-tech text-xs text-[#ffb3b5] tracking-widest uppercase">
          TACTICAL ARCHITECTURE & DEFENSE
        </div>
        <h1 className="font-mono-tech text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">
          WEBGUARDIAN SENTINEL SOLUTIONS
        </h1>
        <p className="font-sans text-sm text-[#debfbf] max-w-3xl mt-2 leading-relaxed">
          Integrated emergency command protocols, real-time telemetry analytics, and military-grade biometric security modules designed for high-risk sector command.
        </p>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-[#20252C] border border-[#343339] p-6 rounded-sm space-y-4 hover:border-[#962333]/60 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono-tech">
                <span className="text-[10px] text-[#ffb3b5] bg-[#291d1d] px-2 py-0.5 border border-[#574142] rounded-xs font-bold">
                  {mod.code}
                </span>
                <span className="material-symbols-outlined text-2xl text-[#ffb3b5] group-hover:scale-110 transition-transform">
                  {mod.icon}
                </span>
              </div>

              <h2 className="font-mono-tech text-xl font-extrabold text-white group-hover:text-[#ffb3b5] transition-colors">
                {mod.title}
              </h2>

              <p className="text-xs text-[#debfbf] leading-relaxed font-sans">{mod.description}</p>
            </div>

            <div className="pt-4 border-t border-[#343339]">
              <button
                onClick={mod.onClick}
                className="w-full bg-[#291d1d] hover:bg-[#962333] text-[#ffb3b5] hover:text-white border border-[#574142] py-2 px-4 rounded-xs font-mono-tech text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                {activeDiagnostic === mod.id ? (
                  <span className="animate-pulse text-white">EXECUTING DIAGNOSTIC...</span>
                ) : (
                  <>
                    <span>{mod.actionText}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Infrastructure Specs */}
      <div className="bg-[#13171B] border border-[#343339] p-6 rounded-sm font-mono-tech text-xs space-y-4">
        <div className="text-white font-bold tracking-wider uppercase border-b border-[#343339] pb-2">
          SYSTEM INTEGRITY & PROTOCOL CERTIFICATIONS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#debfbf]">
          <div>
            <span className="text-[#a68a8a] text-[10px] block">SECURITY ENCRYPTION:</span>
            <span className="text-white font-bold">AES-256-GCM / TLS 1.3</span>
          </div>
          <div>
            <span className="text-[#a68a8a] text-[10px] block">COMPLIANCE STANDARDS:</span>
            <span className="text-white font-bold">HIPAA & SENTINEL LEVEL-5</span>
          </div>
          <div>
            <span className="text-[#a68a8a] text-[10px] block">LATENCY RESPONSE:</span>
            <span className="text-emerald-400 font-bold">&lt; 4ms SUB-LETHAL SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
