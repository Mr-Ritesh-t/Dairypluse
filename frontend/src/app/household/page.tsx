'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Calendar,
  Search,
  CheckCircle2,
  Settings2,
  Trash2,
  Milk,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { Subscription } from '@/types';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { AddSubscriptionModal } from '@/components/subscriptions/AddSubscriptionModal';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  Tabs,
} from '@/components/ui';

export default function HouseholdSubscriptionsPage() {
  const {
    subscriptions,
    toggleSubscriptionPause,
    deleteSubscription,
  } = useDairyPulse();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleDeleteSubscription = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel and remove the subscription for ${name}?`)) {
      await deleteSubscription(id);
      showToast(`Subscription for ${name} removed`);
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'All Plans', count: subscriptions.length },
    { id: 'ACTIVE', label: 'Active', count: activeCount },
    { id: 'PAUSED', label: 'Paused', count: pausedCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Household Subscriptions"
        description="Manage daily doorstep milk subscriptions, frequency schedules, morning/evening shifts, and pause dates."
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-[#0F766E] text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Household Subscriptions"
        description="Daily recurring doorstep milk subscriptions, morning/evening shifts, vacation holds, and extra milk requests."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Subscription
          </Button>
        }
      />

      {/* ── Summary KPI Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Subscribers"
          value={activeCount}
          subtitle="Daily morning doorstep deliveries"
          icon={<Users className="w-5 h-5" />}
          variant="teal"
          trend={{ value: 'Live', isPositive: true }}
        />

        <StatCard
          title="Committed Volume"
          value={`${totalDailyLiters.toFixed(1)} L`}
          subtitle="Daily required supply quota"
          icon={<Milk className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Daily', isPositive: true }}
        />

        <StatCard
          title="Paused Plans"
          value={pausedCount}
          subtitle="Temporary vacation holds"
          icon={<Calendar className="w-5 h-5" />}
          variant="amber"
          trend={{
            value: pausedCount > 0 ? `${pausedCount} On Hold` : '0 On Hold',
            isPositive: pausedCount === 0,
          }}
        />

        <StatCard
          title="Extra Requests"
          value={subscriptions.filter((s: any) => s.isExtraOrder || s.extraLitres).length}
          subtitle="Special festival add-ons"
          icon={<Sparkles className="w-5 h-5" />}
          variant="terracotta"
        />
      </section>

      {/* ── Subscriptions Table Card ── */}
      <Card
        title="Active Subscription Directory"
        subtitle="Customer plans, milk variants, daily quotas, and delivery schedules"
        headerClassName="flex-col sm:flex-row items-start sm:items-center gap-3"
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Tabs
              tabs={filterTabs}
              activeTab={filter}
              onChange={(id) => setFilter(id as any)}
              variant="pill"
              size="sm"
            />
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search subscriber..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                aria-label="Search subscriber"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]" aria-label="Subscriptions Table">
            <thead>
              <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Customer / Household</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Milk Variety</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-center">Daily Quota</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Delivery Slot</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Rate</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Status</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#F6F2EA] text-[#0F766E] flex items-center justify-center border border-stone-200">
                        <Milk className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm text-stone-800">No household subscriptions found</span>
                      <span className="text-xs text-stone-500 font-normal">
                        Start a recurring doorstep delivery plan for any household customer
                      </span>
                      <div className="mt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsAddModalOpen(true)}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                        >
                          + Add Household Subscription
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      <div className="font-bold text-stone-900">{sub.customerName}</div>
                      <div className="text-[10px] text-stone-500 font-normal">Active since {sub.startDate}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-700">{sub.productVariant}</td>
                    <td className="py-3 px-3 text-center font-extrabold text-stone-900 tabular-nums">
                      {sub.quantityLiters} Litres
                    </td>
                    <td className="py-3 px-3 text-stone-600">{sub.timeSlot}</td>
                    <td className="py-3 px-3 font-bold text-stone-800 tabular-nums">₹{sub.unitPrice}/L</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={sub.status === 'Active' ? 'success' : 'warning'}
                        dot
                        size="xs"
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedSubForManage(sub)}
                          leftIcon={<Settings2 className="w-3 h-3 text-stone-500" />}
                        >
                          Manage
                        </Button>
                        <Button
                          variant={sub.status === 'Active' ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => toggleSubscriptionPause(sub.id)}
                        >
                          {sub.status === 'Active' ? 'Pause' : 'Resume'}
                        </Button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id, sub.customerName)}
                          title="Delete subscription"
                          className="p-1.5 text-stone-400 hover:text-orange-700 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                          aria-label={`Delete subscription for ${sub.customerName}`}
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
      </Card>

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
