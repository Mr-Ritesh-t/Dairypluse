'use client';

import React, { useState } from 'react';
import { X, Milk, Plus, Minus, CheckCircle2, Clock, Calendar, AlertCircle, Truck } from 'lucide-react';
import { Customer, MilkVariant } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';

interface AddMilkModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSuccess?: (message: string) => void;
}

export function AddMilkModal({ isOpen, onClose, customer, onSuccess }: AddMilkModalProps) {
  const { products, addDeliveryTask, updateCustomer } = useDairyPulse();
  
  const [variant, setVariant] = useState<MilkVariant>('Cow Milk');
  const [quantity, setQuantity] = useState<number>(1.0);
  const [slot, setSlot] = useState<'Morning' | 'Evening'>('Morning');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [deliveryStatus, setDeliveryStatus] = useState<'DELIVERED_NOW' | 'SCHEDULE_DISPATCH'>('DELIVERED_NOW');
  const [paymentOption, setPaymentOption] = useState<'ADD_TO_DUES' | 'PAID_NOW'>('ADD_TO_DUES');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Find product price
  const matchedProduct = products.find((p) => p.variant === variant);
  const unitPrice = matchedProduct?.sellingPrice || (variant === 'Cow Milk' ? 62 : variant === 'Buffalo Milk' ? 78 : variant === 'Toned Milk' ? 54 : 95);
  const totalCost = Math.round(quantity * unitPrice);

  const handleQuickAdd = (liters: number) => {
    setQuantity((prev) => Math.max(0.5, Math.round((prev + liters) * 10) / 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSubmitting(true);
    try {
      const isDeliveredNow = deliveryStatus === 'DELIVERED_NOW';
      
      // 1. Create delivery task with exact status
      await addDeliveryTask({
        customerName: customer.name,
        customerPhone: customer.phone,
        address: customer.address,
        area: customer.area,
        productVariant: variant,
        quantityLiters: quantity,
        slot: slot === 'Morning' ? 'Morning (6:00 AM - 7:30 AM)' : 'Evening (5:30 PM - 7:00 PM)',
        assignedRider: 'Rahul Deshmukh',
        dairyName: customer.dairyName || 'DairyPulse Farm HQ',
        deliveryDate: deliveryDate,
        isExtraOrder: true,
        status: isDeliveredNow ? 'Delivered' : 'Pending',
      });

      // 2. Persist updated customer balance to SQLite database
      let updatedBalance = customer.balance || 0;
      if (paymentOption === 'ADD_TO_DUES') {
        updatedBalance = Math.round((updatedBalance + totalCost) * 100) / 100;
        await updateCustomer(customer.id, { balance: updatedBalance });
      }

      const msg = `Successfully recorded ${quantity}L ${variant} (₹${totalCost}) for ${customer.name}! ${
        isDeliveredNow ? 'Marked as Delivered now.' : 'Scheduled for dispatch.'
      } ${
        paymentOption === 'ADD_TO_DUES' ? `Remaining dues: ₹${updatedBalance}.` : 'Paid on the spot.'
      }`;

      if (onSuccess) onSuccess(msg);
      onClose();
    } catch (err) {
      console.error('Failed to add milk to customer', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Add Milk to Customer</h3>
              <p className="text-xs text-emerald-100 mt-0.5">{customer.name} ({customer.area})</p>
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
          {/* Milk Variant */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Milk Variant</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Cow Milk', 'Buffalo Milk', 'Toned Milk', 'A2 Desi Cow Milk'] as MilkVariant[]).map((v) => {
                const isSelected = variant === v;
                const price = v === 'Cow Milk' ? 62 : v === 'Buffalo Milk' ? 78 : v === 'Toned Milk' ? 54 : 95;
                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{v}</span>
                    <span className="text-[11px] text-slate-500">₹{price} / Liter</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Milk Quantity (Liters)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickAdd(-0.5)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-full text-center text-xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl py-2 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">Liters</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAdd(0.5)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mt-2">
              {[0.5, 1, 1.5, 2, 5].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setQuantity(preset)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    quantity === preset
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset}L
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Fulfillment Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryStatus('DELIVERED_NOW')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  deliveryStatus === 'DELIVERED_NOW'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Delivered Now</span>
                <span className="text-[10px] font-normal text-slate-400">Instant Handover</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryStatus('SCHEDULE_DISPATCH')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  deliveryStatus === 'SCHEDULE_DISPATCH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Schedule Dispatch</span>
                <span className="text-[10px] font-normal text-slate-400">Add to Rider Run</span>
              </button>
            </div>
          </div>

          {/* Delivery Slot & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as 'Morning' | 'Evening')}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 cursor-pointer"
              >
                <option value="Morning">Morning (06:00 - 07:30)</option>
                <option value="Evening">Evening (17:30 - 19:00)</option>
              </select>
            </div>
          </div>

          {/* Payment Handling Option */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Calculated Cost ({quantity}L × ₹{unitPrice}):</span>
              <span className="text-base font-extrabold text-slate-900">₹{totalCost}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'ADD_TO_DUES'}
                  onChange={() => setPaymentOption('ADD_TO_DUES')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Add ₹{totalCost} to Customer Remaining Dues</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'PAID_NOW'}
                  onChange={() => setPaymentOption('PAID_NOW')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Paid Now (Cash / Direct UPI)</span>
              </label>
            </div>
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : `Confirm +${quantity}L Milk`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
