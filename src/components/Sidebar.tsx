import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Brain, User, Settings, LogOut, Disc, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('neuro_role') || 'doctor';

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('neuro_role');
    navigate('/');
  };

  const allNavItems = [
    { icon: Disc, label: 'Patient Dashboard', path: '/dashboard', roles: ['doctor', 'patient'] },
    { icon: Activity, label: 'Clinical Monitor', path: '/eeg', roles: ['doctor', 'patient'] },
    { icon: Brain, label: 'Diagnostic Reports', path: '/analysis', roles: ['doctor', 'patient'] },
    { icon: User, label: 'Patient Registry', path: '/patients', roles: ['doctor'] },
    { icon: Zap, label: 'Assessment AI', path: '/stress-classifier', roles: ['doctor', 'patient'] },
    { icon: Settings, label: 'Portal Settings', path: '/settings', roles: ['doctor', 'patient'] },
  ];

  const filteredNavItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside style={{ width: 256, height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
      <div className="p-8 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
            <Brain size={16} color="white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-text-primary">NeuroEngage</h1>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-text-muted font-medium ml-9">
          {role === 'doctor' ? 'Practitioner View' : 'Patient View'}
        </span>
      </div>

      <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm",
                isActive 
                  ? "text-brand-primary font-semibold bg-brand-primary/5" 
                  : "text-text-secondary hover:text-text-primary hover:bg-black/5"
              )
            }
            style={({ isActive }) => isActive ? { border: '1px solid var(--border-subtle)' } : { border: '1px solid transparent' }}
          >
            <item.icon size={16} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <a 
          href="/"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </a>
      </div>
    </aside>
  );
};
