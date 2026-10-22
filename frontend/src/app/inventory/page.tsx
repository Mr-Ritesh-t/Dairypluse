'use client';

import React, { useState } from 'react';
import {
  Milk,
  Plus,
  History,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { MilkVariant } from '@/types';

export default function MilkInventoryPage() {
  const { products, movements, openModal, recordWastage } = useDairyPulse();
  const [filterType, setFilterType] = useState<string>('ALL');

  const totalStock = products.reduce((acc, p) => acc + p.availableStock, 0);
  const totalReceivedToday = movements
    .filter((m) => m.type === 'RECEIPT')
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalDispatchedToday = movements
    .filter((m) => m.type === 'DISPATCH')
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalWastageToday = movements
    .filter((m) => m.type === 'WASTAGE')
    .reduce((acc, m) => acc + m.quantity, 0);

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-purpose="page-header">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Milk Inventory & Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track milk storage silos, daily farm intake, dispatches, and recorded wastage.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              const reason = prompt('Enter wastage reason (e.g. Spillage, Pouch leak, Testing):');
              const qty = prompt('Enter wastage in Liters:');
              if (reason && qty) {
                recordWastage('Cow Milk', parseFloat(qty) || 0, reason);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Log Wastage</span>
          </button>
          <button
            onClick={() => openModal('addStock')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milk Stock</span>
          </button>
        </div>
      </section>

      {/* 4 Metric KPI Cards (Stitch Exact UI) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-purpose="inventory-metrics">
        {/* Total Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Milk in Stock</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalStock.toLocaleString()} L
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Silos at 76% capacity</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Milk className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Received Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Milk Received Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalReceivedToday.toLocaleString()} L
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Morning intake batches</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dispatched Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Milk Dispatched Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalDispatchedToday.toLocaleString()} L
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Routes 1, 2, 3 and Bulk</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Wastage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Wastage / Loss Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-rose-600">
                {totalWastageToday} L
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">0.3% of total handling</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Stock by Variant Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Stock by Milk Variant & Silos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const percentage = Math.min(100, Math.round((p.availableStock / 2000) * 100));
            return (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{p.variant}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {p.availableStock} <span className="text-xs font-normal text-slate-400">Litres</span>
                  </div>
                  <div className="text-xs text-slate-500">₹{p.sellingPrice}/L</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        p.status === 'In Stock' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>FAT: {p.fatContent}% | SNF: {p.snfContent}%</span>
                    <span>Min: {p.lowStockThreshold}L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Movement Ledger Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Auditable Inventory Movement Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Traceable movements: farm intake, dispatch runs, wastage, and calibrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Transactions</option>
              <option value="RECEIPT">Intake Receipts</option>
              <option value="DISPATCH">Dispatches</option>
              <option value="WASTAGE">Wastage Logs</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Timestamp</th>
                <th className="pb-2.5 font-medium">Variant</th>
                <th className="pb-2.5 font-medium">Type</th>
                <th className="pb-2.5 font-medium text-center">Quantity</th>
                <th className="pb-2.5 font-medium">Source / Route</th>
                <th className="pb-2.5 font-medium">Notes & Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 font-semibold text-slate-700">
                    <div>{m.timestamp}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.date}</div>
                  </td>
                  <td className="py-3 font-semibold text-slate-800">{m.productVariant}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.type === 'RECEIPT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.type === 'DISPATCH'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-800 tabular-nums">
                    {m.type === 'RECEIPT' ? '+' : '-'} {m.quantity} L
                  </td>
                  <td className="py-3 font-medium text-slate-600">{m.supplierOrBatch}</td>
                  <td className="py-3 text-slate-500">
                    {m.notes || (m.ratePerLiter ? `₹${m.ratePerLiter}/L purchase cost` : 'Standard handling')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
