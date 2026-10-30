'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Milk,
  Truck,
  Users,
  Plus,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Receipt,
  BarChart3,
  Building2,
  ShoppingBag,
  UserPlus,
  DollarSign,
  ChevronRight,
  LogOut,
  MapPin,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const { openModal, activeDairy, dairies, setActiveDairy } = useDairyPulse();
  const { user, logout } = useAuth();
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showQuickSheet, setShowQuickSheet] = useState(false);

  // Core 4 bottom tabs
  const navTabs = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Milk Stock', href: '/inventory', icon: Milk },
    { label: 'Deliveries', href: '/delivery', icon: Truck },
    { label: 'Customers', href: '/customers', icon: Users },
  ];

  // Additional modules in More sheet
  const moreModules = [
    { label: 'Household Subscriptions', href: '/household', icon: Users, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Commercial Shop Orders', href: '/orders', icon: ShoppingBag, color: 'text-purple-700 bg-purple-50' },
    { label: 'Staff & Delivery Crew', href: '/staff', icon: Briefcase, color: 'text-blue-700 bg-blue-50' },
    { label: 'Billing & Invoices', href: '/billing', icon: CreditCard, color: 'text-amber-700 bg-amber-50' },
    { label: 'Farm Expenses', href: '/expenses', icon: Receipt, color: 'text-rose-700 bg-rose-50' },
    { label: 'Reports & Waste Analytics', href: '/reports', icon: BarChart3, color: 'text-teal-700 bg-teal-50' },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MOBILE BOTTOM NAVIGATION BAR (Phones & Small Tablets) */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around lg:hidden transition-all duration-200"
      >
        {/* Tab 1: Overview */}
        {(() => {
          const isActive = pathname === '/';
          return (
            <Link
              href="/"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
            </Link>
          );
        })()}

        {/* Tab 2: Milk Stock */}
        {(() => {
          const isActive = pathname === '/inventory';
          return (
            <Link
              href="/inventory"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                <Milk className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Stock</span>
            </Link>
          );
        })()}

        {/* Center Quick Action Button (+) */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            type="button"
            onClick={() => setShowQuickSheet(true)}
            aria-label="Quick Actions"
            className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] text-emerald-800 font-extrabold mt-0.5">Action</span>
        </div>

        {/* Tab 3: Deliveries */}
        {(() => {
          const isActive = pathname === '/delivery';
          return (
            <Link
              href="/delivery"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Riders</span>
            </Link>
          );
        })()}

        {/* Tab 4: More Menu */}
        <button
          type="button"
          onClick={() => setShowMoreSheet(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
            showMoreSheet ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${showMoreSheet ? 'bg-emerald-100 text-emerald-700' : ''}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 2. QUICK ACTIONS MOBILE BOTTOM SHEET */}
      {/* ======================================================== */}
      {showQuickSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setShowQuickSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick Farm Operations</h3>
                <p className="text-xs text-slate-500">Record intake, register customers, or bill clients</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickSheet(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('addStock');
                }}
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Milk className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Add Milk Stock</span>
                  <span className="text-[10px] text-emerald-700">Record incoming cans</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('addCustomer');
                }}
                className="p-3.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">New Customer</span>
                  <span className="text-[10px] text-blue-700">Add household / shop</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('generateBill');
                }}
                className="p-3.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Generate Bill</span>
                  <span className="text-[10px] text-amber-700">Cycle billing invoice</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('createOrder');
                }}
                className="p-3.5 bg-purple-50 hover:bg-purple-100/70 border border-purple-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Shop Order</span>
                  <span className="text-[10px] text-purple-700">Commercial bulk order</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('addExpense');
                }}
                className="p-3.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Record Expense</span>
                  <span className="text-[10px] text-rose-700">Cattle feed, fuel, etc.</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('dairyProfile');
                }}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition flex flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Dairy Profile</span>
                  <span className="text-[10px] text-slate-500">Plant GPS & details</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. "MORE" ALL MODULES MOBILE SHEET */}
      {/* ======================================================== */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setShowMoreSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            {/* Farm Header & Active Dairy Switcher */}
            <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Active Dairy Farm
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block truncate max-w-[180px]">
                    {activeDairy?.name || 'DairyPulse HQ'}
                  </span>
                </div>
              </div>
              {dairies && dairies.length > 1 && (
                <select
                  value={activeDairy?.name || ''}
                  onChange={(e) => {
                    const found = dairies.find((d) => d.name === e.target.value);
                    if (found) setActiveDairy(found);
                  }}
                  className="px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none"
                >
                  {dairies.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* All Management Modules */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
                All Farm Modules
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                {moreModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname === mod.href;
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setShowMoreSheet(false)}
                      className={`flex items-center justify-between p-3.5 transition ${
                        isActive ? 'bg-emerald-100/70 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mod.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{mod.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Profile & Log Out */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DP'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{user?.name || 'Farm Owner'}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Owner / Admin Access</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreSheet(false);
                  logout();
                  window.location.href = '/login';
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

