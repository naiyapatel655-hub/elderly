export type PillColor = 'blue' | 'white' | 'amber' | 'ruby' | 'emerald' | 'purple';
export type PillShape = 'round' | 'oval' | 'capsule' | 'drop';
export type RoutineTimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: RoutineTimeSlot;
  timeLabel: string; // e.g., "8:00 AM"
  withFood: boolean;
  pillColor: PillColor;
  pillShape: PillShape;
  purpose: string;
  instructions: string;
  pillsRemaining: number;
  refillThreshold: number;
  takenToday: boolean;
  takenAt?: string;
  daysSupply: number;
}

export interface HydrationEntry {
  id: string;
  timestamp: string;
  amountMl: number;
  drinkType: 'water' | 'herbal-tea' | 'broth' | 'juice';
}

export interface VitalLog {
  id: string;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  type: 'blood-pressure' | 'glucose' | 'pulse' | 'weight' | 'temperature' | 'mood';
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  glucose?: number;
  glucoseContext?: 'fasting' | 'post-meal' | 'bedtime';
  temperature?: number;
  weight?: number;
  moodLevel?: 1 | 2 | 3 | 4 | 5; // 1 = sad/tired, 5 = joyful/peaceful
  notes?: string;
}

export interface RoutineTask {
  id: string;
  timeSlot: RoutineTimeSlot;
  scheduledTime: string;
  title: string;
  description: string;
  category: 'medication' | 'hydration' | 'vitals' | 'activity' | 'meal';
  completed: boolean;
  completedAt?: string;
  iconName: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  notes?: string;
}

export interface DoctorContact {
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  nextAppointment?: string;
}

export interface SeniorProfile {
  name: string;
  age: number;
  textSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceChimeEnabled: boolean;
  hydrationGoalMl: number;
  hydrationIntervalMinutes: number;
  bloodType: string;
  knownAllergies: string[];
  medicalConditions: string[];
  emergencyContacts: EmergencyContact[];
  doctor: DoctorContact;
}

export interface MedicationExplanation {
  summary: string;
  plainExplanation: string;
  foodPrecautions: string;
  caregiverTips: string;
  missedDoseAdvice: string;
}

export interface DailyCoachingMessage {
  greeting: string;
  encouragement: string;
  hydrationComment: string;
  vitalsObservation: string;
  dailyFocusTip: string;
}

export interface CaregiverReportData {
  executiveSummary: string;
  vitalsReview: string;
  hydrationAssessment: string;
  recommendedDoctorQuestions: string[];
  lifestyleRecommendations: string;
}
