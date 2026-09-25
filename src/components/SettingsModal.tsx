import React, { useState } from 'react';
import { SeniorProfile } from '../types';
import { X, Save, RotateCcw, User, Heart, Bell, Shield, Phone } from 'lucide-react';
import { resetToDemoData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SeniorProfile;
  onSaveProfile: (profile: SeniorProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [age, setAge] = useState<number>(profile.age);
  const [textSize, setTextSize] = useState<SeniorProfile['textSize']>(profile.textSize);
  const [voiceChimeEnabled, setVoiceChimeEnabled] = useState<boolean>(profile.voiceChimeEnabled);
  const [hydrationGoalMl, setHydrationGoalMl] = useState<number>(profile.hydrationGoalMl);
  const [hydrationIntervalMinutes, setHydrationIntervalMinutes] = useState<number>(
    profile.hydrationIntervalMinutes
  );
  const [primaryContactName, setPrimaryContactName] = useState<string>(
    profile.emergencyContacts[0]?.name || ''
  );
  const [primaryContactPhone, setPrimaryContactPhone] = useState<string>(
    profile.emergencyContacts[0]?.phone || ''
  );
  const [doctorName, setDoctorName] = useState<string>(profile.doctor.name);
  const [doctorPhone, setDoctorPhone] = useState<string>(profile.doctor.phone);
  const [doctorClinic, setDoctorClinic] = useState<string>(profile.doctor.clinic);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SeniorProfile = {
      ...profile,
      name,
      age: Number(age) || 75,
      textSize,
      voiceChimeEnabled,
      hydrationGoalMl: Number(hydrationGoalMl) || 1800,
      hydrationIntervalMinutes: Number(hydrationIntervalMinutes) || 90,
      emergencyContacts: [
        {
          ...profile.emergencyContacts[0],
          name: primaryContactName,
          phone: primaryContactPhone,
        },
        ...profile.emergencyContacts.slice(1),
      ],
      doctor: {
        ...profile.doctor,
        name: doctorName,
        phone: doctorPhone,
        clinic: doctorClinic,
      },
    };

    onSaveProfile(updated);
    onClose();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all routine, medications, and hydration logs back to original sample data?')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h3 className="text-xl font-bold text-stone-900 font-sans">
            KinCare Settings &amp; Preferences
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg text-xl font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Senior Profile Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Senior Personal Information
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-700">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Accessibility & Voice Chime */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Accessibility &amp; Sounds
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Default Text Size</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { id: 'normal', label: 'Standard (A)' },
                  { id: 'large', label: 'Large (A+)' },
                  { id: 'extra-large', label: 'Jumbo (A++)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTextSize(s.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      textSize === s.id
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-sm font-semibold text-stone-800 block">
                  Soothing Voice &amp; Chime Prompts
                </span>
                <span className="text-xs text-stone-500">
                  Plays harmonic bell chimes and speaks gentle reminders aloud.
                </span>
              </div>
              <input
                type="checkbox"
                checked={voiceChimeEnabled}
                onChange={(e) => setVoiceChimeEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Hydration Goals */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Hydration Cadence
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Daily Water Goal (ml)</label>
                <input
                  type="number"
                  step="100"
                  value={hydrationGoalMl}
                  onChange={(e) => setHydrationGoalMl(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Reminder Every (mins)</label>
                <input
                  type="number"
                  step="15"
                  value={hydrationIntervalMinutes}
                  onChange={(e) => setHydrationIntervalMinutes(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Emergency & Doctor Contacts */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Primary Emergency Contacts
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Family Caregiver</label>
                <input
                  type="text"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Caregiver Phone</label>
                <input
                  type="text"
                  value={primaryContactPhone}
                  onChange={(e) => setPrimaryContactPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Doctor Phone</label>
                <input
                  type="text"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
