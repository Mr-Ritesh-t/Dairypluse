'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Droplets,
  Truck,
  Wallet,
  Plus,
  UserPlus,
  Receipt,
  ShoppingBag,
  Milk,
  Building2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, StatCard, Badge, Button, ProgressBar } from '@/components/ui';
import { motion, type Variants } from 'motion/react';

// Motion Orchestration Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export default function DashboardPage() {
  const { products, deliveries, subscriptions, shopOrders, invoices, openModal } = useDairyPulse();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Farm Admin';
  const dairyName = (user as any)?.dairyName || (user as any)?.dairy_name || 'HQ Farm & Chilling Center';
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalStockLitres = products.reduce((acc, p) => acc + p.availableStock, 0);
  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;
  const totalDeliveries = deliveries.length;
  const deliveryPercentage = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;
  const pendingPayments = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);

  const totalShopSales = shopOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalSubscriptionSales = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + s.quantityLiters * s.unitPrice, 0);
  const todaySales = totalShopSales + totalSubscriptionSales;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <PageHead
        title="Operations Dashboard"
        description="Real-time overview of daily milk collection, stock levels, delivery fleet dispatch, and active subscriptions."
      />

      {/* ── 1. Hero Welcome & Operations Banner ── */}
      <motion.section
        variants={sectionVariants}
        whileHover={{ boxShadow: '0 4px 20px -2px rgba(15, 118, 110, 0.08)' }}
        transition={{ duration: 0.25 }}
        className="pastoral-banner rounded-3xl border border-stone-200/90 shadow-[0_1px_3px_rgba(28,25,23,0.04)] relative px-5 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between min-h-[160px] overflow-hidden gap-6"
        data-purpose="hero-banner"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.35, 0.5, 0.35],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-200/40 via-teal-100/30 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 text-xs font-semibold border border-stone-200/80 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            <span className="font-bold text-stone-900">{dairyName}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-medium">{todayFormatted}</span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            {greeting},{' '}
            <span className="text-[#0F766E]">{firstName}!</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
            All morning collection runs dispatched. Storage tanks holding <span className="font-semibold text-stone-800">{totalStockLitres} Litres</span> fresh milk ready for distribution.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openModal('addStock')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Milk Intake
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/delivery">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Truck className="w-3.5 h-3.5 text-[#0F766E]" />}
                >
                  View Dispatches
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Live Farm Quick Glance */}
        <div className="relative z-10 flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-stone-200/80 pt-4 lg:pt-0 lg:pl-8 gap-4 shrink-0">
          <div className="text-left lg:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Fleet Status
            </span>
            <span className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-1.5 lg:justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active Dispatch
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Delivery Completion
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#0F766E] tabular-nums">
              {deliveryPercentage}% done
            </span>
          </div>
        </div>
      </motion.section>

      {/* ── 2. KPI Metrics Grid ── */}
      <motion.section
        variants={sectionVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        data-purpose="metrics-row"
      >
        {[
          {
            title: "Today's Sales",
            value: `₹${todaySales.toLocaleString()}`,
            subtitle: `${shopOrders.length + subscriptions.length} active order streams`,
            icon: <TrendingUp className="w-5 h-5" />,
            variant: 'teal' as const,
            trend: { value: 'Live', isPositive: true },
          },
          {
            title: 'Milk in Stock',
            value: `${totalStockLitres.toLocaleString()} L`,
            subtitle: 'Across active chilling tanks',
            icon: <Droplets className="w-5 h-5" />,
            variant: 'blue' as const,
            trend: {
              value: totalStockLitres > 0 ? 'Optimal' : 'Low',
              isPositive: totalStockLitres > 0,
            },
          },
          {
            title: 'Deliveries Today',
            value: `${deliveredCount} / ${totalDeliveries}`,
            subtitle: `${totalDeliveries - deliveredCount} stops remaining`,
            icon: <Truck className="w-5 h-5" />,
            variant: 'amber' as const,
            trend: {
              value: `${deliveryPercentage}%`,
              isPositive: deliveryPercentage >= 50,
            },
          },
          {
            title: 'Pending Dues',
            value: `₹${pendingPayments.toLocaleString()}`,
            subtitle: `${invoices.filter((i) => i.status !== 'Paid').length} pending accounts`,
            icon: <Wallet className="w-5 h-5" />,
            variant: 'terracotta' as const,
            trend: {
              value: pendingPayments > 0 ? 'Collect' : 'Clear',
              isPositive: pendingPayments === 0,
            },
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            variants={sectionVariants}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.section>

      {/* ── 3. Milk Inventory Overview Table ── */}
      <motion.div variants={sectionVariants}>
        <Card
          title="Live Milk Inventory & Stock Levels"
          subtitle="Real-time chilling center tank levels and variant availability"
          action={
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs text-stone-500 font-medium">
                Total Storage:{' '}
                <strong className="text-stone-800 font-bold tabular-nums">
                  {totalStockLitres} Litres
                </strong>
              </span>
              <Link
                href="/inventory"
                className="text-xs font-bold text-[#0F766E] hover:text-[#0D6560] inline-flex items-center gap-1 group"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Milk Inventory Table">
              <thead>
                <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                  <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">
                    Product / Variety
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-center">
                    Available Stock
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-center">
                    Unit Price
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-stone-50/80 transition-colors"
                  >
                    <td className="py-3 px-3 flex items-center gap-2.5 font-semibold text-stone-800">
                      <motion.div
                        whileHover={{ rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 0.4 }}
                        className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center text-sm border border-teal-200/60 shadow-2xs shrink-0"
                      >
                        <Milk className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <span className="font-bold text-stone-900 block">{p.variant}</span>
                        <span className="text-[11px] text-stone-500 font-normal">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-stone-800 tabular-nums">
                      {p.availableStock} {p.unit}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-stone-600 tabular-nums">
                      ₹{p.sellingPrice} / {p.unit}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Badge
                        variant={p.status === 'In Stock' ? 'success' : 'warning'}
                        dot
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* ── 4. Split Grid: Route Stops & Commercial Orders ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5" data-purpose="deliveries-and-orders-tables">
        {/* Today's Route Stops */}
        <motion.div variants={sectionVariants}>
          <Card
            title="Today's Route Stops"
            subtitle="Live status from rider delivery dispatch"
            action={
              <Link
                href="/delivery"
                className="text-xs font-bold text-[#0F766E] hover:text-[#0D6560] inline-flex items-center gap-1 group"
              >
                <span>All Stops</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Today Route Stops">
                <thead>
                  <tr className="text-stone-500 font-semibold border-b border-stone-200/80">
                    <th scope="col" className="pb-2.5 font-semibold">Customer</th>
                    <th scope="col" className="pb-2.5 font-semibold">Qty</th>
                    <th scope="col" className="pb-2.5 font-semibold">Rider</th>
                    <th scope="col" className="pb-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-stone-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Truck className="w-6 h-6 text-stone-300" />
                          <span className="font-semibold text-xs text-stone-600">No active delivery runs today</span>
                          <span className="text-xs text-stone-400">Generate stops from the Deliveries tab</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    deliveries.slice(0, 4).map((d, idx) => (
                      <motion.tr
                        key={d.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-stone-50/80 transition-colors"
                      >
                        <td className="py-3 font-semibold text-stone-800">
                          <div className="font-bold text-stone-900">{d.customerName}</div>
                          <div className="text-[11px] text-stone-500 font-normal">{d.area}</div>
                        </td>
                        <td className="py-3 font-bold text-stone-800 tabular-nums">
                          {d.quantityLiters} L
                        </td>
                        <td className="py-3 text-stone-600 font-medium">{d.assignedRider}</td>
                        <td className="py-3 text-right">
                          <Badge
                            variant={
                              d.status === 'Delivered'
                                ? 'success'
                                : d.status === 'In Progress'
                                ? 'info'
                                : 'warning'
                            }
                            dot
                            size="xs"
                          >
                            {d.status}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Commercial & Shop Orders */}
        <motion.div variants={sectionVariants}>
          <Card
            title="Commercial & Shop Orders"
            subtitle="Bulk B2B orders and restaurant dispatches"
            action={
              <Link
                href="/orders"
                className="text-xs font-bold text-[#0F766E] hover:text-[#0D6560] inline-flex items-center gap-1 group"
              >
                <span>All Orders</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Commercial Orders Table">
                <thead>
                  <tr className="text-stone-500 font-semibold border-b border-stone-200/80">
                    <th scope="col" className="pb-2.5 font-semibold">Order #</th>
                    <th scope="col" className="pb-2.5 font-semibold">Buyer</th>
                    <th scope="col" className="pb-2.5 font-semibold">Amount</th>
                    <th scope="col" className="pb-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {shopOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-stone-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <ShoppingBag className="w-6 h-6 text-stone-300" />
                          <span className="font-semibold text-xs text-stone-600">No commercial orders logged yet</span>
                          <span className="text-xs text-stone-400">Click &apos;Shop Order&apos; below to log bulk sales</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    shopOrders.slice(0, 4).map((ord, idx) => (
                      <motion.tr
                        key={ord.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-stone-50/80 transition-colors"
                      >
                        <td className="py-3 font-mono font-bold text-[#0F766E]">{ord.orderNumber}</td>
                        <td className="py-3 font-semibold text-stone-800">
                          <div className="font-bold text-stone-900">{ord.shopName}</div>
                          <div className="text-[11px] text-stone-500 font-normal">{ord.contactPerson}</div>
                        </td>
                        <td className="py-3 font-extrabold text-stone-900 tabular-nums">
                          ₹{ord.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
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
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* ── 5. Quick Farm Action Bar ── */}
      <motion.section
        variants={sectionVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2"
        data-purpose="quick-actions"
      >
        <motion.button
          whileHover={{ scale: 1.025, y: -2 }}
          whileTap={{ scale: 0.975 }}
          onClick={() => openModal('addStock')}
          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#F6F2EA] border border-stone-200/90 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-colors duration-150 group text-left cursor-pointer"
          type="button"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/70 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">Add Milk Stock</h4>
            <p className="text-[10px] sm:text-xs text-stone-500 font-normal truncate">Incoming tank batch</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.025, y: -2 }}
          whileTap={{ scale: 0.975 }}
          onClick={() => openModal('addCustomer')}
          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#F6F2EA] border border-stone-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-colors duration-150 group text-left cursor-pointer"
          type="button"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 text-[#0369A1] border border-sky-200/70 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">Add Customer</h4>
            <p className="text-[10px] sm:text-xs text-stone-500 font-normal truncate">Household / retail</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.025, y: -2 }}
          whileTap={{ scale: 0.975 }}
          onClick={() => openModal('generateBill')}
          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#F6F2EA] border border-stone-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-colors duration-150 group text-left cursor-pointer"
          type="button"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200/70 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">Generate Bill</h4>
            <p className="text-[10px] sm:text-xs text-stone-500 font-normal truncate">Create customer invoice</p>
          </div>
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.025, y: -2 }}
          whileTap={{ scale: 0.975 }}
        >
          <Link
            href="/delivery"
            className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#F6F2EA] border border-stone-200/90 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-colors duration-150 group text-left cursor-pointer h-full"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/70 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">Delivery Runs</h4>
              <p className="text-[10px] sm:text-xs text-stone-500 font-normal truncate">Route fleet management</p>
            </div>
          </Link>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
