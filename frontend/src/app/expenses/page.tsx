'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  TrendingDown,
  Calendar,
  Filter,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function ExpensesPage() {
  const { expenses, openModal } = useDairyPulse();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === 'ALL') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expense Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Log farm operational expenses, cattle feed procurement, logistics, utilities, and packaging.
          </p>
        </div>
        <button
          onClick={() => openModal('addExpense')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Monthly Expenses</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalExpense.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across operational categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Logged Expense Entries</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {expenses.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {expenses.length === 1 ? '1 active transaction' : `${expenses.length} active transactions`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Active Categories</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {new Set(expenses.map((e) => e.category)).size}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Feed, utilities, fuel & logistics</p>
        </div>
      </section>

      {/* Expenses Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recorded Expense Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Categorized accounting log for P&L tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Cattle Feed">Cattle Feed</option>
              <option value="Fuel & Transport">Fuel & Transport</option>
              <option value="Cold Storage Electricity">Cold Storage Electricity</option>
              <option value="Packaging Pouches">Packaging Pouches</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Date</th>
                <th className="pb-2.5 font-medium">Category</th>
                <th className="pb-2.5 font-medium">Vendor / Payee</th>
                <th className="pb-2.5 font-medium">Payment Mode</th>
                <th className="pb-2.5 font-medium">Notes & Invoice Ref</th>
                <th className="pb-2.5 font-medium text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="font-semibold text-sm text-slate-600">No operational expenses logged yet</span>
                      <span className="text-xs text-slate-400">Click &apos;+ Record Expense&apos; above to log feed, fuel, or packaging costs</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-semibold text-slate-700">{exp.date}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">{exp.vendor}</td>
                    <td className="py-3.5 text-slate-600">{exp.paymentMethod}</td>
                    <td className="py-3.5 text-slate-500">{exp.notes || '—'}</td>
                    <td className="py-3.5 text-right font-extrabold text-slate-900 tabular-nums">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
