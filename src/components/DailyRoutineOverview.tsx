import React, { useState, useEffect } from 'react';
import {
  RoutineTask,
  SeniorProfile,
  Medication,
  HydrationEntry,
  VitalLog,
} from '../types';
import {
  CheckCircle2,
  Circle,
  Volume2,
  Droplet,
  Pill,
  Heart,
  Footprints,
  Utensils,
  Moon,
  Plus,
  Sparkles,
} from 'lucide-react';
import { playChimeSound, speakText } from '../utils/audio';

interface DailyRoutineOverviewProps {
  profile: SeniorProfile;
  routine: RoutineTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<RoutineTask, 'id' | 'completed'>) => void;
  medications: Medication[];
  hydration: HydrationEntry[];
  vitals: VitalLog[];
  onNavigateTab: (tab: string) => void;
  onOpenAICoach: () => void;
}

export const DailyRoutineOverview: React.FC<DailyRoutineOverviewProps> = ({
  profile,
  routine,
  onToggleTask,
  onAddTask,
  medications,
  hydration,
  vitals,
  onNavigateTab,
  onOpenAICoach,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentGreeting, setCurrentGreeting] = useState<string>('Good morning');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskTime, setNewTaskTime] = useState<string>('11:00 AM');
  const [newTaskSlot, setNewTaskSlot] = useState<RoutineTask['timeSlot']>('Morning');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      const hour = now.getHours();
      if (hour < 12) setCurrentGreeting('Good morning');
      else if (hour < 17) setCurrentGreeting('Good afternoon');
      else setCurrentGreeting('Good evening');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHydrationMl = hydration.reduce((acc, curr) => acc + curr.amountMl, 0);
  const hydrationPct = Math.min(100, Math.round((totalHydrationMl / profile.hydrationGoalMl) * 100));

  const totalMeds = medications.length;
  const medsTaken = medications.filter((m) => m.takenToday).length;

  const latestBP = vitals.find((v) => v.type === 'blood-pressure');

  const completedTasks = routine.filter((r) => r.completed).length;
  const routinePct = routine.length > 0 ? Math.round((completedTasks / routine.length) * 100) : 0;

  const handleReadDaySummary = () => {
    const summaryText = `${currentGreeting}, ${profile.name}. It is ${currentTime}. You have completed ${completedTasks} of ${routine.length} routine activities today. You have taken ${medsTaken} of ${totalMeds} medications, and drank ${totalHydrationMl} milliliters of water. Have a serene and peaceful day.`;
    speakText(summaryText);
  };

  const handleTaskClick = (taskId: string) => {
    playChimeSound();
    onToggleTask(taskId);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Daily routine step',
      scheduledTime: newTaskTime,
      timeSlot: newTaskSlot,
      category: 'activity',
      iconName: 'Footprints',
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddModal(false);
  };

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet':
        return <Droplet className="w-6 h-6 text-sky-600" />;
      case 'Pill':
        return <Pill className="w-6 h-6 text-amber-600" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-rose-600" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 text-emerald-600" />;
      case 'Moon':
        return <Moon className="w-6 h-6 text-purple-600" />;
      default:
        return <Footprints className="w-6 h-6 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Text & Status Info */}
          <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 text-stone-500 text-sm font-medium">
                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-base font-bold text-stone-800 tabular-nums">
                  {currentTime}
                </span>
              </div>

              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-sans">
                {currentGreeting}, {profile.name}
              </h1>
              <p className="mt-2 text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl">
                Welcome to your daily health companion. Take things at your own peaceful pace today.
              </p>
            </div>

            {/* Read Aloud & Coach Button Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleReadDaySummary}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2.5 transition-colors shadow-xs min-h-[48px]"
              >
                <Volume2 className="w-5 h-5" />
                <span>Read Today's Schedule Aloud</span>
              </button>

              <button
                onClick={onOpenAICoach}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center gap-2 border border-stone-200 transition-colors min-h-[48px]"
              >
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Daily Companion Advice</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-stone-100">
              <div
                onClick={() => onNavigateTab('medications')}
                className="cursor-pointer p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200/60 transition-colors"
              >
                <span className="text-xs text-amber-900 font-medium block">Medications</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-950 font-mono tabular-nums">
                  {medsTaken}/{totalMeds}
                </span>
                <span className="text-[11px] text-amber-800 block">
                  {medsTaken === totalMeds ? 'All taken' : `${totalMeds - medsTaken} remaining`}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('hydration')}
                className="cursor-pointer p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/60 border border-sky-200/60 transition-colors"
              >
                <span className="text-xs text-sky-900 font-medium block">Hydration</span>
                <span className="text-xl sm:text-2xl font-bold text-sky-950 font-mono tabular-nums">
                  {totalHydrationMl}
                  <span className="text-xs font-normal text-sky-800 ml-0.5">ml</span>
                </span>
                <span className="text-[11px] text-sky-800 block">{hydrationPct}% of goal</span>
              </div>

              <div
                onClick={() => onNavigateTab('vitals')}
                className="cursor-pointer p-3 rounded-xl bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/60 transition-colors"
              >
                <span className="text-xs text-rose-900 font-medium block">Blood Pressure</span>
                <span className="text-xl sm:text-2xl font-bold text-rose-950 font-mono tabular-nums">
                  {latestBP?.systolic ? `${latestBP.systolic}/${latestBP.diastolic}` : '120/80'}
                </span>
                <span className="text-[11px] text-rose-800 block">Normal range</span>
              </div>
            </div>
          </div>

          {/* Right Serene Image */}
          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-stone-100">
            <img
              src="/src/assets/images/hero_elder_wellness_1790313678762.jpg"
              alt="Serene morning wellness atmosphere for seniors"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* Routine Progress and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-sans tracking-tight">
            Daily Routine Checklist
          </h2>
          <p className="text-sm text-stone-600">
            Tap any item once completed. Big clear buttons for effortless touch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-stone-500 font-medium block">Routine Progress</span>
            <span className="text-base font-bold text-stone-900 font-mono tabular-nums">
              {completedTasks} of {routine.length} done ({routinePct}%)
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Routine Step</span>
          </button>
        </div>
      </div>

      {/* Routine Task Items by Time Slot */}
      <div className="space-y-4">
        {routine.map((task) => {
          const isDone = task.completed;
          return (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className={`group cursor-pointer p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 select-none ${
                isDone
                  ? 'bg-stone-50 border-stone-200 opacity-80'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`mt-0.5 sm:mt-0 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {getTaskIcon(task.iconName)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="text-amber-800 font-mono tabular-nums">
                      {task.scheduledTime}
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-stone-500">{task.timeSlot}</span>
                    {isDone && task.completedAt && (
                      <>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-emerald-700">Completed at {task.completedAt}</span>
                      </>
                    )}
                  </div>

                  <h3
                    className={`text-lg sm:text-xl font-bold font-sans transition-colors ${
                      isDone ? 'line-through text-stone-500' : 'text-stone-900'
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p className="text-sm text-stone-600 max-w-2xl">{task.description}</p>
                </div>
              </div>

              {/* Big Tap Target Check Indicator */}
              <div className="shrink-0 pl-2">
                {isDone ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-stone-300 text-stone-400 group-hover:border-amber-500 group-hover:text-amber-600 flex items-center justify-center transition-colors">
                    <Circle className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Adding Custom Routine Step */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-xl font-bold text-stone-900">Add New Routine Activity</h3>
            <p className="text-sm text-stone-500 mt-1">
              Add a regular activity, walk, prayer, or phone call with family.
            </p>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-800">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Afternoon Walk with Daughter"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-800">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-800">
                    Time Slot
                  </label>
                  <select
                    value={newTaskSlot}
                    onChange={(e) => setNewTaskSlot(e.target.value as RoutineTask['timeSlot'])}
                    className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800">
                  Notes / Instructions (optional)
                </label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="e.g., Wear comfortable walking sneakers"
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
