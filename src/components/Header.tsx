import React from 'react';
import { HeartHandshake, PhoneCall, Volume2, VolumeX, Sparkles, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  textSize: 'normal' | 'large' | 'extra-large';
  setTextSize: (size: 'normal' | 'large' | 'extra-large') => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onOpenSOS: () => void;
  onOpenSettings: () => void;
  onOpenAICoach: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  textSize,
  setTextSize,
  voiceEnabled,
  setVoiceEnabled,
  onOpenSOS,
  onOpenSettings,
  onOpenAICoach,
}) => {
  const navItems = [
    { id: 'routine', label: "Today's Routine" },
    { id: 'medications', label: 'Medications' },
    { id: 'hydration', label: 'Hydration' },
    { id: 'vitals', label: 'Vitals & Health' },
    { id: 'caregiver', label: 'Doctor & Family' },
  ];

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('extra-large');
    else setTextSize('normal');
  };

  const getTextLabel = () => {
    if (textSize === 'normal') return 'Standard Text (A)';
    if (textSize === 'large') return 'Large Text (A+)';
    return 'Jumbo Text (A++)';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Brand title wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('routine')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg py-1 px-1.5"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-stone-900 font-sans block">
                  KinCare
                </span>
                <span className="text-xs text-stone-500 block -mt-1 font-medium">
                  Elder Daily Routine &amp; Health
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-h-[44px] flex items-center ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Accessibility & Emergency SOS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Button */}
            <button
              onClick={cycleTextSize}
              title={`Change text size. Currently: ${getTextLabel()}`}
              className="min-h-[44px] px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200"
            >
              <span className="text-base font-extrabold">A</span>
              <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                {textSize === 'normal' ? '1x' : textSize === 'large' ? '1.25x' : '1.5x'}
              </span>
            </button>

            {/* Voice Readout Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Mute Voice Guide' : 'Enable Voice Audio Prompts'}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg border flex items-center justify-center transition-colors ${
                voiceEnabled
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* AI Companion Quick Prompt */}
            <button
              onClick={onOpenAICoach}
              title="Open KinCare Companion"
              className="min-h-[44px] px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Daily Companion</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Preferences & Medical Profile"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center justify-center transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSOS}
              className="min-h-[44px] px-3.5 sm:px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span className="tracking-wide">SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-stone-100 -mx-4 px-4 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap min-h-[38px] ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
