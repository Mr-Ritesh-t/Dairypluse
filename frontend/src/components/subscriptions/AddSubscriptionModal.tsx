'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Milk,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  User,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { Customer, MilkVariant } from '@/types';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
  onSuccess?: (message: string) => void;
}

export function AddSubscriptionModal({
  isOpen,
  onClose,
  preselectedCustomer,
  onSuccess,
}: AddSubscriptionModalProps) {
  const { customers, products, addSubscription, activeDairy, openModal } = useDairyPulse();

  const householdCustomers = customers.filter((c) => c.type === 'HOUSEHOLD');
  const candidateCustomers = householdCustomers.length > 0 ? householdCustomers : customers;

  // Filter products: ONLY show milk varieties that are available (not Out of Stock and stock > 0)
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === 'Out of Stock') return false;
      if (typeof p.availableStock === 'number' && p.availableStock <= 0) return false;
      return true;
    });
  }, [products]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer?.id || candidateCustomers[0]?.id || ''
  );
  const [selectedVariant, setSelectedVariant] = useState<MilkVariant>(
    (availableProducts[0]?.variant as MilkVariant) || 'Cow Milk'
  );
  const [quantityLiters, setQuantityLiters] = useState<number>(1.0);
  const [timeSlot, setTimeSlot] = useState<
    'Morning (6:00 AM - 7:30 AM)' | 'Evening (5:30 PM - 7:00 PM)' | 'Both'
  >('Morning (6:00 AM - 7:30 AM)');
  const [frequency, setFrequency] = useState<'Daily' | 'Alternate Days' | 'Weekdays'>('Daily');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync preselectedCustomer or first candidate
  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
    } else if (candidateCustomers.length > 0) {
      if (!selectedCustomerId || !candidateCustomers.some((c) => c.id === selectedCustomerId)) {
        setSelectedCustomerId(candidateCustomers[0].id);
      }
    }
  }, [preselectedCustomer, customers]);

  // Keep selectedVariant in sync with availableProducts
  useEffect(() => {
    if (availableProducts.length > 0) {
      if (!selectedVariant || !availableProducts.some((p) => p.variant === selectedVariant)) {
        setSelectedVariant(availableProducts[0].variant);
      }
    }
  }, [availableProducts, selectedVariant]);

  if (!isOpen) return null;

  const currentCustomer =
    preselectedCustomer ||
    customers.find((c) => c.id === selectedCustomerId) ||
    candidateCustomers[0];

  const matchedProduct =
    availableProducts.find((p) => p.variant === selectedVariant) ||
    availableProducts[0];

  const unitPrice =
    matchedProduct?.sellingPrice ||
    (selectedVariant === 'Buffalo Milk' ? 78 : selectedVariant === 'A2 Desi Cow Milk' ? 95 : selectedVariant === 'Toned Milk' ? 54 : 62);

  const dailyTotal = Math.round(quantityLiters * unitPrice);
  const monthlyEstimate = Math.round(dailyTotal * 30);

  const handleQuickAdd = (liters: number) => {
    setQuantityLiters((prev) => Math.max(0.5, Math.round((prev + liters) * 10) / 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) {
      setErrorMessage('Please select a customer.');
      return;
    }
    if (availableProducts.length === 0) {
      setErrorMessage('No available milk varieties in stock to subscribe to.');
      return;
    }
    if (quantityLiters <= 0) {
      setErrorMessage('Please enter a valid quantity in liters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const targetDairy = currentCustomer.dairyName || activeDairy?.name || 'DairyPulse Farm HQ';

      const result = await addSubscription({
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        productVariant: selectedVariant,
        quantityLiters: quantityLiters,
        timeSlot: timeSlot,
        frequency: frequency,
        unitPrice: unitPrice,
        startDate: startDate,
        status: 'Active',
        dairyName: targetDairy,
      });

      if (result) {
        if (onSuccess) {
          onSuccess(`Daily subscription started for ${currentCustomer.name} (${quantityLiters}L/day)`);
        }
        onClose();
      } else {
        setErrorMessage('Failed to create subscription. Please check details and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">New Household Subscription</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Set up recurring daily doorstep delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Household Customer <span className="text-rose-500">*</span>
            </label>
            {preselectedCustomer ? (
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">{preselectedCustomer.name}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {preselectedCustomer.area} • {preselectedCustomer.phone}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  Household
                </span>
              </div>
            ) : candidateCustomers.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                <p className="text-xs text-amber-800 font-medium">
                  No customers found yet. Please register a customer first.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openModal('addCustomer');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  + Add New Customer
                </button>
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {candidateCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.area} ({c.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Available Milk Varieties Only */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Available Milk Variety <span className="text-rose-500">*</span>
              </label>
              {availableProducts.length > 0 && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {availableProducts.length} Variety Available In Stock
                </span>
              )}
            </div>

            {availableProducts.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
                <p className="text-xs text-amber-800 font-semibold">
                  No milk varieties are currently available in stock.
                </p>
                <p className="text-[11px] text-amber-700">
                  Please add stock or create varieties in the Inventory section first.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openModal('addStock');
                  }}
                  className="mt-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  + Restock Milk in Inventory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableProducts.map((prod) => {
                  const isSelected = selectedVariant === prod.variant;
                  return (
                    <button
                      key={prod.id || prod.variant}
                      type="button"
                      onClick={() => setSelectedVariant(prod.variant)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {prod.variant}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            prod.status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prod.availableStock !== undefined ? `${prod.availableStock}L` : 'Available'}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-700">
                          ₹{prod.sellingPrice}/Liter
                        </span>
                        {(prod.fatContent > 0 || prod.snfContent > 0) && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            FAT {prod.fatContent}% • SNF {prod.snfContent}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Daily Quantity (Liters) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[0.5, 1.0, 1.5, 2.0].map((liters) => (
                  <button
                    key={liters}
                    type="button"
                    onClick={() => setQuantityLiters(liters)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                      quantityLiters === liters
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {liters}L
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(-0.5)}
                disabled={quantityLiters <= 0.5}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantityLiters}
                  onChange={(e) => setQuantityLiters(parseFloat(e.target.value) || 0)}
                  className="w-full text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                  L / day
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAdd(0.5)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery Slot & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                <option value="Both">Both Morning & Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="Daily">Daily (Every Day)</option>
                <option value="Alternate Days">Alternate Days</option>
                <option value="Weekdays">Weekdays Only (Mon-Fri)</option>
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block">Daily Delivery Cost</span>
              <span className="text-lg font-extrabold text-emerald-950">₹{dailyTotal}</span>
              <span className="text-[10px] text-emerald-700 ml-1">/ day</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">Monthly Approx</span>
              <span className="text-sm font-bold text-slate-700">₹{monthlyEstimate}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">/ mo</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentCustomer || availableProducts.length === 0}
              className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Subscription...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Subscription</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
