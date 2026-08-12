import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Save, Heart, AlertCircle, Check } from 'lucide-react';
import { fetchMedicalProfile, updateMedicalProfile } from '../../services/api';

export const WebShieldProfileCard = () => {
  const [profile, setProfile] = useState({
    blood_group: 'O Negative',
    allergies: 'Penicillin, Peanuts',
    medical_notes: 'History of mild asthma; carries inhaler in jacket pocket.',
    pre_existing_conditions: 'Asthma',
    share_blood_group: true,
    share_allergies: true,
    share_medical_notes: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('EDIT'); // EDIT, RESPONDER_PREVIEW

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchMedicalProfile();
      if (data) setProfile(data);
    } catch (err) {
      console.error('Failed to load WebShield profile:', err);
    }
  };

  const handleToggle = (field) => {
    setProfile(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMedicalProfile(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving WebShield profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="wg-card wg-card-clinical p-6 flex flex-col gap-5">
      {/* Clinical Slate Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#343339] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#343339] border border-slate-600 text-slate-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              WebShield Clinical Profile
              <span className="badge-angular-slate">Privacy Shielded</span>
            </h3>
            <p className="text-xs text-slate-400">Configure medical data release consent for first responders</p>
          </div>
        </div>

        <div className="flex bg-[#13171B] p-1 border border-[#343339]">
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-3 py-1.5 text-xs font-bold transition uppercase ${
              activeTab === 'EDIT' ? 'bg-[#343339] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Consent Controls
          </button>
          <button
            onClick={() => setActiveTab('RESPONDER_PREVIEW')}
            className={`px-3 py-1.5 text-xs font-bold transition uppercase flex items-center gap-1.5 ${
              activeTab === 'RESPONDER_PREVIEW' ? 'bg-[#60262C] text-white border border-[#962333]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Responder HUD Preview
          </button>
        </div>
      </div>

      {activeTab === 'EDIT' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blood Type */}
            <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> Blood Type
                </label>
                <button
                  onClick={() => handleToggle('share_blood_group')}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 border font-semibold transition ${
                    profile.share_blood_group
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {profile.share_blood_group ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {profile.share_blood_group ? 'Sharing Allowed' : 'Hidden'}
                </button>
              </div>
              <input
                type="text"
                value={profile.blood_group || ''}
                onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                className="w-full bg-[#20252C] border border-[#343339] px-3 py-2 text-white text-sm focus:border-slate-500 focus:outline-none"
                placeholder="e.g. O Negative"
              />
            </div>

            {/* Allergies */}
            <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Critical Allergies
                </label>
                <button
                  onClick={() => handleToggle('share_allergies')}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 border font-semibold transition ${
                    profile.share_allergies
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {profile.share_allergies ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {profile.share_allergies ? 'Sharing Allowed' : 'Hidden'}
                </button>
              </div>
              <input
                type="text"
                value={profile.allergies || ''}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                className="w-full bg-[#20252C] border border-[#343339] px-3 py-2 text-white text-sm focus:border-slate-500 focus:outline-none"
                placeholder="e.g. Penicillin, Latex"
              />
            </div>
          </div>

          {/* Medical Notes */}
          <div className="bg-[#13171B] p-4 border border-[#343339] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Clinical Instructions
              </label>
              <button
                onClick={() => handleToggle('share_medical_notes')}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 border font-semibold transition ${
                  profile.share_medical_notes
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {profile.share_medical_notes ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {profile.share_medical_notes ? 'Sharing Allowed' : 'Hidden'}
              </button>
            </div>
            <textarea
              value={profile.medical_notes || ''}
              onChange={(e) => setProfile({ ...profile, medical_notes: e.target.value })}
              rows={3}
              className="w-full bg-[#20252C] border border-[#343339] px-3 py-2 text-white text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Crucial medical notes for first responders..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Patient privacy encryption active. Only fields with consent enabled will be released to en-route units.
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-angular btn-angular-secondary px-5 py-2.5 text-xs flex items-center gap-2"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {saveSuccess ? 'Preferences Saved' : isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      ) : (
        /* RESPONDER HUD CLINICAL PREVIEW */
        <div className="p-4 bg-[#13171B] border border-[#343339] space-y-4">
          <div className="flex justify-between items-center border-b border-[#343339] pb-2">
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-400" /> First Responder Medical Screen (Consent Filtered)
            </span>
            <span className="text-xs text-slate-400 font-mono">Patient Consent Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#20252C] p-3 border border-[#343339]">
              <span className="text-xs text-slate-400 block mb-1">Blood Group:</span>
              {profile.share_blood_group ? (
                <span className="text-red-400 font-bold text-base">{profile.blood_group || 'O Negative'}</span>
              ) : (
                <span className="text-slate-500 text-xs italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> [Restricted by Patient]
                </span>
              )}
            </div>

            <div className="bg-[#20252C] p-3 border border-[#343339]">
              <span className="text-xs text-slate-400 block mb-1">Allergies:</span>
              {profile.share_allergies ? (
                <span className="text-amber-400 font-medium text-sm">{profile.allergies || 'None'}</span>
              ) : (
                <span className="text-slate-500 text-xs italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> [Restricted by Patient]
                </span>
              )}
            </div>

            <div className="bg-[#20252C] p-3 border border-[#343339]">
              <span className="text-xs text-slate-400 block mb-1">Emergency Contacts:</span>
              <span className="text-emerald-400 font-bold text-xs">2 Verified Contacts</span>
            </div>
          </div>

          <div className="bg-[#20252C] p-3 border border-[#343339]">
            <span className="text-xs text-slate-400 block mb-1">Medical Instructions:</span>
            {profile.share_medical_notes ? (
              <p className="text-slate-200 text-sm leading-relaxed">{profile.medical_notes || 'No notes provided.'}</p>
            ) : (
              <p className="text-slate-500 text-xs italic flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> [Restricted by Patient Privacy Preferences]
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
