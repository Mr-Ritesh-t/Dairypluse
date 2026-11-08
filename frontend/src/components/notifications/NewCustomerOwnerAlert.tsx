'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  UserPlus,
  X,
  Send,
  ExternalLink,
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export function NewCustomerOwnerAlert() {
  const { ownerAlert, dismissOwnerAlert } = useDairyPulse();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!ownerAlert) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const totalDuration = 10000; // 10 seconds
    const intervalTime = 100;
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissOwnerAlert();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [ownerAlert, dismissOwnerAlert]);

  if (!ownerAlert) return null;

  const handleOpenWhatsApp = () => {
    if (ownerAlert.ownerWhatsAppUrl) {
      window.open(ownerAlert.ownerWhatsAppUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[420px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-emerald-500/40 p-4 sm:p-5 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 font-sans backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                New Customer Alert
              </span>
              <span className="text-[11px] text-slate-400">{ownerAlert.timestamp}</span>
            </div>
            <h4 className="text-base font-extrabold text-white mt-0.5 tracking-tight">
              {ownerAlert.customerName}
            </h4>
          </div>
        </div>

        <button
          onClick={dismissOwnerAlert}
          className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Contact Phone:</span>
          <strong className="text-white font-mono">{ownerAlert.customerPhone}</strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Account Type:</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {ownerAlert.customerType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Route & Area:</span>
          <span className="text-slate-200 font-semibold truncate max-w-[200px]">
            {ownerAlert.route} • {ownerAlert.area}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Supplying Farm:</span>
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{ownerAlert.dairyName}</span>
          </span>
        </div>
      </div>

      {/* Status Notice */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400/90 relative z-10">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span>Logged in Owner Notification Center & Farm Ledger.</span>
      </div>

      {/* Actions */}
      <div className="mt-3.5 flex items-center gap-2 relative z-10">
        {ownerAlert.ownerWhatsAppUrl && (
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            title="Forward new customer details to owner WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp Owner</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </button>
        )}

        <Link
          href="/customers"
          onClick={dismissOwnerAlert}
          className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
        >
          <span>View Customer</span>
        </Link>
      </div>

      {/* Auto-dismiss countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-emerald-500 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

