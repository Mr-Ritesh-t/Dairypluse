'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Store,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { ShopOrder } from '@/types';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  Tabs,
} from '@/components/ui';

export default function ShopOrdersPage() {
  const { shopOrders, customers, openModal } = useDairyPulse();
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(shopOrders[0] || null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'clients'>('orders');

  const totalRevenue = shopOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalVolume = shopOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const pendingOrders = shopOrders.filter((o) => o.status === 'Pending').length;

  // Real Commercial Clients calculation
  const commercialClientsList = useMemo(() => {
    const clientsMap = new Map<
      string,
      {
        id?: string;
        name: string;
        type: string;
        contactPerson: string;
        phone: string;
        area: string;
        address: string;
        totalVolume: number;
        ordersCount: number;
        totalSpent: number;
        balance: number;
      }
    >();

    // 1. Registered commercial customers
    customers
      .filter((c) => c.type === 'SHOP' || c.type === 'RESTAURANT')
      .forEach((c) => {
        const key = c.name.toLowerCase().trim();
        clientsMap.set(key, {
          id: c.id,
          name: c.name,
          type: c.type === 'RESTAURANT' ? 'Restaurant / Cafe' : 'Shop / Bakery',
          contactPerson: c.name,
          phone: c.phone,
          area: c.area || 'City',
          address: c.address || '',
          totalVolume: 0,
          ordersCount: 0,
          totalSpent: 0,
          balance: c.balance || 0,
        });
      });

    // 2. Orders placed by shops
    shopOrders.forEach((o) => {
      const key = o.shopName.toLowerCase().trim();
      const existing = clientsMap.get(key);
      const orderVolume = o.items.reduce((sum, item) => sum + item.quantity, 0);
      if (existing) {
        existing.totalVolume += orderVolume;
        existing.ordersCount += 1;
        existing.totalSpent += o.totalAmount;
        if (o.contactPerson && existing.contactPerson === existing.name) {
          existing.contactPerson = o.contactPerson;
        }
        if (o.phone && !existing.phone) {
          existing.phone = o.phone;
        }
      } else {
        clientsMap.set(key, {
          name: o.shopName,
          type: 'Commercial Client',
          contactPerson: o.contactPerson,
          phone: o.phone,
          area: 'City Depot',
          address: 'Commercial Delivery Address',
          totalVolume: orderVolume,
          ordersCount: 1,
          totalSpent: o.totalAmount,
          balance: 0,
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [customers, shopOrders]);

  const totalCommercialClients = commercialClientsList.length;

  const filteredOrders = shopOrders.filter((o) => {
    if (
      search &&
      !o.shopName.toLowerCase().includes(search.toLowerCase()) &&
      !o.orderNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredClients = commercialClientsList.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const mainTabs = [
    { id: 'orders', label: 'Commercial Orders', count: shopOrders.length, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'clients', label: 'Client Directory', count: totalCommercialClients, icon: <Store className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Commercial Shop Orders"
        description="Manage B2B commercial dairy orders for sweets shops, bakeries, tea stalls, and wholesale distributors."
      />

      {/* ── Page Header ── */}
      <PageHeader
        title="Shop & Commercial B2B Orders"
        description="Bulk commercial milk orders, sweet shops, hotel contracts, fulfillment queues, and client accounts."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('addCustomer')}
              leftIcon={<Store className="w-3.5 h-3.5 text-stone-600" />}
            >
              + Add Client
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('createOrder')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Bulk Order
            </Button>
          </>
        }
      />

      {/* ── KPI Metrics Grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="B2B Volume"
          value={`${totalVolume.toLocaleString()} L`}
          subtitle="Bulk commercial dispatches"
          icon={<ShoppingBag className="w-5 h-5" />}
          variant="teal"
          trend={{ value: 'Dispatched', isPositive: true }}
        />

        <StatCard
          title="Commercial Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Gross order pipeline value"
          icon={<Receipt className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Live', isPositive: true }}
        />

        <StatCard
          title="Fulfillment Queue"
          value={pendingOrders}
          subtitle="Orders awaiting dispatch"
          icon={<Store className="w-5 h-5" />}
          variant="amber"
          trend={{
            value: pendingOrders > 0 ? `${pendingOrders} Pending` : 'All Clear',
            isPositive: pendingOrders === 0,
          }}
        />

        <StatCard
          title="B2B Accounts"
          value={totalCommercialClients}
          subtitle="Bakeries, cafes, and halwais"
          icon={<Users className="w-5 h-5" />}
          variant="terracotta"
          onClick={() => setActiveTab(activeTab === 'clients' ? 'orders' : 'clients')}
        />
      </section>

      {/* ── View Switcher Tabs ── */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="pill"
        />
      </div>

      {/* ── TAB 1: COMMERCIAL ORDERS LIST & DETAIL ── */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Orders Table (8 cols) */}
          <div className="lg:col-span-8">
            <Card
              title="Commercial Orders"
              subtitle="All bulk delivery contracts and orders"
              action={
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search order or shop..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                    aria-label="Search order"
                  />
                </div>
              }
            >
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left text-xs min-w-[620px]" aria-label="Commercial Orders Table">
                  <thead>
                    <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                      <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Order #</th>
                      <th scope="col" className="py-2.5 px-3 font-semibold">Shop / Buyer</th>
                      <th scope="col" className="py-2.5 px-3 font-semibold text-center">Volume</th>
                      <th scope="col" className="py-2.5 px-3 font-semibold">Total (₹)</th>
                      <th scope="col" className="py-2.5 px-3 font-semibold">Payment</th>
                      <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ShoppingBag className="w-8 h-8 text-stone-300" />
                            <span className="font-bold text-sm text-stone-800">No commercial orders logged yet</span>
                            <span className="text-xs text-stone-500 font-normal">
                              Click &apos;Create Bulk Order&apos; above to record wholesale orders
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const isSelected = selectedOrder?.id === ord.id;
                        const totalLitres = ord.items.reduce((s, i) => s + i.quantity, 0);
                        return (
                          <tr
                            key={ord.id}
                            onClick={() => setSelectedOrder(ord)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-teal-50/70' : 'hover:bg-stone-50/80'
                            }`}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-[#0F766E]">{ord.orderNumber}</td>
                            <td className="py-3 px-3 font-semibold text-stone-800">
                              <div className="font-bold text-stone-900">{ord.shopName}</div>
                              <div className="text-[10px] text-stone-500 font-normal">{ord.contactPerson}</div>
                            </td>
                            <td className="py-3 px-3 text-center font-extrabold text-stone-800 tabular-nums">
                              {totalLitres} L
                            </td>
                            <td className="py-3 px-3 font-extrabold text-stone-900 tabular-nums">
                              ₹{ord.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                variant={
                                  ord.paymentStatus === 'Paid'
                                    ? 'success'
                                    : ord.paymentStatus === 'Partial'
                                    ? 'info'
                                    : 'warning'
                                }
                                size="xs"
                              >
                                {ord.paymentStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Badge
                                variant={
                                  ord.status === 'Delivered'
                                    ? 'success'
                                    : ord.status === 'Dispatched'
                                    ? 'info'
                                    : 'warning'
                                }
                                dot
                                size="xs"
                              >
                                {ord.status}
                              </Badge>
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

          {/* Selected Order Detail Receipt (4 cols) */}
          <div className="lg:col-span-4">
            <Card
              title={selectedOrder ? selectedOrder.orderNumber : 'Order Receipt'}
              subtitle={selectedOrder ? `Status: ${selectedOrder.status}` : 'Select an order to inspect'}
            >
              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="p-3 bg-[#F6F2EA] rounded-xl border border-stone-200/70 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Buyer / Client
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm block">
                        {selectedOrder.shopName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/50 text-stone-700">
                      <div>
                        <span className="text-stone-400 text-[10px] block">Contact</span>
                        <span className="font-semibold">{selectedOrder.contactPerson}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Phone</span>
                        <a
                          href={`tel:${selectedOrder.phone}`}
                          className="font-semibold text-[#0F766E] hover:underline"
                        >
                          {selectedOrder.phone}
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/50 text-stone-700">
                      <div>
                        <span className="text-stone-400 text-[10px] block">Order Date</span>
                        <span className="font-semibold">{selectedOrder.orderDate}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Delivery Slot</span>
                        <span className="font-semibold">{selectedOrder.deliveryDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-900 block">Line Items</span>
                    <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 text-xs">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-900 block">{item.productVariant}</span>
                            <span className="text-[10px] text-stone-500">
                              {item.quantity} L @ ₹{item.unitPrice}/L
                            </span>
                          </div>
                          <span className="font-extrabold text-stone-900 tabular-nums">
                            ₹{item.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="p-3 bg-[#F6F2EA] flex justify-between font-extrabold text-stone-900 text-sm">
                        <span>Grand Total</span>
                        <span className="text-[#0F766E]">
                          ₹{selectedOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => alert(`Invoice generated for ${selectedOrder.orderNumber}`)}
                    leftIcon={<Receipt className="w-4 h-4" />}
                  >
                    Generate Invoice PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-stone-400 text-xs">
                  Select an order from the table to view line item specs
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: COMMERCIAL CLIENTS DIRECTORY ── */}
      {activeTab === 'clients' && (
        <Card
          title="Commercial Accounts & Wholesale Clients"
          subtitle="Bakeries, sweet marts, hotels, and restaurant accounts"
          action={
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search client, contact, area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                aria-label="Search client"
              />
            </div>
          }
        >
          {filteredClients.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                <Store className="w-10 h-10 text-stone-300" />
                <h4 className="font-bold text-sm text-stone-800">No Commercial Clients Found</h4>
                <p className="text-xs text-stone-500 font-normal leading-relaxed">
                  You haven&apos;t added any commercial accounts yet. Add local sweet shops, bakeries, or cafes to start supplying milk in bulk cans.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openModal('addCustomer')}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    + Add Commercial Client
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="teal" size="xs">
                        {client.type}
                      </Badge>
                      <h4 className="font-extrabold text-sm text-stone-900 mt-1">{client.name}</h4>
                    </div>
                    {client.id && (
                      <Link
                        href={`/customers?search=${encodeURIComponent(client.name)}`}
                        className="text-stone-400 hover:text-[#0F766E] p-1"
                        title="View in Customer Directory"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a href={`tel:${client.phone}`} className="hover:text-[#0F766E] font-semibold">
                        {client.phone}
                      </a>
                    </div>
                    {client.area && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{client.area}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center text-xs">
                    <div className="bg-[#F6F2EA] p-2 rounded-xl border border-stone-200/60">
                      <span className="text-[10px] text-stone-500 font-medium block">Orders</span>
                      <span className="font-extrabold text-stone-900 tabular-nums">{client.ordersCount}</span>
                    </div>
                    <div className="bg-[#F6F2EA] p-2 rounded-xl border border-stone-200/60">
                      <span className="text-[10px] text-stone-500 font-medium block">Volume</span>
                      <span className="font-extrabold text-[#0F766E] tabular-nums">{client.totalVolume} L</span>
                    </div>
                    <div className="bg-[#F6F2EA] p-2 rounded-xl border border-stone-200/60">
                      <span className="text-[10px] text-stone-500 font-medium block">Balance</span>
                      <span
                        className={`font-extrabold tabular-nums ${
                          client.balance > 0 ? 'text-orange-700' : 'text-stone-700'
                        }`}
                      >
                        ₹{client.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => openModal('createOrder')}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-[#0F766E]" />}
                  >
                    Create Order for {client.name.split(' ')[0]}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
