'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Pause,
  Play,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings2,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { MilkVariant, Subscription } from '@/types';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';

export default function HouseholdSubscriptionsPage() {
  const { subscriptions, toggleSubscriptionPause, addSubscription, customers } = useDairyPulse();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);

  // New Subscription state
  const [subCustomer, setSubCustomer] = useState(customers[1]?.id || '');
  const [subVariant, setSubVariant] = useState<MilkVariant>('Cow Milk');
  const [subQty, setSubQty] = useState('1.0');
  const [subSlot, setSubSlot] = useState<'Morning (6:00 AM - 7:30 AM)' | 'Evening (5:30 PM - 7:00 PM)' | 'Both'>('Morning (6:00 AM - 7:30 AM)');

  const activeCount = subscriptions.filter((s) => s.status === 'Active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'Paused').length;
  const totalDailyLiters = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + s.quantityLiters, 0);

  const filteredSubs = subscriptions.filter((s) => {
    if (filter === 'ACTIVE' && s.status !== 'Active') return false;
    if (filter === 'PAUSED' && s.status !== 'Paused') return false;
    if (search && !s.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Household Subscriptions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage daily recurring doorstep milk subscriptions, vacation pauses, and extra milk requests.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </section>

      {/* Summary KPI Cards (Stitch Exact) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Active Subscribers</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{activeCount}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {activeCount > 0 ? 'Daily morning doorstep run' : 'No active subscribers'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Committed Daily Volume</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalDailyLiters.toFixed(1)} L
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalDailyLiters > 0 ? 'Morning & Evening dispatch' : 'No recurring volume committed'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Paused (On Vacation)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-amber-600">
            {pausedCount}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Temporary hold active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Extra Milk Requests</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-blue-600">
            {subscriptions.filter((s: any) => s.isExtraOrder || s.extraLitres).length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Festival & guest add-ons</p>
        </div>
      </section>

      {/* New Subscription Form Drawer */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-100">
          <h3 className="font-bold text-sm text-slate-900">Create New Subscription Plan</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const cust = customers.find((c) => c.id === subCustomer);
              addSubscription({
                customerId: subCustomer,
                customerName: cust?.name || 'New Subscriber',
                productVariant: subVariant,
                quantityLiters: parseFloat(subQty) || 1.0,
                timeSlot: subSlot,
                frequency: 'Daily',
                unitPrice: subVariant === 'Buffalo Milk' ? 78 : subVariant === 'A2 Desi Cow Milk' ? 95 : 62,
                startDate: new Date().toISOString().split('T')[0],
                status: 'Active',
              });
              setShowAddForm(false);
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
              <select
                value={subCustomer}
                onChange={(e) => setSubCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {customers
                  .filter((c) => c.type === 'HOUSEHOLD')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.area}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variant</label>
              <select
                value={subVariant}
                onChange={(e) => setSubVariant(e.target.value as MilkVariant)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Cow Milk">Cow Milk (₹62/L)</option>
                <option value="Buffalo Milk">Buffalo Milk (₹78/L)</option>
                <option value="Toned Milk">Toned Milk (₹54/L)</option>
                <option value="A2 Desi Cow Milk">A2 Desi Cow Milk (₹95/L)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (L/day)</label>
              <input
                type="number"
                step="0.5"
                value={subQty}
                onChange={(e) => setSubQty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirm Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === 'ALL' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Plans ({subscriptions.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('PAUSED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === 'PAUSED' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paused ({pausedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscriber..."
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
                <th className="pb-2.5 font-medium">Customer / Household</th>
                <th className="pb-2.5 font-medium">Milk Variant</th>
                <th className="pb-2.5 font-medium text-center">Daily Quota</th>
                <th className="pb-2.5 font-medium">Delivery Slot</th>
                <th className="pb-2.5 font-medium">Rate</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-sm text-slate-600">No household subscriptions yet</span>
                      <span className="text-xs text-slate-400">Click &apos;+ New Subscription&apos; above or subscribe customers from their profiles</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 font-semibold text-slate-800">
                    <div>{sub.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Active since {sub.startDate}</div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-700">{sub.productVariant}</td>
                  <td className="py-3.5 text-center font-bold text-slate-900 tabular-nums">
                    {sub.quantityLiters} Liters
                  </td>
                  <td className="py-3.5 text-slate-600">{sub.timeSlot}</td>
                  <td className="py-3.5 font-semibold text-slate-800">₹{sub.unitPrice}/L</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        sub.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      ></span>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSubForManage(sub)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Settings2 className="w-3 h-3 text-slate-500" />
                        <span>Manage</span>
                      </button>
                      <button
                        onClick={() => toggleSubscriptionPause(sub.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          sub.status === 'Active'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sub.status === 'Active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Flexible Subscription Modal */}
      {selectedSubForManage && (
        <FlexibleSubscriptionModal
          isOpen={!!selectedSubForManage}
          onClose={() => setSelectedSubForManage(null)}
          subscriptionId={selectedSubForManage.id}
          customerName={selectedSubForManage.customerName}
          currentQuantity={selectedSubForManage.quantityLiters}
          productVariant={selectedSubForManage.productVariant}
          unitPrice={selectedSubForManage.unitPrice}
        />
      )}
    </div>
  );
}

