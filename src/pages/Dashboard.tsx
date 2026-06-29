import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Copy, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SessionRecord {
  _id?: string;
  date: string;
  avgStress: string;  
  avgFocus: string;
}

interface PatientInfo {
  name: string;
  age?: number;
  diagnosis?: string;
  lastSessionDate?: string;
}

interface ClinicalNote {
  _id?: string;
  userId: string;
  note: string;
  createdAt?: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem('neuro_role') || 'doctor';
  const isDoctor = role === 'doctor';
  const pairingCode = localStorage.getItem('neuro_pairing_code');
  const userId = localStorage.getItem('neuro_user');

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [latestNote, setLatestNote] = useState<ClinicalNote | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);

  //Fetching sessions (doctor: by doctorCode, patient: by userId)
  useEffect(() => {
    const url = isDoctor
      ? `https://neuroengage.onrender.com/api/sessions?doctorCode=${pairingCode}`
      : `https://neuroengage.onrender.com/api/sessions?userId=${userId}`;
    if (!pairingCode && isDoctor) return;
    if (!userId && !isDoctor) return;

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
        }
      })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, [isDoctor, pairingCode, userId]);


  useEffect(() => {
    if (!userId) return;

    fetch(`https://neuroengage.onrender.com/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setPatientInfo(data);
      })
      .catch(err => console.error('User fetch error:', err));
  }, [userId]);

  // Fetch latest clinical note(doctor mode only)
  useEffect(() => {
    if (!isDoctor || !userId) return;

    fetch(`https://neuroengage.onrender.com/api/clinical-notes/latest?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.note) {
          setLatestNote(data);
        }
      })
      .catch(err => console.error('Clinical notes fetch error:', err));
  }, [isDoctor, userId]);

  const saveNote = async () => {
    if (!isDoctor || !userId || !noteDraft.trim()) return;
    try {
      setSavingNote(true);
      const res = await fetch('https://neuroengage.onrender.com/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, note: noteDraft.trim() }),
      });
      const data = await res.json();
      setLatestNote(data);
      setNoteDraft('');
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const totalSessions = sessions.length;
  const highStressCount = sessions.filter(s => s.avgStress === 'High').length;
  const validFocusScores = sessions
    .map(s => parseInt(s.avgFocus || '0', 10))
    .filter(v => !isNaN(v));

  const avgFocusScore =
    validFocusScores.length > 0
      ? Math.round(validFocusScores.reduce((acc, val) => acc + val, 0) / validFocusScores.length)
      : 0;

  const chartData = sessions.slice(0, 7).reverse().map(s => {
    const d = new Date(s.date);
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const parsedFocus = parseInt(s.avgFocus || '0', 10);
    const focus = isNaN(parsedFocus) ? 0 : parsedFocus;

    const stress =
      s.avgStress === 'High' ? 80 :
      s.avgStress === 'Elevated' ? 50 :
      s.avgStress === 'Focused' ? 30 :
      20;

    return { day, stress, focus };
  });

  const goToAnalysis = () => {
    navigate('/analysis');
  };

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen animate-fade-in bg-[#030712]" >
      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">
            {isDoctor ? 'Clinical Patient Portal' : 'Your Cognitive Health Overview'}
          </h1>
          {patientInfo ? (
            <p className="text-text-secondary text-sm">
              {isDoctor
                ? `Monitoring ${patientInfo.name}${patientInfo.age ? `, ${patientInfo.age} yrs` : ''}${patientInfo.diagnosis ? ` – ${patientInfo.diagnosis}` : ''}.`
                : `Hello ${patientInfo.name}, this portal shows your EEG-based stress and focus history.`}
              {patientInfo.lastSessionDate &&
                ` Last session: ${new Date(patientInfo.lastSessionDate).toLocaleDateString()}.`}
            </p>
          ) : (
            <p className="text-text-secondary text-sm">
              Real-time patient health metrics and diagnostic system status.
            </p>
          )}
        </div>
        {isDoctor && (
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-md"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-highlight)',
              borderRadius: 10,
            }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-text-muted font-medium tracking-wider">
                Your Pairing Code
              </span>
              <span className="text-sm font-semibold text-text-primary tracking-widest">
                {pairingCode || 'LOADING'}
              </span>
            </div>
            <div
              style={{
                width: 1,
                height: 24,
                background: 'var(--border-subtle)',
                margin: '0 4px',
              }}
            />
            <button
              onClick={() => navigator.clipboard.writeText(pairingCode || '')}
              className="text-text-secondary hover:text-text-primary transition-colors"
              title="Copy Code"
            >
              <Copy size={16} />
            </button>
          </div>
        )}
      </header>

      {isDoctor && highStressCount >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} color="var(--status-stress)" />
            <div>
              <h3 className="font-bold" style={{ color: 'var(--status-stress)' }}>
                Repeated High Stress Alert
              </h3>
              <p className="text-sm text-text-secondary">
                The patient has registered "High Stress" in {highStressCount} sessions. Immediate
                clinical review or intervention is recommended.
              </p>
              <button
                className="mt-2 text-xs px-3 py-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20"
                onClick={goToAnalysis}
              >
                Review Latest EEG Session
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Aggregate stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                style={{
                  padding: 12,
                  background: 'rgba(79,70,229,0.06)',
                  borderRadius: 10,
                  border: '1px solid rgba(79,70,229,0.12)',
                  color: 'var(--brand-primary)',
                }}
              >
                <Users size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  {isDoctor ? 'Total Patient Sessions' : 'Your Total Sessions'}
                </p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                  {loading ? '...' : totalSessions}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                style={{
                  padding: 12,
                  background: 'rgba(79,70,229,0.06)',
                  borderRadius: 10,
                  border: '1px solid rgba(79,70,229,0.12)',
                  color: 'var(--brand-primary)',
                }}
              >
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  {isDoctor ? 'Avg Patient Engagement' : 'Your Avg Focus Score'}
                </p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                  {loading ? '...' : `${avgFocusScore}%`}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                style={{
                  padding: 12,
                  background: 'rgba(239,68,68,0.06)',
                  borderRadius: 10,
                  border: '1px solid rgba(239,68,68,0.12)',
                  color: 'var(--status-stress)',
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  {isDoctor ? 'Critical Stress Alerts' : 'Your Stress Events'}
                </p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                  {loading ? '...' : highStressCount}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                style={{
                  padding: 12,
                  background: 'rgba(16,185,129,0.06)',
                  borderRadius: 10,
                  border: '1px solid rgba(16,185,129,0.1)',
                  color: 'var(--status-calm)',
                }}
              >
                <Activity size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  {isDoctor ? 'Monitoring Status' : 'Your Current State'}
                </p>
                <h3
                  className={`text-2xl font-bold tracking-tight ${
                    totalSessions === 0 ? 'text-text-muted' : 'text-status-calm'
                  }`}
                >
                  {totalSessions === 0 ? 'No Data' : 'Active'}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="mt-2">
          <CardHeader className="border-border-subtle">
            <CardTitle className="text-sm font-medium text-text-secondary">
              {isDoctor
                ? 'Weekly Stress Probability Index vs Cognitive Focus'
                : 'Your Weekly Stress vs Focus Timeline'}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6 border-t border-border-subtle">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length > 0 ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#52525b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#52525b', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10,
                      color: '#000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  <Bar
                    dataKey="stress"
                    name="Stress Probability Index"
                    fill="var(--brand-primary)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    dataKey="focus"
                    name="Cognitive Focus (%)"
                    fill="var(--brand-secondary)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted text-sm border border-dashed border-border-subtle rounded-md">
                  No clinical telemetry available yet. {isDoctor ? 'Patients' : 'You'} must complete a diagnostic session.
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
      {isDoctor && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <FileText size={16} />
                Doctor Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestNote && (
                <div className="text-xs text-text-secondary bg-bg-surface border border-border-subtle rounded-md p-2">
                  <div className="font-semibold text-text-primary mb-1">
                    Last recorded note:
                    {latestNote.createdAt &&
                      ` (${new Date(latestNote.createdAt).toLocaleString()})`}
                  </div>
                  <p>{latestNote.note}</p>
                </div>
              )}
              <textarea
                className="w-full bg-bg-surface border border-border-subtle rounded-md p-2 text-sm"
                rows={3}
                placeholder="Summarize clinical impression and recommended actions (e.g., breathing exercises, sleep hygiene, follow-up visit)..."
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
              />
              <button
                disabled={savingNote || !noteDraft.trim()}
                onClick={saveNote}
                className="px-4 py-2 text-xs rounded-md bg-brand-primary text-white disabled:bg-gray-500/40"
              >
                {savingNote ? 'Saving...' : 'Save Clinical Note'}
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};