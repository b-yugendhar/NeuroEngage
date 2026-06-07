import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../components/UI';
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in max-w-4xl">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary">Manage system preferences and user account settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-left" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.12)', color: 'var(--brand-primary)' }}>
            <SettingsIcon size={18} /> General
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-black/5 hover:text-text-primary transition-colors text-left">
            <Shield size={18} /> Privacy & Data
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-black/5 hover:text-text-primary transition-colors text-left">
            <Bell size={18} /> Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-black/5 hover:text-text-primary transition-colors text-left">
            <Database size={18} /> Sensor Config
          </button>
        </div>

        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <Card glass>
              <CardHeader className="border-border-highlight">
                <CardTitle>Hardware Configuration</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">EEG Headset IP Address</label>
                  <Input defaultValue="192.168.1.100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Sampling Rate (Hz)</label>
                  <select className="flex h-11 w-full rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                    <option style={{ background: '#0f0f1a' }}>256 Hz</option>
                    <option style={{ background: '#0f0f1a' }}>512 Hz</option>
                    <option style={{ background: '#0f0f1a' }}>1024 Hz</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border-subtle bg-bg-surface text-brand-primary focus:ring-brand-primary" />
                  <span className="text-sm text-text-primary">Enable automatic data syncing to cloud</span>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card glass className="mt-6">
              <CardHeader className="border-border-highlight">
                <CardTitle>Threshold Alerts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-gray-50">
                  <div>
                    <h4 className="text-text-primary font-bold">Critical Stress Alert</h4>
                    <p className="text-xs text-text-muted">Notify when any Beta wave spikes over 80Hz</p>
                  </div>
                  <div style={{ width: 40, height: 20, background: 'var(--brand-primary)', borderRadius: 9999, position: 'relative', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-gray-50">
                  <div>
                    <h4 className="text-text-primary font-bold">Attention Loss Warning</h4>
                    <p className="text-xs text-text-muted">Notify when Alpha waves drop below 15Hz</p>
                  </div>
                  <div className="w-10 h-5 bg-bg-surface-elevated border border-border-subtle rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-text-muted rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
