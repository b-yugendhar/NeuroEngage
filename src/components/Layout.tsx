import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-bg-base selection:bg-brand-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full" style={{ marginLeft: 256, padding: '32px 48px' }}>
        <div className="max-w-7xl mx-auto w-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
