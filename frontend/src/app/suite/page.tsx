'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Milk,
  Users,
  ShoppingBag,
  Truck,
  CreditCard,
  Briefcase,
  Receipt,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function BusinessSuitePage() {
  const { products, deliveries, invoices, expenses, staff } = useDairyPulse();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Business Management Suite & Operations Console
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Centralized hub integrating cold-chain storage health, fleet dispatches, accounting, and staff roster.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Plant Systems Operational
          </span>
        </div>
      </section>

      {/* Cold Chain & Facility Health Indicators */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Main Chilling Plant Silo</span>
            <Thermometer className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">4.1°C</div>
          <p className="text-[11px] text-emerald-600 font-medium">Within safe cold storage window (3.5°C - 4.5°C)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fleet Dispatch Integrity</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">100% Insulated</div>
          <p className="text-[11px] text-emerald-600 font-medium">Thermal cold boxes deployed on all 3 routes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">FSSAI Compliance Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Grade A+ (99.2%)</div>
          <p className="text-[11px] text-emerald-600 font-medium">Daily FAT/SNF automated lactometer testing passed</p>
        </div>
      </section>

      {/* Operations Quick Navigation Cards */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Operations Control Centers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Milk Inventory & Silos',
              desc: 'Monitor Cow, Buffalo, Toned silos and auditable movement logs.',
              href: '/inventory',
              icon: Milk,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              title: 'Household Subscriptions',
              desc: 'Doorstep daily morning milk quotas, vacation pauses, and extra milk.',
              href: '/household',
              icon: Users,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              title: 'Commercial Shop Orders',
              desc: 'B2B orders, bulk sweet shops, restaurant cans, and delivery dates.',
              href: '/orders',
              icon: ShoppingBag,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              title: 'Delivery Fleet Dispatch',
              desc: 'Delivery boy assignments, route sequencing, and live drop tracking.',
              href: '/delivery',
              icon: Truck,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              title: 'Billing & Ledgers',
              desc: 'Automated invoice cycles, UPI payment collection, and dues tracking.',
              href: '/billing',
              icon: CreditCard,
              color: 'text-emerald-700',
              bg: 'bg-emerald-100/60',
            },
            {
              title: 'Expense Accounting & P&L',
              desc: 'Cattle feed procurement, logistics, utilities, and financial audit reports.',
              href: '/expenses',
              icon: Receipt,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-200 transition group space-y-2 block"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
