import React, { useState, useEffect } from 'react';
import {
  SeniorProfile,
  Medication,
  HydrationEntry,
  VitalLog,
  RoutineTask,
} from './types';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredMedications,
  saveStoredMedications,
  getStoredHydration,
  saveStoredHydration,
  getStoredVitals,
  saveStoredVitals,
  getStoredRoutine,
  saveStoredRoutine,
} from './utils/storage';
import { Header } from './components/Header';
import { DailyRoutineOverview } from './components/DailyRoutineOverview';
import { MedicationTracker } from './components/MedicationTracker';
import { HydrationTracker } from './components/HydrationTracker';
import { VitalsTracker } from './components/VitalsTracker';
import { CaregiverDoctorReport } from './components/CaregiverDoctorReport';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Heart,
  Droplet,
  Pill,
  Activity,
  CheckCircle,
  PhoneCall,
  Sparkles,
  Info,
} from 'lucide-react';
import { playWaterDropSound } from './utils/audio';

export default function App() {
  const [profile, setProfile] = useState<SeniorProfile>(getStoredProfile);
  const [medications, setMedications] = useState<Medication[]>(getStoredMedications);
  const [hydration, setHydration] = useState<HydrationEntry[]>(getStoredHydration);
  const [vitals, setVitals] = useState<VitalLog[]>(getStoredVitals);
  const [routine, setRoutine] = useState<RoutineTask[]>(getStoredRoutine);

  const [activeTab, setActiveTab] = useState<string>('routine');
  const [showSOS, setShowSOS] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAICoach, setShowAICoach] = useState<boolean>(false);

  // Sync state changes to localStorage
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredMedications(medications);
  }, [medications]);

  useEffect(() => {
    saveStoredHydration(hydration);
  }, [hydration]);

  useEffect(() => {
    saveStoredVitals(vitals);
  }, [vitals]);

  useEffect(() => {
    saveStoredRoutine(routine);
  }, [routine]);

  // Routine task toggling
  const handleToggleTask = (taskId: string) => {
    setRoutine((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? now : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskData: Omit<RoutineTask, 'id' | 'completed'>) => {
    const newTask: RoutineTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setRoutine((prev) => [...prev, newTask]);
  };

  // Medication handlers
  const handleToggleMedication = (medId: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const nextTaken = !m.takenToday;
          return {
            ...m,
            takenToday: nextTaken,
            takenAt: nextTaken ? now : undefined,
            pillsRemaining: nextTaken ? Math.max(0, m.pillsRemaining - 1) : m.pillsRemaining + 1,
          };
        }
        return m;
      })
    );

    // Auto complete medication routine task if all taken
    setRoutine((prev) =>
      prev.map((t) => {
        if (t.category === 'medication') {
          return { ...t, completed: true };
        }
        return t;
      })
    );
  };

  const handleAddMedication = (medData: Omit<Medication, 'id' | 'takenToday'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      takenToday: false,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const handleRefillMedication = (medId: string, count: number) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, pillsRemaining: m.pillsRemaining + count } : m))
    );
  };

  // Hydration handlers
  const handleAddHydration = (amountMl: number, drinkType: HydrationEntry['drinkType']) => {
    const newEntry: HydrationEntry = {
      id: `hyd-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amountMl,
      drinkType,
    };
    setHydration((prev) => [newEntry, ...prev]);

    // Check off hydration step if routine task exists
    setRoutine((prev) =>
      prev.map((t) => (t.category === 'hydration' ? { ...t, completed: true } : t))
    );
  };

  const handleRemoveHydration = (id: string) => {
    setHydration((prev) => prev.filter((item) => item.id !== id));
  };

  // Vitals handlers
  const handleAddVital = (
    vitalData: Omit<VitalLog, 'id' | 'timestamp' | 'dateStr' | 'timeStr'>
  ) => {
    const now = new Date();
    const newVital: VitalLog = {
      ...vitalData,
      id: `vit-${Date.now()}`,
      timestamp: now.toISOString(),
      dateStr: 'Today',
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setVitals((prev) => [newVital, ...prev]);

    // Check off vitals routine task
    setRoutine((prev) =>
      prev.map((t) => (t.category === 'vitals' ? { ...t, completed: true } : t))
    );
  };

  const handleSaveProfile = (newProfile: SeniorProfile) => {
    setProfile(newProfile);
  };

  // Accessibility text size class
  const getTextSizeClass = () => {
    if (profile.textSize === 'large') return 'text-lg';
    if (profile.textSize === 'extra-large') return 'text-xl';
    return 'text-base';
  };

  const latestBP = vitals.find((v) => v.type === 'blood-pressure');
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.takenToday).length;

  return (
    <div
      className={`min-h-screen flex flex-col bg-amber-50/25 text-stone-800 font-sans ${getTextSizeClass()} ${
        profile.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        textSize={profile.textSize}
        setTextSize={(s) => setProfile((p) => ({ ...p, textSize: s }))}
        voiceEnabled={profile.voiceChimeEnabled}
        setVoiceEnabled={(v) => setProfile((p) => ({ ...p, voiceChimeEnabled: v }))}
        onOpenSOS={() => setShowSOS(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAICoach={() => setShowAICoach(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-12">
        {activeTab === 'routine' && (
          <DailyRoutineOverview
            profile={profile}
            routine={routine}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            medications={medications}
            hydration={hydration}
            vitals={vitals}
            onNavigateTab={setActiveTab}
            onOpenAICoach={() => setShowAICoach(true)}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationTracker
            medications={medications}
            onToggleMedication={handleToggleMedication}
            onAddMedication={handleAddMedication}
            onRefillMedication={handleRefillMedication}
          />
        )}

        {activeTab === 'hydration' && (
          <HydrationTracker
            hydration={hydration}
            profile={profile}
            onAddHydration={handleAddHydration}
            onRemoveHydration={handleRemoveHydration}
          />
        )}

        {activeTab === 'vitals' && (
          <VitalsTracker
            vitals={vitals}
            profile={profile}
            onAddVital={handleAddVital}
          />
        )}

        {activeTab === 'caregiver' && (
          <CaregiverDoctorReport
            profile={profile}
            medications={medications}
            vitals={vitals}
            hydration={hydration}
          />
        )}
      </main>

      {/* Bottom Sticky Mobile Thumb Bar (Pattern 1 from Mobile Design Reference) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 shadow-lg">
        <div className="grid grid-cols-5 items-center gap-1 text-center">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              activeTab === 'routine' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              activeTab === 'medications' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Pill className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">
              Meds ({totalMeds - takenMeds})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hydration')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              activeTab === 'hydration' ? 'text-sky-700 font-bold' : 'text-stone-500'
            }`}
          >
            <Droplet className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Water</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              activeTab === 'vitals' ? 'text-rose-700 font-bold' : 'text-stone-500'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Vitals</span>
          </button>

          <button
            onClick={() => setShowSOS(true)}
            className="flex flex-col items-center justify-center py-1 text-rose-600 font-bold"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] mt-1">SOS</span>
          </button>
        </div>
      </div>

      {/* Quiet Accessible Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-stone-500 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">KinCare</span>
            <span aria-hidden="true">·</span>
            <span>Senior Routine, Hydration &amp; Medication Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Primary Caregiver: {profile.emergencyContacts[0]?.name || 'Connected'}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowSettings(true)}
              className="text-stone-700 hover:text-stone-950 font-semibold underline"
            >
              Preferences
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EmergencySOSModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        profile={profile}
        medications={medications}
        latestBP={latestBP}
      />

      <VoiceAssistantModal
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        profile={profile}
        medications={medications}
        hydration={hydration}
        vitals={vitals}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
