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
  History,
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { Customer, Subscription } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { AddSubscriptionModal } from '@/components/subscriptions/AddSubscriptionModal';
import { AddMilkModal } from '@/components/customers/AddMilkModal';
import { CollectPaymentModal } from '@/components/customers/CollectPaymentModal';
import { MonthEndWhatsAppModal } from '@/components/customers/MonthEndWhatsAppModal';
import { postCustomerWhatsAppReminderApi, postNotifyOwnerNewCustomerApi } from '@/lib/api';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  Tabs,
} from '@/components/ui';

export default function CustomersPage() {
  const {
    customers,
    subscriptions,
    deliveries,
    openModal,
    activeDairy,
    dairies,
    updateCustomer,
  } = useDairyPulse();

  const [isEditingDairy, setIsEditingDairy] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0] || null);
  const [selectedSubForManage, setSelectedSubForManage] = useState<Subscription | null>(null);

  // Modal states
  const [isAddMilkOpen, setIsAddMilkOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isMonthEndModalOpen, setIsMonthEndModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedSelectedId, setCopiedSelectedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (customers.length > 0) {
      if (!selectedCust || !customers.some((c) => c.id === selectedCust.id)) {
        setSelectedCust(customers[0]);
      } else {
        const refreshed = customers.find((c) => c.id === selectedCust.id);
        if (refreshed) setSelectedCust(refreshed);
      }
    } else {
      setSelectedCust(null);
    }
  }, [customers, selectedCust]);

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
    if (
      search &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.phone.includes(search)
    ) {
      return false;
    }
    return true;
  });

  const custDeliveries = deliveries.filter(
    (d) =>
      (selectedCust && d.customerName && d.customerName.toLowerCase() === selectedCust.name.toLowerCase()) ||
      (selectedCust && d.customerPhone && d.customerPhone === selectedCust.phone)
  );

  const deliveredTasks = custDeliveries.filter((d) => d.status === 'Delivered');
  const totalDeliveredLiters =
    Math.round(deliveredTasks.reduce((sum, d) => sum + (d.quantityLiters || 0), 0) * 10) / 10;

  const customerSub = subscriptions.find(
    (s) =>
      s.customerId === selectedCust?.id ||
      s.customerName.toLowerCase() === selectedCust?.name.toLowerCase()
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

  const customerFilterTabs = [
    { id: 'ALL', label: 'All Clients', count: customers.length },
    { id: 'HOUSEHOLD', label: 'Households', count: householdCount },
    { id: 'SHOP', label: 'Shops & Cafes', count: commercialCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Customer Directory"
        description="Complete customer roster, doorstep GPS coordinates, active subscriptions, and account balances."
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-[#0F766E] text-white font-semibold text-xs rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-teal-200 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Customer Directory & Accounts"
        description="Track doorstep milk dispatches, manage subscriptions, record daily milk intake, and send WhatsApp payment notices."
        badge={
          activeDairy ? (
            <Badge variant="teal" size="sm">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              {activeDairy.name}
            </Badge>
          ) : undefined
        }
        actions={
          <>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setIsMonthEndModalOpen(true)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              rightIcon={
                customersWithDuesCount > 0 ? (
                  <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {customersWithDuesCount}
                  </span>
                ) : undefined
              }
            >
              Month-End WhatsApp Dues
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('addCustomer')}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add New Customer
            </Button>
          </>
        }
      />

      {/* ── Month-End Broadcast Banner ── */}
      {totalDues > 0 && (
        <div className="p-4 bg-gradient-to-r from-teal-500/10 via-amber-500/10 to-orange-500/10 border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-stone-900">
                  Month-End WhatsApp Payment Notices Ready
                </span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-200">
                  ₹{totalDues.toLocaleString()} Outstanding
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5 font-normal">
                {customersWithDuesCount} customer{customersWithDuesCount > 1 ? 's have' : ' has'} pending balances. Send 1-click WhatsApp bills with delivered liters and UPI pay link.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsMonthEndModalOpen(true)}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Broadcast WhatsApp Dues
          </Button>
        </div>
      )}

      {/* ── KPI Metrics Grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Directory"
          value={customers.length}
          subtitle="Registered farm subscribers"
          icon={<Users className="w-5 h-5" />}
          variant="teal"
        />

        <StatCard
          title="Households"
          value={householdCount}
          subtitle="Doorstep milk subscriptions"
          icon={<Milk className="w-5 h-5" />}
          variant="blue"
        />

        <StatCard
          title="Commercial Accounts"
          value={commercialCount}
          subtitle="Bakeries, cafes, sweet shops"
          icon={<Building2 className="w-5 h-5" />}
          variant="amber"
        />

        <StatCard
          title="Total Dues Pending"
          value={`₹${totalDues.toLocaleString()}`}
          subtitle={`${customersWithDuesCount} accounts with pending balance`}
          icon={<CreditCard className="w-5 h-5" />}
          variant="terracotta"
          trend={{
            value: totalDues > 0 ? 'Dues' : 'Clear',
            isPositive: totalDues === 0,
          }}
        />
      </section>

      {/* ── Main Split View: Customer Table (8 cols) & Detail Drawer (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table View */}
        <div className="lg:col-span-8">
          <Card
            title="Customer Registry"
            subtitle="All households, shops, and restaurants"
            headerClassName="flex-col sm:flex-row items-start sm:items-center gap-3"
            action={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Tabs
                  tabs={customerFilterTabs}
                  activeTab={filterType}
                  onChange={(t) => setFilterType(t as any)}
                  variant="pill"
                  size="sm"
                />
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                    aria-label="Search customer"
                  />
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs min-w-[660px]" aria-label="Customers Table">
                <thead>
                  <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                    <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Customer</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Type</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Milk Delivered</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Balance</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-stone-300" />
                          <span className="font-bold text-sm text-stone-800">No customers found</span>
                          <span className="text-xs text-stone-500 font-normal">
                            Click &apos;Add New Customer&apos; above to begin
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const isSelected = selectedCust?.id === c.id;
                      const cTasks = deliveries.filter(
                        (d) =>
                          (d.customerName && d.customerName.toLowerCase() === c.name.toLowerCase()) ||
                          (d.customerPhone && d.customerPhone === c.phone)
                      );
                      const cDelivered = cTasks.filter((d) => d.status === 'Delivered');
                      const cDeliveredLiters =
                        Math.round(cDelivered.reduce((sum, d) => sum + (d.quantityLiters || 0), 0) * 10) / 10;
                      const cSub = subscriptions.find(
                        (s) =>
                          s.customerId === c.id ||
                          s.customerName.toLowerCase() === c.name.toLowerCase()
                      );

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCust(c)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/70' : 'hover:bg-stone-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 font-semibold text-stone-800">
                            <div className="font-bold text-stone-900">{c.name}</div>
                            <div className="text-[10px] text-stone-500 font-normal">
                              {c.address} •{' '}
                              <a
                                href={`tel:${c.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline text-[#0F766E] font-medium"
                              >
                                {c.phone}
                              </a>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <Badge variant={c.type === 'HOUSEHOLD' ? 'teal' : 'info'} size="xs">
                              {c.type}
                            </Badge>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <Milk className="w-3.5 h-3.5 text-[#0F766E]" />
                              <span className="font-extrabold text-stone-900 tabular-nums">
                                {cDeliveredLiters > 0
                                  ? `${cDeliveredLiters}L`
                                  : cSub
                                  ? `${cSub.quantityLiters}L (Daily)`
                                  : '0L'}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {cDelivered.length > 0 ? `(${cDelivered.length} stops)` : ''}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-bold tabular-nums">
                            {c.balance > 0 ? (
                              <Badge variant="danger" size="xs">
                                ₹{c.balance.toLocaleString()} Due
                              </Badge>
                            ) : c.balance < 0 ? (
                              <Badge variant="info" size="xs">
                                ₹{Math.abs(c.balance)} Advance
                              </Badge>
                            ) : (
                              <Badge variant="success" size="xs">
                                ₹0 Clear
                              </Badge>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => handleOpenAddMilk(c, e)}
                                leftIcon={<Plus className="w-3 h-3 text-[#0F766E]" />}
                              >
                                Add Milk
                              </Button>

                              {c.balance > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendWhatsAppForSelected(c);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Send WhatsApp bill reminder"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                              )}

                              {c.balance > 0 && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => handleOpenCollectPayment(c, e)}
                                >
                                  Settle
                                </Button>
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
          </Card>
        </div>

        {/* Selected Customer Profile Drawer */}
        <div className="lg:col-span-4">
          <Card
            title={selectedCust ? selectedCust.name : 'Customer Profile'}
            subtitle={selectedCust ? `${selectedCust.type} • ${selectedCust.area}` : 'Select a customer'}
          >
            {selectedCust ? (
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {selectedCust.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 leading-tight">
                        {selectedCust.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Route: <span className="font-semibold text-stone-700">{selectedCust.route}</span>
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={selectedCust.status === 'Active' ? 'success' : 'warning'}
                    dot
                    size="xs"
                  >
                    {selectedCust.status}
                  </Badge>
                </div>

                {/* Delivered Milk Card */}
                <div className="p-3.5 rounded-2xl bg-[#F6F2EA] border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
                        <Milk className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                          Total Milk Delivered
                        </span>
                        <div className="text-lg font-black text-stone-900 tabular-nums">
                          {totalDeliveredLiters > 0
                            ? `${totalDeliveredLiters} Litres`
                            : customerSub
                            ? `${customerSub.quantityLiters} L (Active Plan)`
                            : '0 Litres'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAddMilk(selectedCust)}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600 font-medium">
                    <span>
                      Daily Plan:{' '}
                      <strong className="text-stone-900 font-bold">
                        {customerSub
                          ? `${customerSub.quantityLiters}L/day (${customerSub.productVariant})`
                          : 'Spot Orders'}
                      </strong>
                    </span>
                    <span>
                      Stops: <strong className="text-stone-900 font-bold">{deliveredTasks.length}</strong>
                    </span>
                  </div>

                  {custDeliveries.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[11px] font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>
                          {showHistory
                            ? 'Hide Delivery Runs'
                            : `View ${custDeliveries.length} Delivery Runs`}
                        </span>
                      </button>

                      {showHistory && (
                        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {custDeliveries.slice(0, 5).map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-stone-900">
                                  {d.quantityLiters}L {d.productVariant}
                                </span>
                                <div className="text-[10px] text-stone-500">
                                  {d.deliveryDate || 'Today'} • {d.slot}
                                </div>
                              </div>
                              <Badge
                                variant={d.status === 'Delivered' ? 'success' : 'warning'}
                                size="xs"
                              >
                                {d.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Remaining Payment Due Card */}
                <div
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    selectedCust.balance > 0
                      ? 'bg-orange-50/80 border-orange-200'
                      : selectedCust.balance < 0
                      ? 'bg-sky-50/80 border-sky-200'
                      : 'bg-emerald-50/80 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        selectedCust.balance > 0 ? 'text-orange-900' : 'text-emerald-800'
                      }`}
                    >
                      Remaining Payment Due
                    </span>
                    <Badge
                      variant={
                        selectedCust.balance > 0
                          ? 'danger'
                          : selectedCust.balance < 0
                          ? 'info'
                          : 'success'
                      }
                      size="xs"
                    >
                      {selectedCust.balance > 0
                        ? 'Payment Pending'
                        : selectedCust.balance < 0
                        ? 'Advance Credit'
                        : 'Cleared'}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className="text-xl font-black tabular-nums">
                      {selectedCust.balance > 0 ? (
                        <span className="text-orange-950">₹{selectedCust.balance.toLocaleString()}</span>
                      ) : selectedCust.balance < 0 ? (
                        <span className="text-sky-950">₹{Math.abs(selectedCust.balance)}</span>
                      ) : (
                        <span className="text-emerald-950">₹0.00</span>
                      )}
                    </div>

                    <Button
                      variant={selectedCust.balance > 0 ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenCollectPayment(selectedCust)}
                      leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    >
                      {selectedCust.balance > 0 ? 'Collect' : 'Record'}
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Notice Card if balance > 0 */}
                {selectedCust.balance > 0 && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200/90 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-teal-900">
                        <MessageSquare className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>WhatsApp Month-End Notice</span>
                      </div>
                      {selectedCust.last_reminder_sent && (
                        <span className="text-[10px] text-stone-500 font-medium">
                          Sent: {selectedCust.last_reminder_sent}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 font-normal leading-tight">
                      Send {selectedCust.name} an itemized monthly milk bill breakdown with 1-click UPI pay link.
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSendWhatsAppForSelected(selectedCust)}
                        leftIcon={<Send className="w-3 h-3" />}
                        rightIcon={<ExternalLink className="w-3 h-3 opacity-75" />}
                      >
                        Send WhatsApp Bill
                      </Button>
                      <button
                        onClick={() => handleCopyWhatsAppForSelected(selectedCust)}
                        className="p-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                        title="Copy WhatsApp bill text"
                        aria-label="Copy WhatsApp bill"
                      >
                        {copiedSelectedId === selectedCust.id ? (
                          <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-xs p-3.5 rounded-2xl bg-[#F6F2EA] border border-stone-200/70">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                    <a href={`tel:${selectedCust.phone}`} className="font-semibold text-stone-900 hover:underline">
                      {selectedCust.phone}
                    </a>
                  </div>
                  {selectedCust.email && (
                    <div className="flex items-center gap-2 text-stone-700">
                      <Mail className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <a href={`mailto:${selectedCust.email}`} className="font-semibold text-stone-900 hover:underline">
                        {selectedCust.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                    <span>{selectedCust.address}</span>
                  </div>
                </div>

                {/* Additional Buttons */}
                <div className="space-y-2 pt-1">
                  {selectedCust.type === 'HOUSEHOLD' && (
                    customerSub ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedSubForManage(customerSub)}
                        leftIcon={<Settings2 className="w-3.5 h-3.5 text-stone-500" />}
                      >
                        Manage Daily Milk Plan
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsAddSubOpen(true)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        + Add Household Subscription
                      </Button>
                    )
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => openModal('generateBill')}
                    leftIcon={<CreditCard className="w-3.5 h-3.5 text-stone-500" />}
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs">
                Select a customer to view their delivery history and ledger
              </div>
            )}
          </Card>
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
