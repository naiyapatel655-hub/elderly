import React, { useState, useEffect } from 'react';
import { HydrationEntry, SeniorProfile } from '../types';
import {
  Droplet,
  Coffee,
  Soup,
  Plus,
  Volume2,
  Bell,
  Clock,
  CheckCircle,
  Sparkles,
  Info,
  Trash2,
} from 'lucide-react';
import { playWaterDropSound, playChimeSound, speakText } from '../utils/audio';

interface HydrationTrackerProps {
  hydration: HydrationEntry[];
  profile: SeniorProfile;
  onAddHydration: (amountMl: number, drinkType: HydrationEntry['drinkType']) => void;
  onRemoveHydration: (id: string) => void;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  hydration,
  profile,
  onAddHydration,
  onRemoveHydration,
}) => {
  const [customMl, setCustomMl] = useState<string>('200');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [timerCountdown, setTimerCountdown] = useState<number>(profile.hydrationIntervalMinutes * 60);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  const totalMl = hydration.reduce((acc, curr) => acc + curr.amountMl, 0);
  const goalMl = profile.hydrationGoalMl || 1800;
  const progressPercent = Math.min(100, Math.round((totalMl / goalMl) * 100));
  const glassesCount = (totalMl / 250).toFixed(1);

  // Countdown timer for next gentle hydration chime
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerCountdown((prev) => {
        if (prev <= 1) {
          // Fire alert
          playChimeSound();
          if (profile.voiceChimeEnabled) {
            speakText(`Hello ${profile.name}! It's time for a refreshing sip of water.`);
          }
          return profile.hydrationIntervalMinutes * 60; // reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, profile]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleQuickAdd = (amount: number, type: HydrationEntry['drinkType']) => {
    playWaterDropSound();
    onAddHydration(amount, type);
    // Reset timer countdown when user drinks
    setTimerCountdown(profile.hydrationIntervalMinutes * 60);
  };

  const handleTestChime = () => {
    playChimeSound();
    speakText(`Time for a refreshing glass of water, ${profile.name}. Staying hydrated keeps your joints easy and mind clear.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <span>Hydration Guardian</span>
            <span aria-hidden="true">·</span>
            <span>Gentle Chime Alerts</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-700 font-semibold">Circulation &amp; Vitality</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            Hydration Tracker &amp; Alerts
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            As we age, natural thirst signals become quieter. Logging glasses helps maintain steady energy, joint comfort, and clear thinking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestChime}
            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors min-h-[44px]"
          >
            <Volume2 className="w-4 h-4 text-sky-600" />
            <span>Test Hydration Chime</span>
          </button>
        </div>
      </div>

      {/* Main Hydration Visual Meter & Quick Tap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fluid Progress Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Today's Fluid Intake
            </span>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md">
              Goal: {goalMl} ml (~7 glasses)
            </span>
          </div>

          {/* Visual Water Fill Meter */}
          <div className="relative mx-auto w-44 h-56 rounded-3xl border-4 border-stone-200 bg-stone-50 overflow-hidden flex flex-col justify-end p-2 shadow-inner">
            {/* Water Waves / Level */}
            <div
              className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-2xl transition-all duration-700 relative overflow-hidden"
              style={{ height: `${Math.max(8, progressPercent)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            {/* Readout Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums drop-shadow-xs">
                {totalMl}
                <span className="text-sm font-normal text-stone-600 ml-1">ml</span>
              </span>
              <span className="text-xs font-bold text-stone-700 mt-1">
                {progressPercent}% Complete
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                (~{glassesCount} cups)
              </span>
            </div>
          </div>

          {/* Reminder Cadence Info */}
          <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">Next Reminder Chime</span>
                <span className="text-xs text-stone-500">Every {profile.hydrationIntervalMinutes} mins</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-mono font-bold text-sky-900 tabular-nums block">
                {formatCountdown(timerCountdown)}
              </span>
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="text-[11px] font-semibold text-sky-700 hover:underline"
              >
                {timerActive ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Big Touch Quick-Log Buttons & Photographic Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-sans">
                One-Tap Log: What did you just drink?
              </h3>
              <p className="text-xs text-stone-500">
                Tap any item to add to your daily goal. Big buttons designed for easy touch.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {/* Glass of Water */}
              <button
                onClick={() => handleQuickAdd(250, 'water')}
                className="p-4 rounded-xl border-2 border-sky-200 hover:border-sky-500 hover:bg-sky-50 transition-all text-left flex items-start gap-3 group active:scale-98 min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-500 group-hover:text-white text-sky-700 flex items-center justify-center shrink-0 transition-colors">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold text-stone-900 block group-hover:text-sky-950">
                    + Full Glass
                  </span>
                  <span className="text-xs text-stone-500 font-mono">250 ml (Water)</span>
                </div>
              </button>

              {/* Small Cup of Water */}
              <button
                onClick={() => handleQuickAdd(150, 'water')}
                className="p-4 rounded-xl border-2 border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all text-left flex items-start gap-3 group active:scale-98 min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-sky-500 group-hover:text-white text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-base font-bold text-stone-900 block group-hover:text-sky-950">
                    + Small Cup
                  </span>
                  <span className="text-xs text-stone-500 font-mono">150 ml (Water)</span>
                </div>
              </button>

              {/* Warm Herbal Tea */}
              <button
                onClick={() => handleQuickAdd(200, 'herbal-tea')}
                className="p-4 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left flex items-start gap-3 group active:scale-98 min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-500 group-hover:text-white text-amber-800 flex items-center justify-center shrink-0 transition-colors">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold text-stone-900 block group-hover:text-amber-950">
                    + Herbal Tea
                  </span>
                  <span className="text-xs text-stone-500 font-mono">200 ml (Chamomile/Mint)</span>
                </div>
              </button>

              {/* Soup / Light Broth */}
              <button
                onClick={() => handleQuickAdd(200, 'broth')}
                className="p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left flex items-start gap-3 group active:scale-98 min-h-[72px]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 group-hover:text-white text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                  <Soup className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold text-stone-900 block group-hover:text-emerald-950">
                    + Warm Broth
                  </span>
                  <span className="text-xs text-stone-500 font-mono">200 ml (Vegetable/Soup)</span>
                </div>
              </button>
            </div>

            {/* Custom Amount Button */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-stone-500">Need to record a bottle or mug?</span>
              <button
                onClick={() => setShowCustomModal(true)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Amount</span>
              </button>
            </div>
          </div>

          {/* Senior Hydration Wellness Tip Box with Image */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-300">
              <img
                src="/src/assets/images/card_hydration_glass_1790313709232.jpg"
                alt="Clear glass of water with lemon slice"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Elder Hydration Tip: Why Small Sips Matter
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Drinking half a cup every 90 minutes is much gentler on your bladder and kidneys than drinking large gulps all at once. It helps prevent afternoon dizziness and keeps your mind clear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Hydration Logs List */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h3 className="text-lg font-bold text-stone-900 font-sans mb-3">
          Today's Drinks Recorded ({hydration.length})
        </h3>

        {hydration.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-sm">
            No drinks logged yet today. Tap any button above to log your morning glass of water!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {hydration.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 capitalize">
                      {item.drinkType.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-stone-400 ml-2 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    +{item.amountMl} ml
                  </span>
                  <button
                    onClick={() => onRemoveHydration(item.id)}
                    title="Remove entry"
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Milliliters Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">Add Custom Drink Amount</h3>
            <p className="text-xs text-stone-500 mt-1">
              Enter the exact milliliters (e.g. 300 ml for a mug or 500 ml for a water bottle).
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-stone-800">
                Amount in Milliliters (ml)
              </label>
              <input
                type="number"
                min="50"
                max="1500"
                step="50"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-300 text-stone-900 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-stone-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(customMl) || 200;
                  handleQuickAdd(val, 'water');
                  setShowCustomModal(false);
                }}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Add {customMl} ml
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
