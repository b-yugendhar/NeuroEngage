import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen selection:bg-brand-primary selection:text-white" style={{ background: '#f6f3fb' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative" style={{ marginLeft: 256, padding: '24px' }}>
        <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-48px)] animate-fade-in bg-white shadow-sm border border-border-subtle" style={{ borderRadius: '24px', padding: '32px 48px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
