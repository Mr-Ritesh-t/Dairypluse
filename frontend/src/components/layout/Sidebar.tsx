'use client';

import React from 'react';
import Link from 'next/navigation';
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
  Layers,
  Smartphone,
  Sparkles,
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
  { label: 'Business Suite', href: '/suite', icon: Layers },
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
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              {/* Stylized Cow / Dairy Logo */}
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 13.5a5.5 5.5 0 0 1-11 0c0-1.5.5-2.9 1.4-4L9 7l2 1 1-2 1 2 2-1-.4 2.5c.9 1.1 1.4 2.5 1.4 4Z"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <path d="M7 10l-3-2a2 2 0 0 0-2.8 2.2L2 14c.4 2 2 3.5 4 3.5h.5" />
                <path d="M17 10l3-2a2 2 0 0 1 2.8 2.2L22 14c-.4 2-2 3.5-4 3.5h-.5" />
                <circle cx="10" cy="13" fill="currentColor" r="1" />
                <circle cx="14" cy="13" fill="currentColor" r="1" />
                <path d="M10 17s1 1 2 1 2-1 2-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none flex items-center">
                Dairy<span className="text-emerald-600">Pulse</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-1">
                Fresh Milk, Healthier Tomorrows
              </p>
            </div>
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

            {/* Mobile Experiences Divider */}
            <div className="pt-3 pb-1 px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mobile Interfaces
              </span>
            </div>

            <a
              href="/mobile/delivery"
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs transition font-medium ${
                pathname === '/mobile/delivery'
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Delivery Partner App</span>
            </a>

            <a
              href="/mobile/customer"
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs transition font-medium ${
                pathname === '/mobile/customer'
                  ? 'bg-purple-100 text-purple-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Customer Self-Service</span>
            </a>
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
