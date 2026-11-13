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
  const { openModal, activeDairy } = useDairyPulse();
  const { user, logout } = useAuth();
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showQuickSheet, setShowQuickSheet] = useState(false);

  const moreModules = [
    { label: 'Customer Directory', href: '/customers', icon: Users, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { label: 'Household Subscriptions', href: '/household', icon: Users, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { label: 'Commercial Shop Orders', href: '/orders', icon: ShoppingBag, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { label: 'Delivery Route Studio', href: '/routes', icon: MapPin, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    { label: 'Staff & Delivery Crew', href: '/staff', icon: Briefcase, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Billing & Invoices', href: '/billing', icon: CreditCard, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Farm Expenses', href: '/expenses', icon: Receipt, color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { label: 'Reports & Analytics', href: '/reports', icon: BarChart3, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <>
      {/* ── 1. Sticky Bottom Navigation Bar ── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-2px_10px_rgba(28,25,23,0.05)] px-2 py-1.5 flex items-center justify-around lg:hidden"
      >
        {/* Tab 1: Overview */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-colors ${
            pathname === '/' ? 'text-[#0F766E] font-bold' : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname === '/' ? 'bg-teal-50 text-[#0F766E]' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
        </Link>

        {/* Tab 2: Stock */}
        <Link
          href="/inventory"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-colors ${
            pathname === '/inventory' ? 'text-[#0F766E] font-bold' : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname === '/inventory' ? 'bg-teal-50 text-[#0F766E]' : ''}`}>
            <Milk className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Stock</span>
        </Link>

        {/* Center Action (+) */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            type="button"
            onClick={() => setShowQuickSheet(true)}
            aria-label="Quick Actions"
            className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center shadow-lg shadow-teal-900/20 active:scale-95 transition-transform duration-100 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] text-[#0F766E] font-extrabold mt-0.5">Action</span>
        </div>

        {/* Tab 3: Deliveries */}
        <Link
          href="/delivery"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-colors ${
            pathname === '/delivery' ? 'text-[#0F766E] font-bold' : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname === '/delivery' ? 'bg-teal-50 text-[#0F766E]' : ''}`}>
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Deliveries</span>
        </Link>

        {/* Tab 4: More */}
        <button
          type="button"
          onClick={() => setShowMoreSheet(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-colors cursor-pointer ${
            showMoreSheet ? 'text-[#0F766E] font-bold' : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${showMoreSheet ? 'bg-teal-50 text-[#0F766E]' : ''}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* ── 2. Quick Operations Drawer ── */}
      {showQuickSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150 lg:hidden">
          <div className="fixed inset-0" onClick={() => setShowQuickSheet(false)} />
          <div className="relative bg-white rounded-t-3xl border-t border-stone-200 p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Quick Farm Operations</h3>
                <p className="text-xs text-stone-500 font-normal">Add stock, register subscriber or record payments</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickSheet(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
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
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
                  <Milk className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Add Milk Stock</span>
                  <span className="text-[10px] text-stone-500">Record incoming can batch</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('addCustomer');
                }}
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">New Customer</span>
                  <span className="text-[10px] text-stone-500">Add household / retail shop</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('generateBill');
                }}
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Generate Bill</span>
                  <span className="text-[10px] text-stone-500">Cycle billing invoice</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('createOrder');
                }}
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Shop Order</span>
                  <span className="text-[10px] text-stone-500">Commercial bulk order</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('addExpense');
                }}
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#C2410C] text-white flex items-center justify-center shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Record Expense</span>
                  <span className="text-[10px] text-stone-500">Cattle feed, fuel, etc.</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  openModal('dairyProfile');
                }}
                className="p-3 bg-[#F6F2EA] hover:bg-teal-50 border border-stone-200/80 rounded-2xl text-left transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Dairy Profile</span>
                  <span className="text-[10px] text-stone-500">Plant GPS & details</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. More All Modules Drawer ── */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150 lg:hidden">
          <div className="fixed inset-0" onClick={() => setShowMoreSheet(false)} />
          <div className="relative bg-white rounded-t-3xl border-t border-stone-200 p-5 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto" />

            {/* Farm Header */}
            <div className="p-3.5 bg-[#F6F2EA] rounded-2xl border border-stone-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-stone-200 flex items-center justify-center text-[#0F766E] shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
                    Active Dairy Farm
                  </span>
                  <span className="text-sm font-extrabold text-stone-900 block truncate max-w-[180px]">
                    {activeDairy?.name || 'DairyPulse HQ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1 block mb-2">
                All Farm Modules
              </span>
              <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl overflow-hidden bg-white">
                {moreModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname === mod.href;
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setShowMoreSheet(false)}
                      className={`flex items-center justify-between p-3.5 transition-colors ${
                        isActive ? 'bg-teal-50 text-[#0F766E] font-bold' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${mod.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{mod.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DP'}
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">{user?.name || 'Farm Owner'}</span>
                  <span className="text-[10px] text-teal-700 font-semibold block">Owner / Admin Access</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreSheet(false);
                  logout();
                  window.location.href = '/login';
                }}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
export default MobileBottomNav;
