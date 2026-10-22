'use client';

import React, { useState } from 'react';
import { DairyPulseProvider } from '@/context/DairyPulseContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { ModalContainer } from '@/components/modals/ModalContainer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DairyPulseProvider>
      <div className="min-h-screen bg-[#F4F7FB] flex text-slate-800">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
          <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
        <ModalContainer />
      </div>
    </DairyPulseProvider>
  );
}
