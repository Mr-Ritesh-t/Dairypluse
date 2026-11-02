'use client';

import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react';
import { Customer } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSuccess?: (message: string) => void;
}

export function CollectPaymentModal({ isOpen, onClose, customer, onSuccess }: CollectPaymentModalProps) {
  const { updateCustomer, invoices, recordPayment } = useDairyPulse();
  const currentDue = customer.balance > 0 ? customer.balance : 0;
  
  const [amount, setAmount] = useState<number>(currentDue);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER'>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      // 1. Calculate updated balance
      const newBalance = Math.round(((customer.balance || 0) - amount) * 100) / 100;
      await updateCustomer(customer.id, { balance: newBalance });

      // 2. Also check if there's an unpaid invoice for this customer to mark paid
      const customerUnpaidInv = invoices.find(
        (inv) => (inv.customerId === customer.id || inv.customerName === customer.name) && inv.status !== 'Paid'
      );
      if (customerUnpaidInv) {
        recordPayment(customerUnpaidInv.id, amount);
      }

      const remainingText = newBalance > 0 ? `Remaining dues: ₹${newBalance}` : 'All dues fully cleared (₹0)!';
      const msg = `Successfully recorded ₹${amount} payment via ${paymentMode} for ${customer.name}. ${remainingText}`;
      
      if (onSuccess) onSuccess(msg);
      onClose();
    } catch (err) {
      console.error('Failed to collect payment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Collect Customer Payment</h3>
              <p className="text-xs text-emerald-100 mt-0.5">{customer.name} • {customer.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Outstanding Balance Banner */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Remaining Payment Due</span>
              <div className="text-2xl font-black text-rose-700 tabular-nums">
                ₹{currentDue.toLocaleString()}
              </div>
            </div>
            {currentDue > 0 && (
              <button
                type="button"
                onClick={() => setAmount(currentDue)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
              >
                Pay Full Due
              </button>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Amount Received (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 text-xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter amount collected..."
              />
            </div>
            {amount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Remaining after payment:{' '}
                <strong className={currentDue - amount <= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  ₹{Math.max(0, currentDue - amount).toLocaleString()}
                </strong>
              </p>
            )}
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  paymentMode === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('BANK_TRANSFER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  paymentMode === 'BANK_TRANSFER'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Bank / Net</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Reference / Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GPay ref #847291 or Collected by Suresh"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : `Settle ₹${amount}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
