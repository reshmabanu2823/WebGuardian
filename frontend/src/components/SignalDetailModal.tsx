import React, { useState } from 'react';
import { SignalItem, SignalStatus, SignalLevel } from '../types';

interface SignalDetailModalProps {
  signal: SignalItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: SignalStatus, newLevel?: SignalLevel) => void;
  onDispatchUnit: (sector: string) => void;
}

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({
  signal,
  onClose,
  onUpdateStatus,
  onDispatchUnit,
}) => {
  if (!signal) return null;

  const [currentStatus, setCurrentStatus] = useState<SignalStatus>(signal.status);
  const [currentLevel, setCurrentLevel] = useState<SignalLevel>(signal.level);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSaveStatus = () => {
    onUpdateStatus(signal.id, currentStatus, currentLevel);
    setActionNotice('STATUS SUCCESSFULLY UPDATED');
    setTimeout(() => setActionNotice(null), 2000);
  };

  const handleDispatch = () => {
    onDispatchUnit(signal.sector);
    setActionNotice(`TACTICAL RECON DISPATCHED TO ${signal.sector}`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#13171B]/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#20252C] border-2 border-[#962333] w-full max-w-xl p-6 rounded-sm shadow-2xl space-y-6 animate-in fade-in">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#343339] pb-3">
          <div>
            <div className="text-[10px] text-[#ffb3b5] font-bold">SIGNAL TELEMETRY INSPECTION</div>
            <h2 className="text-xl font-extrabold text-white">{signal.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#debfbf] hover:text-white p-1 text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Main Details */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-[#13171B] p-3 rounded-sm border border-[#343339]">
            <div>
              <span className="text-[#a68a8a] text-[10px] block">TIMESTAMP:</span>
              <span className="text-white font-bold">{signal.timestamp}</span>
            </div>
            <div>
              <span className="text-[#a68a8a] text-[10px] block">SECTOR:</span>
              <span className="text-[#ffb3b5] font-bold">{signal.sector}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#a68a8a] text-[10px] block">LOCATION NAME:</span>
              <span className="text-white font-bold">{signal.locationName}</span>
            </div>
          </div>

          <div>
            <span className="text-[#a68a8a] text-[10px] block uppercase font-bold mb-1">CLASSIFICATION:</span>
            <div className="text-sm font-bold text-white bg-[#13171B] p-2.5 rounded-sm border border-[#343339]">
              {signal.classification}
            </div>
          </div>

          <div>
            <span className="text-[#a68a8a] text-[10px] block uppercase font-bold mb-1">INCIDENT DETAILS:</span>
            <p className="text-[#debfbf] bg-[#13171B] p-3 rounded-sm border border-[#343339] leading-relaxed text-[11px]">
              {signal.details || 'No additional packet logs attached to this threat signal.'}
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[#a68a8a] text-[10px] block font-bold mb-1">STATUS:</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as SignalStatus)}
                className="w-full bg-[#13171B] border border-[#343339] text-white p-2 rounded-xs focus:outline-none focus:border-[#962333]"
              >
                <option value="UNRESOLVED">UNRESOLVED</option>
                <option value="ENGAGING">ENGAGING</option>
                <option value="MONITORING">MONITORING</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            <div>
              <label className="text-[#a68a8a] text-[10px] block font-bold mb-1">LEVEL:</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as SignalLevel)}
                className="w-full bg-[#13171B] border border-[#343339] text-white p-2 rounded-xs focus:outline-none focus:border-[#962333]"
              >
                <option value="L1">L1 - CRITICAL</option>
                <option value="L2">L2 - HIGH PRIORITY</option>
                <option value="L3">L3 - MONITORING</option>
              </select>
            </div>
          </div>

          {/* Action Notice */}
          {actionNotice && (
            <div className="bg-[#962333]/30 border border-[#ffb3b5] text-[#ffb3b5] text-center py-2 text-[11px] font-bold rounded-xs animate-pulse">
              {actionNotice}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#343339]">
          <button
            onClick={handleDispatch}
            className="flex-1 bg-[#291d1d] hover:bg-[#342727] text-[#ffb3b5] border border-[#574142] py-2 rounded-xs text-xs font-bold uppercase transition-colors"
          >
            DISPATCH RECON UNIT
          </button>
          <button
            onClick={handleSaveStatus}
            className="flex-1 bg-[#962333] hover:bg-[#A32633] text-white py-2 rounded-xs text-xs font-bold uppercase transition-colors"
          >
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};
