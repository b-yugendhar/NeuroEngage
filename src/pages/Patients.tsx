import React, { useState, useEffect } from 'react';
import { Card, Input } from '../components/UI';
import { Search, UserCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const C_LOAD = '#ef4444';     
const C_FOCUS = '#BF77F6';    
const C_ATTENTION = '#64748b'; 

const generatePatientHistory = (seed: number) => {
  return Array.from({ length: 14 }, (_, i) => {
    return {
      day: `Day ${i + 1}`,
      load: Math.abs(Math.cos(i * 0.4 + seed) * 30 + 50 + Math.random() * 10),
      focus: Math.abs(Math.sin(i * 0.3 + seed) * 20 + 70 + Math.random() * 10),
      attention: Math.abs(Math.sin(i * 0.5 + seed) * 15 + 75 + Math.random() * 10),
    };
  });
};

export const Patients: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientsList, setPatientsList] = useState<{ name: string, id: string, stressLevel: string, focus: string, status: string, history: { day: string, load: number, focus: number, attention: number }[] }[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('neuro_role') || 'doctor';
    const isDoctor = role === 'doctor';
    const pairingCode = localStorage.getItem('neuro_pairing_code');
    const userId = localStorage.getItem('neuro_user');

    const url = isDoctor ? `https://neuroengage.onrender.com/api/sessions?doctorCode=${pairingCode}` : `https://neuroengage.onrender.com/api/sessions?userId=${userId}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const patientMap = new Map();
          data.forEach(s => {
             if (!patientMap.has(s.userId)) {
                patientMap.set(s.userId, {
                   name: s.username || s.context?.username || 'Unknown Patient',
                   id: 'PT-' + s.userId.slice(-4).toUpperCase(),
                   stressLevel: s.avgStress || 'Neutral',
                   focus: s.avgFocus || '0%',
                   status: 'Offline',
                   history: generatePatientHistory(Math.random()) 
                });
             }
          });
          setPatientsList(Array.from(patientMap.values()));
        }
      })
      .catch(err => console.error('Failed to fetch patients:', err));
  }, []);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredPatients = patientsList.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <header className="mb-4 border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">Clinical Patient Registry</h1>
          <p className="text-text-secondary text-sm">Monitor individual patient metrics and access detailed medical history.</p>
        </div>
        <div className="w-full max-w-sm">
          <Input 
            icon={<Search size={16} />} 
            placeholder="Search patients by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-text-muted border border-dashed border-border-subtle rounded-md bg-bg-surface-elevated/20">
            No active patients found. Share your 6-digit Pairing Code with patients to link their telemetry data.
          </div>
        ) : filteredPatients.map((patient, idx) => (
          <motion.div key={patient.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="flex flex-col overflow-hidden transition-colors hover:border-border-highlight">
              <div 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer gap-4 md:gap-0"
                onClick={() => toggleDetails(patient.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-border-subtle border border-border-highlight flex items-center justify-center text-text-muted">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{patient.name}</h3>
                    <p className="text-xs text-text-secondary">Patient ID: {patient.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end w-full md:w-auto">
                  <div className="flex flex-col md:items-end">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Last Focus Score</p>
                    <p className="text-sm font-semibold text-text-primary">{patient.focus}</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Clinical State</p>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          patient.stressLevel === 'High' ? 'text-status-stress border-status-stress/20' :
                          patient.stressLevel === 'Elevated' ? 'text-status-anxious border-status-anxious/20' :
                          'text-status-calm border-status-calm/20'
                        }`}>
                      {patient.stressLevel}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-text-muted md:ml-4 w-6">
                    {expandedId === patient.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === patient.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border-subtle bg-bg-base/50"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <h4 className="text-sm text-text-secondary flex items-center gap-2">
                          <History size={14} className="text-brand-primary" />
                          14-Day Clinical Baseline Tracking
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: C_LOAD}}></div> Stress Index</span>
                          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: C_FOCUS}}></div> Focus Index</span>
                          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: C_ATTENTION}}></div> Attention Span</span>
                        </div>
                      </div>

                      <div className="h-48 w-full border border-border-subtle rounded-md p-1 bg-bg-surface-elevated/30">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={patient.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="day" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                              labelStyle={{ display: 'none' }} 
                            />
                            <Area type="monotone" name="Stress Level" dataKey="load" stroke={C_LOAD} fillOpacity={0.1} fill={C_LOAD} isAnimationActive={false} strokeWidth={1} />
                            <Area type="monotone" name="Cognitive Focus" dataKey="focus" stroke={C_FOCUS} fillOpacity={0} isAnimationActive={false} strokeWidth={1} />
                            <Area type="monotone" name="Patient Attention" dataKey="attention" stroke={C_ATTENTION} fillOpacity={0} isAnimationActive={false} strokeWidth={1} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4 flex gap-4 text-xs text-text-secondary">
                        <p>Patient status: <strong>{patient.status.toLowerCase()}</strong>.</p>
                        <p>Latest assessment: <strong>{patient.stressLevel}</strong> stress risk detected.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
