import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Save, Heart, AlertCircle, PhoneCall, Check, Sparkles } from 'lucide-react';
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
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 border border-slate-800">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-500 shadow-[0_0_15px_rgba(255,30,39,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              WebShield Medical Profile
              <span className="badge-spider text-xs">Privacy Filtered</span>
            </h3>
            <p className="text-xs text-slate-400">Control what medical information responders can access during an emergency</p>
          </div>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'EDIT' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Profile & Consent
          </button>
          <button
            onClick={() => setActiveTab('RESPONDER_PREVIEW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'RESPONDER_PREVIEW' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Responder View Preview
          </button>
        </div>
      </div>

      {activeTab === 'EDIT' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blood Group */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> Blood Type
                </label>
                <button
                  onClick={() => handleToggle('share_blood_group')}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition ${
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="e.g. O Negative"
              />
            </div>

            {/* Allergies */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Known Allergies
                </label>
                <button
                  onClick={() => handleToggle('share_allergies')}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition ${
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="e.g. Penicillin, Latex"
              />
            </div>
          </div>

          {/* Medical Notes */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Emergency Medical Notes
              </label>
              <button
                onClick={() => handleToggle('share_medical_notes')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition ${
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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
              placeholder="Crucial medical instructions for first responders..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              WebShield encryption active. Only fields with sharing enabled are unlocked for responders.
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-[0_0_20px_rgba(255,30,39,0.4)] disabled:opacity-50"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {saveSuccess ? 'Privacy Saved!' : isSaving ? 'Saving...' : 'Save WebShield Profile'}
            </button>
          </div>
        </div>
      ) : (
        /* RESPONDER CONFIDENTIAL VIEW PREVIEW */
        <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Responder Mobile HUD (Filtered View)
            </span>
            <span className="text-xs text-slate-400">Victim Consent Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Blood Group:</span>
              {profile.share_blood_group ? (
                <span className="text-red-400 font-bold text-base">{profile.blood_group || 'O Negative'}</span>
              ) : (
                <span className="text-slate-500 text-xs italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> [Restricted by Victim]
                </span>
              )}
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Allergies:</span>
              {profile.share_allergies ? (
                <span className="text-amber-400 font-medium text-sm">{profile.allergies || 'None'}</span>
              ) : (
                <span className="text-slate-500 text-xs italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> [Restricted by Victim]
                </span>
              )}
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Emergency Contacts:</span>
              <span className="text-emerald-400 font-bold text-xs">2 Contacts (Aunt May, Ned)</span>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Medical Notes:</span>
            {profile.share_medical_notes ? (
              <p className="text-slate-200 text-sm leading-relaxed">{profile.medical_notes || 'No special notes.'}</p>
            ) : (
              <p className="text-slate-500 text-xs italic flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> [Restricted by Victim Privacy Settings]
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
