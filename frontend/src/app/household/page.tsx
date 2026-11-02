'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  AlertCircle,
  Milk,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { MilkVariant, Subscription } from '@/types';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { AddSubscriptionModal } from '@/components/subscriptions/AddSubscriptionModal';

export default function HouseholdSubscriptionsPage() {
  const {
    subscriptions,
    toggleSubscriptionPause,
    deleteSubscription,
    addSubscription,
    customers,
    products,
    activeDairy,
  } = useDairyPulse();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Inline Subscription Form state
  const householdCustomers = customers.filter((c) => c.type === 'HOUSEHOLD');
  const candidateCustomers = householdCustomers.length > 0 ? householdCustomers : customers;

  const [subCustomer, setSubCustomer] = useState(candidateCustomers[0]?.id || '');
  const [subVariant, setSubVariant] = useState<MilkVariant>(products[0]?.variant || 'Cow Milk');
  const [subQty, setSubQty] = useState('1.0');
  const [subSlot, setSubSlot] = useState<
    'Morning (6:00 AM - 7:30 AM)' | 'Evening (5:30 PM - 7:00 PM)' | 'Both'
  >('Morning (6:00 AM - 7:30 AM)');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Sync subCustomer when candidate customers load
  useEffect(() => {
    if (candidateCustomers.length > 0) {
      if (!subCustomer || !candidateCustomers.some((c) => c.id === subCustomer)) {
        setSubCustomer(candidateCustomers[0].id);
      }
    }
  }, [customers]);

  // Sync subVariant when products load
  useEffect(() => {
    if (products && products.length > 0 && !products.some((p) => p.variant === subVariant)) {
      setSubVariant(products[0].variant);
    }
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCustomer) {
      alert('Please select a customer.');
      return;
    }
    const cust = customers.find((c) => c.id === subCustomer) || candidateCustomers[0];
    if (!cust) {
      alert('Customer not found.');
      return;
    }
    const qty = parseFloat(subQty) || 1.0;
    const matchedProd = products.find((p) => p.variant === subVariant);
    const unitPrice =
      matchedProd?.sellingPrice ||
      (subVariant === 'Buffalo Milk' ? 78 : subVariant === 'A2 Desi Cow Milk' ? 95 : subVariant === 'Toned Milk' ? 54 : 62);
    const targetDairy = cust.dairyName || activeDairy?.name || 'DairyPulse Farm HQ';

    setIsSubmittingQuick(true);
    try {
      const res = await addSubscription({
        customerId: cust.id,
        customerName: cust.name,
        productVariant: subVariant,
        quantityLiters: qty,
        timeSlot: subSlot,
        frequency: 'Daily',
        unitPrice: unitPrice,
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        dairyName: targetDairy,
      });

      if (res) {
        showToast(`Subscription created for ${cust.name} (${qty}L / day)`);
        setShowAddForm(false);
      }
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const handleDeleteSubscription = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel and remove the subscription for ${name}?`)) {
      await deleteSubscription(id);
      showToast(`Subscription for ${name} removed`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Household Subscriptions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage daily recurring doorstep milk subscriptions, vacation pauses, and extra milk requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </button>
        </div>
      </section>

      {/* Summary KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Subscribers</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{activeCount}</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
            {activeCount > 0 ? 'Daily morning doorstep' : 'No subscribers'}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Committed Volume</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalDailyLiters.toFixed(1)} L
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
            {totalDailyLiters > 0 ? 'Morning & Evening' : 'No committed vol'}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Paused Plans</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-amber-600">
            {pausedCount}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Vacation hold</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Extra Requests</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-blue-600">
            {subscriptions.filter((s: any) => s.isExtraOrder || s.extraLitres).length}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Festival add-ons</p>
        </div>
      </section>

      {/* Subscriptions Table */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
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

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]">
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
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Milk className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 block">No household subscriptions found</span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          Start a recurring doorstep delivery plan for any household customer
                        </span>
                      </div>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Household Subscription</span>
                      </button>
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                            sub.status === 'Active'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {sub.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id, sub.customerName)}
                          title="Delete subscription"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

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
