import {
  Medication,
  HydrationEntry,
  VitalLog,
  RoutineTask,
  SeniorProfile,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'kincare_senior_profile_v2',
  MEDICATIONS: 'kincare_medications_v2',
  HYDRATION: 'kincare_hydration_v2',
  VITALS: 'kincare_vitals_v2',
  ROUTINE: 'kincare_routine_v2',
};

const DEFAULT_PROFILE: SeniorProfile = {
  name: 'Arthur Vance',
  age: 78,
  textSize: 'large',
  highContrast: false,
  voiceChimeEnabled: true,
  hydrationGoalMl: 1800,
  hydrationIntervalMinutes: 90,
  bloodType: 'O Positive',
  knownAllergies: ['Penicillin', 'Sulfa drugs'],
  medicalConditions: ['Mild Hypertension', 'Type 2 Pre-Diabetes', 'Mild Osteoarthritis'],
  emergencyContacts: [
    {
      id: 'contact-1',
      name: 'Claire Vance',
      relationship: 'Daughter (Caregiver)',
      phone: '(555) 234-8901',
      isPrimary: true,
      notes: 'Lives 10 minutes away, has spare house key.',
    },
    {
      id: 'contact-2',
      name: 'David Vance',
      relationship: 'Son',
      phone: '(555) 789-3412',
      isPrimary: false,
      notes: 'Call if Claire is unavailable.',
    },
  ],
  doctor: {
    name: 'Dr. Elizabeth Warren, MD',
    specialty: 'Geriatric & Family Medicine',
    clinic: 'Evergreen Senior Care Medical Pavilion',
    phone: '(555) 890-4567',
    nextAppointment: 'Thursday, October 15 at 10:30 AM',
  },
};

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10 mg',
    timing: 'Morning',
    timeLabel: '8:00 AM',
    withFood: false,
    pillColor: 'amber',
    pillShape: 'round',
    purpose: 'Blood Pressure & Heart Protection',
    instructions: 'Take once daily with a full glass of water. Keep consistent time.',
    pillsRemaining: 24,
    refillThreshold: 7,
    takenToday: true,
    takenAt: '8:05 AM',
    daysSupply: 30,
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500 mg',
    timing: 'Morning',
    timeLabel: '8:00 AM',
    withFood: true,
    pillColor: 'white',
    pillShape: 'oval',
    purpose: 'Blood Sugar Regulation',
    instructions: 'Take with breakfast to minimize stomach sensitivity.',
    pillsRemaining: 18,
    refillThreshold: 7,
    takenToday: true,
    takenAt: '8:15 AM',
    daysSupply: 30,
  },
  {
    id: 'med-3',
    name: 'Vitamin D3 + Calcium',
    dosage: '1000 IU / 600 mg',
    timing: 'Afternoon',
    timeLabel: '12:30 PM',
    withFood: true,
    pillColor: 'amber',
    pillShape: 'capsule',
    purpose: 'Bone Density & Immune Support',
    instructions: 'Take with lunch. Best absorbed with healthy meal fats.',
    pillsRemaining: 42,
    refillThreshold: 10,
    takenToday: false,
    daysSupply: 60,
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    dosage: '20 mg',
    timing: 'Evening',
    timeLabel: '7:00 PM',
    withFood: true,
    pillColor: 'blue',
    pillShape: 'round',
    purpose: 'Cholesterol & Artery Health',
    instructions: 'Take with dinner. Avoid consuming large amounts of grapefruit.',
    pillsRemaining: 6, // Low refill alert demonstration!
    refillThreshold: 7,
    takenToday: false,
    daysSupply: 30,
  },
  {
    id: 'med-5',
    name: 'Melatonin',
    dosage: '3 mg',
    timing: 'Bedtime',
    timeLabel: '9:30 PM',
    withFood: false,
    pillColor: 'purple',
    pillShape: 'round',
    purpose: 'Natural Sleep Rhythm',
    instructions: 'Take 30 minutes before bedtime with half a cup of water.',
    pillsRemaining: 35,
    refillThreshold: 7,
    takenToday: false,
    daysSupply: 45,
  },
];

const DEFAULT_HYDRATION: HydrationEntry[] = [
  {
    id: 'hyd-1',
    timestamp: '07:45 AM',
    amountMl: 250,
    drinkType: 'water',
  },
  {
    id: 'hyd-2',
    timestamp: '09:30 AM',
    amountMl: 200,
    drinkType: 'herbal-tea',
  },
  {
    id: 'hyd-3',
    timestamp: '11:15 AM',
    amountMl: 250,
    drinkType: 'water',
  },
];

const DEFAULT_VITALS: VitalLog[] = [
  {
    id: 'vit-1',
    timestamp: '2026-09-24T08:00:00Z',
    dateStr: 'Today',
    timeStr: '8:00 AM',
    type: 'blood-pressure',
    systolic: 122,
    diastolic: 78,
    pulse: 68,
    notes: 'Rested 5 mins before measuring. Feeling well.',
  },
  {
    id: 'vit-2',
    timestamp: '2026-09-24T08:15:00Z',
    dateStr: 'Today',
    timeStr: '8:15 AM',
    type: 'glucose',
    glucose: 104,
    glucoseContext: 'fasting',
    notes: 'Morning fasting blood sugar.',
  },
  {
    id: 'vit-3',
    timestamp: '2026-09-23T08:00:00Z',
    dateStr: 'Yesterday',
    timeStr: '8:00 AM',
    type: 'blood-pressure',
    systolic: 124,
    diastolic: 80,
    pulse: 71,
    notes: 'Morning measurement.',
  },
  {
    id: 'vit-4',
    timestamp: '2026-09-23T14:00:00Z',
    dateStr: 'Yesterday',
    timeStr: '2:00 PM',
    type: 'glucose',
    glucose: 128,
    glucoseContext: 'post-meal',
    notes: '2 hours after vegetable soup and whole wheat bread.',
  },
  {
    id: 'vit-5',
    timestamp: '2026-09-22T08:10:00Z',
    dateStr: 'Sep 22',
    timeStr: '8:10 AM',
    type: 'blood-pressure',
    systolic: 119,
    diastolic: 76,
    pulse: 66,
  },
  {
    id: 'vit-6',
    timestamp: '2026-09-21T08:00:00Z',
    dateStr: 'Sep 21',
    timeStr: '8:00 AM',
    type: 'blood-pressure',
    systolic: 126,
    diastolic: 82,
    pulse: 72,
  },
  {
    id: 'vit-7',
    timestamp: '2026-09-20T08:05:00Z',
    dateStr: 'Sep 20',
    timeStr: '8:05 AM',
    type: 'blood-pressure',
    systolic: 121,
    diastolic: 79,
    pulse: 69,
  },
];

const DEFAULT_ROUTINE: RoutineTask[] = [
  {
    id: 'task-1',
    timeSlot: 'Morning',
    scheduledTime: '7:30 AM',
    title: 'Morning Glass of Pure Water',
    description: 'Awaken your body with 250ml of room-temperature water.',
    category: 'hydration',
    completed: true,
    completedAt: '7:35 AM',
    iconName: 'Droplet',
  },
  {
    id: 'task-2',
    timeSlot: 'Morning',
    scheduledTime: '8:00 AM',
    title: 'Morning Blood Pressure Check & Medications',
    description: 'Check BP cuff, then take Lisinopril and Metformin with breakfast.',
    category: 'medication',
    completed: true,
    completedAt: '8:10 AM',
    iconName: 'Pill',
  },
  {
    id: 'task-3',
    timeSlot: 'Morning',
    scheduledTime: '10:00 AM',
    title: '15-Minute Garden Stroll or Light Stretches',
    description: 'Gentle mobility helps joint circulation and gives natural morning sunlight.',
    category: 'activity',
    completed: false,
    iconName: 'Footprints',
  },
  {
    id: 'task-4',
    timeSlot: 'Afternoon',
    scheduledTime: '12:30 PM',
    title: 'Midday Meal & Vitamin D3',
    description: 'Wholesome lunch with warm tea or water, take Vitamin D3 + Calcium.',
    category: 'meal',
    completed: false,
    iconName: 'Utensils',
  },
  {
    id: 'task-5',
    timeSlot: 'Afternoon',
    scheduledTime: '3:00 PM',
    title: 'Afternoon Hydration & Brain Activity',
    description: 'Drink a glass of water or herbal tea; 15 mins of reading or crossword.',
    category: 'hydration',
    completed: false,
    iconName: 'BookOpen',
  },
  {
    id: 'task-6',
    timeSlot: 'Evening',
    scheduledTime: '6:30 PM',
    title: 'Evening Dinner & Atorvastatin',
    description: 'Comfortable dinner, take cholesterol pill with water.',
    category: 'medication',
    completed: false,
    iconName: 'Pill',
  },
  {
    id: 'task-7',
    timeSlot: 'Bedtime',
    scheduledTime: '9:30 PM',
    title: 'Bedtime Rest & Melatonin',
    description: 'Quiet wind-down, bedside glass of water, soothing sleep.',
    category: 'medication',
    completed: false,
    iconName: 'Moon',
  },
];

export function getStoredProfile(): SeniorProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: SeniorProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredMedications(): Medication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!raw) return DEFAULT_MEDICATIONS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEDICATIONS;
  }
}

export function saveStoredMedications(meds: Medication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
  } catch (e) {
    console.error('Failed to save meds', e);
  }
}

export function getStoredHydration(): HydrationEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HYDRATION);
    if (!raw) return DEFAULT_HYDRATION;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HYDRATION;
  }
}

export function saveStoredHydration(entries: HydrationEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save hydration', e);
  }
}

export function getStoredVitals(): VitalLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VITALS);
    if (!raw) return DEFAULT_VITALS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VITALS;
  }
}

export function saveStoredVitals(vitals: VitalLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitals));
  } catch (e) {
    console.error('Failed to save vitals', e);
  }
}

export function getStoredRoutine(): RoutineTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINE);
    if (!raw) return DEFAULT_ROUTINE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ROUTINE;
  }
}

export function saveStoredRoutine(routine: RoutineTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routine));
  } catch (e) {
    console.error('Failed to save routine', e);
  }
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(DEFAULT_MEDICATIONS));
  localStorage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify(DEFAULT_HYDRATION));
  localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(DEFAULT_VITALS));
  localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(DEFAULT_ROUTINE));
}
