'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  FileText,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { ShopOrder } from '@/types';

export default function ShopOrdersPage() {
  const { shopOrders, openModal } = useDairyPulse();
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(shopOrders[0] || null);
  const [search, setSearch] = useState('');

  const totalRevenue = shopOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalVolume = shopOrders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const pendingOrders = shopOrders.filter((o) => o.status === 'Pending').length;

  const filteredOrders = shopOrders.filter((o) => {
    if (search && !o.shopName.toLowerCase().includes(search.toLowerCase()) && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop & B2B Orders</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bulk commercial milk orders, sweet shops, hotel contracts, and delivery dispatches.
          </p>
        </div>
        <button
          onClick={() => openModal('createOrder')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Shop Order</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total B2B Volume Today</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{totalVolume} L</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Bulk can dispatches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Commercial Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Gross order value</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pending Fulfillment</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-amber-600">
            {pendingOrders} Orders
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires loading & route dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Commercial Clients</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums text-purple-600">14 Shops</h3>
          <p className="text-[11px] text-slate-400 mt-1">Bakeries, Halwais, Cafes</p>
        </div>
      </section>

      {/* Orders Grid with Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Table (7-8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Commercial Orders</h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order or shop..."
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
                  <th className="pb-2.5 font-medium">Order #</th>
                  <th className="pb-2.5 font-medium">Shop / Client</th>
                  <th className="pb-2.5 font-medium">Quantity</th>
                  <th className="pb-2.5 font-medium">Total (₹)</th>
                  <th className="pb-2.5 font-medium">Payment</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const totalLitres = ord.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3.5 font-bold text-emerald-700">{ord.orderNumber}</td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        <div>{ord.shopName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{ord.contactPerson}</div>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700 tabular-nums">{totalLitres} L</td>
                      <td className="py-3.5 font-extrabold text-slate-900 tabular-nums">
                        ₹{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentStatus === 'Partial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'Dispatched'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-500'
                                : ord.status === 'Dispatched'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                          ></span>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail Drawer (Stitch Exact UI) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order Details
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-200">
                  {selectedOrder.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Buyer / Establishment:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.shopName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Person:</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone:</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.phone}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Order Date:</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.orderDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Delivery Slot:</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.deliveryDate}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Order Line Items</span>
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{item.productVariant}</span>
                        <span className="text-slate-400 block text-[10px]">
                          {item.quantity} L @ ₹{item.unitPrice}/L
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        ₹{item.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-emerald-700">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => alert(`Invoice generated for ${selectedOrder.orderNumber}`)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Generate Invoice PDF
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select an order from the table to view line item specs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
