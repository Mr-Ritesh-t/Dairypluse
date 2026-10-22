'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  PieChart,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function ReportsDashboardPage() {
  const { products, invoices, expenses, deliveries } = useDairyPulse();

  const totalRevenue = 248500;
  const totalLitersSold = 12450;
  const totalCost = expenses.reduce((acc, e) => acc + e.amount, 0) + 120000; // feed, procurement, operations
  const netEstimatedProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciled financial statements, milk volume dispatch analytics, wastage reports, and operational audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Reconciled DairyPulse Report as CSV...')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Generating formal monthly audit PDF report...')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </section>

      {/* Macro Performance Indicators (Stitch Exact UI) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Gross Monthly Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18.4% YoY growth</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Milk Sold</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalLitersSold.toLocaleString()} L
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Daily avg: 415 L/day</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Operational Expenses</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalCost.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Procurement, feed & logistics</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Estimated Net Profit</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            ₹{netEstimatedProfit.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">25.8% Operating Margin</p>
        </div>
      </section>

      {/* Product-wise Volume & Route Efficiency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Variant Share */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Product Variant Sales Share</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly distribution percentage by product</p>
            </div>
            <PieChart className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {[
              { name: 'Cow Milk (Standard 4.2% FAT)', liters: '6,400 L', share: 52, color: 'bg-emerald-600' },
              { name: 'Pure Buffalo Milk (7.0% FAT)', liters: '3,800 L', share: 30, color: 'bg-blue-600' },
              { name: 'Homogenized Toned Milk', liters: '1,500 L', share: 12, color: 'bg-amber-500' },
              { name: 'A2 Gir Cow Organic Milk', liters: '750 L', share: 6, color: 'bg-purple-600' },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>{p.name}</span>
                  <span className="tabular-nums font-bold">
                    {p.liters} ({p.share}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${p.color} h-2 rounded-full`} style={{ width: `${p.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Delivery Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Route Delivery Efficiency</h3>
              <p className="text-xs text-slate-400 mt-0.5">On-time drop completion and customer satisfaction</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-3 text-xs">
            {[
              { route: 'Route 1 - Morning Baner', rider: 'Rahul Deshmukh', stops: 42, onTime: 98, rating: 4.9 },
              { route: 'Route 2 - Camp & Wanowrie', rider: 'Amit Shinde', stops: 34, onTime: 96, rating: 4.8 },
              { route: 'Route 3 - South Hub', rider: 'Sachin Kamble', stops: 28, onTime: 94, rating: 4.7 },
              { route: 'Route A - Commercial Bulk', rider: 'Rahul & Driver', stops: 8, onTime: 100, rating: 5.0 },
            ].map((r, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{r.route}</span>
                  <span className="text-emerald-700">{r.onTime}% On-Time</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Rider: {r.rider}</span>
                  <span>{r.stops} Stops | ★ {r.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
