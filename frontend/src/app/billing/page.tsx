'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  DollarSign,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function BillingPaymentsPage() {
  const { invoices, recordPayment, openModal } = useDairyPulse();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const outstanding = totalInvoiced - totalCollected;
  const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
    if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Payments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Automate monthly billing cycles, track customer ledgers, and log full/partial payments.
          </p>
        </div>
        <button
          onClick={() => openModal('generateBill')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </section>

      {/* KPI Cards (Stitch Exact UI) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Invoiced (This Month)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalInvoiced.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across 124 subscriber bills</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Payments Collected</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            ₹{totalCollected.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% recovery rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Outstanding Balance</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{outstanding.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Pending client receipts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Overdue Accounts</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1 tabular-nums">{overdueCount}</h3>
          <p className="text-[11px] text-rose-500 mt-1">Requires payment reminder</p>
        </div>
      </section>

      {/* Invoices Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {['ALL', 'Paid', 'Partial', 'Unpaid', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === st ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All Invoices' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Invoice #</th>
                <th className="pb-2.5 font-medium">Customer / Client</th>
                <th className="pb-2.5 font-medium">Billing Period</th>
                <th className="pb-2.5 font-medium">Total Bill</th>
                <th className="pb-2.5 font-medium">Paid</th>
                <th className="pb-2.5 font-medium">Due Date</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const balanceDue = inv.totalAmount - inv.paidAmount;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-bold text-emerald-700">{inv.invoiceNumber}</td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      <div>{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{inv.customerType}</div>
                    </td>
                    <td className="py-3.5 text-slate-600">{inv.billingPeriod}</td>
                    <td className="py-3.5 font-extrabold text-slate-900 tabular-nums">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-700 tabular-nums">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'Partial'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      {balanceDue > 0 && (
                        <button
                          onClick={() => {
                            const amt = prompt(`Record payment for ${inv.invoiceNumber} (Due: ₹${balanceDue}):`, balanceDue.toString());
                            if (amt) {
                              recordPayment(inv.id, parseFloat(amt) || 0);
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber}...`)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition inline-block align-middle cursor-pointer"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
