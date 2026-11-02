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
} from 'lucide-react';
import { Customer, Subscription, DeliveryTask } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { AddMilkModal } from '@/components/customers/AddMilkModal';
import { CollectPaymentModal } from '@/components/customers/CollectPaymentModal';

export default function CustomersPage() {
  const { customers, subscriptions, deliveries, openModal, activeDairy, dairies, setActiveDairy } = useDairyPulse();
  const [filterType, setFilterType] = useState<'ALL' | 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0] || null);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);
  
  // Modal states for Add Milk & Collect Payment
  const [isAddMilkOpen, setIsAddMilkOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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
  const totalScheduledLiters = Math.round(custDeliveries.reduce((sum, d) => sum + (d.quantityLiters || 0), 0) * 10) / 10;
  
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
            Track milk delivered to each customer, add extra milk, and monitor remaining payments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dairies.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
              <Building2 className="w-4 h-4 text-slate-500" />
              <select
                value={activeDairy?.name || ''}
                onChange={(e) => {
                  const d = dairies.find((dairy) => dairy.name === e.target.value);
                  if (d) setActiveDairy(d);
                }}
                className="bg-transparent text-xs font-bold text-slate-700 border-none focus:outline-none cursor-pointer"
              >
                {dairies.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.city ? `(${d.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => openModal('addCustomer')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </section>

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

              {/* Customer Contact Details */}
              <div className="space-y-2.5 text-xs p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dairy: <strong className="text-slate-800 font-semibold">{selectedCust.dairyName || activeDairy?.name || 'DairyPulse Farm HQ'}</strong></span>
                </div>
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

              {/* Additional Action Buttons */}
              <div className="pt-1 flex flex-col gap-2">
                {selectedCust.type === 'HOUSEHOLD' && (
                  <button
                    onClick={() => {
                      const sub: Subscription = customerSub || {
                        id: `sub-${selectedCust.id}`,
                        customerId: selectedCust.id,
                        customerName: selectedCust.name,
                        productVariant: 'Cow Milk',
                        quantityLiters: 1.5,
                        frequency: 'Daily',
                        timeSlot: 'Morning (6:00 AM - 7:30 AM)',
                        unitPrice: 62.0,
                        status: 'Active',
                        startDate: '2026-09-01',
                      };
                      setSelectedSubForManage(sub);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage Daily Milk (Skip / Vacation / Qty)</span>
                  </button>
                )}
                <button
                  onClick={() => openModal('generateBill')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
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
    </div>
  );
}
