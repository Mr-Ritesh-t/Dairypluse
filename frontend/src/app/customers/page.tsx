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
} from 'lucide-react';
import { Customer, Subscription } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';

export default function CustomersPage() {
  const { customers, subscriptions, openModal, activeDairy, dairies, setActiveDairy } = useDairyPulse();
  const [filterType, setFilterType] = useState<'ALL' | 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0] || null);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);

  // Sync selected customer when active dairy changes or customers list updates
  React.useEffect(() => {
    if (customers.length > 0) {
      if (!selectedCust || !customers.some((c) => c.id === selectedCust.id)) {
        setSelectedCust(customers[0]);
      }
    } else {
      setSelectedCust(null);
    }
  }, [customers, selectedCust]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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
            Maintain client directories, household subscriptions, shop credits, and outstanding balances.
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
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Recurring runs</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Commercial</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-blue-600">
            {commercialCount}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Shops & cafes</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Outstanding</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-rose-600">
            ₹{totalDues.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Net receivable</p>
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
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Customer Name</th>
                  <th className="pb-2.5 font-medium">Supplying Dairy</th>
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Phone</th>
                  <th className="pb-2.5 font-medium">Route / Area</th>
                  <th className="pb-2.5 font-medium">Balance</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-sm text-slate-600">No customers registered yet</span>
                        <span className="text-xs text-slate-400">Click &apos;+ Add Customer&apos; above or register from the Customer Portal to begin</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isSelected = selectedCust?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCust(c)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 font-semibold text-slate-800">
                          <div>{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{c.address}</div>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700 max-w-[130px] truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.dairyName || 'DairyPulse Farm HQ'}</span>
                          </span>
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
                        <td className="py-3.5 text-slate-600 font-medium">{c.phone}</td>
                        <td className="py-3.5 text-slate-600">{c.area}</td>
                        <td className="py-3.5 font-bold tabular-nums">
                          {c.balance > 0 ? (
                            <span className="text-rose-600">₹{c.balance.toLocaleString()} (Due)</span>
                          ) : c.balance < 0 ? (
                            <span className="text-emerald-600">₹{Math.abs(c.balance)} (Credit)</span>
                          ) : (
                            <span className="text-slate-400">₹0</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {c.status}
                          </span>
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
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          {selectedCust ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center shrink-0">
                  {selectedCust.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    {selectedCust.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedCust.type} Client</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
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
                  <span>Client since {selectedCust.joinedDate}</span>
                </div>
              </div>

              {/* Financial Balance Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">Current Account Balance</span>
                <div className="text-xl font-extrabold text-slate-900 tabular-nums">
                  {selectedCust.balance > 0 ? (
                    <span className="text-rose-600">₹{selectedCust.balance.toLocaleString()} Due</span>
                  ) : selectedCust.balance < 0 ? (
                    <span className="text-emerald-600">₹{Math.abs(selectedCust.balance)} Advance</span>
                  ) : (
                    <span className="text-emerald-700">₹0 Clear</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Route: {selectedCust.route}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {selectedCust.type === 'HOUSEHOLD' && (
                  <button
                    onClick={() => {
                      const sub: Subscription = subscriptions.find((s) => s.customerId === selectedCust.id) || {
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
                    <span>Manage Daily Milk (Skip / Extra / Qty)</span>
                  </button>
                )}
                <button
                  onClick={() => openModal('generateBill')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a customer to view their profile and ledger
            </div>
          )}
        </div>
      </div>

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
