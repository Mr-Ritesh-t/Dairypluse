'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  ThermometerSnowflake,
  Truck,
  Droplets,
  Package,
  FlaskConical,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import { getWastageInsightsApi } from '@/lib/api';
import { WastageInsightsResponse } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';

export function WastageIntelligenceCard() {
  const { openModal } = useDairyPulse();
  const [insights, setInsights] = useState<WastageInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getWastageInsightsApi();
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !insights) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Auditing cold-chain logs, transit spillage & quality tests...</span>
        </div>
      </div>
    );
  }

  const getReasonIcon = (reason: string) => {
    if (reason.toLowerCase().includes('temperature') || reason.toLowerCase().includes('cold')) {
      return <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />;
    }
    if (reason.toLowerCase().includes('transit') || reason.toLowerCase().includes('spillage')) {
      return <Truck className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (reason.toLowerCase().includes('quality') || reason.toLowerCase().includes('fat')) {
      return <Droplets className="w-3.5 h-3.5 text-rose-600" />;
    }
    if (reason.toLowerCase().includes('packaging') || reason.toLowerCase().includes('pouch')) {
      return <Package className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <FlaskConical className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Cold-Chain Leakage Audit</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                insights.benchmark_status === 'HEALTHY'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Benchmark: {insights.benchmark_status} (&lt;1.5%)
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Milk Wastage Intelligence & Cost Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Root-cause breakdown across bulk chilling, road dispatch, and pouch filling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('logWastage')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Spoilage</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Wastage</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {insights.total_wastage_liters} <span className="text-sm font-normal text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            Out of {insights.total_procured_liters.toLocaleString()} L Procured
          </span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 block">Wastage Rate</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {insights.wastage_rate_percentage}%
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Well below 1.5% Dairy SLA</span>
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block">Financial Loss</span>
          <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
            ₹{insights.total_financial_loss.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-600" />
            <span>{insights.cost_trend_vs_last_week_percentage}% vs Last Week</span>
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block">Top Contributing Reason</span>
          <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
            {insights.reasons_breakdown[0]?.reason || 'Cold-Chain Breach'}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            {insights.reasons_breakdown[0]?.percentage}% of all recorded spoilage
          </span>
        </div>
      </div>

      {/* Two Column Grid: Root Causes & Variant Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Root Cause Breakdown Progress Bars */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Wastage by Root Cause
          </h4>
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            {insights.reasons_breakdown.map((r) => (
              <div key={r.reason} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {getReasonIcon(r.reason)}
                    <span>{r.reason}</span>
                  </span>
                  <span className="font-mono text-slate-600 font-bold">
                    {r.quantity_liters} L ({r.percentage}%) • ₹{r.financial_loss.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-2 rounded-full"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Breakdown by Milk Variant & Actionable Tips */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Wastage by Milk Variant
          </h4>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            {insights.variants_breakdown.map((v) => (
              <div key={v.variant} className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-800 block truncate">
                  {v.variant}
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {v.quantity_liters} L
                </div>
                <span className="text-[10px] text-slate-500 block">
                  ₹{v.financial_loss.toLocaleString()} ({v.percentage}%)
                </span>
              </div>
            ))}
          </div>

          {/* Operational Mitigation Directives */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Corrective Action Directives:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 pl-1">
              <li>{insights.mitigation_tips[0]}</li>
              <li>{insights.mitigation_tips[1]}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
