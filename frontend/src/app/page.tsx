'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Droplets,
  Truck,
  Wallet,
  Plus,
  UserPlus,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function DashboardPage() {
  const { products, deliveries, shopOrders, invoices, openModal } = useDairyPulse();
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '3m'>('7d');

  // Compute live metrics
  const totalStockLitres = products.reduce((acc, p) => acc + p.availableStock, 0);
  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;
  const totalDeliveries = deliveries.length;
  const deliveryPercentage = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;
  const pendingPayments = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Hero Welcome Banner (Stitch Exact Pastoral Gradient & Artwork) */}
      <section
        className="pastoral-banner rounded-3xl border border-emerald-100 shadow-xs relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col md:flex-row md:items-center justify-between min-h-[160px] overflow-hidden"
        data-purpose="hero-banner"
      >
        {/* Decorative pastoral background hills */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 200">
            <path d="M0 160 Q 300 110, 600 150 T 1200 130 L 1200 200 L 0 200 Z" fill="#059669" />
            <path d="M0 180 Q 400 140, 800 170 T 1200 150 L 1200 200 L 0 200 Z" fill="#047857" />
          </svg>
        </div>

        {/* Left Greeting Text */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, <span className="text-emerald-700">Ritesh!</span>
          </h2>
          <p className="text-slate-600 text-sm mt-1.5 font-medium">
            Here's what's happening with your dairy business today across routes and plants.
          </p>
        </div>

        {/* Right Side Pastoral Landscape & Dairy Illustration */}
        <div className="relative z-10 flex items-end gap-6 self-end mt-4 md:mt-0">
          {/* Grazing cows art */}
          <div className="hidden lg:flex items-end gap-2 pb-1">
            <div className="text-slate-800 opacity-80 flex flex-col items-center">
              <svg className="w-14 h-10" fill="currentColor" viewBox="0 0 100 70">
                <ellipse cx="50" cy="40" rx="30" ry="18" />
                <circle cx="25" cy="28" r="12" />
                <rect height="15" rx="2" width="5" x="25" y="52" />
                <rect height="15" rx="2" width="5" x="37" y="52" />
                <rect height="15" rx="2" width="5" x="60" y="52" />
                <rect height="15" rx="2" width="5" x="72" y="52" />
                <path d="M78 38 Q 88 42, 85 55" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="text-slate-800 opacity-90 flex flex-col items-center">
              <svg className="w-18 h-12" fill="currentColor" viewBox="0 0 100 70">
                <ellipse cx="50" cy="40" rx="32" ry="20" />
                <circle cx="22" cy="26" r="14" />
                <rect height="16" rx="2" width="6" x="25" y="54" />
                <rect height="16" rx="2" width="6" x="38" y="54" />
                <rect height="16" rx="2" width="6" x="60" y="54" />
                <rect height="16" rx="2" width="6" x="73" y="54" />
                <path d="M80 38 Q 92 45, 87 60" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Milk Pitcher & Glass Badge */}
          <div className="flex items-end gap-3 bg-white/75 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/80 shadow-xs">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 40 48">
                <path d="M12 6h16M14 6v4c-6 4-6 10-6 18a10 10 0 0020 0c0-8 0-14-6-18V6" strokeLinecap="round" strokeWidth="2" />
                <path d="M12 18 C12 28, 28 28, 28 18" fill="#E0F2FE" opacity="0.6" />
                <path d="M28 16c4 0 7 2 7 6s-3 6-7 6" strokeWidth="2" />
              </svg>
              <span className="text-[9px] font-bold text-slate-700 mt-0.5">Fresh Farm</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-5 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 36">
                <path d="M4 4h16l-2 26a2 2 0 01-2 2H8a2 2 0 01-2-2L4 4z" strokeWidth="2" />
                <path d="M5.5 14h13l-1.5 15a1 1 0 01-1 1H8a1 1 0 01-1-1L5.5 14z" fill="#F0F9FF" />
              </svg>
              <span className="text-[8px] font-semibold text-slate-500 mt-0.5">100% Pure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" data-purpose="metrics-row">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">Today's Sales</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹24,850</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  ↑ 14%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">vs yesterday (₹21,800)</p>
            </div>
          </div>
        </div>

        {/* Milk in Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">Milk in Stock</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {totalStockLitres.toLocaleString()} L
                </span>
                <span className="text-xs font-semibold text-emerald-600">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">across 4 active silos</p>
            </div>
          </div>
        </div>

        {/* Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">Deliveries Today</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {deliveredCount} / {totalDeliveries}
                </span>
              </div>
              <div className="mt-2.5">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${deliveryPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{deliveryPercentage}% completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">Pending Dues</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  ₹{pendingPayments.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-rose-500">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">3 overdue accounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts & Inventory Status Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-purpose="charts-and-inventory">
        {/* Sales Overview Chart (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales & Dispatch Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Household subscriptions vs Commercial bulk revenue</p>
            </div>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
              <button
                onClick={() => setChartRange('7d')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartRange === '7d' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
                type="button"
              >
                7 Days
              </button>
              <button
                onClick={() => setChartRange('30d')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartRange === '30d' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
                type="button"
              >
                30 Days
              </button>
              <button
                onClick={() => setChartRange('3m')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartRange === '3m' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
                type="button"
              >
                3 Months
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="mt-4 relative">
            <div className="h-60 w-full relative flex flex-col justify-between">
              {/* Y-Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
                <div className="border-b border-dashed border-slate-200 flex justify-between pb-1"><span>₹30K</span></div>
                <div className="border-b border-dashed border-slate-200 flex justify-between pb-1"><span>₹20K</span></div>
                <div className="border-b border-dashed border-slate-200 flex justify-between pb-1"><span>₹10K</span></div>
                <div className="border-b border-slate-300 flex justify-between pb-1"><span>0</span></div>
              </div>

              {/* Bar Columns */}
              <div className="relative h-52 mt-4 ml-8 mr-2 flex items-end justify-between z-10">
                {[
                  { day: '17 Oct', hh: 55, shop: 35 },
                  { day: '18 Oct', hh: 65, shop: 42 },
                  { day: '19 Oct', hh: 70, shop: 48 },
                  { day: '20 Oct', hh: 75, shop: 50 },
                  { day: '21 Oct', hh: 68, shop: 45 },
                  { day: '22 Oct', hh: 72, shop: 52 },
                  { day: 'Today', hh: 78, shop: 55 },
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="flex items-end gap-1.5 h-40">
                      <div
                        className="w-3.5 bg-emerald-600 rounded-t-xs transition-all group-hover:brightness-110"
                        style={{ height: `${col.hh}%` }}
                        title={`Household: ${col.hh * 200}`}
                      ></div>
                      <div
                        className="w-3.5 bg-blue-500 rounded-t-xs transition-all group-hover:brightness-110"
                        style={{ height: `${col.shop}%` }}
                        title={`Shop: ${col.shop * 200}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{col.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-xs"></span>
                <span>Household Subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-xs"></span>
                <span>Shop Bulk Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milk Inventory Table (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Milk Inventory</h3>
              <a href="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All
              </a>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">Milk Type</th>
                    <th className="pb-2 font-medium text-center">Available</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 flex items-center gap-2.5 font-semibold text-slate-800">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
                          🥛
                        </div>
                        <span>{p.variant}</span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700 tabular-nums">
                        {p.availableStock} L
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            p.status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Storage Volume:</span>
            <span className="font-bold text-slate-800 text-sm tabular-nums">{totalStockLitres} Litres</span>
          </div>
        </div>
      </section>

      {/* Deliveries & Recent Orders Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-purpose="deliveries-and-orders-tables">
        {/* Today's Deliveries Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Delivery Route Stops</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live status from delivery partner app</p>
            </div>
            <a href="/delivery" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </a>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">Qty</th>
                  <th className="pb-2.5 font-medium">Rider</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.slice(0, 4).map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 font-semibold text-slate-800">
                      <div>{d.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{d.area}</div>
                    </td>
                    <td className="py-3 font-bold text-slate-700 tabular-nums">
                      {d.quantityLiters} L ({d.productVariant.split(' ')[0]})
                    </td>
                    <td className="py-3 text-slate-600 font-medium">{d.assignedRider}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          d.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : d.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'Delivered'
                              ? 'bg-emerald-500'
                              : d.status === 'In Progress'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Shop Orders Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Commercial & Shop Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Bulk B2B orders and restaurant dispatches</p>
            </div>
            <a href="/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </a>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Order #</th>
                  <th className="pb-2.5 font-medium">Buyer</th>
                  <th className="pb-2.5 font-medium">Amount</th>
                  <th className="pb-2.5 font-medium text-right">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shopOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3 font-semibold text-emerald-700">{ord.orderNumber}</td>
                    <td className="py-3 font-semibold text-slate-800">
                      <div>{ord.shopName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{ord.contactPerson}</div>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900 tabular-nums">
                      ₹{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom Quick Action Tiles (Stitch Exact UI) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2" data-purpose="quick-actions">
        {/* Quick Action 1: Add Milk Stock */}
        <button
          onClick={() => openModal('addStock')}
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition group text-left cursor-pointer"
          type="button"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-snug">Add Milk Stock</h4>
            <p className="text-xs text-emerald-100 font-normal">Record incoming milk batch</p>
          </div>
        </button>

        {/* Quick Action 2: Add Customer */}
        <button
          onClick={() => openModal('addCustomer')}
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition group text-left cursor-pointer"
          type="button"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-snug">Add Customer</h4>
            <p className="text-xs text-blue-100 font-normal">Register household or shop</p>
          </div>
        </button>

        {/* Quick Action 3: Generate Bill */}
        <button
          onClick={() => openModal('generateBill')}
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs transition group text-left cursor-pointer"
          type="button"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-snug">Generate Bill</h4>
            <p className="text-xs text-orange-100 font-normal">Create customer invoice</p>
          </div>
        </button>

        {/* Quick Action 4: Assign Deliveries */}
        <a
          href="/delivery"
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs transition group text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-snug">Assign Deliveries</h4>
            <p className="text-xs text-purple-100 font-normal">Route dispatch planner</p>
          </div>
        </a>
      </section>
    </div>
  );
}
