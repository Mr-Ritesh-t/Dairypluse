'use client';

import React from 'react';
import Link from 'next/navigation';
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
  Building2,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Milk Inventory', href: '/inventory', icon: Milk },
  { label: 'Household Subscriptions', href: '/household', icon: Users },
  { label: 'Shop Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Delivery Management', href: '/delivery', icon: Truck },
  { label: 'Customers', href: '/customers', icon: UserCheck },
  { label: 'Billing & Payments', href: '/billing', icon: CreditCard },
  { label: 'Staff Management', href: '/staff', icon: Briefcase },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-50 overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-purpose="main-sidebar"
      >
        {/* Top Branding & Navigation */}
        <div>
          {/* Brand Logo & Title */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 lg:border-none">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200/90 shrink-0 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="DairyPulse Cow Analytics Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none flex items-center">
                  Dairy<span className="text-emerald-600">Pulse</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-1">
                  Farm Operations Hub
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Navigation"
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav aria-label="Main Navigation" className="mt-4 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm transition font-medium ${
                    isActive
                      ? 'bg-emerald-100/70 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promo Leaf Card (Stitch Exact Design) */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 p-4 border border-emerald-200 shadow-xs">
            {/* Botanical decorative elements */}
            <div className="absolute -right-4 -bottom-6 opacity-30 text-emerald-800 pointer-events-none">
              <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 0 C60 30 80 40 100 50 C80 60 60 70 50 100 C40 70 20 60 0 50 C20 40 40 30 50 0 Z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-slate-900 text-sm leading-tight">
                Pure Milk
                <br />
                <span className="text-emerald-800">Better Living</span>
              </h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1.5 leading-snug">
                Manage today for a healthier tomorrow.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs">
                  Eco Dairy 100%
                </span>
                {/* Bottle icon */}
                <svg
                  className="w-6 h-6 text-emerald-700 opacity-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 3h6M10 3v2m4-2v2M8 7h8l1 3v10a2 2 0 01-2 2H9a2 2 0 01-2-2V10l1-3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
