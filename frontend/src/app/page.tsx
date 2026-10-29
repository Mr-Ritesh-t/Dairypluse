'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ShieldCheck,
  Sun,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { products, deliveries, subscriptions, shopOrders, invoices, openModal } = useDairyPulse();
  const { user } = useAuth();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Ritesh';
  const dairyName = (user as any)?.dairyName || (user as any)?.dairy_name || 'HQ Farm & Chilling Center';
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Compute live metrics
  const totalStockLitres = products.reduce((acc, p) => acc + p.availableStock, 0);
  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;
  const totalDeliveries = deliveries.length;
  const deliveryPercentage = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;
  const pendingPayments = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);

  // Dynamic sales calculation
  const totalShopSales = shopOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalSubscriptionSales = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + (s.quantityLiters * s.unitPrice), 0);
  const todaySales = totalShopSales + totalSubscriptionSales;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Hero Welcome Banner (Premium Pastoral Operations Hub) */}
      <section
        className="pastoral-banner rounded-3xl border border-emerald-100/90 shadow-xs relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between min-h-[175px] overflow-hidden gap-6"
        data-purpose="hero-banner"
      >
        {/* Decorative Scenic Rolling Hills & Soft Morning Light */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle warm morning sun glow */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-amber-200/50 via-emerald-100/40 to-transparent rounded-full blur-3xl" />

          {/* Layered pastoral landscape hills with smooth gradients */}
          <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 1200 240">
            <defs>
              <linearGradient id="hillDistant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path d="M0 130 Q 300 85, 620 120 T 1200 100 L 1200 240 L 0 240 Z" fill="url(#hillDistant)" />
            <path d="M0 160 Q 280 120, 640 155 T 1200 135 L 1200 240 L 0 240 Z" fill="url(#hillMid)" />
            <path d="M0 190 Q 380 160, 780 185 T 1200 170 L 1200 240 L 0 240 Z" fill="url(#hillFront)" />
          </svg>
        </div>

        {/* Left Side: Dynamic Greeting & Quick Shortcuts */}
        <div className="relative z-10 max-w-xl">
          {/* Farm telemetry pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold border border-emerald-200/90 shadow-2xs mb-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{dairyName}</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-700 font-semibold">{todayFormatted}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
              {firstName}!
            </span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            Morning route dispatch is actively underway. Cold-chain storage silos are operating at optimal holding temperature with zero disruption alerts.
          </p>

          {/* Quick Action Shortcuts inside Banner */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <button
              onClick={() => openModal('addStock')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milk Intake</span>
            </button>
            <Link
              href="/delivery"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Route Dispatches</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Operations Showcase & Quality Hub */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Card 1: Certified Quality & Cold-Chain */}
          <div className="bg-white/85 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-white/90 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-2xs border border-emerald-100 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="DairyPulse Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900">A+ Certified Milk</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md">
                  100% PURE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Fat: <span className="font-bold text-slate-700">4.2%</span> • SNF: <span className="font-bold text-slate-700">8.7%</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Cold-Chain 3.8°C (Optimal)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Live Morning Route Completion Progress */}
          <div className="bg-white/85 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-white/90 shadow-xs flex flex-col justify-between min-w-[170px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Today's Runs</span>
              </span>
              <span className="font-mono font-extrabold text-emerald-700">{deliveryPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2 border border-slate-200/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${deliveryPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">{deliveredCount} delivered</span>
              <span>{totalDeliveries} total drops</span>
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
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ₹{todaySales.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {shopOrders.length + subscriptions.length > 0
                  ? `${shopOrders.length + subscriptions.length} active revenue streams`
                  : 'No orders logged today'}
              </p>
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
                <span className={`text-xs font-semibold ${totalStockLitres > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {totalStockLitres > 0 ? 'Optimal' : 'Zero Stock'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {totalStockLitres > 0 ? 'across active silos' : 'Awaiting milk intake'}
              </p>
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
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {totalDeliveries > 0 ? `${deliveryPercentage}% completed` : 'No runs scheduled'}
                </p>
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
                <span className={`text-xs font-semibold ${pendingPayments > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {pendingPayments > 0 ? 'Active' : 'All Clear'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {invoices.filter((i) => i.status !== 'Paid').length} pending accounts
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Milk Inventory Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs" data-purpose="inventory-status">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Milk Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live storage silo levels and available product stock</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              Total Storage Volume: <span className="font-bold text-slate-800 text-sm tabular-nums">{totalStockLitres} Litres</span>
            </span>
            <Link href="/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Manage Inventory &rarr;
            </Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Product / Milk Type</th>
                <th className="pb-3 font-medium text-center">Available Stock</th>
                <th className="pb-3 font-medium text-center">Unit Price</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 flex items-center gap-2.5 font-semibold text-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm shadow-2xs">
                      🥛
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{p.variant}</span>
                      <span className="block text-[11px] text-slate-400 font-normal">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-700 tabular-nums">
                    {p.availableStock} {p.unit}
                  </td>
                  <td className="py-3 text-center font-semibold text-slate-600 tabular-nums">
                    ₹{p.sellingPrice} / {p.unit}
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
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Truck className="w-6 h-6 text-slate-300" />
                        <span className="font-medium text-xs text-slate-500">No delivery runs active yet today</span>
                        <span className="text-[11px] text-slate-400">Add subscribers or generate daily dispatches from the Delivery tab</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deliveries.slice(0, 4).map((d) => (
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
                  ))
                )}
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
                {shopOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <ShoppingBag className="w-6 h-6 text-slate-300" />
                        <span className="font-medium text-xs text-slate-500">No commercial orders logged yet</span>
                        <span className="text-[11px] text-slate-400">Record wholesale or retail bulk orders by clicking 'Create Order' below</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  shopOrders.map((ord) => (
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
                  ))
                )}
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
