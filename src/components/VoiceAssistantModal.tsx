import React, { useState, useEffect } from 'react';
import { SeniorProfile, DailyCoachingMessage, Medication, VitalLog, HydrationEntry } from '../types';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Send,
  MessageCircle,
  Heart,
  Droplet,
  Coffee,
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/audio';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SeniorProfile;
  medications: Medication[];
  hydration: HydrationEntry[];
  vitals: VitalLog[];
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  hydration,
  vitals,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${profile.name}! I am your KinCare daily wellness companion. How are you feeling today? You can tap any question below or ask me about your pills, water intake, or gentle mobility.`,
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingData, setCoachingData] = useState<DailyCoachingMessage | null>(null);

  const totalHydrationMl = hydration.reduce((acc, curr) => acc + curr.amountMl, 0);
  const medsTaken = medications.filter((m) => m.takenToday).length;
  const adherence = medications.length > 0 ? Math.round((medsTaken / medications.length) * 100) : 100;

  useEffect(() => {
    if (!isOpen) return;

    // Fetch initial daily greeting coaching
    const fetchCoaching = async () => {
      try {
        const res = await fetch('/api/health/daily-coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seniorName: profile.name,
            vitals: vitals[0] || {},
            hydrationMl: totalHydrationMl,
            adherencePercent: adherence,
            recentSymptoms: 'Feeling comfortable',
          }),
        });
        const data = await res.json();
        setCoachingData(data);
      } catch (e) {
        console.error('Coaching fetch error', e);
      }
    };

    fetchCoaching();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prompt backend for friendly advice
      const res = await fetch('/api/health/daily-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seniorName: profile.name,
          vitals: vitals[0] || {},
          hydrationMl: totalHydrationMl,
          adherencePercent: adherence,
          recentSymptoms: userMsg,
        }),
      });
      const data = await res.json();

      let reply = `${data.greeting} ${data.encouragement} ${data.hydrationComment} ${data.dailyFocusTip}`;
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      if (profile.voiceChimeEnabled) {
        speakText(reply);
      }
    } catch {
      const fallback = `Take it easy, ${profile.name}. Remember to drink a nice cup of water and rest your legs if you feel fatigued. Your family and doctor are always right by your side.`;
      setMessages((prev) => [...prev, { sender: 'ai', text: fallback }]);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadMessage = (text: string) => {
    speakText(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shrink-0">
              <img
                src="/src/assets/images/avatar_care_companion_1790313696372.jpg"
                alt="KinCare Companion Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-sans">
                KinCare Daily Companion
              </h3>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                Here to help anytime
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => stopSpeaking()}
              title="Stop voice speech"
              className="p-2 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <VolumeX className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-lg text-xl font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[50vh] pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-stone-100 text-stone-800 rounded-bl-none border border-stone-200'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'ai' && (
                <button
                  onClick={() => handleReadMessage(m.text)}
                  className="mt-1 text-[11px] text-amber-800 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read aloud</span>
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs italic p-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
              Thinking gentle advice...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 border-t border-stone-100">
          <span className="text-[11px] text-stone-500 font-semibold block mb-1.5">
            Quick questions you can ask:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'How is my hydration today?',
              'Gentle 5-minute chair stretch',
              'What should I eat with Metformin?',
              'An uplifting thought for today',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 text-xs font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="pt-3 border-t border-stone-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or thought..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-stone-900 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
