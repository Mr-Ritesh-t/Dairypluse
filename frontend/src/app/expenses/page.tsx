'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  Calendar,
  Layers,
  ArrowDownRight,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
} from '@/components/ui';

export default function ExpensesPage() {
  const { expenses, openModal } = useDairyPulse();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === 'ALL') return true;
    return e.category === selectedCategory;
  });

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Cattle Feed':
        return 'amber';
      case 'Fuel & Transport':
        return 'info';
      case 'Cold Storage Electricity':
        return 'teal';
      case 'Packaging Pouches':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Farm Expenses Ledger"
        description="Record operating expenses for cattle feed, fodder, veterinary care, diesel, packaging, and maintenance."
      />

      {/* ── Page Header ── */}
      <PageHeader
        title="Farm Operating Expenses"
        description="Log farm operating costs, cattle feed procurement, logistics, cold storage electricity, and packaging supplies."
        actions={
          <Button
            variant="danger"
            size="sm"
            onClick={() => openModal('addExpense')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Record Expense
          </Button>
        }
      />

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Monthly Operating Costs"
          value={`₹${totalExpense.toLocaleString()}`}
          subtitle="Across all logged farm categories"
          icon={<Receipt className="w-5 h-5" />}
          variant="terracotta"
          trend={{ value: 'Cost', isPositive: false }}
        />

        <StatCard
          title="Logged Transactions"
          value={expenses.length}
          subtitle={expenses.length === 1 ? '1 active expense entry' : `${expenses.length} active expense entries`}
          icon={<Layers className="w-5 h-5" />}
          variant="teal"
          trend={{ value: 'Ledger', isPositive: true }}
        />

        <StatCard
          title="Cost Categories"
          value={new Set(expenses.map((e) => e.category)).size}
          subtitle="Feed, utilities, fuel & logistics"
          icon={<ArrowDownRight className="w-5 h-5" />}
          variant="amber"
        />
      </section>

      {/* ── Expenses Ledger Table ── */}
      <Card
        title="Expense Register"
        subtitle="Audited ledger for farm P&L calculations and cost control"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
              aria-label="Filter expense category"
            >
              <option value="ALL">All Categories</option>
              <option value="Cattle Feed">Cattle Feed</option>
              <option value="Fuel & Transport">Fuel & Transport</option>
              <option value="Cold Storage Electricity">Cold Storage Electricity</option>
              <option value="Packaging Pouches">Packaging Pouches</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]" aria-label="Expenses Table">
            <thead>
              <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Date</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Category</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Vendor / Payee</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Payment Mode</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Notes & Ref</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 text-stone-300" />
                      <span className="font-bold text-sm text-stone-800">No operational expenses logged yet</span>
                      <span className="text-xs text-stone-500 font-normal">
                        Click &apos;Record Expense&apos; above to log feed, fuel, or packaging costs
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-700">{exp.date}</td>
                    <td className="py-3 px-3">
                      <Badge variant={getCategoryBadgeVariant(exp.category) as any} size="xs">
                        {exp.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">{exp.vendor}</td>
                    <td className="py-3 px-3 text-stone-600 font-medium">{exp.paymentMethod}</td>
                    <td className="py-3 px-3 text-stone-500">{exp.notes || '—'}</td>
                    <td className="py-3 px-3 text-right font-black text-stone-900 tabular-nums">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
