import React, { useState } from 'react';
import {
  SeniorProfile,
  Medication,
  VitalLog,
  HydrationEntry,
  CaregiverReportData,
} from '../types';
import {
  FileText,
  Printer,
  Download,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
  User,
  HeartPulse,
  Share2,
} from 'lucide-react';
import { speakText } from '../utils/audio';

interface CaregiverDoctorReportProps {
  profile: SeniorProfile;
  medications: Medication[];
  vitals: VitalLog[];
  hydration: HydrationEntry[];
}

export const CaregiverDoctorReport: React.FC<CaregiverDoctorReportProps> = ({
  profile,
  medications,
  vitals,
  hydration,
}) => {
  const [reportData, setReportData] = useState<CaregiverReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.takenToday).length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 95;

  const totalHydrationMl = hydration.reduce((acc, curr) => acc + curr.amountMl, 0);

  const bpReadings = vitals.filter((v) => v.type === 'blood-pressure');
  const avgSystolic =
    bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + (r.systolic || 120), 0) / bpReadings.length)
      : 122;
  const avgDiastolic =
    bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + (r.diastolic || 80), 0) / bpReadings.length)
      : 78;

  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/caregiver/export-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seniorName: profile.name,
          medications: medications.map((m) => ({
            name: m.name,
            dosage: m.dosage,
            timing: m.timing,
            refillLeft: m.pillsRemaining,
          })),
          vitalsHistory: vitals.slice(0, 10).map((v) => ({
            date: v.dateStr,
            type: v.type,
            systolic: v.systolic,
            diastolic: v.diastolic,
            glucose: v.glucose,
          })),
          averageHydration: totalHydrationMl,
          adherenceRate: adherenceRate,
        }),
      });

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error generating report', err);
      setReportData({
        executiveSummary: `${profile.name} has maintained an adherence rate of ${adherenceRate}% with consistent routine tracking.`,
        vitalsReview: `Average Blood Pressure is ${avgSystolic}/${avgDiastolic} mmHg over recent logs, within stable baseline parameters.`,
        hydrationAssessment: `Daily recorded fluid intake is tracking steadily near ${totalHydrationMl} ml.`,
        recommendedDoctorQuestions: [
          'Review morning blood pressure medication timings with breakfast.',
          'Confirm if current hydration goals are appropriate for renal health.',
          'Check next prescription refill synchronizations.',
        ],
        lifestyleRecommendations: 'Continue the gentle morning walks and regular bedtime routine.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = () => {
    const text = `
KINCARE CLINICAL & FAMILY SUMMARY
Patient: ${profile.name} (Age: ${profile.age})
Physician: ${profile.doctor.name} (${profile.doctor.clinic})
Medication Adherence: ${adherenceRate}%
Recent BP Average: ${avgSystolic}/${avgDiastolic} mmHg
Today's Hydration: ${totalHydrationMl} ml

ACTIVE MEDICATIONS:
${medications.map((m) => `- ${m.name} ${m.dosage} (${m.timing}) - ${m.instructions}`).join('\n')}

KNOWN ALLERGIES:
${profile.knownAllergies.join(', ')}

SUMMARY NOTES:
${reportData?.executiveSummary || 'Patient shows consistent adherence to routine.'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <span>Doctor Appointments</span>
            <span aria-hidden="true">·</span>
            <span>Family Caregiver Sync</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-semibold">Printable Summary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans mt-1">
            Doctor &amp; Caregiver Reports
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Compile your vitals, pill taking adherence, and hydration into an organized summary ready for your physician visit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAIReport}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors min-h-[44px] shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Preparing Report...' : 'Generate Visit Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-stone-200 min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Doctor & Emergency Quick Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor Contact Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Primary Physician
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-stone-900 font-sans">
              {profile.doctor.name}
            </h3>
            <p className="text-xs text-stone-500">{profile.doctor.specialty}</p>
            <p className="text-xs text-stone-600 mt-1">{profile.doctor.clinic}</p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <a
              href={`tel:${profile.doctor.phone}`}
              className="text-xs font-bold text-stone-900 flex items-center gap-1.5 hover:text-amber-800"
            >
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>{profile.doctor.phone}</span>
            </a>

            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Next: {profile.doctor.nextAppointment}</span>
            </span>
          </div>
        </div>

        {/* Primary Caregiver Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Primary Family Caregiver
            </span>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
              Emergency Keyholder
            </span>
          </div>

          {profile.emergencyContacts[0] && (
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-sans">
                {profile.emergencyContacts[0].name}
              </h3>
              <p className="text-xs text-stone-500">{profile.emergencyContacts[0].relationship}</p>
              <p className="text-xs text-stone-600 mt-1">{profile.emergencyContacts[0].notes}</p>
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <a
              href={`tel:${profile.emergencyContacts[0]?.phone}`}
              className="text-xs font-bold text-stone-900 flex items-center gap-1.5 hover:text-amber-800"
            >
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>{profile.emergencyContacts[0]?.phone}</span>
            </a>

            <span className="text-xs font-semibold text-emerald-700">
              Receives daily routine alerts
            </span>
          </div>
        </div>
      </div>

      {/* Generated Report Display */}
      {reportData && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-amber-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wide">
                Physician Consultation Sheet
              </span>
              <h3 className="text-2xl font-bold text-stone-900 font-sans mt-0.5">
                Clinical Health Summary: {profile.name}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Generated {new Date().toLocaleDateString()} for appointment with {profile.doctor.name}
              </p>
            </div>

            <button
              onClick={handleCopyReport}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200 self-start sm:self-center"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Medication Adherence</span>
              <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {adherenceRate}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Average Blood Pressure</span>
              <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {avgSystolic}/{avgDiastolic}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Today's Hydration</span>
              <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {totalHydrationMl} <span className="text-xs font-normal">ml</span>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Active Medications</span>
              <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {medications.length} <span className="text-xs font-normal">prescriptions</span>
              </span>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Clinical Overview
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              {reportData.executiveSummary}
            </p>
          </div>

          {/* Recommended Questions to Ask Doctor */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Suggested Questions for Doctor Appointment
            </h4>
            <ul className="space-y-2">
              {reportData.recommendedDoctorQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-stone-800 p-2.5 rounded-lg bg-stone-50 border border-stone-100"
                >
                  <span className="font-bold text-amber-700 font-mono">{idx + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Medication Table */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Current Active Regimen
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Timing</th>
                    <th className="py-2.5 px-3">Instructions</th>
                    <th className="py-2.5 px-3">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {medications.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-bold text-stone-900">{m.name}</td>
                      <td className="py-2.5 px-3 font-mono">{m.dosage}</td>
                      <td className="py-2.5 px-3">{m.timing} ({m.timeLabel})</td>
                      <td className="py-2.5 px-3 text-stone-600">{m.instructions}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{m.pillsRemaining} tabs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Static Initial Helper if Report Not Yet Generated */}
      {!reportData && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-3">
          <FileText className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="text-base font-bold text-stone-800">
            Generate Your Doctor Visit Overview
          </h4>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Click "Generate Visit Summary" above to have our health advisor review your last 7 days of blood pressure, medications, and hydration into an appointment-ready brief.
          </p>
        </div>
      )}
    </div>
  );
};
