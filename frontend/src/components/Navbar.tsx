import React, { useState } from 'react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onTriggerSOS: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTriggerSOS,
  unreadCount,
  onOpenNotifications,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <nav className="bg-[#1c1011]/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#574142]">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('COMMAND_CENTRAL')}
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="relative w-9 h-9 bg-[#962333] border-2 border-[#ffb3b5] flex items-center justify-center rounded-sm group-hover:bg-[#A32633] transition-colors shadow-[0_0_12px_rgba(255,59,83,0.4)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              {/* Spider web emblem */}
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" />
              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.2" />
              <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1" />
              <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-mono-tech text-xl font-extrabold tracking-tight text-[#ffb3b5] group-hover:text-white transition-colors flex items-center gap-1">
              WebGuardian
              <span className="text-[10px] text-[#ff3b53] bg-[#291d1d] px-1.5 py-0.2 rounded border border-[#962333]">
                SPIDER-GRID
              </span>
            </span>
            <span className="font-mono-tech text-[9px] text-[#debfbf] tracking-widest uppercase">
              Marvel Tactical Protocol
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-mono-tech text-xs uppercase tracking-widest font-semibold">
          <button
            onClick={() => setActiveTab('SOLUTIONS')}
            className={`transition-colors pb-1 ${
              activeTab === 'SOLUTIONS'
                ? 'text-[#ffb3b5] font-bold border-b-2 border-[#ffb3b5]'
                : 'text-[#debfbf] hover:text-[#ffb3b5]'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setActiveTab('NETWORK')}
            className={`transition-colors pb-1 ${
              activeTab === 'NETWORK'
                ? 'text-[#ffb3b5] font-bold border-b-2 border-[#ffb3b5]'
                : 'text-[#debfbf] hover:text-[#ffb3b5]'
            }`}
          >
            Network
          </button>
          <button
            onClick={() => setActiveTab('DOSSIER')}
            className={`transition-colors pb-1 ${
              activeTab === 'DOSSIER'
                ? 'text-[#ffb3b5] font-bold border-b-2 border-[#ffb3b5]'
                : 'text-[#debfbf] hover:text-[#ffb3b5]'
            }`}
          >
            Dossier
          </button>
          <button
            onClick={() => setActiveTab('COMMAND_CENTRAL')}
            className={`transition-colors pb-1 ${
              activeTab === 'COMMAND_CENTRAL'
                ? 'text-[#ffb3b5] font-bold border-b-2 border-[#ffb3b5]'
                : 'text-[#debfbf] hover:text-[#ffb3b5]'
            }`}
          >
            Command Central
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onTriggerSOS}
            className={`px-3 md:px-4 py-1.5 font-mono-tech text-xs tracking-wider uppercase font-extrabold transition-all rounded-sm shadow-md ${
              activeTab === 'TACTICAL_COMMAND'
                ? 'bg-[#A32633] text-white ring-2 ring-[#ffb3b5] animate-pulse'
                : 'bg-[#962333] text-white hover:bg-[#A32633]'
            }`}
          >
            SOS
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-[#debfbf] hover:text-[#ffb3b5] transition-colors rounded hover:bg-[#291d1d]"
              title="System Alerts"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#962333] border border-[#1c1011] rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="p-2 text-[#debfbf] hover:text-[#ffb3b5] transition-colors rounded hover:bg-[#291d1d]"
              title="Personnel Profile"
            >
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="flex md:hidden border-t border-[#343339] bg-[#20252C] px-4 py-2 justify-around font-mono-tech text-[10px] uppercase font-bold tracking-wider text-[#debfbf]">
        <button
          onClick={() => setActiveTab('COMMAND_CENTRAL')}
          className={activeTab === 'COMMAND_CENTRAL' ? 'text-[#ffb3b5]' : ''}
        >
          Central
        </button>
        <button
          onClick={() => setActiveTab('DOSSIER')}
          className={activeTab === 'DOSSIER' ? 'text-[#ffb3b5]' : ''}
        >
          Dossier
        </button>
        <button
          onClick={() => setActiveTab('NETWORK')}
          className={activeTab === 'NETWORK' ? 'text-[#ffb3b5]' : ''}
        >
          Network
        </button>
        <button
          onClick={() => setActiveTab('SOLUTIONS')}
          className={activeTab === 'SOLUTIONS' ? 'text-[#ffb3b5]' : ''}
        >
          Solutions
        </button>
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="absolute right-4 top-16 w-80 bg-[#20252C] border border-[#574142] shadow-2xl p-4 rounded-sm z-50 text-xs font-mono-tech">
          <div className="flex items-center justify-between border-b border-[#343339] pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#962333] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                  alt="Commander Vance"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div>
                <div className="font-bold text-white text-sm">CDR. K. VANCE</div>
                <div className="text-[10px] text-[#ffb3b5]">COMMANDER // SECTOR 4</div>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-[#debfbf] hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-[11px] text-[#debfbf]">
            <div className="flex justify-between py-1 border-b border-[#343339]/50">
              <span>CLEARANCE:</span>
              <span className="text-emerald-400 font-bold">LEVEL-5 CLEARED</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#343339]/50">
              <span>TERMINAL ID:</span>
              <span className="text-white">WGD-77X-992</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#343339]/50">
              <span>SESSION PROTOCOL:</span>
              <span className="text-[#ffb3b5]">AES-256 ACTIVE</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#343339] flex gap-2">
            <button
              onClick={() => {
                setShowProfileModal(false);
                setActiveTab('DOSSIER');
              }}
              className="flex-1 bg-[#291d1d] hover:bg-[#342727] text-white py-1.5 px-2 text-center rounded-sm border border-[#574142] transition-colors"
            >
              VIEW DOSSIER
            </button>
            <button
              onClick={() => {
                setShowProfileModal(false);
                setActiveTab('TACTICAL_COMMAND');
              }}
              className="flex-1 bg-[#962333] hover:bg-[#A32633] text-white py-1.5 px-2 text-center rounded-sm transition-colors"
            >
              TACTICAL SOS
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
