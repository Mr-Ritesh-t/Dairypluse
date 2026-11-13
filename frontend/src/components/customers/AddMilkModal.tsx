'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Milk,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Truck,
  User,
  CreditCard,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { Customer, MilkVariant, StaffMember } from '@/types';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useToast } from '@/context/ToastContext';

interface AddMilkModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSuccess?: (message: string) => void;
}

export function AddMilkModal({ isOpen, onClose, customer, onSuccess }: AddMilkModalProps) {
  const {
    products,
    staff,
    routes,
    subscriptions,
    activeDairy,
    addDeliveryTask,
  } = useDairyPulse();
  const { showSuccess, showError } = useToast();

  // Find existing subscription for defaults
  const customerSub = useMemo(() => {
    return subscriptions.find(
      (s) =>
        s.customerId === customer?.id ||
        (customer?.name && s.customerName.toLowerCase() === customer.name.toLowerCase())
    );
  }, [subscriptions, customer]);

  // Delivery riders
  const deliveryRiders = useMemo(() => {
    const list = staff.filter((s) => s.role === 'Delivery Rider');
    return list.length > 0
      ? list
      : ([
          {
            id: 'default_rider',
            name: 'Rahul Deshmukh',
            role: 'Delivery Rider',
            phone: '+91 98220 11984',
            status: 'On Duty',
          },
        ] as StaffMember[]);
  }, [staff]);

  // Route-assigned rider default
  const defaultRider = useMemo(() => {
    if (customer?.route) {
      const matchedRoute = routes.find(
        (r) =>
          r.name.toLowerCase() === customer.route.toLowerCase() ||
          r.routeCode.toLowerCase() === customer.route.toLowerCase()
      );
      if (matchedRoute?.assignedRider) {
        return matchedRoute.assignedRider;
      }
    }
    return deliveryRiders[0]?.name || 'Rahul Deshmukh';
  }, [customer, routes, deliveryRiders]);

  // State
  const [variant, setVariant] = useState<MilkVariant>(
    (customerSub?.productVariant as MilkVariant) || 'Cow Milk'
  );
  const [quantity, setQuantity] = useState<number>(
    customerSub?.quantityLiters ? Number(customerSub.quantityLiters) : 1.0
  );
  const [slot, setSlot] = useState<'Morning' | 'Evening'>('Morning');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedRider, setSelectedRider] = useState<string>(defaultRider);
  const [deliveryStatus, setDeliveryStatus] = useState<'DELIVERED_NOW' | 'SCHEDULE_DISPATCH'>(
    'DELIVERED_NOW'
  );
  const [paymentOption, setPaymentOption] = useState<'ADD_TO_DUES' | 'PAID_NOW'>('ADD_TO_DUES');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when customer changes or modal opens
  useEffect(() => {
    if (isOpen && customer) {
      const preferredVariant = (customerSub?.productVariant as MilkVariant) || 'Cow Milk';
      const preferredQty = customerSub?.quantityLiters ? Number(customerSub.quantityLiters) : 1.0;
      setVariant(preferredVariant);
      setQuantity(preferredQty);
      setSlot('Morning');
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setSelectedRider(defaultRider);
      setDeliveryStatus('DELIVERED_NOW');
      setPaymentOption('ADD_TO_DUES');
      setIsSubmitting(false);
    }
  }, [isOpen, customer, customerSub, defaultRider]);

  if (!isOpen || !customer) return null;

  // Available variants from inventory or standard fallback
  const availableVariants: { variant: MilkVariant; price: number }[] =
    products && products.length > 0
      ? products.map((p) => ({
          variant: p.variant as MilkVariant,
          price: p.sellingPrice,
        }))
      : [
          { variant: 'Cow Milk', price: 62 },
          { variant: 'Buffalo Milk', price: 78 },
          { variant: 'Toned Milk', price: 54 },
          { variant: 'A2 Desi Cow Milk', price: 95 },
        ];

  // Resolve unit price & total
  const matchedProduct = products.find((p) => p.variant === variant);
  const unitPrice =
    matchedProduct?.sellingPrice ||
    (variant === 'Cow Milk'
      ? 62
      : variant === 'Buffalo Milk'
      ? 78
      : variant === 'Toned Milk'
      ? 54
      : 95);
  const totalCost = Math.round(quantity * unitPrice * 100) / 100;

  const handleQuickAdd = (liters: number) => {
    setQuantity((prev) => Math.max(0.5, Math.round((prev + liters) * 10) / 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      showError('Please enter a valid milk quantity (min 0.5L).');
      return;
    }

    setIsSubmitting(true);
    try {
      const isDeliveredNow = deliveryStatus === 'DELIVERED_NOW';
      const isPaidOnSpot = paymentOption === 'PAID_NOW';

      let taskNotes = '';
      if (isDeliveredNow) {
        taskNotes = isPaidOnSpot
          ? `Paid on spot (₹${totalCost}) via Cash/UPI - Handed over at farm/counter`
          : `Extra milk order (+${quantity}L) - Added to customer monthly dues (₹${totalCost})`;
      } else {
        taskNotes = isPaidOnSpot
          ? `Pre-paid extra order (₹${totalCost}) - Do not collect payment on delivery`
          : `Scheduled extra delivery (+${quantity}L) - Bill ₹${totalCost} upon doorstep delivery`;
      }

      // Add delivery task to database & context state
      await addDeliveryTask({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        address: customer.address,
        area: customer.area,
        route: customer.route,
        dairyName: customer.dairyName || activeDairy?.name || 'DairyPulse Farm HQ',
        productVariant: variant,
        quantityLiters: quantity,
        slot: slot === 'Morning' ? 'Morning (6:00 AM - 7:30 AM)' : 'Evening (5:30 PM - 7:00 PM)',
        assignedRider: selectedRider,
        deliveryDate: deliveryDate,
        isExtraOrder: true,
        status: isDeliveredNow ? 'Delivered' : 'Pending',
        notes: taskNotes,
      });

      const msg = `Successfully recorded +${quantity}L ${variant} (₹${totalCost}) for ${customer.name}! ${
        isDeliveredNow ? 'Delivered right now.' : `Scheduled for dispatch on ${deliveryDate}.`
      } ${
        isPaidOnSpot
          ? 'Paid on the spot (Cash / UPI).'
          : isDeliveredNow
          ? `Added ₹${totalCost} to customer account balance.`
          : `Will be billed upon doorstep delivery.`
      }`;

      showSuccess(msg);
      if (onSuccess) onSuccess(msg);
      onClose();
    } catch (err: any) {
      console.error('Failed to add milk to customer', err);
      showError(err?.message || 'Failed to record extra milk delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Milk className="w-5 h-5 text-teal-100" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base leading-tight truncate">
                Add Milk to Customer
              </h3>
              <p className="text-xs text-teal-200/90 mt-0.5 truncate flex items-center gap-1.5">
                <span>{customer.name}</span>
                <span>•</span>
                <span className="font-mono">{customer.phone}</span>
                {customer.route && (
                  <>
                    <span>•</span>
                    <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      {customer.route}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-stone-900">
          {/* Section: Select Milk Variant */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Select Milk Variety
              </label>
              {customerSub && (
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  Subscribed: {customerSub.quantityLiters}L {customerSub.productVariant}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableVariants.map((item) => {
                const isSelected = variant === item.variant;
                return (
                  <button
                    type="button"
                    key={item.variant}
                    onClick={() => setVariant(item.variant)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/80 ring-2 ring-teal-600/30 font-bold text-teal-950'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm leading-tight text-stone-900">
                      {item.variant}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5 font-medium">
                      ₹{item.price} / Liter
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Milk Quantity Controls */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Milk Quantity (Liters)
            </label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickAdd(-0.5)}
                className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-lg transition cursor-pointer shrink-0 border border-stone-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))
                  }
                  className="w-full text-center text-xl font-extrabold text-stone-900 bg-[#FAF8F5] border border-stone-200 rounded-xl py-2 focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-400">
                  Liters
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAdd(0.5)}
                className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-lg transition cursor-pointer shrink-0 border border-stone-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mt-2">
              {[0.5, 1, 1.5, 2, 3, 5].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setQuantity(preset)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    quantity === preset
                      ? 'bg-teal-800 text-white border-teal-800 font-bold'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {preset}L
                </button>
              ))}
            </div>
          </div>

          {/* Section: Delivery Fulfillment Status */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Fulfillment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryStatus('DELIVERED_NOW')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  deliveryStatus === 'DELIVERED_NOW'
                    ? 'border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Handover / Delivered Now</span>
                <span className="text-[10px] font-normal text-stone-500">
                  Counter pickup or instant drop
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryStatus('SCHEDULE_DISPATCH')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  deliveryStatus === 'SCHEDULE_DISPATCH'
                    ? 'border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Truck className="w-4 h-4 text-teal-700" />
                <span>Schedule for Rider Run</span>
                <span className="text-[10px] font-normal text-stone-500">
                  Adds to morning/evening run
                </span>
              </button>
            </div>
          </div>

          {/* Section: Delivery Details (Date, Slot & Rider) */}
          <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  <span>Delivery Date</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Time Slot</span>
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as 'Morning' | 'Evening')}
                  className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 cursor-pointer min-h-[38px]"
                >
                  <option value="Morning">Morning (06:00 - 07:30)</option>
                  <option value="Evening">Evening (17:30 - 19:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Assigned Delivery Rider</span>
              </label>
              <select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 cursor-pointer min-h-[38px]"
              >
                {deliveryRiders.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.assignedArea || 'Pune Route'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Payment Handling Option */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-600">
                Calculated Amount ({quantity}L × ₹{unitPrice}):
              </span>
              <span className="text-base font-extrabold text-stone-900 tabular-nums">
                ₹{totalCost.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'ADD_TO_DUES'}
                  onChange={() => setPaymentOption('ADD_TO_DUES')}
                  className="mt-0.5 text-teal-700 focus:ring-teal-600"
                />
                <div>
                  <span className="font-bold text-stone-900 block">
                    Add ₹{totalCost} to Monthly Dues
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    {deliveryStatus === 'DELIVERED_NOW'
                      ? 'Added to customer account balance right now and invoice updated.'
                      : 'Will be added to billing statement when marked delivered.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'PAID_NOW'}
                  onChange={() => setPaymentOption('PAID_NOW')}
                  className="mt-0.5 text-teal-700 focus:ring-teal-600"
                />
                <div>
                  <span className="font-bold text-stone-900 block">
                    Paid Now (Cash / Direct UPI Handover)
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    Payment collected immediately. Does not add to monthly customer dues.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Recording...' : `Confirm +${quantity}L ${variant}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
