'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Milk,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  skipSubscriptionDeliveryApi,
  modifySubscriptionQuantityApi,
  scheduleExtraMilkApi,
} from '@/lib/api';

interface FlexibleSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  customerName: string;
  currentQuantity: number;
  productVariant: string;
  unitPrice: number;
  initialTab?: 'SKIP' | 'QUANTITY' | 'EXTRA';
  onSuccess?: () => void;
}

export function FlexibleSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
  customerName,
  currentQuantity,
  productVariant,
  unitPrice,
  initialTab = 'SKIP',
  onSuccess,
}: FlexibleSubscriptionModalProps) {
  const [activeTab, setActiveTab] = useState<'SKIP' | 'QUANTITY' | 'EXTRA'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  // Tomorrow's formatted date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  // Tab 1: Skip state
  const [skipDate, setSkipDate] = useState(defaultDateStr);
  const [skipReason, setSkipReason] = useState('Out of town / Travelling');

  // Tab 2: Modify Quantity state
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [effectiveDate, setEffectiveDate] = useState(defaultDateStr);

  // Tab 3: Extra Milk state
  const [extraLiters, setExtraLiters] = useState(1.0);
  const [extraDate, setExtraDate] = useState(defaultDateStr);
  const [extraVariant, setExtraVariant] = useState(productVariant);

  if (!isOpen) return null;

  const handleSkipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await skipSubscriptionDeliveryApi(subscriptionId, {
      skip_date: skipDate,
      reason: skipReason,
    });
    setIsSubmitting(false);
    setSuccessMessage(res.message);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
    }, 1500);
  };

  const handleQuantitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await modifySubscriptionQuantityApi(subscriptionId, {
      new_quantity_liters: newQuantity,
      effective_date: effectiveDate,
    });
    setIsSubmitting(false);
    setSuccessMessage(res.message);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
    }, 1500);
  };

  const handleExtraMilkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await scheduleExtraMilkApi(subscriptionId, {
      extra_liters: extraLiters,
      date: extraDate,
      variant: extraVariant,
    });
    setIsSubmitting(false);
    setSuccessMessage(res.message);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Manage Milk Subscription
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Self-Service
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {customerName} • {currentQuantity}L {productVariant} (₹{unitPrice}/L)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('SKIP');
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-xl transition ${
              activeTab === 'SKIP' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skip Delivery
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('QUANTITY');
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-xl transition ${
              activeTab === 'QUANTITY' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Change Quota
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('EXTRA');
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-xl transition ${
              activeTab === 'EXTRA' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Extra Milk
          </button>
        </div>

        {/* Feedback message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* TAB 1: Skip a Delivery */}
        {activeTab === 'SKIP' && (
          <form onSubmit={handleSkipSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-amber-900 text-xs">
              <span className="font-bold block">No charge for skipped days</span>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Your monthly billing cycle will automatically be credited ₹{(currentQuantity * unitPrice).toFixed(0)} for this skipped morning run.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Date to Skip Delivery
              </label>
              <input
                type="date"
                value={skipDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSkipDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason (Optional)
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="Out of town / Travelling">Out of town / Travelling</option>
                <option value="Festival Fasting">Festival / Fasting day</option>
                <option value="Extra milk leftover in fridge">Excess milk in fridge</option>
                <option value="Personal / Other">Other personal reason</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Skip for {skipDate}</span>}
            </button>
          </form>
        )}

        {/* TAB 2: Change Daily Quota */}
        {activeTab === 'QUANTITY' && (
          <form onSubmit={handleQuantitySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                New Daily Delivery Quota (Liters)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewQuantity((prev) => Math.max(0.5, prev - 0.5))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition"
                >
                  -
                </button>
                <div className="flex-1 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-lg text-slate-900 tabular-nums">
                  {newQuantity} <span className="text-xs font-normal text-slate-500">Liters / day</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewQuantity((prev) => prev + 0.5)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Effective Start Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-600">
              <span>New Daily Price:</span>
              <span className="font-extrabold text-slate-900">₹{(newQuantity * unitPrice).toFixed(0)} / day</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Quota to {newQuantity} L</span>}
            </button>
          </form>
        )}

        {/* TAB 3: Add Extra Milk */}
        {activeTab === 'EXTRA' && (
          <form onSubmit={handleExtraMilkSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-blue-900 text-xs">
              <span className="font-bold block">Need extra milk for guests or sweets?</span>
              <p className="text-[11px] text-blue-800/90 mt-0.5">
                Rider will bring extra chilled pouches on your selected date alongside your regular quota.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Extra Quantity to Add
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setExtraLiters(q)}
                    className={`py-2 rounded-xl font-bold transition ${
                      extraLiters === q
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    +{q} L
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={extraDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExtraDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Milk Variant
                </label>
                <select
                  value={extraVariant}
                  onChange={(e) => setExtraVariant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Cow Milk">Cow Milk</option>
                  <option value="Buffalo Milk">Buffalo Milk</option>
                  <option value="Toned Milk">Toned Milk</option>
                  <option value="A2 Desi Cow Milk">A2 Desi Cow</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-600">
              <span>One-Time Charge Added to Invoice:</span>
              <span className="font-extrabold text-emerald-700">₹{(extraLiters * unitPrice).toFixed(0)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Schedule +{extraLiters}L on {extraDate}</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
