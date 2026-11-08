'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Plus,
  Users,
  Building2,
  Settings2,
  Milk,
  DollarSign,
  CheckCircle2,
  Truck,
  History,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Customer, Subscription, DeliveryTask } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { AddSubscriptionModal } from '@/components/subscriptions/AddSubscriptionModal';
import { AddMilkModal } from '@/components/customers/AddMilkModal';
import { CollectPaymentModal } from '@/components/customers/CollectPaymentModal';
import { MonthEndWhatsAppModal } from '@/components/customers/MonthEndWhatsAppModal';
import { postCustomerWhatsAppReminderApi, postNotifyOwnerNewCustomerApi } from '@/lib/api';

export default function CustomersPage() {
  const { customers, subscriptions, deliveries, openModal, activeDairy, dairies, updateCustomer } = useDairyPulse();
  const [isEditingDairy, setIsEditingDairy] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0] || null);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);
  
  // Modal states for Add Milk, Collect Payment & Month-End WhatsApp
  const [isAddMilkOpen, setIsAddMilkOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isMonthEndModalOpen, setIsMonthEndModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedSelectedId, setCopiedSelectedId] = useState<string | null>(null);

  // Sync selected customer when active dairy changes or customers list updates
  React.useEffect(() => {
    if (customers.length > 0) {
      if (!selectedCust || !customers.some((c) => c.id === selectedCust.id)) {
        setSelectedCust(customers[0]);
      } else {
        // Refresh selected customer state if updated in list
        const refreshed = customers.find((c) => c.id === selectedCust.id);
        if (refreshed) setSelectedCust(refreshed);
      }
    } else {
      setSelectedCust(null);
    }
  }, [customers, selectedCust]);

  // Toast auto-clear
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalDues = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  const customersWithDuesCount = customers.filter((c) => c.balance > 0).length;
  const householdCount = customers.filter((c) => c.type === 'HOUSEHOLD').length;
  const commercialCount = customers.filter((c) => c.type === 'SHOP' || c.type === 'RESTAURANT').length;

  const filteredCustomers = customers.filter((c) => {
    if (filterType !== 'ALL' && c.type !== filterType) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) {
      return false;
    }
    return true;
  });

  // Calculate delivery stats for selected customer
  const custDeliveries = deliveries.filter(
    (d) =>
      (selectedCust && d.customerName && d.customerName.toLowerCase() === selectedCust.name.toLowerCase()) ||
      (selectedCust && d.customerPhone && d.customerPhone === selectedCust.phone)
  );

  const deliveredTasks = custDeliveries.filter((d) => d.status === 'Delivered');
  const totalDeliveredLiters = Math.round(deliveredTasks.reduce((sum, d) => sum + (d.quantityLiters || 0), 0) * 10) / 10;
  
  const customerSub = subscriptions.find(
    (s) => s.customerId === selectedCust?.id || s.customerName.toLowerCase() === selectedCust?.name.toLowerCase()
  );

  const handleOpenAddMilk = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalCustomer(cust);
    setIsAddMilkOpen(true);
  };

  const handleOpenCollectPayment = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalCustomer(cust);
    setIsCollectPaymentOpen(true);
  };

  const handleSendWhatsAppForSelected = async (cust: Customer) => {
    try {
      const res = await postCustomerWhatsAppReminderApi(cust.id);
      if (res) {
        if (res.whatsapp_url) {
          window.open(res.whatsapp_url, '_blank', 'noopener,noreferrer');
        }
        if (selectedCust && selectedCust.id === cust.id) {
          setSelectedCust({
            ...selectedCust,
            last_reminder_sent: res.last_reminder_sent,
            lastReminderSent: res.last_reminder_sent,
          });
        }
        setToastMessage(`📲 WhatsApp notice opened for ${cust.name}!`);
      }
    } catch (err) {
      console.error('Failed to send WhatsApp reminder:', err);
      setToastMessage('Error generating WhatsApp notice.');
    }
  };

  const handleCopyWhatsAppForSelected = async (cust: Customer) => {
    try {
      const res = await postCustomerWhatsAppReminderApi(cust.id);
      if (res && res.message_text) {
        navigator.clipboard.writeText(res.message_text);
        setCopiedSelectedId(cust.id);
        setTimeout(() => setCopiedSelectedId(null), 2500);
        setToastMessage(`📋 Copied WhatsApp bill text for ${cust.name}!`);
      }
    } catch (err) {
      console.error('Failed to copy WhatsApp reminder:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl shadow-xs text-xs font-semibold animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Management</h2>
            {activeDairy && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeDairy.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track milk delivered to each customer, add extra milk, and dispatch month-end payment reminders on WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month-End WhatsApp Broadcast Button */}
          <button
            onClick={() => setIsMonthEndModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition cursor-pointer"
            title="Send month-end WhatsApp payment reminders to all customers with dues"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Month-End WhatsApp Dues</span>
            {customersWithDuesCount > 0 && (
              <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {customersWithDuesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => openModal('addCustomer')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </section>

      {/* Month-End Payment Collection Banner */}
      {totalDues > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">Month-End WhatsApp Payment Notices Ready</span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                  ₹{totalDues.toLocaleString()} Outstanding
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {customersWithDuesCount} customer{customersWithDuesCount > 1 ? 's have' : ' has'} pending balances. Send 1-click WhatsApp bills with delivered liters and UPI pay link.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMonthEndModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast WhatsApp Dues</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Clients</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{customers.length}</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">Active directory</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Households</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{householdCount}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Daily subscribers</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Commercial</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-blue-600">
            {commercialCount}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Shops & cafes</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Remaining Payment</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-rose-600">
            ₹{totalDues.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-rose-500 font-medium mt-0.5 truncate">Pending from customers</p>
        </div>
      </section>

      {/* Main Customers Grid with Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === 'ALL' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('HOUSEHOLD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === 'HOUSEHOLD' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Households
              </button>
              <button
                onClick={() => setFilterType('SHOP')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === 'SHOP' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Shops (B2B)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Customer Name</th>
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Milk Delivered</th>
                  <th className="pb-2.5 font-medium">Remaining Payment</th>
                  <th className="pb-2.5 font-medium text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-sm text-slate-600">No customers registered yet</span>
                        <span className="text-xs text-slate-400">Click &apos;+ Add Customer&apos; above to begin</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isSelected = selectedCust?.id === c.id;
                    
                    // Customer-specific delivery metrics
                    const cTasks = deliveries.filter(
                      (d) =>
                        (d.customerName && d.customerName.toLowerCase() === c.name.toLowerCase()) ||
                        (d.customerPhone && d.customerPhone === c.phone)
                    );
                    const cDelivered = cTasks.filter((d) => d.status === 'Delivered');
                    const cDeliveredLiters = Math.round(cDelivered.reduce((sum, d) => sum + (d.quantityLiters || 0), 0) * 10) / 10;
                    const cSub = subscriptions.find((s) => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCust(c)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 font-semibold text-slate-800">
                          <div className="text-xs font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{c.address} • {c.phone}</div>
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.type === 'HOUSEHOLD'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Milk className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-extrabold text-slate-900 tabular-nums">
                              {cDeliveredLiters > 0 ? `${cDeliveredLiters}L` : cSub ? `${cSub.quantityLiters}L (Daily)` : '0L'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {cDelivered.length > 0 ? `(${cDelivered.length} stops)` : ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 font-bold tabular-nums">
                          {c.balance > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                              ₹{c.balance.toLocaleString()} Due
                            </span>
                          ) : c.balance < 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              ₹{Math.abs(c.balance)} Advance
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              ₹0 Cleared
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => handleOpenAddMilk(c, e)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Add milk to this customer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Milk</span>
                            </button>

                            {c.balance > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendWhatsAppForSelected(c);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Send WhatsApp bill reminder"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {c.balance > 0 && (
                              <button
                                onClick={(e) => handleOpenCollectPayment(c, e)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs"
                                title="Collect remaining payment"
                              >
                                Settle
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Profile Detail Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          {selectedCust ? (
            <>
              {/* Profile Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {selectedCust.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {selectedCust.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCust.type} Client • {selectedCust.area}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedCust.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedCust.status}
                </span>
              </div>

              {/* 1. HOW MANY MILK WAS DELIVERED CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Milk className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">Total Milk Delivered</span>
                      <div className="text-xl font-black text-slate-900 tabular-nums">
                        {totalDeliveredLiters > 0 ? `${totalDeliveredLiters} Liters` : customerSub ? `${customerSub.quantityLiters} Liters (Active)` : '0 Liters'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddMilk(selectedCust)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milk</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Daily Quota:{' '}
                    <strong className="text-slate-800 font-bold">
                      {customerSub ? `${customerSub.quantityLiters}L/day (${customerSub.productVariant})` : 'Spot Orders'}
                    </strong>
                  </span>
                  <span>
                    Delivered Stops: <strong className="text-slate-800 font-bold">{deliveredTasks.length}</strong>
                  </span>
                </div>

                {/* Delivery History Accordion / Toggle */}
                {custDeliveries.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{showHistory ? 'Hide Delivery History' : `View ${custDeliveries.length} Delivery Runs`}</span>
                    </button>

                    {showHistory && (
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {custDeliveries.slice(0, 5).map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-100 text-[11px]"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{d.quantityLiters}L {d.productVariant}</span>
                              <div className="text-[10px] text-slate-400">{d.deliveryDate || 'Today'} • {d.slot}</div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                d.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {d.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. REMAINING PAYMENT CARD */}
              <div
                className={`p-4 rounded-2xl border transition ${
                  selectedCust.balance > 0
                    ? 'bg-rose-50/90 border-rose-200'
                    : selectedCust.balance < 0
                    ? 'bg-blue-50/90 border-blue-200'
                    : 'bg-emerald-50/90 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      selectedCust.balance > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    Remaining Payment Due
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCust.balance > 0
                        ? 'bg-rose-200 text-rose-800'
                        : selectedCust.balance < 0
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {selectedCust.balance > 0 ? 'Payment Pending' : selectedCust.balance < 0 ? 'Advance Credit' : 'All Cleared'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl font-black tabular-nums">
                    {selectedCust.balance > 0 ? (
                      <span className="text-rose-700">₹{selectedCust.balance.toLocaleString()}</span>
                    ) : selectedCust.balance < 0 ? (
                      <span className="text-blue-700">₹{Math.abs(selectedCust.balance)}</span>
                    ) : (
                      <span className="text-emerald-700">₹0.00</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenCollectPayment(selectedCust)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 ${
                      selectedCust.balance > 0
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{selectedCust.balance > 0 ? 'Collect Payment' : 'Record Payment'}</span>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Billing Route: <strong className="text-slate-700 font-semibold">{selectedCust.route}</strong></span>
                  <span>Unit Price: <strong className="text-slate-700 font-semibold">₹{customerSub?.unitPrice || 62}/L</strong></span>
                </div>
              </div>

              {/* 3. MONTH-END WHATSAPP DUE NOTICE CARD */}
              {selectedCust.balance > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-emerald-900">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Month-End Notice</span>
                    </div>
                    {selectedCust.last_reminder_sent && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Sent: {selectedCust.last_reminder_sent}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-tight">
                    Send {selectedCust.name} an itemized monthly milk bill breakdown with 1-click UPI pay link.
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleSendWhatsAppForSelected(selectedCust)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send WhatsApp Bill</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                    </button>

                    <button
                      onClick={() => handleCopyWhatsAppForSelected(selectedCust)}
                      className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Copy WhatsApp bill text"
                    >
                      {copiedSelectedId === selectedCust.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="space-y-2.5 text-xs p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Dairy: <strong className="text-slate-800 font-semibold">{selectedCust.dairyName || activeDairy?.name || 'DairyPulse Farm HQ'}</strong></span>
                  </div>
                  {dairies && dairies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDairy(!isEditingDairy)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition cursor-pointer shrink-0 ml-2"
                      title="Change customer's supplying dairy farm"
                    >
                      {isEditingDairy ? 'Cancel' : 'Change Dairy'}
                    </button>
                  )}
                </div>

                {isEditingDairy && dairies && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5 animate-in fade-in">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Reassign Supplying Dairy:</span>
                    <select
                      value={selectedCust.dairyName || activeDairy?.name || ''}
                      onChange={async (e) => {
                        const newDairy = e.target.value;
                        const ok = await updateCustomer(selectedCust.id, { dairyName: newDairy });
                        if (ok) {
                          setSelectedCust({ ...selectedCust, dairyName: newDairy });
                          setToastMessage(`Supplying farm updated to ${newDairy}!`);
                          setIsEditingDairy(false);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {dairies.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.city || 'Pune'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${selectedCust.phone}`} className="font-semibold text-slate-800 hover:underline">
                    {selectedCust.phone}
                  </a>
                </div>
                {selectedCust.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{selectedCust.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedCust.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Joined {selectedCust.joinedDate}</span>
                </div>
              </div>

              {/* Customer Portal Login Credentials Box for Owner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-200/80 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-indigo-900">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customer Portal Login Info</span>
                  </div>
                </div>
               
                <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-100 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Login ID:</span>
                    <strong className="text-slate-900">{selectedCust.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Default Password:</span>
                    <strong className="text-indigo-700">cust123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Alternative:</span>
                    <span className="text-emerald-700 font-sans font-bold">SMS OTP Login</span>
                  </div>
                </div>
              </div>

              {/* Additional Action Buttons */}
              <div className="pt-1 flex flex-col gap-2">
                {selectedCust.type === 'HOUSEHOLD' && (
                  customerSub ? (
                    <button
                      onClick={() => setSelectedSubForManage(customerSub)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Manage Daily Milk (Skip / Vacation / Qty)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAddSubOpen(true)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Household Subscription</span>
                    </button>
                  )
                )}
                <button
                  onClick={() => openModal('generateBill')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
                </button>
                <button
                  onClick={async () => {
                    const res = await postNotifyOwnerNewCustomerApi(selectedCust.id);
                    if (res && res.owner_whatsapp_url) {
                      window.open(res.owner_whatsapp_url, '_blank', 'noopener,noreferrer');
                      setToastMessage(`📲 Forwarding ${selectedCust.name} alert to Owner WhatsApp!`);
                    } else {
                      setToastMessage(`Owner notified in Notification Center!`);
                    }
                  }}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="Forward new customer registration alert to Owner WhatsApp"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notify Owner on WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a customer to view their delivery history and ledger
            </div>
          )}
        </div>
      </div>

      {/* Add Milk Modal */}
      {modalCustomer && (
        <AddMilkModal
          isOpen={isAddMilkOpen}
          onClose={() => {
            setIsAddMilkOpen(false);
            setModalCustomer(null);
          }}
          customer={modalCustomer}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Collect Payment Modal */}
      {modalCustomer && (
        <CollectPaymentModal
          isOpen={isCollectPaymentOpen}
          onClose={() => {
            setIsCollectPaymentOpen(false);
            setModalCustomer(null);
          }}
          customer={modalCustomer}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Add Subscription Modal */}
      {selectedCust && (
        <AddSubscriptionModal
          isOpen={isAddSubOpen}
          onClose={() => setIsAddSubOpen(false)}
          preselectedCustomer={selectedCust}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Flexible Subscription Modal for Customer */}
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

      {/* Month-End WhatsApp Due Reminders Broadcast Modal */}
      <MonthEndWhatsAppModal
        isOpen={isMonthEndModalOpen}
        onClose={() => setIsMonthEndModalOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />
    </div>
  );
}
