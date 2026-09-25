import React, { useState } from 'react';
import { VitalLog, SeniorProfile } from '../types';
import {
  Heart,
  Activity,
  Thermometer,
  Smile,
  Plus,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { playChimeSound } from '../utils/audio';

interface VitalsTrackerProps {
  vitals: VitalLog[];
  profile: SeniorProfile;
  onAddVital: (vital: Omit<VitalLog, 'id' | 'timestamp' | 'dateStr' | 'timeStr'>) => void;
}

export const VitalsTracker: React.FC<VitalsTrackerProps> = ({
  vitals,
  profile,
  onAddVital,
}) => {
  const [activeTab, setActiveTab] = useState<'bp' | 'glucose' | 'mood'>('bp');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Form states for adding reading
  const [newSystolic, setNewSystolic] = useState<number>(120);
  const [newDiastolic, setNewDiastolic] = useState<number>(80);
  const [newPulse, setNewPulse] = useState<number>(70);
  const [newGlucose, setNewGlucose] = useState<number>(105);
  const [newGlucoseContext, setNewGlucoseContext] = useState<VitalLog['glucoseContext']>('fasting');
  const [newTemp, setNewTemp] = useState<number>(98.6);
  const [newMood, setNewMood] = useState<VitalLog['moodLevel']>(4);
  const [newNotes, setNewNotes] = useState<string>('');

  const bpReadings = vitals.filter((v) => v.type === 'blood-pressure');
  const glucoseReadings = vitals.filter((v) => v.type === 'glucose');
  const latestBP = bpReadings[0];
  const latestGlucose = glucoseReadings[0];

  // American Heart Association category
  const getBPCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) {
      return { label: 'Optimal / Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (sys <= 129 && dia < 80) {
      return { label: 'Elevated (Pre-hypertension)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (sys <= 139 || dia <= 89) {
      return { label: 'Stage 1 Hypertension', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    }
    return { label: 'Stage 2 Hypertension', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    playChimeSound();

    if (activeTab === 'bp') {
      onAddVital({
        type: 'blood-pressure',
        systolic: newSystolic,
        diastolic: newDiastolic,
        pulse: newPulse,
        notes: newNotes.trim() || undefined,
      });
    } else if (activeTab === 'glucose') {
      onAddVital({
        type: 'glucose',
        glucose: newGlucose,
        glucoseContext: newGlucoseContext,
        notes: newNotes.trim() || undefined,
      });
    } else {
      onAddVital({
        type: 'mood',
        moodLevel: newMood,
        temperature: newTemp,
        notes: newNotes.trim() || undefined,
      });
    }

    setNewNotes('');
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <span>Daily Health Diary</span>
            <span aria-hidden="true">·</span>
            <span>Cardiovascular &amp; Metabolic</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700 font-semibold">Doctor Shared</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            Health Vitals Monitor
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Effortless blood pressure, blood glucose, and pulse tracking with extra-large readouts.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-2 transition-colors min-h-[48px] shadow-xs"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Log New Reading</span>
        </button>
      </div>

      {/* Primary Readout Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest BP Card */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Blood Pressure
            </span>
            <Heart className="w-5 h-5 text-rose-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-stone-900 font-mono tabular-nums">
                {latestBP?.systolic || 120}
              </span>
              <span className="text-2xl font-bold text-stone-400 font-mono">/</span>
              <span className="text-3xl font-bold text-stone-700 font-mono tabular-nums">
                {latestBP?.diastolic || 80}
              </span>
              <span className="text-xs font-normal text-stone-500 ml-1">mmHg</span>
            </div>

            {latestBP && (
              <div className="mt-2">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${
                    getBPCategory(latestBP.systolic || 120, latestBP.diastolic || 80).color
                  }`}
                >
                  {getBPCategory(latestBP.systolic || 120, latestBP.diastolic || 80).label}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Pulse: <strong className="font-mono text-stone-800">{latestBP?.pulse || 70} bpm</strong></span>
            <span>{latestBP?.dateStr || 'Today'}</span>
          </div>
        </div>

        {/* Latest Blood Glucose Card */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Blood Sugar (Glucose)
            </span>
            <Activity className="w-5 h-5 text-amber-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-stone-900 font-mono tabular-nums">
                {latestGlucose?.glucose || 104}
              </span>
              <span className="text-xs font-normal text-stone-500 ml-1">mg/dL</span>
            </div>

            <div className="mt-2">
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                {latestGlucose?.glucoseContext || 'Fasting'} Reading
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Target: 80 - 130 mg/dL</span>
            <span>{latestGlucose?.dateStr || 'Today'}</span>
          </div>
        </div>

        {/* Daily Comfort & Energy */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Today's Comfort &amp; Mood
            </span>
            <Smile className="w-5 h-5 text-emerald-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">😊</span>
              <span className="text-2xl font-bold text-stone-900">Feeling Good</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Rested well, gentle joint comfort, good morning appetite.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Temp: <strong className="font-mono text-stone-800">98.4°F</strong></span>
            <span>Reported 8:00 AM</span>
          </div>
        </div>
      </div>

      {/* Visual Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-sans flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              Blood Pressure Trend (Last Readings)
            </h3>
            <p className="text-xs text-stone-500">
              Green line represents Systolic, orange line represents Diastolic.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              Systolic (Upper)
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              Diastolic (Lower)
            </span>
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div className="h-56 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
            {/* Safe zone background band (Systolic 110-130) */}
            <rect x="0" y="30" width="600" height="40" fill="#f0fdf4" opacity="0.8" />
            <line x1="0" y1="50" x2="600" y2="50" stroke="#bbf7d0" strokeDasharray="4 4" />
            <text x="10" y="45" fill="#15803d" fontSize="10" fontWeight="bold">Normal Zone (120)</text>

            {/* Grid horizontal lines */}
            <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" />
            <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" />

            {/* Data Points from bpReadings */}
            {bpReadings.slice(0, 6).reverse().map((r, i, arr) => {
              const x = (i / Math.max(1, arr.length - 1)) * 520 + 40;
              // Map systolic 100-150 to y 140-20
              const sysY = 150 - (( (r.systolic || 120) - 100) / 50) * 120;
              const diaY = 150 - (( (r.diastolic || 80) - 50) / 50) * 80;

              return (
                <g key={r.id}>
                  {/* Point for Systolic */}
                  <circle cx={x} cy={sysY} r="5" fill="#059669" />
                  <text x={x} y={sysY - 8} textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    {r.systolic}
                  </text>

                  {/* Point for Diastolic */}
                  <circle cx={x} cy={diaY} r="5" fill="#d97706" />
                  <text x={x} y={diaY + 16} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    {r.diastolic}
                  </text>

                  {/* Date label */}
                  <text x={x} y="155" textAnchor="middle" fill="#64748b" fontSize="10">
                    {r.dateStr}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Historical Vitals Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-stone-900 font-sans">
          Recorded Vitals History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 font-semibold text-xs border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Measurement</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Pulse / Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {vitals.map((v) => (
                <tr key={v.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-stone-700 text-xs">
                    {v.dateStr} {v.timeStr}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900 capitalize">
                    {v.type.replace('-', ' ')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900 tabular-nums">
                    {v.type === 'blood-pressure' && `${v.systolic}/${v.diastolic} mmHg`}
                    {v.type === 'glucose' && `${v.glucose} mg/dL (${v.glucoseContext})`}
                    {v.type === 'mood' && `Mood: ${v.moodLevel}/5`}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600 tabular-nums">
                    {v.pulse ? `${v.pulse} bpm` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {v.type === 'blood-pressure' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Normal
                      </span>
                    )}
                    {v.type === 'glucose' && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Stable
                      </span>
                    )}
                    {v.type === 'mood' && (
                      <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        Comfortable
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-stone-500 max-w-xs truncate">
                    {v.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Reading Modal with Big Buttons and Steppers */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-stone-900 font-sans">
              Log Health Measurement
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Select type and adjust numbers using large stepper buttons.
            </p>

            {/* Segmented type switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('bp')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'bp'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Blood Pressure
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('glucose')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'glucose'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Blood Sugar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mood')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'mood'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Daily Comfort
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="mt-5 space-y-4">
              {activeTab === 'bp' && (
                <div className="space-y-4">
                  {/* Systolic Stepper */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Systolic (Upper number)
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setNewSystolic((s) => Math.max(80, s - 2))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={newSystolic}
                        onChange={(e) => setNewSystolic(Number(e.target.value))}
                        className="flex-1 text-center py-2.5 rounded-xl border border-stone-300 text-2xl font-mono font-bold text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => setNewSystolic((s) => Math.min(220, s + 2))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Diastolic Stepper */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Diastolic (Lower number)
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setNewDiastolic((d) => Math.max(50, d - 2))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={newDiastolic}
                        onChange={(e) => setNewDiastolic(Number(e.target.value))}
                        className="flex-1 text-center py-2.5 rounded-xl border border-stone-300 text-2xl font-mono font-bold text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => setNewDiastolic((d) => Math.min(140, d + 2))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pulse */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Pulse Rate (BPM)
                    </label>
                    <input
                      type="number"
                      value={newPulse}
                      onChange={(e) => setNewPulse(Number(e.target.value))}
                      className="mt-1 w-full text-center py-2.5 rounded-xl border border-stone-300 text-xl font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'glucose' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Glucose Level (mg/dL)
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setNewGlucose((g) => Math.max(50, g - 5))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={newGlucose}
                        onChange={(e) => setNewGlucose(Number(e.target.value))}
                        className="flex-1 text-center py-2.5 rounded-xl border border-stone-300 text-2xl font-mono font-bold text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => setNewGlucose((g) => Math.min(400, g + 5))}
                        className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-2xl flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      Context
                    </label>
                    <select
                      value={newGlucoseContext}
                      onChange={(e) => setNewGlucoseContext(e.target.value as any)}
                      className="mt-1 w-full py-2.5 px-3 rounded-xl border border-stone-300 text-sm font-semibold"
                    >
                      <option value="fasting">Fasting (Morning before meal)</option>
                      <option value="post-meal">Post-Meal (1-2 hours after food)</option>
                      <option value="bedtime">Bedtime</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'mood' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800">
                      How are you feeling right now?
                    </label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {[
                        { score: 1, emoji: '😔', label: 'Tired/Pain' },
                        { score: 2, emoji: '😐', label: 'Low Energy' },
                        { score: 3, emoji: '🙂', label: 'Comfortable' },
                        { score: 4, emoji: '😊', label: 'Good' },
                        { score: 5, emoji: '🌟', label: 'Joyful' },
                      ].map((item) => (
                        <button
                          key={item.score}
                          type="button"
                          onClick={() => setNewMood(item.score as any)}
                          className={`p-2 rounded-xl text-center border-2 transition-all ${
                            newMood === item.score
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-2xl block">{item.emoji}</span>
                          <span className="text-[10px] font-semibold text-stone-700 block mt-1">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800">
                  Notes (e.g. "measured after morning walk")
                </label>
                <input
                  type="text"
                  placeholder="Optional observation"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
