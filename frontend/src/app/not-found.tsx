import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Milk, Truck, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 flex flex-col items-center">
        {/* Logo / Icon */}
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center p-3 mb-6 shadow-xs">
          <Image
            src="/icon.png"
            alt="DairyPulse Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* 404 Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-3 tracking-wide uppercase">
          404 • Missing Route
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          The farm page, route, or delivery ledger you requested could not be found. It may have moved or been updated.
        </p>

        {/* Quick Actions */}
        <div className="w-full space-y-2.5">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <Link
              href="/inventory"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs border border-slate-200 transition"
            >
              <Milk className="w-3.5 h-3.5 text-emerald-600" />
              <span>Milk Stock</span>
            </Link>

            <Link
              href="/delivery"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs border border-slate-200 transition"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Deliveries</span>
            </Link>
          </div>
        </div>

        {/* Help footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full flex items-center justify-center gap-2 text-xs text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Need help? Contact farm support at </span>
          <a
            href="tel:+919822012345"
            className="font-semibold text-emerald-600 hover:underline"
          >
            +91 98220 12345
          </a>
        </div>
      </div>
    </div>
  );
}

