'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Milk,
  Users,
  ShoppingBag,
  Truck,
  UserCheck,
  CreditCard,
  Briefcase,
  Receipt,
  BarChart3,
  X,
  MapPin,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Milk Inventory', href: '/inventory', icon: Milk },
  { label: 'Household Subscriptions', href: '/household', icon: Users },
  { label: 'Shop Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Delivery Management', href: '/delivery', icon: Truck },
  { label: 'Delivery Routes', href: '/routes', icon: MapPin },
  { label: 'Customers', href: '/customers', icon: UserCheck },
  { label: 'Billing & Payments', href: '/billing', icon: CreditCard },
  { label: 'Staff Management', href: '/staff', icon: Briefcase },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
];

export function Sidebar({
  isOpen = true,
  onClose,
  onToggle,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const { activeDairy } = useDairyPulse();

  const handleNavClick = () => {
    // Only close the drawer on mobile viewports (< 1024px); on desktop, preserve the user's open or closed state
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-[#151413] text-stone-300 border-r border-[#262320] flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-50 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
        data-purpose="main-sidebar"
        aria-label="Main Sidebar"
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col">
          {/* Brand Logo & Name Header */}
          <div
            className={`pt-5 pb-4 border-b border-[#24211E] flex items-center transition-all duration-300 ${
              isOpen ? 'px-5 justify-between' : 'px-2 justify-center'
            }`}
          >
            <Link
              href="/"
              onClick={handleNavClick}
              className={`flex items-center group cursor-pointer focus:outline-hidden ${
                isOpen ? 'gap-3 min-w-0' : 'justify-center'
              }`}
              title="DairyPulse Hub"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md border border-stone-200 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-150">
                <Image
                  src="/logo.png"
                  alt="DairyPulse Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {isOpen && (
                <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-white leading-none truncate">
                      Dairy<span className="text-[#2DD4BF]">Pulse</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-1 truncate">
                    Farm Operations
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile-only close button for overlay drawer */}
            {isOpen && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                title="Close sidebar"
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items (Icon rail when closed, full menu when open) */}
          <nav
            aria-label="Sidebar Menu"
            className={`mt-4 space-y-1.5 transition-all duration-300 ${
              isOpen ? 'px-3' : 'px-2 flex flex-col items-center'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  title={item.label}
                  className={`group flex items-center rounded-xl transition-all duration-150 relative cursor-pointer ${
                    isOpen
                      ? 'gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-medium w-full'
                      : 'justify-center w-11 h-11'
                  } ${
                    isActive
                      ? 'bg-[#0F766E] text-white font-bold shadow-md ring-1 ring-teal-500/40'
                      : 'text-stone-300 hover:text-white hover:bg-[#201D1B]'
                  }`}
                >
                  <Icon
                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                      isOpen ? 'w-4 h-4' : 'w-5 h-5'
                    } ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'
                    }`}
                  />
                  {isOpen && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-200" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Farm Status Panel */}
        <div
          className={`mt-4 transition-all duration-300 ${
            isOpen ? 'p-3.5' : 'p-2 flex flex-col items-center mb-2'
          }`}
        >
          {isOpen ? (
            <div className="rounded-2xl bg-[#1E1C1A] border border-[#2B2825] p-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-900/60 border border-teal-700/60 flex items-center justify-center text-teal-300 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                    Active Plant
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {activeDairy?.name || 'DairyPulse HQ'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#2B2825] text-[11px] text-stone-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Dispatch
                </span>
                <span className="text-stone-400 font-mono text-[10px]">v2.4</span>
              </div>
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-xl bg-[#1E1C1A] border border-[#2B2825] flex items-center justify-center text-teal-300 relative group shadow-xs"
              title={`Active Plant: ${activeDairy?.name || 'DairyPulse HQ'}`}
            >
              <Building2 className="w-5 h-5 text-teal-400 group-hover:scale-105 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#151413] animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
