'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Sparkles,
  Milk,
  Truck,
  Calendar,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
} from 'lucide-react';
import { NotificationItem, NotificationCategory } from '@/types';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  clearReadNotificationsApi,
  simulateNotificationEventApi,
} from '@/lib/api';
import Link from 'next/link';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NotificationCategory>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load notifications from API
  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getNotificationsApi();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
        if (onUnreadCountChange) onUnreadCountChange(res.unread_count);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    // Poll every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  const handleMarkRead = async (id: string, actionUrl?: string) => {
    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    const newCount = Math.max(0, unreadCount - 1);
    setUnreadCount(newCount);
    if (onUnreadCountChange) onUnreadCountChange(newCount);

    await markNotificationReadApi(id);

    if (actionUrl) {
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    if (onUnreadCountChange) onUnreadCountChange(0);
    await markAllNotificationsReadApi();
  };

  const handleClearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.is_read));
    await clearReadNotificationsApi();
  };

  const handleSimulateEvent = async (type: 'SKIP' | 'STOCK' | 'ROUTE' | 'ORDER') => {
    setSimMenuOpen(false);
    const res = await simulateNotificationEventApi(type);
    if (res && res.created_notification) {
      setNotifications((prev) => [res.created_notification, ...prev]);
      const newCount = unreadCount + 1;
      setUnreadCount(newCount);
      if (onUnreadCountChange) onUnreadCountChange(newCount);

      // Play soft web audio beep if sound enabled
      if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.22);
        } catch {
          // Audio not allowed without prior user interaction
        }
      }
    }
  };

  const filtered = notifications.filter((n) => {
    if (selectedCategory === 'ALL') return true;
    return n.category === selectedCategory;
  });

  if (!isOpen) return null;

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'INVENTORY':
        return <Milk className="w-4 h-4 text-emerald-600" />;
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'SUBSCRIPTION':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'BILLING':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'URGENT':
        return <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />;
      case 'WARNING':
        return <span className="w-2 h-2 rounded-full bg-amber-500" />;
      case 'SUCCESS':
        return <span className="w-2 h-2 rounded-full bg-emerald-500" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-blue-400" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
    >
      {/* Header */}
      <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Live operational & delivery alert stream</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => fetchNotifications(true)}
            title="Refresh stream"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Sub-Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition text-[11px]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.some((n) => n.is_read) && (
            <button
              onClick={handleClearRead}
              className="flex items-center gap-1 font-semibold text-slate-400 hover:text-rose-600 transition text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear read</span>
            </button>
          )}
        </div>

        {/* Demo Simulator Trigger */}
        <div className="relative">
          <button
            onClick={() => setSimMenuOpen(!simMenuOpen)}
            className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] transition"
          >
            <Play className="w-3 h-3 fill-indigo-600" />
            <span>Simulate Live Event</span>
          </button>

          {simMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-left text-xs animate-in fade-in duration-100">
              <span className="block px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Trigger Real-Time Demo
              </span>
              <button
                onClick={() => handleSimulateEvent('SKIP')}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Customer Skipped Tomorrow</span>
              </button>
              <button
                onClick={() => handleSimulateEvent('STOCK')}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Critical Stock Warning</span>
              </button>
              <button
                onClick={() => handleSimulateEvent('ORDER')}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Commercial Bulk Order</span>
              </button>
              <button
                onClick={() => handleSimulateEvent('ROUTE')}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Evening Dispatch Started</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto text-[11px]">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'DELIVERY', label: 'Delivery' },
          { key: 'INVENTORY', label: 'Stock' },
          { key: 'SUBSCRIPTION', label: 'Subs' },
          { key: 'BILLING', label: 'Billing' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key as any)}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
              selectedCategory === tab.key
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-400">
              No pending notifications in this category. Live system alerts will appear here.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id, item.action_url)}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 relative ${
                !item.is_read
                  ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-100'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Category Icon */}
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {!item.is_read && getSeverityBadge(item.severity)}
                    <h4
                      className={`text-xs font-bold truncate ${
                        !item.is_read ? 'text-slate-950 font-black' : 'text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    {item.time_ago}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {item.message}
                </p>

                {/* Action button if present */}
                {item.action_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={item.action_url}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(item.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-[10px] font-bold border border-slate-200/90 shadow-2xs transition"
                    >
                      <span>{item.action_label || 'View Details'}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[10px] text-slate-400">
          DairyPulse Enterprise Notification Gateway • Automated Real-time Telemetry
        </span>
      </div>
    </div>
  );
}
