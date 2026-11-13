'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ShoppingBag,
  DollarSign,
  LogOut,
  Building2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function TopNavbar({
  onToggleSidebar,
  isSidebarOpen = true,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}) {
  const { openModal, activeDairy } = useDairyPulse();
  const { user, logout } = useAuth();
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header
      className="h-14 bg-white border-b border-stone-200/80 flex items-center justify-between px-3.5 sm:px-6 sticky top-0 z-30 shadow-[0_1px_2px_rgba(28,25,23,0.03)] gap-2 sm:gap-4"
      data-purpose="top-navbar"
    >
      {/* Left side: Hamburger, Mobile Brand & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        <button
          aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Open Sidebar'}
          onClick={onToggleSidebar}
          className="text-stone-600 hover:text-stone-900 focus:outline-hidden p-2 rounded-xl hover:bg-stone-100 cursor-pointer shrink-0 transition-colors flex items-center justify-center border border-stone-200/60"
          type="button"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-stone-600" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-stone-700" />
          )}
        </button>

        {/* Mobile brand logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-1.5 shrink-0 focus:outline-hidden group mr-1"
          title="DairyPulse Dashboard"
        >
          <Image
            src="/icon.png"
            alt="DairyPulse"
            width={28}
            height={28}
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <input
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200/80 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all duration-150"
            placeholder="Search farm, orders, routes..."
            type="text"
            aria-label="Search farm records"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Operations Button */}
        <div className="relative">
          {/* Desktop Button */}
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white rounded-xl text-xs font-bold shadow-xs transition-colors duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Mobile compact (+) button */}
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            aria-label="New Action"
            className="sm:hidden flex items-center justify-center w-8 h-8 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {quickActionOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setQuickActionOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Quick Operations
              </div>
              <button
                onClick={() => openModal('addStock')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <Milk className="w-4 h-4 text-[#0F766E]" />
                <span>Add Milk Stock</span>
              </button>
              <button
                onClick={() => openModal('addVariety')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#0F766E]" />
                <span>Add Milk Variety</span>
              </button>
              <button
                onClick={() => openModal('addCustomer')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#0369A1]" />
                <span>Add New Customer</span>
              </button>
              <button
                onClick={() => openModal('generateBill')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-[#D97706]" />
                <span>Generate Invoice</span>
              </button>
              <button
                onClick={() => openModal('createOrder')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                <span>Create Shop Order</span>
              </button>
              <button
                onClick={() => openModal('addExpense')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-[#C2410C]" />
                <span>Record Expense</span>
              </button>
              <div className="my-1 border-t border-stone-100" />
              <button
                onClick={() => openModal('dairyProfile')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-teal-50 hover:text-teal-900 text-left transition-colors cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                <span>Dairy Profile & Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Dairy Plant Badge */}
        {activeDairy && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#F6F2EA] border border-stone-200/90 rounded-xl text-xs font-semibold text-stone-800">
            <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span className="truncate max-w-[140px] font-bold">
              {activeDairy.name}
            </span>
          </div>
        )}

        {/* Date Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#F6F2EA] border border-stone-200/90 rounded-xl text-xs font-medium text-stone-600">
          <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="relative p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors focus:outline-hidden cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 min-w-[16px] text-center bg-[#0F766E] text-white font-extrabold text-[9px] rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-stone-300 rounded-full ring-1 ring-white" />
            )}
          </button>

          <NotificationCenter
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onUnreadCountChange={(cnt) => setUnreadCount(cnt)}
          />
        </div>

        <div className="h-5 w-px bg-stone-200 mx-0.5" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition-colors focus:outline-hidden cursor-pointer text-left"
            aria-label="User Profile"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'DP'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-stone-900 leading-tight">
                {user?.name || 'Farm Admin'}
              </div>
              <div className="text-[10px] text-[#0F766E] font-semibold">
                {user?.role === 'OWNER'
                  ? 'Dairy Owner'
                  : user?.role === 'DELIVERY'
                  ? 'Rider'
                  : 'Subscriber'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2.5 px-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-stone-100">
                <p className="text-xs font-bold text-stone-900">{user?.name || 'DairyPulse Admin'}</p>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {user?.loginId || user?.email || user?.phone || 'admin@dairypulse.farm'}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {user?.role || 'OWNER'}
                  </span>
                  {user?.assignedAreaOrRoute && (
                    <span className="text-[10px] text-stone-500 truncate max-w-[120px]">
                      {user.assignedAreaOrRoute}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-1.5 pb-0.5 space-y-0.5 text-xs">
                {user?.role === 'OWNER' && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openModal('dairyProfile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Dairy Profile & Location</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-orange-700 hover:bg-orange-50 rounded-xl transition-colors text-left cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4 text-[#C2410C]" />
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
export default TopNavbar;
