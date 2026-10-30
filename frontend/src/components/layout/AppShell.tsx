'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DairyPulseProvider } from '@/context/DairyPulseContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { Loader2 } from 'lucide-react';

function RoleGuardedShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (isLoading) return;

    // 1. Unauthenticated users: Can ONLY access /login or /register
    if (!user) {
      if (!isAuthPage) {
        setIsRedirecting(true);
        router.replace('/login');
      } else {
        setIsRedirecting(false);
      }
      return;
    }

    // 2. Authenticated user visiting /login: Route directly to their role's dashboard
    if (isAuthPage) {
      setIsRedirecting(true);
      if (user.role === 'DELIVERY') {
        router.replace('/mobile/delivery');
      } else if (user.role === 'CUSTOMER') {
        router.replace('/mobile/customer');
      } else {
        router.replace('/');
      }
      return;
    }

    // 3. DELIVERY BOY: Can ONLY see their delivery dashboard (/mobile/delivery)
    if (user.role === 'DELIVERY') {
      if (pathname !== '/mobile/delivery') {
        setIsRedirecting(true);
        router.replace('/mobile/delivery');
        return;
      }
      setIsRedirecting(false);
      return;
    }

    // 4. CUSTOMER: Can ONLY see their customer dashboard (/mobile/customer)
    if (user.role === 'CUSTOMER') {
      if (pathname !== '/mobile/customer') {
        setIsRedirecting(true);
        router.replace('/mobile/customer');
        return;
      }
      setIsRedirecting(false);
      return;
    }

    // 5. OWNER: Can ONLY see owner dashboard and management modules
    // Block access to mobile portals
    if (user.role === 'OWNER') {
      if (pathname === '/mobile/delivery' || pathname === '/mobile/customer') {
        setIsRedirecting(true);
        router.replace('/');
        return;
      }
      setIsRedirecting(false);
      return;
    }
  }, [user, isLoading, pathname, isAuthPage, router]);

  // Loading or redirecting state spinner
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Verifying DairyPulse Portal Access...</p>
        </div>
      </div>
    );
  }

  // 1. Auth Page Layout (/login, /register)
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col overflow-x-hidden">
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <ModalContainer />
      </div>
    );
  }

  // 2. Delivery Boy Dashboard Layout (/mobile/delivery)
  // Standalone mobile interface: NO Admin Sidebar, NO Admin TopNavbar
  if (user?.role === 'DELIVERY') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col justify-center items-center p-0 sm:p-4">
        <main className="w-full flex justify-center">{children}</main>
        <ModalContainer />
      </div>
    );
  }

  // 3. Customer Dashboard Layout (/mobile/customer)
  // Standalone mobile interface: NO Admin Sidebar, NO Admin TopNavbar
  if (user?.role === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col justify-center items-center p-0 sm:p-4">
        <main className="w-full flex justify-center">{children}</main>
        <ModalContainer />
      </div>
    );
  }

  // 4. Owner Dashboard & Modules Layout
  // Responsive workspace with Sidebar, TopNavbar, Mobile Bottom Nav, and ModalContainer
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <ModalContainer />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DairyPulseProvider>
        <RoleGuardedShell>{children}</RoleGuardedShell>
      </DairyPulseProvider>
    </AuthProvider>
  );
}
