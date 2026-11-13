'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-xs text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs group-hover:border-emerald-300 transition">
                <Image
                  src="/icon.png"
                  alt="DairyPulse Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Dairy<span className="text-emerald-600">Pulse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise dairy farm distribution, fresh milk route dispatch, household subscriptions, and real-time billing ledger.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Quick Modules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Operations Hub
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link href="/" className="hover:text-emerald-700 transition">
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-emerald-700 transition">
                  Milk Stock & Tank Levels
                </Link>
              </li>
              <li>
                <Link href="/household" className="hover:text-emerald-700 transition">
                  Household Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-700 transition">
                  Commercial Shop Orders
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-emerald-700 transition">
                  Delivery Management & Routes
                </Link>
              </li>
            </ul>
          </div>

          {/* Management & Ledger */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Ledger & Fleet
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link href="/customers" className="hover:text-emerald-700 transition">
                  Customer Directory
                </Link>
              </li>
              <li>
                <Link href="/billing" className="hover:text-emerald-700 transition">
                  Billing & WhatsApp Invoices
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-emerald-700 transition">
                  Delivery Riders & Staff Payroll
                </Link>
              </li>
              <li>
                <Link href="/expenses" className="hover:text-emerald-700 transition">
                  Farm Expenses & Fodder
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-emerald-700 transition">
                  Reports & Spoilage Audits
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Support & Farm HQ
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a
                  href="tel:+919822012345"
                  className="font-medium hover:text-emerald-700 hover:underline transition"
                  title="Call Farm Support"
                >
                  +91 98220 12345
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a
                  href="mailto:support@dairypulse.in"
                  className="font-medium hover:text-emerald-700 hover:underline transition"
                  title="Email Farm Support"
                >
                  support@dairypulse.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Survey No. 42, Bavdhan-Pashan Link Road, Pune, MH 411021</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Security */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} DairyPulse. All rights reserved. Pure Milk, Better Living.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL 256-Bit Encrypted</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>Made with precision for Indian Dairies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
