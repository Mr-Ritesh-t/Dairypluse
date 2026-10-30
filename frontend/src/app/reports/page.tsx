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
  const { products, invoices, expenses, deliveries, shopOrders } = useDairyPulse();

  const invoiceRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const shopRevenue = shopOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalRevenue = invoiceRevenue + shopRevenue;
  const totalLitersSold = deliveries
    .filter((d) => d.status === 'Delivered')
    .reduce((acc, d) => acc + d.quantityLiters, 0);
  const totalCost = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netEstimatedProfit = totalRevenue - totalCost;

  const handleExportCsv = () => {
    const rows = [
      ['DairyPulse Enterprise Operational & Financial Report'],
      ['Generated On', new Date().toLocaleDateString('en-IN')],
      [],
      ['=== INVOICES SUMMARY ==='],
      ['Invoice Number', 'Customer', 'Type', 'Period', 'Amount (INR)', 'Paid (INR)', 'Status'],
      ...invoices.map((inv) => [
        inv.invoiceNumber,
        `"${inv.customerName}"`,
        inv.customerType,
        `"${inv.billingPeriod}"`,
        inv.totalAmount,
        inv.paidAmount,
        inv.status,
      ]),
      [],
      ['=== EXPENSES SUMMARY ==='],
      ['Category', 'Amount (INR)', 'Vendor', 'Date', 'Payment Method'],
      ...expenses.map((e) => [
        `"${e.category}"`,
        e.amount,
        `"${e.vendor}"`,
        e.date,
        e.paymentMethod,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dairypulse_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </section>

      {/* Macro Performance Indicators (Stitch Exact UI) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Gross Revenue</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums truncate">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">
            {totalRevenue > 0 ? 'Recorded receipts' : 'No collections'}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Sold</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums truncate">
            {totalLitersSold.toLocaleString()} L
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {totalLitersSold > 0 ? 'Delivered across routes' : 'Awaiting runs'}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Expenses</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums truncate">
            ₹{totalCost.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Procurement & feed</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Net Profit</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums truncate">
            ₹{netEstimatedProfit.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
            {totalRevenue > 0 ? `${Math.round((netEstimatedProfit / totalRevenue) * 100)}% Margin` : 'Net balance'}
          </p>
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
