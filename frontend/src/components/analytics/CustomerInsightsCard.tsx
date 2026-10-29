'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  CreditCard,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { getCustomerInsightsApi } from '@/lib/api';
import { CustomerInsightsResponse, CustomerInsightItem } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';

export function CustomerInsightsCard() {
  const { customers } = useDairyPulse();
  const [data, setData] = useState<CustomerInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TOP_BUYER' | 'AT_RISK' | 'OVERDUE' | 'HIGH_VOLUME_SHOP'>('ALL');

  const loadInsights = async () => {
    setLoading(true);
    const res = await getCustomerInsightsApi();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Analyzing subscriber retention, pause duration & customer loyalty...</span>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-900">Subscriber Retention & Intelligence Engine</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          Once you register household subscribers and commercial shops, AI retention tracking, VIP loyalty tiers, and pause risk alerts will activate here.
        </p>
      </div>
    );
  }

  const filteredInsights = data.insights.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'TOP_BUYER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            <span>VIP Loyalty</span>
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>At-Risk Churn</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <CreditCard className="w-3 h-3 text-purple-600" />
            <span>Payment Overdue</span>
          </span>
        );
      case 'HIGH_VOLUME_SHOP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Building2 className="w-3 h-3 text-blue-600" />
            <span>Wholesale Bulk</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customer Intelligence & Retention</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {data.retention_rate_percentage}% Active Retention
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Subscriber Retention & Account Intelligence
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify VIP buyers, subscribers at risk of churn, and pending payment reminders.
          </p>
        </div>

        <button
          onClick={loadInsights}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Directory</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {data.total_customers}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            {data.active_subscribers} Active Subscribers
          </span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 block">Retention Health</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {data.retention_rate_percentage}%
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
            Target benchmark &gt; 90%
          </span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
          <span className="text-[11px] font-semibold text-rose-800 block">At-Risk Churn Alerts</span>
          <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
            {data.at_risk_count} <span className="text-xs font-normal text-rose-600">Accounts</span>
          </div>
          <span className="text-[10px] text-rose-700 font-medium mt-0.5 block">
            Paused &gt; 7 days or reduced quota
          </span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
          <span className="text-[11px] font-semibold text-purple-800 block">Overdue Collections</span>
          <div className="text-2xl font-black text-purple-700 mt-1 tabular-nums">
            {data.overdue_count} <span className="text-xs font-normal text-purple-700">Accounts</span>
          </div>
          <span className="text-[10px] text-purple-700 font-medium mt-0.5 block">
            Action needed before next run
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {[
          { key: 'ALL', label: `All Alerts (${data.insights.length})` },
          { key: 'TOP_BUYER', label: `VIP Loyalty (${data.top_buyers_count})` },
          { key: 'AT_RISK', label: `At-Risk / Retention (${data.at_risk_count})` },
          { key: 'OVERDUE', label: `Overdue Dues (${data.overdue_count})` },
          { key: 'HIGH_VOLUME_SHOP', label: `Wholesale Shops (1)` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === tab.key
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {filteredInsights.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {item.area} • {item.type} • {item.phone}
                  </p>
                </div>
                {getCategoryBadge(item.category)}
              </div>

              <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  {item.metric_label}
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                  {item.metric_value}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-slate-600 italic truncate max-w-[240px]">
                {item.recommended_action}
              </span>
              <a
                href={`tel:${item.phone}`}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Retention Best Practices Directives */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-2xl text-xs text-indigo-900 space-y-1">
        <span className="font-bold block text-indigo-800">
          Retention Playbook Directives:
        </span>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-900/90 pl-1">
          {data.retention_tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
