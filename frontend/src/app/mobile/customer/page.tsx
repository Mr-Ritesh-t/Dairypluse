'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Milk,
  Calendar,
  Clock,
  CheckCircle2,
  Pause,
  Play,
  Plus,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function CustomerSelfServiceApp() {
  const { subscriptions, toggleSubscriptionPause } = useDairyPulse();
  const sub = subscriptions[0] || {
    id: 'sub1',
    customerName: 'Priya Kulkarni',
    productVariant: 'Cow Milk',
    quantityLiters: 1.5,
    timeSlot: 'Morning (6:00 AM - 7:30 AM)',
    status: 'Active',
    unitPrice: 62,
  };

  const [extraMilkRequested, setExtraMilkRequested] = useState(false);

  return (
    <div className="py-2 flex justify-center w-full">
      <div className="w-full max-w-md min-h-[85vh] bg-slate-100 flex flex-col font-sans rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Mobile Top Header */}
      <div className="bg-emerald-700 text-white p-5 pt-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <a href="/" className="p-1 rounded-lg hover:bg-emerald-800 transition">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="font-extrabold text-base leading-tight">DairyPulse Customer</h1>
              <p className="text-[11px] text-emerald-200">Doorstep Pure Milk Subscription</p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
            PK
          </span>
        </div>
        <p className="text-xs text-emerald-100 mt-1">Hello, Priya Kulkarni! (Flat 402, Baner)</p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-12">
        {/* Active Subscription Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
                🥛
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Subscription
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                  {sub.productVariant}
                </h3>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                sub.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {sub.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-700">
            <div>
              <span className="text-slate-400 text-[11px] block">Daily Quota:</span>
              <span className="font-extrabold text-slate-900 text-base">{sub.quantityLiters} Liters</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Delivery Slot:</span>
              <span className="font-bold text-slate-900 text-xs">Morning (6:00 AM - 7:30 AM)</span>
            </div>
          </div>

          {/* Quick Pause & Extra Milk Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => toggleSubscriptionPause(sub.id)}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sub.status === 'Active'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {sub.status === 'Active' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Delivery</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Delivery</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setExtraMilkRequested(true);
                alert('Extra 1 Liter Cow Milk request submitted for tomorrow morning!');
              }}
              className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{extraMilkRequested ? '+1L Added!' : 'Add Extra Milk'}</span>
            </button>
          </div>
        </div>

        {/* Today's Delivery Status Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Today's Milk Drop</h4>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Delivered
            </span>
          </div>
          <div className="flex items-center gap-3 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-slate-800">Delivered at 06:42 AM</p>
              <p className="text-slate-600 text-[11px]">Placed inside doorstep insulated milk bag by Rahul (Rider).</p>
            </div>
          </div>
        </div>

        {/* Bill & Account Balance Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Account & Billing</h4>
            <span className="text-xs font-bold text-emerald-700">₹0.00 Due</span>
          </div>
          <p className="text-xs text-slate-500">
            Your billing cycle is 1st to 15th of every month. Last payment of ₹2,790 was recorded via UPI on 16 Oct.
          </p>
          <button
            onClick={() => alert('Opening UPI Intent (GPay/PhonePe/Paytm)...')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Advance via UPI</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
