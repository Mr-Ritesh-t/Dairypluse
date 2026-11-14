import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading DairyPulse Operations Hub..."
      className="min-h-[82vh] w-full flex flex-col justify-start px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6 animate-fadeIn"
    >
      {/* ── Brand Splash Pill ── */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
            <Image
              src="/icon.png"
              alt="DairyPulse"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
            {/* Ambient Pulse Ring */}
            <span className="absolute inset-0 rounded-xl border border-teal-500/40 animate-ping opacity-30" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>DairyPulse Operations</span>
                <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Synchronizing farm procurement, milk dispatch &amp; billing ledgers...
            </p>
          </div>
        </div>

        {/* Shimmer Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50/80 border border-teal-200/60 px-3.5 py-1.5 rounded-xl">
          <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Fetching Stream...</span>
        </div>
      </div>

      {/* ── Metric Stat Cards Shimmer Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        {[
          { label: 'Today Milk Procured', accent: 'border-l-teal-600' },
          { label: 'Morning Dispatch Stops', accent: 'border-l-blue-600' },
          { label: 'Active Subscriptions', accent: 'border-l-emerald-600' },
          { label: 'Monthly Cash Collections', accent: 'border-l-amber-600' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3 border-l-4 ${card.accent}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-stone-100 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="h-6 w-28 bg-stone-200/80 rounded-md animate-pulse" />
              <div className="h-3.5 w-36 bg-stone-100 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Area Skeleton Card ── */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="space-y-1.5">
            <div className="h-5 w-44 bg-stone-200/90 rounded-md animate-pulse" />
            <div className="h-3.5 w-64 bg-stone-100 rounded-md animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-9 w-32 bg-stone-200/70 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Filter / Search Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="h-9 w-full sm:w-64 bg-stone-100 rounded-xl animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-stone-100 rounded-lg animate-pulse" />
            <div className="h-8 w-20 bg-stone-100 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-stone-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-2.5 pt-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 bg-stone-50/70 rounded-xl border border-stone-100/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-200/80 animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div
                    className="h-3.5 bg-stone-200 rounded-md animate-pulse"
                    style={{ width: `${110 + (i % 4) * 25}px` }}
                  />
                  <div className="h-2.5 w-24 bg-stone-100 rounded-md animate-pulse" />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-8">
                <div className="h-3.5 w-20 bg-stone-100 rounded-md animate-pulse" />
                <div className="h-3.5 w-16 bg-stone-200 rounded-md animate-pulse" />
                <div className="h-5 w-18 bg-stone-100 rounded-full animate-pulse" />
              </div>

              <div className="h-7 w-16 bg-stone-200/60 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
