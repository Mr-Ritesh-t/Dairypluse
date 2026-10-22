'use client';

import React, { useState } from 'react';
import { X, Milk, UserPlus, Receipt, DollarSign, ShoppingBag } from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { MilkVariant } from '@/types';

export function ModalContainer() {
  const { activeModal, closeModal, addStockReceipt, addCustomer, generateInvoice, addExpense, addShopOrder, customers } = useDairyPulse();

  // Add Stock Form State
  const [stockVariant, setStockVariant] = useState<MilkVariant>('Cow Milk');
  const [stockQty, setStockQty] = useState('500');
  const [supplier, setSupplier] = useState('Sahyadri Farmers Co-Op');
  const [rate, setRate] = useState('48');
  const [stockNotes, setStockNotes] = useState('FAT 4.2%, SNF 8.6% tested ok');

  // Add Customer Form State
  const [custName, setCustName] = useState('');
  const [custType, setCustType] = useState<'HOUSEHOLD' | 'SHOP' | 'RESTAURANT'>('HOUSEHOLD');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custArea, setCustArea] = useState('Baner');
  const [custRoute, setCustRoute] = useState('Route 1 - Morning Baner');

  // Generate Bill State
  const [billCustId, setBillCustId] = useState(customers[0]?.id || '');
  const [billAmount, setBillAmount] = useState('4500');
  const [billPeriod, setBillPeriod] = useState('01 Oct - 15 Oct 2026');

  // Add Expense State
  const [expCategory, setExpCategory] = useState<'Cattle Feed' | 'Fuel & Transport' | 'Cold Storage Electricity' | 'Packaging Pouches' | 'Staff Salaries' | 'Veterinary & Healthcare' | 'Equipment Maintenance'>('Cattle Feed');
  const [expAmount, setExpAmount] = useState('12000');
  const [expVendor, setExpVendor] = useState('');
  const [expMethod, setExpMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [expNotes, setExpNotes] = useState('');

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            {activeModal === 'addStock' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Milk className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'addCustomer' && (
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'generateBill' && (
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'addExpense' && (
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'createOrder' && (
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {activeModal === 'addStock' && 'Add Milk Stock Intake'}
                {activeModal === 'addCustomer' && 'Register New Customer'}
                {activeModal === 'generateBill' && 'Generate Invoice / Bill'}
                {activeModal === 'addExpense' && 'Record Business Expense'}
                {activeModal === 'createOrder' && 'New Commercial Shop Order'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeModal === 'addStock' && 'Record incoming bulk milk cans or tanker supply'}
                {activeModal === 'addCustomer' && 'Add household subscriber or commercial dairy buyer'}
                {activeModal === 'generateBill' && 'Create cycle invoice linked to client ledger'}
                {activeModal === 'addExpense' && 'Log farm or operational expense with category'}
                {activeModal === 'createOrder' && 'Create bulk dairy order for shops or cafes'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Add Stock Form */}
          {activeModal === 'addStock' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addStockReceipt(stockVariant, parseFloat(stockQty) || 0, supplier, parseFloat(rate) || 0, stockNotes);
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milk Variant</label>
                <select
                  value={stockVariant}
                  onChange={(e) => setStockVariant(e.target.value as MilkVariant)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cow Milk">Cow Milk (Standard 4.2% FAT)</option>
                  <option value="Buffalo Milk">Buffalo Milk (Rich 7.0% FAT)</option>
                  <option value="Toned Milk">Toned Milk (3.0% FAT)</option>
                  <option value="A2 Desi Cow Milk">A2 Desi Cow Milk (Gir Cow Organic)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Dairy Co-Op</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Sahyadri Farmers Co-Op"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Notes & Quality Specs</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="FAT %, SNF %, temperature check"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  Record Milk Intake
                </button>
              </div>
            </form>
          )}

          {/* Add Customer Form */}
          {activeModal === 'addCustomer' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCustomer({
                  name: custName,
                  type: custType,
                  phone: custPhone,
                  address: custAddress,
                  area: custArea,
                  route: custRoute,
                  balance: 0,
                  activeSubscriptionsCount: custType === 'HOUSEHOLD' ? 1 : 0,
                  status: 'Active',
                });
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Business Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Anand Sweet Mart or Sunita Kulkarni"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HOUSEHOLD">Household (Daily Milk)</option>
                    <option value="SHOP">Retail Shop (B2B)</option>
                    <option value="RESTAURANT">Hotel / Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98XXX XXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address & Landmark</label>
                <input
                  type="text"
                  required
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Flat/Shop number, building, street"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Sector</label>
                  <input
                    type="text"
                    required
                    value={custArea}
                    onChange={(e) => setCustArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Route</label>
                  <select
                    value={custRoute}
                    onChange={(e) => setCustRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Route 1 - Morning Baner">Route 1 - Morning Baner</option>
                    <option value="Route 2 - Camp & Wanowrie">Route 2 - Camp & Wanowrie</option>
                    <option value="Route 3 - South Hub">Route 3 - South Hub</option>
                    <option value="Route A - Commercial">Route A - Commercial</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Save Customer
                </button>
              </div>
            </form>
          )}

          {/* Generate Bill Form */}
          {activeModal === 'generateBill' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateInvoice(billCustId, parseFloat(billAmount) || 0, billPeriod);
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer</label>
                <select
                  value={billCustId}
                  onChange={(e) => setBillCustId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type}) — {c.area}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Period</label>
                  <input
                    type="text"
                    required
                    value={billPeriod}
                    onChange={(e) => setBillPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 01 Oct - 15 Oct 2026"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Generate & Send Bill
                </button>
              </div>
            </form>
          )}

          {/* Add Expense Form */}
          {activeModal === 'addExpense' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addExpense({
                  category: expCategory,
                  amount: parseFloat(expAmount) || 0,
                  date: new Date().toISOString().split('T')[0],
                  vendor: expVendor || 'Authorized Dairy Vendor',
                  paymentMethod: expMethod,
                  notes: expNotes,
                });
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Cattle Feed">Cattle Feed & Supplements</option>
                  <option value="Fuel & Transport">Fuel & Transport Delivery</option>
                  <option value="Cold Storage Electricity">Cold Storage Electricity & Chilling</option>
                  <option value="Packaging Pouches">Packaging Pouches & Bottles</option>
                  <option value="Staff Salaries">Staff Salaries & Wages</option>
                  <option value="Veterinary & Healthcare">Veterinary & Cattle Healthcare</option>
                  <option value="Equipment Maintenance">Equipment & Plant Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  required
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Godrej Agrovet or Local Fuel Depot"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Invoice Ref</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                  placeholder="Bill / Receipt No. or purpose"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
                >
                  Record Expense
                </button>
              </div>
            </form>
          )}

          {/* Create Order Form */}
          {activeModal === 'createOrder' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addShopOrder({
                  shopName: 'Central Creamery & Cafe',
                  contactPerson: 'Suresh Patil',
                  phone: '+91 98877 66554',
                  orderDate: new Date().toISOString().split('T')[0],
                  deliveryDate: new Date().toISOString().split('T')[0],
                  status: 'Pending',
                  paymentStatus: 'Pending',
                  totalAmount: 6200,
                  paidAmount: 0,
                  items: [{ productVariant: 'Cow Milk', quantity: 100, unit: 'Liter', unitPrice: 62, total: 6200 }],
                });
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shop / Restaurant</label>
                <input
                  type="text"
                  defaultValue="Central Creamery & Cafe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Variant</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500">
                    <option>Cow Milk (100 L)</option>
                    <option>Buffalo Milk (80 L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order Total (₹)</label>
                  <input
                    type="text"
                    defaultValue="6,200"
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition"
                >
                  Create Order
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
