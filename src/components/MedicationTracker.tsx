import React, { useState } from 'react';
import {
  Medication,
  RoutineTimeSlot,
  PillColor,
  PillShape,
  MedicationExplanation,
} from '../types';
import {
  Check,
  AlertCircle,
  Clock,
  Plus,
  HelpCircle,
  Volume2,
  Sparkles,
  Info,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import { playChimeSound, speakText } from '../utils/audio';

interface MedicationTrackerProps {
  medications: Medication[];
  onToggleMedication: (medId: string) => void;
  onAddMedication: (med: Omit<Medication, 'id' | 'takenToday'>) => void;
  onRefillMedication: (medId: string, count: number) => void;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onToggleMedication,
  onAddMedication,
  onRefillMedication,
}) => {
  const [activeSlot, setActiveSlot] = useState<string>('all');
  const [selectedMedForExplain, setSelectedMedForExplain] = useState<Medication | null>(null);
  const [explanation, setExplanation] = useState<MedicationExplanation | null>(null);
  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New medication form state
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [newMedTiming, setNewMedTiming] = useState<RoutineTimeSlot>('Morning');
  const [newMedTimeLabel, setNewMedTimeLabel] = useState<string>('8:00 AM');
  const [newMedWithFood, setNewMedWithFood] = useState<boolean>(false);
  const [newMedColor, setNewMedColor] = useState<PillColor>('amber');
  const [newMedShape, setNewMedShape] = useState<PillShape>('round');
  const [newMedPurpose, setNewMedPurpose] = useState<string>('');
  const [newMedInstructions, setNewMedInstructions] = useState<string>('');
  const [newMedPills, setNewMedPills] = useState<number>(30);

  const filteredMeds =
    activeSlot === 'all'
      ? medications
      : medications.filter((m) => m.timing.toLowerCase() === activeSlot.toLowerCase());

  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.takenToday).length;
  const adherencePercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
  const lowRefills = medications.filter((m) => m.pillsRemaining <= m.refillThreshold);

  const handleTakePill = (med: Medication) => {
    playChimeSound();
    onToggleMedication(med.id);
  };

  const handleExplainMedication = async (med: Medication) => {
    setSelectedMedForExplain(med);
    setLoadingExplain(true);
    setExplanation(null);

    try {
      const response = await fetch('/api/medication/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationName: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          currentMeds: medications.map((m) => m.name),
        }),
      });
      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      console.error('Failed to get explanation', err);
      setExplanation({
        summary: `${med.name} helps maintain your vitality and doctor-prescribed balance.`,
        plainExplanation: `Take consistently with water. Store in a cool, dry place.`,
        foodPrecautions: 'Drink plenty of water. Check with your pharmacist regarding food interactions.',
        caregiverTips: 'Use a pill organizer to prevent accidental double-dosing.',
        missedDoseAdvice: 'Never double up on pills. If close to the next scheduled time, skip the missed one.',
      });
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleReadExplanation = () => {
    if (!explanation || !selectedMedForExplain) return;
    const textToRead = `Here is information on ${selectedMedForExplain.name}. ${explanation.summary}. How it works: ${explanation.plainExplanation}. Important food precautions: ${explanation.foodPrecautions}. If you miss a dose: ${explanation.missedDoseAdvice}.`;
    speakText(textToRead);
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 tablet',
      timing: newMedTiming,
      timeLabel: newMedTimeLabel,
      withFood: newMedWithFood,
      pillColor: newMedColor,
      pillShape: newMedShape,
      purpose: newMedPurpose.trim() || 'Prescribed health support',
      instructions:
        newMedInstructions.trim() ||
        (newMedWithFood ? 'Take with food and water.' : 'Take with a glass of water.'),
      pillsRemaining: Number(newMedPills) || 30,
      refillThreshold: 7,
      daysSupply: 30,
    });

    // Reset form
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
    setNewMedInstructions('');
    setShowAddModal(false);
  };

  // Render realistic pill glyph with shape and color
  const renderPillGlyph = (color: PillColor, shape: PillShape) => {
    const colorStyles: Record<PillColor, string> = {
      blue: 'bg-sky-500 border-sky-600 text-white shadow-sky-200',
      white: 'bg-white border-stone-300 text-stone-700 shadow-stone-200',
      amber: 'bg-amber-400 border-amber-500 text-amber-950 shadow-amber-200',
      ruby: 'bg-rose-500 border-rose-600 text-white shadow-rose-200',
      emerald: 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200',
      purple: 'bg-purple-500 border-purple-600 text-white shadow-purple-200',
    };

    let shapeClasses = 'w-10 h-10 rounded-full'; // round
    if (shape === 'oval') shapeClasses = 'w-12 h-8 rounded-2xl';
    else if (shape === 'capsule') shapeClasses = 'w-14 h-7 rounded-full';
    else if (shape === 'drop') shapeClasses = 'w-9 h-11 rounded-t-full rounded-b-2xl';

    return (
      <div
        className={`${shapeClasses} ${colorStyles[color]} border-2 flex items-center justify-center shadow-xs font-mono font-bold text-[10px] uppercase select-none`}
      >
        <span className="opacity-80">Rx</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Adherence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <span>Daily Pillbox</span>
            <span aria-hidden="true">·</span>
            <span>Refill Watchdog</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-semibold">Caregiver Monitored</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            Medication Schedule
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Each medicine is listed with its scheduled time, clear instructions, and visual shape.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-right">
            <span className="text-xs text-stone-500 block font-medium">Today's Progress</span>
            <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
              {takenMeds} / {totalMeds} ({adherencePercent}%)
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors min-h-[48px] shadow-xs"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Low Refill Alert Banner if any pills are running low */}
      {lowRefills.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold text-amber-900">
              Refill Notice: {lowRefills.map((m) => `${m.name} (${m.pillsRemaining} left)`).join(', ')}
            </h4>
            <p className="text-amber-800 mt-0.5">
              Please let family or your pharmacy know so you do not run out this week.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs by Time Slot */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-xl overflow-x-auto">
        {['all', 'morning', 'afternoon', 'evening', 'bedtime'].map((slot) => {
          const isActive = activeSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap min-h-[40px] transition-colors ${
                isActive
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {slot === 'all' ? 'All Day' : slot}
            </button>
          );
        })}
      </div>

      {/* Medication Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.map((med) => {
          const isTaken = med.takenToday;
          const isLow = med.pillsRemaining <= med.refillThreshold;

          return (
            <div
              key={med.id}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isTaken
                  ? 'bg-stone-50 border-stone-200'
                  : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              {/* Header: Time, Pill visual, Name */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Visual Pill Replica */}
                  <div className="mt-0.5 shrink-0">
                    {renderPillGlyph(med.pillColor, med.pillShape)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                      <span className="flex items-center gap-1 text-amber-800 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {med.timeLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{med.timing}</span>
                      {med.withFood && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium">With Food</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 font-sans mt-0.5">
                      {med.name}{' '}
                      <span className="text-stone-500 font-normal text-base font-mono">
                        {med.dosage}
                      </span>
                    </h3>

                    <p className="text-xs text-stone-600 font-medium mt-0.5">{med.purpose}</p>
                  </div>
                </div>

                {/* Pill Counter / Refill Pill status */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-mono tabular-nums block font-semibold ${
                      isLow ? 'text-amber-800 font-bold' : 'text-stone-500'
                    }`}
                  >
                    {med.pillsRemaining} pills left
                  </span>
                  {isLow && (
                    <span className="text-[11px] text-amber-700 font-bold block">
                      Refill soon
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-700 text-xs sm:text-sm">
                <span className="font-semibold text-stone-900 block text-xs mb-0.5">
                  How to take:
                </span>
                <p>{med.instructions}</p>
              </div>

              {/* Action Buttons: Take Now + Plain English Info */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => handleExplainMedication(med)}
                  className="px-3 py-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Explain Pill</span>
                </button>

                <div className="flex items-center gap-2">
                  {isTaken && (
                    <button
                      onClick={() => handleTakePill(med)}
                      title="Undo taken status if tapped by mistake"
                      className="p-2 text-stone-400 hover:text-stone-600 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleTakePill(med)}
                    className={`min-h-[48px] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-900 text-white hover:bg-amber-600 active:scale-95'
                    }`}
                  >
                    {isTaken ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-700" />
                        <span>Taken Today {med.takenAt ? `(${med.takenAt})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-5 h-5" />
                        <span>Take {med.name}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medication Explanation Modal (AI Powered Plain English) */}
      {selectedMedForExplain && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Senior Plain-English Guide
                </span>
                <h3 className="text-2xl font-bold text-stone-900 font-sans mt-0.5">
                  About {selectedMedForExplain.name} {selectedMedForExplain.dosage}
                </h3>
              </div>

              <button
                onClick={() => setSelectedMedForExplain(null)}
                className="text-stone-400 hover:text-stone-600 text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            {loadingExplain ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-stone-600 text-sm">
                  Consulting medication guide for gentle, plain-language explanation...
                </p>
              </div>
            ) : explanation ? (
              <div className="mt-5 space-y-4 text-stone-700">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    What It Does in Simple Words
                  </h4>
                  <p className="mt-1 text-stone-800 text-sm leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    How it helps your body
                  </h5>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">
                    {explanation.plainExplanation}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <h5 className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    Food &amp; Beverage Precautions
                  </h5>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">
                    {explanation.foodPrecautions}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                    What if I miss a dose?
                  </h5>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">
                    {explanation.missedDoseAdvice}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <button
                    onClick={handleReadExplanation}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors min-h-[40px]"
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>Read Aloud</span>
                  </button>

                  <button
                    onClick={() => setSelectedMedForExplain(null)}
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors min-h-[40px]"
                  >
                    Understood
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-stone-900 font-sans">Add New Medication</h3>
            <p className="text-xs text-stone-500 mt-1">
              Enter prescription details to display on your daily schedule.
            </p>

            <form onSubmit={handleCreateMed} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amlodipine"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 mg"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800">Time Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 8:00 AM"
                    value={newMedTimeLabel}
                    onChange={(e) => setNewMedTimeLabel(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800">Schedule Slot</label>
                  <select
                    value={newMedTiming}
                    onChange={(e) => setNewMedTiming(e.target.value as RoutineTimeSlot)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800">
                    Pill Shape &amp; Appearance
                  </label>
                  <select
                    value={newMedShape}
                    onChange={(e) => setNewMedShape(e.target.value as PillShape)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="round">Round Tablet</option>
                    <option value="oval">Oval Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="drop">Drop / Gelcap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800">Pill Color</label>
                  <select
                    value={newMedColor}
                    onChange={(e) => setNewMedColor(e.target.value as PillColor)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="white">White</option>
                    <option value="amber">Yellow / Amber</option>
                    <option value="blue">Blue</option>
                    <option value="ruby">Red / Pink</option>
                    <option value="purple">Purple</option>
                    <option value="emerald">Green</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800">
                    Initial Pill Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newMedPills}
                    onChange={(e) => setNewMedPills(parseInt(e.target.value) || 30)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800">
                  Purpose / Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood pressure and heart protection"
                  value={newMedPurpose}
                  onChange={(e) => setNewMedPurpose(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800">
                  Instructions / Doctor's Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with morning oatmeal and water."
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="withFoodCheckbox"
                  checked={newMedWithFood}
                  onChange={(e) => setNewMedWithFood(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="withFoodCheckbox" className="text-xs font-medium text-stone-800">
                  Must be taken with food / meals
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
