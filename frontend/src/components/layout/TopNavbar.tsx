'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export function TopNavbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { openModal } = useDairyPulse();
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

      {/* Right side: Quick Action, Date, Notifications, Profile */}
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
            </div>
          )}
        </div>

        {/* Date Selector Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Today, 23 Oct 2026</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition focus:outline-hidden"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">Baramati Agro Chilling Batch In</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">500 Liters Buffalo Milk received (FAT 7.1%)</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15 mins ago</span>
                </div>
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">Morning Run 86% Complete</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Rahul Deshmukh finished Baner route stops</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">45 mins ago</span>
                </div>
                <div className="py-2.5">
                  <p className="font-semibold text-slate-800">Low Stock Alert: A2 Milk</p>
                  <p className="text-amber-600 text-[11px] mt-0.5">Stock at 180 L (Threshold: 200 L)</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              RT
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-slate-900 leading-tight">Ritesh Tayade</div>
            <div className="text-[11px] text-emerald-700 font-medium">Farm Admin / Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
