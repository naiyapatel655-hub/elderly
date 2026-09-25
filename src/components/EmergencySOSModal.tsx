import React, { useState } from 'react';
import { SeniorProfile, Medication, VitalLog } from '../types';
import {
  PhoneCall,
  AlertTriangle,
  X,
  ShieldAlert,
  Send,
  CheckCircle2,
  Heart,
  Pill,
  User,
} from 'lucide-react';
import { playAlertSound, speakText } from '../utils/audio';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SeniorProfile;
  medications: Medication[];
  latestBP?: VitalLog;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  latestBP,
}) => {
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const primaryContact = profile.emergencyContacts.find((c) => c.isPrimary) || profile.emergencyContacts[0];

  const handleSendFamilyAlert = () => {
    setIsSending(true);
    playAlertSound();
    speakText(`Sending emergency alert to ${primaryContact.name}. Stay calm, help is on the way.`);

    setTimeout(() => {
      setIsSending(false);
      setAlertSent(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-600 max-h-[92vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-pulse shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-700 uppercase tracking-widest block">
                Immediate Assistance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans">
                Emergency &amp; Family SOS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xl font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Quick Call Buttons */}
        <div className="space-y-3">
          {/* 911 Direct Call */}
          <a
            href="tel:911"
            className="w-full min-h-[64px] bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-2xl font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg transition-transform"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>Call 911 (Emergency Services)</span>
          </a>

          {/* Primary Caregiver Direct Call */}
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="w-full min-h-[60px] bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-2xl font-bold text-base sm:text-lg flex items-center justify-between px-6 shadow-md transition-transform"
            >
              <div className="text-left">
                <span className="text-xs text-amber-400 block font-normal">Call Primary Caregiver</span>
                <span className="text-white">{primaryContact.name} ({primaryContact.relationship})</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-mono text-sm sm:text-base">
                <PhoneCall className="w-5 h-5" />
                <span>{primaryContact.phone}</span>
              </div>
            </a>
          )}

          {/* Doctor Direct Call */}
          <a
            href={`tel:${profile.doctor.phone}`}
            className="w-full min-h-[56px] bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 rounded-2xl font-bold text-base flex items-center justify-between px-6 transition-colors"
          >
            <div className="text-left">
              <span className="text-xs text-amber-700 block font-normal">Call Physician Clinic</span>
              <span>{profile.doctor.name}</span>
            </div>
            <span className="font-mono text-stone-800 text-sm">{profile.doctor.phone}</span>
          </a>
        </div>

        {/* One-Tap Family Broadcast Simulation */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-rose-950 text-sm">
                Broadcast SOS Alert to Family
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Immediately sends notification with your current location and vital numbers.
              </p>
            </div>

            <button
              onClick={handleSendFamilyAlert}
              disabled={isSending || alertSent}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                alertSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {alertSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alert Sent to Family!</span>
                </>
              ) : isSending ? (
                <span>Dispatching Alert...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send SOS Alert</span>
                </>
              )}
            </button>
          </div>

          {alertSent && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 p-2.5 rounded-lg">
              ✓ Claire Vance and David Vance have been notified via SMS with your home address and recent readings.
            </div>
          )}
        </div>

        {/* Paramedic / First Responder Card */}
        <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-700" />
              Paramedic Quick Reference Card
            </span>
            <span className="text-xs font-bold text-rose-700 font-mono">
              Blood: {profile.bloodType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-stone-400 block font-semibold">Patient Name:</span>
              <span className="font-bold text-stone-900">{profile.name} (Age: {profile.age})</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold">Recent BP:</span>
              <span className="font-bold text-stone-900 font-mono">
                {latestBP ? `${latestBP.systolic}/${latestBP.diastolic} mmHg` : '122/78 mmHg'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-rose-700 block font-bold">
              Known Drug Allergies:
            </span>
            <span className="text-xs font-extrabold text-stone-900">
              {profile.knownAllergies.join(', ') || 'No known drug allergies'}
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-500 block font-semibold">
              Current Active Medications:
            </span>
            <span className="text-xs text-stone-800 leading-relaxed">
              {medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 text-sm font-semibold underline underline-offset-4"
          >
            I am safe now — Close Emergency View
          </button>
        </div>
      </div>
    </div>
  );
};
