'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Plus,
  ChevronDown,
  Milk,
  UserPlus,
  Receipt,
  Truck,
  ShoppingBag,
  DollarSign,
  Activity,
  LogOut,
  UserCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { checkBackendHealth } from '@/lib/api';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function TopNavbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { openModal, activeDairy, dairies, setActiveDairy } = useDairyPulse();
  const { user, logout } = useAuth();
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then((res) => setBackendOnline(res.online));
  }, []);

  return (
    <header
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-2xs"
      data-purpose="top-navbar"
    >
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          aria-label="Toggle Navigation"
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-600 hover:text-slate-900 focus:outline-hidden p-2 rounded-lg hover:bg-slate-100"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder:text-slate-400"
            placeholder="Search customers, milk orders, routes, or invoices..."
            type="text"
          />
        </div>
      </div>

     
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {quickActionOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setQuickActionOpen(false)}
            >
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Operations
              </div>
              <button
                onClick={() => openModal('addStock')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition"
              >
                <Milk className="w-4 h-4 text-emerald-600" />
                <span>Add Milk Stock</span>
              </button>
              <button
                onClick={() => openModal('addCustomer')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-left transition"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Add New Customer</span>
              </button>
              <button
                onClick={() => openModal('generateBill')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 text-left transition"
              >
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>Generate Invoice</span>
              </button>
              <button
                onClick={() => openModal('createOrder')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 text-left transition"
              >
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                <span>Create Shop Order</span>
              </button>
              <button
                onClick={() => openModal('addExpense')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700 text-left transition"
              >
                <DollarSign className="w-4 h-4 text-rose-600" />
                <span>Record Expense</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => openModal('dairyProfile')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Dairy Profile & Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Dairy Selector / Switcher */}
        {dairies && dairies.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs font-semibold text-emerald-900 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            {dairies.length > 1 ? (
              <select
                value={activeDairy?.name || ''}
                onChange={(e) => {
                  const found = dairies.find((d) => d.name === e.target.value);
                  if (found) setActiveDairy(found);
                }}
                className="bg-transparent text-xs font-bold text-emerald-950 border-none focus:outline-none cursor-pointer max-w-[140px] truncate"
                title="Switch Active Dairy Farm"
              >
                {dairies.map((d) => (
                  <option key={d.id} value={d.name} className="text-slate-800 bg-white font-medium">
                    {d.name} {d.city ? `(${d.city})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="truncate max-w-[140px]">{activeDairy?.name || 'DairyPulse HQ'}</span>
            )}
          </div>
        )}

        {/* Date Selector Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Today, 23 Oct 2026</span>
        </div>

        {/* Backend API status badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200 bg-white">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-600">
            {backendOnline ? 'FastAPI v1 Live' : 'Local Mock Engine'}
          </span>
        </div>

        {/* Notifications Bell & Dynamic Center */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition focus:outline-hidden"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-center bg-emerald-600 text-white font-extrabold text-[9px] rounded-full ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-300 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          <NotificationCenter
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onUnreadCountChange={(cnt) => setUnreadCount(cnt)}
          />
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 pl-1 p-1 rounded-xl hover:bg-slate-100 transition focus:outline-hidden text-left"
            aria-label="User Profile Menu"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'DP'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.name || 'Guest User'}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {user?.role === 'OWNER'
                  ? 'Farm Admin / Owner'
                  : user?.role === 'DELIVERY'
                  ? 'Delivery Rider'
                  : 'Customer / Subscriber'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 px-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name || 'DairyPulse User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.loginId || user?.email || user?.phone || 'admin@dairypulse.farm'}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {user?.role || 'OWNER'}
                  </span>
                  {user?.assignedAreaOrRoute && (
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                      {user.assignedAreaOrRoute}
                    </span>
                  )}
                </div>
              </div>


              <div className="pt-1.5 pb-1 space-y-0.5 text-xs">
                {user?.role === 'OWNER' && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openModal('dairyProfile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 font-semibold rounded-xl transition text-left mb-1"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dairy Profile & Location</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
