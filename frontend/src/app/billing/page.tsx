'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Receipt,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { downloadInvoicePdfApi } from '@/lib/api';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  Tabs,
} from '@/components/ui';

export default function BillingPaymentsPage() {
  const { invoices, recordPayment, openModal } = useDairyPulse();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const outstanding = totalInvoiced - totalCollected;
  const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
    if (
      search &&
      !inv.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const statusTabs = [
    { id: 'ALL', label: 'All Invoices', count: invoices.length },
    { id: 'Paid', label: 'Paid', count: invoices.filter((i) => i.status === 'Paid').length },
    { id: 'Partial', label: 'Partial', count: invoices.filter((i) => i.status === 'Partial').length },
    { id: 'Unpaid', label: 'Unpaid', count: invoices.filter((i) => i.status === 'Unpaid').length },
    { id: 'Overdue', label: 'Overdue', count: overdueCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Billing & Invoices"
        description="Automated monthly customer billing, WhatsApp invoice delivery, payment tracking, and ledger reconciliation."
      />

      {/* ── Page Header ── */}
      <PageHeader
        title="Billing & Payment Ledger"
        description="Automate monthly billing cycles, collect outstanding subscriptions, track cash/UPI payments, and issue receipts."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal('generateBill')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate New Invoice
          </Button>
        }
      />

      {/* ── KPI Metric Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString()}`}
          subtitle={`${invoices.length} invoices generated`}
          icon={<Receipt className="w-5 h-5" />}
          variant="teal"
          trend={{ value: 'Billed', isPositive: true }}
        />

        <StatCard
          title="Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          subtitle={`${totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% collection rate`}
          icon={<CreditCard className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Received', isPositive: true }}
        />

        <StatCard
          title="Outstanding"
          value={`₹${outstanding.toLocaleString()}`}
          subtitle="Pending customer receipts"
          icon={<IndianRupee className="w-5 h-5" />}
          variant="amber"
          trend={{
            value: outstanding > 0 ? 'Dues' : 'Clear',
            isPositive: outstanding === 0,
          }}
        />

        <StatCard
          title="Overdue Accounts"
          value={overdueCount}
          subtitle="Requires WhatsApp reminders"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="terracotta"
          trend={{
            value: overdueCount > 0 ? `${overdueCount} Overdue` : '0 Overdue',
            isPositive: overdueCount === 0,
          }}
        />
      </section>

      {/* ── Invoices Table Card ── */}
      <Card
        title="Customer Invoice Records"
        subtitle="Auditable monthly billing register with collection status"
        headerClassName="flex-col sm:flex-row items-start sm:items-center gap-3"
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Tabs
              tabs={statusTabs}
              activeTab={filterStatus}
              onChange={(st) => setFilterStatus(st)}
              variant="pill"
              size="sm"
            />
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                aria-label="Search invoice"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[700px]" aria-label="Invoices Table">
            <thead>
              <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Invoice #</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Customer / Client</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Billing Cycle</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Total Bill</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Paid Amount</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Due Date</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Status</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 text-stone-300" />
                      <span className="font-bold text-sm text-stone-800">No invoices generated yet</span>
                      <span className="text-xs text-stone-500 font-normal">
                        Click &apos;Generate New Invoice&apos; above to create a customer invoice
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const balanceDue = inv.totalAmount - inv.paidAmount;
                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0F766E]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-stone-800">
                        <div className="font-bold text-stone-900">{inv.customerName}</div>
                        <div className="text-[10px] text-stone-500 font-normal">{inv.customerType}</div>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">{inv.billingPeriod}</td>
                      <td className="py-3.5 px-3 font-extrabold text-stone-900 tabular-nums">
                        ₹{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700 tabular-nums">
                        ₹{inv.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 font-medium">{inv.dueDate}</td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            inv.status === 'Paid'
                              ? 'success'
                              : inv.status === 'Partial'
                              ? 'info'
                              : inv.status === 'Overdue'
                              ? 'danger'
                              : 'warning'
                          }
                          dot
                          size="xs"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {balanceDue > 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const amt = prompt(
                                  `Record payment for ${inv.invoiceNumber} (Due: ₹${balanceDue}):`,
                                  balanceDue.toString()
                                );
                                if (amt) {
                                  recordPayment(inv.id, parseFloat(amt) || 0);
                                }
                              }}
                            >
                              Collect
                            </Button>
                          )}
                          <button
                            onClick={async () => {
                              const success = await downloadInvoicePdfApi(inv.id, inv.invoiceNumber);
                              if (!success) {
                                alert(`Failed to download PDF for ${inv.invoiceNumber}. Please verify backend connection.`);
                              }
                            }}
                            className="p-1.5 text-stone-500 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Download Official Tax Invoice PDF"
                            aria-label={`Download invoice PDF for ${inv.invoiceNumber}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
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
  );
}
