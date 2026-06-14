import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { History, Download, UploadCloud, ChevronDown, ChevronUp, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionRecord {
  id: string;
  date: string;
  duration: string;
  avgStress: string;
  avgFocus: string;
  waves: { time: number; alpha: number; beta: number; gamma: number; focus: number; attention: number; }[];
  context: Record<string, any>;
}

const C_LOAD = '#ef4444';     
const C_FOCUS = '#BF77F6';    
const C_ATTENTION = '#BF77F6'; 

// Removed static monthlyData array

const generateSessionWaves = (seed: number) => {
  return Array.from({ length: 40 }, (_, i) => {
    const alpha = Math.abs(Math.sin(i * 0.2 + seed) * 30 + 30 + Math.random() * 10);
    const beta = Math.abs(Math.cos(i * 0.3 + seed) * 40 + 40 + Math.random() * 15);
    const gamma = Math.abs(Math.sin(i * 0.5 + seed) * 20 + 20 + Math.random() * 5);
    const focus = Math.abs(Math.cos(i * 0.1 + seed) * 20 + 60 + Math.random() * 5);
    const attention = Math.abs(Math.sin(i * 0.15 + seed) * 15 + 70 + Math.random() * 5);

    return { time: i, alpha, beta, gamma, focus, attention };
  });
};

// Removed static initialSessions array

export const Analysis: React.FC = () => {
  const role = localStorage.getItem('neuro_role') || 'doctor';
  const userId = localStorage.getItem('neuro_user') || '';
  const isDoctor = role === 'doctor';

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pairingCode = localStorage.getItem('neuro_pairing_code');
    const url = isDoctor ? `https://neuroengage.onrender.com/api/sessions?doctorCode=${pairingCode}` : `https://neuroengage.onrender.com/api/sessions?userId=${userId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const mapped = data.map((s: { _id: string, date: string, duration?: string, avgStress: string, avgFocus: string, waves: { time: number; alpha: number; beta: number; gamma: number; focus: number; attention: number; }[], context: Record<string, unknown> }) => ({
            id: 'SES-' + s._id.slice(-4).toUpperCase(),
            date: new Date(s.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            duration: s.duration || 'Live Recording',
            avgStress: s.avgStress,
            avgFocus: s.avgFocus,
            waves: s.waves,
            context: s.context as Record<string, string>
          }));
          setSessions(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch from MongoDB:', err));
  }, [isDoctor, userId]);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const chartData = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const chronological = [...sessions].reverse();
    const groupedByDate: Record<string, { loadSum: number, focusSum: number, attentionSum: number, count: number }> = {};
    
    chronological.forEach(s => {
      const dateStr = s.date ? s.date.split(',')[0] : 'Unknown';
      
      const load = s.avgStress === 'High' ? 85 : s.avgStress === 'Elevated' ? 65 : 45;
      const parsedFocus = parseInt(String(s.avgFocus || '50').replace('%',''));
      const focus = isNaN(parsedFocus) ? 0 : parsedFocus;
      const attention = focus > 0 ? Math.min(100, focus + 5) : 0;

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = { loadSum: 0, focusSum: 0, attentionSum: 0, count: 0 };
      }
      
      groupedByDate[dateStr].loadSum += load;
      groupedByDate[dateStr].focusSum += focus;
      groupedByDate[dateStr].attentionSum += attention;
      groupedByDate[dateStr].count += 1;
    });

    return Object.keys(groupedByDate).map(date => {
      const g = groupedByDate[date];
      return {
        date: date,
        load: Math.round(g.loadSum / g.count),
        focus: Math.round(g.focusSum / g.count),
        attention: Math.round(g.attentionSum / g.count)
      };
    });
  }, [sessions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const newSession = {
          id: `SES-0${Math.floor(Math.random() * 100) + 100}`,
          date: 'Just Now',
          duration: 'Imported Data',
          avgStress: Math.random() > 0.5 ? 'Elevated' : 'Neutral',
          avgFocus: `${Math.floor(Math.random() * 20) + 75}%`,
          waves: generateSessionWaves(Math.random() * 10),
          context: {}
        };
        setSessions([newSession, ...sessions]);
        setIsUploading(false);
        setExpandedId(newSession.id);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">
             {isDoctor ? 'Diagnostic Report Library' : 'My Clinical Reports'}
          </h1>
          <p className="text-text-secondary text-sm">Review historical baselines, detailed brainwave patterns, and patient diagnostic records.</p>
        </div>
        <div className="flex gap-2 relative">
          <input 
            type="file" 
            accept=".csv,.edf,.json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isUploading ? 'opacity-50 cursor-not-allowed bg-border-subtle text-text-muted' : 'bg-brand-primary text-white hover:opacity-90'}`}
          >
            <UploadCloud size={16} className={isUploading ? 'animate-bounce' : ''} /> 
            {isUploading ? 'Loading Data...' : 'Import Data'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-border-highlight text-text-primary text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      {/* Expanded Monthly Baseline Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-4">
        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-col xl:flex-row xl:justify-between xl:items-start py-6 gap-6">
            <div className="flex flex-col gap-2 max-w-sm">
              <CardTitle className="text-sm flex items-center gap-2 text-text-secondary mt-1">
                <History className="text-brand-primary" size={14} /> Long-Term Cognitive Baseline
              </CardTitle>
              <p className="font-normal text-text-muted text-xs leading-relaxed mt-1">
                Historical overview tracking physiological vs cognitive metrics over an extended monthly clinical cadence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-text-secondary">
              <div className="flex flex-col gap-1 max-w-[200px]">
                <div className="flex items-center gap-2 font-medium text-white text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C_LOAD }}></div>
                  Cognitive Load (Beta)
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Tracks mental effort. Elevated levels (&gt;70) suggest burnout risk.</p>
              </div>
              <div className="flex flex-col gap-1 max-w-[200px]">
                <div className="flex items-center gap-2 font-medium text-white text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C_FOCUS }}></div>
                  Focus Score (Alpha)
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Relaxed alertness and deep concentration leading to flow states.</p>
              </div>
              <div className="flex flex-col gap-1 max-w-[200px]">
                <div className="flex items-center gap-2 font-medium text-white text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C_ATTENTION }}></div>
                  Attention Span (Gamma)
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Correlates with high-level conceptual binding and rapid sensory tracking.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="h-80 p-6 pt-0 border-t border-border-subtle mt-2">
            <div className="w-full h-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.length > 0 ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 12 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Area type="monotone" name="Cognitive Load" dataKey="load" stroke={C_LOAD} fillOpacity={0.1} fill={C_LOAD} isAnimationActive={false} strokeWidth={1} />
                    <Area type="monotone" name="Focus" dataKey="focus" stroke={C_FOCUS} fillOpacity={0} isAnimationActive={false} strokeWidth={1} />
                    <Area type="monotone" name="Attention" dataKey="attention" stroke={C_ATTENTION} fillOpacity={0} isAnimationActive={false} strokeWidth={1} strokeDasharray="3 3" />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-muted text-sm border border-dashed border-border-subtle rounded-md">
                    No chronological baseline metrics captured yet.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Sessions Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="py-4 border-border-subtle">
            <CardTitle className="text-sm text-text-secondary">Detailed Session Library</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-base/50">
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">Patient</th>
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">Recorded</th>
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">Clinical Activity</th>
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">State</th>
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">Focus</th>
                  <th className="p-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted border-b border-border-subtle bg-bg-surface-elevated/20">
                        No patient telemetry records found. Waiting for authorized patient diagnostic transmissions.
                      </td>
                    </tr>
                  ) : sessions.map((session) => (
                    <React.Fragment key={session.id}>
                      <tr 
                        className={`border-b border-border-subtle transition-colors cursor-pointer ${expandedId === session.id ? 'bg-border-subtle/50' : 'hover:bg-bg-surface-elevated/50'}`}
                        onClick={() => toggleDetails(session.id)}
                      >
                        <td className="p-4 text-sm font-medium text-text-primary">{(session.context?.username as string) || session.id}</td>
                        <td className="p-4 text-sm text-text-secondary">{session.date}</td>
                        <td className="p-4 text-sm text-text-secondary">
                          {session.context?.task === 'Take a Cognitive Quiz' 
                            ? (session.context?.battery ? `Diagnostic: ${session.context.battery as string}` : 'Cognitive Diagnostic')
                            : (session.context?.task as string) || session.duration}
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            session.avgStress === 'High' ? 'text-status-stress border-status-stress/20' :
                            session.avgStress === 'Elevated' ? 'text-status-anxious border-status-anxious/20' :
                            'text-status-calm border-status-calm/20'
                          }`}>
                            {session.avgStress}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-text-primary font-medium">{session.avgFocus}</td>
                        <td className="p-4 text-sm text-text-secondary flex justify-end items-center gap-1">
                          {expandedId === session.id ? 'Hide' : 'Expand'}
                          {expandedId === session.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                      </tr>

                      {/* Expanded Details Pane */}
                      {expandedId === session.id && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-bg-base border-b border-border-subtle"
                        >
                          <td colSpan={6} className="p-6">
                            <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">

                              <div className="flex flex-col gap-4 bg-bg-surface-elevated/30 p-4 rounded-md border border-border-subtle">
                                <h4 className="text-text-primary text-sm font-medium">Session Metadata</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Detected Activity</p>
                                    <p className="text-status-neutral font-medium">{session.context?.task === 'Take a Cognitive Quiz' && session.context?.battery ? `Diagnostic: ${session.context.battery}` : session.context?.task || session.duration}</p>
                                  </div>
                                  <div>
                                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Prior Sleep</p>
                                    <p className="text-text-primary font-medium">{session.context?.caffeine || 'Not Recorded'}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-3">
                                <h4 className="text-white text-sm font-medium flex items-center gap-2">
                                  <Activity size={14} className="text-text-muted" />
                                  Raw EEG Signals Detail
                                </h4>
                                <div className="h-64 w-full rounded-md p-1 border border-border-subtle mt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={session.waves} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                      <XAxis dataKey="time" hide />
                                      <YAxis domain={[0, 100]} hide />
                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ display: 'none' }} />
                                      <Line type="monotone" dataKey="alpha" stroke="var(--brand-primary)" strokeWidth={1} dot={false} isAnimationActive={false} />
                                      <Line type="monotone" dataKey="beta" stroke="var(--status-stress)" strokeWidth={1} dot={false} isAnimationActive={false} />
                                      <Line type="monotone" dataKey="gamma" stroke="var(--brand-accent)" strokeWidth={1} dot={false} isAnimationActive={false} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <h4 className="text-white text-sm font-medium flex items-center gap-2">
                                  <Target size={14} className="text-text-muted" />
                                  Aggregated Attention Vectors
                                </h4>
                                <div className="h-64 w-full rounded-md p-1 border border-border-subtle mt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={session.waves} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                      <XAxis dataKey="time" hide />
                                      <YAxis domain={[0, 100]} hide />
                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ display: 'none' }} />
                                      <Area type="step" dataKey="focus" stroke="var(--brand-primary)" fillOpacity={0} isAnimationActive={false} strokeWidth={1} />
                                      <Area type="step" dataKey="attention" stroke="var(--brand-secondary)" fillOpacity={0.05} fill="var(--brand-secondary)" isAnimationActive={false} strokeWidth={1} />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                              
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
