'use client';

import React, { useState, useEffect } from 'react';
import { X, Milk, UserPlus, Receipt, DollarSign, ShoppingBag, AlertTriangle, Building2, MapPin, Save, Compass } from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { MilkVariant } from '@/types';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';

export function ModalContainer() {
  const {
    activeModal,
    closeModal,
    addStockReceipt,
    recordWastage,
    addCustomer,
    generateInvoice,
    addExpense,
    addShopOrder,
    customers,
    dairies,
    updateDairy,
  } = useDairyPulse();
  const { user, updateUser } = useAuth();

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
  const [custLat, setCustLat] = useState<number>(18.5593);
  const [custLng, setCustLng] = useState<number>(73.7788);

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

  // Create Order State
  const [orderShopName, setOrderShopName] = useState('Central Creamery & Cafe');
  const [orderContact, setOrderContact] = useState('Suresh Patil');
  const [orderPhone, setOrderPhone] = useState('+91 98877 66554');
  const [orderVariant, setOrderVariant] = useState<MilkVariant>('Cow Milk');
  const [orderQty, setOrderQty] = useState('100');
  const [orderRate, setOrderRate] = useState('62');

  // Log Wastage State
  const [wastageVariant, setWastageVariant] = useState<MilkVariant>('Cow Milk');
  const [wastageQty, setWastageQty] = useState('5.0');
  const [wastageReason, setWastageReason] = useState('Packaging pouch line calibration loss');

  // Dairy Profile & Location State
  const [profileDairyId, setProfileDairyId] = useState('');
  const [profileDairyName, setProfileDairyName] = useState('');
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [profileDairyEmail, setProfileDairyEmail] = useState('');
  const [profileDairyPhone, setProfileDairyPhone] = useState('');
  const [profileDairyCity, setProfileDairyCity] = useState('Pune');
  const [profileDairyAddress, setProfileDairyAddress] = useState('');
  const [profileDairyLat, setProfileDairyLat] = useState<number>(18.5089);
  const [profileDairyLng, setProfileDairyLng] = useState<number>(73.9259);
  const [isSavingDairy, setIsSavingDairy] = useState(false);

  useEffect(() => {
    if (activeModal === 'dairyProfile') {
      const current =
        dairies.find((d) => d.name === (user as any)?.dairyName || d.email === user?.email) ||
        dairies[0];
      if (current) {
        setProfileDairyId(current.id);
        setProfileDairyName(current.name);
        setProfileOwnerName(current.ownerName || (current as any).owner_name || user?.name || '');
        setProfileDairyEmail(current.email || user?.email || '');
        setProfileDairyPhone(current.phone || user?.phone || '');
        setProfileDairyCity(current.city || 'Pune');
        setProfileDairyAddress(current.address || 'Hadapsar Chilling Center, Pune');
        setProfileDairyLat(current.latitude || 18.5089);
        setProfileDairyLng(current.longitude || 73.9259);
      }
    }
  }, [activeModal, dairies, user]);

  const handleSaveDairyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDairy(true);
    try {
      await updateDairy(profileDairyId || dairies[0]?.id || 'dairy-1', {
        name: profileDairyName,
        ownerName: profileOwnerName,
        email: profileDairyEmail,
        phone: profileDairyPhone,
        city: profileDairyCity,
        address: profileDairyAddress,
        latitude: profileDairyLat,
        longitude: profileDairyLng,
      });
      if (updateUser) {
        updateUser({
          dairyName: profileDairyName,
          name: profileOwnerName,
          email: profileDairyEmail,
          phone: profileDairyPhone,
        });
      }
      closeModal();
    } catch (err) {
      console.error('Error updating dairy:', err);
    } finally {
      setIsSavingDairy(false);
    }
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full ${activeModal === 'dairyProfile' ? 'max-w-2xl max-h-[92vh] flex flex-col' : 'max-w-lg'} overflow-hidden animate-in zoom-in-95 duration-150`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
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
            {activeModal === 'logWastage' && (
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'dairyProfile' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {activeModal === 'addStock' && 'Add Milk Stock Intake'}
                {activeModal === 'addCustomer' && 'Register New Customer'}
                {activeModal === 'generateBill' && 'Generate Invoice / Bill'}
                {activeModal === 'addExpense' && 'Record Business Expense'}
                {activeModal === 'createOrder' && 'New Commercial Shop Order'}
                {activeModal === 'logWastage' && 'Log Milk Wastage / Leakage'}
                {activeModal === 'dairyProfile' && 'Dairy Farm Profile & Plant Location'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeModal === 'addStock' && 'Record incoming bulk milk cans or tanker supply'}
                {activeModal === 'addCustomer' && 'Add household subscriber or commercial dairy buyer'}
                {activeModal === 'generateBill' && 'Create cycle invoice linked to client ledger'}
                {activeModal === 'addExpense' && 'Log farm or operational expense with category'}
                {activeModal === 'createOrder' && 'Create bulk dairy order for shops or cafes'}
                {activeModal === 'logWastage' && 'Record spoilage, line calibration loss, or transit damage'}
                {activeModal === 'dairyProfile' && 'Configure plant hub coordinates, contact info, and route origin'}
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
        <div className="p-6 overflow-y-auto">
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
                  latitude: custLat,
                  longitude: custLng,
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

              {/* Pin location on map for delivery rider */}
              <MapLocationPicker
                initialLat={custLat}
                initialLng={custLng}
                areaHint={custArea}
                onLocationSelect={(lat, lng) => {
                  setCustLat(lat);
                  setCustLng(lng);
                }}
                label="Pin Delivery Location on Map"
                compact={false}
              />
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
                const qty = parseFloat(orderQty) || 0;
                const unitRate = parseFloat(orderRate) || 0;
                const total = qty * unitRate;
                addShopOrder({
                  shopName: orderShopName,
                  contactPerson: orderContact,
                  phone: orderPhone,
                  orderDate: new Date().toISOString().split('T')[0],
                  deliveryDate: new Date().toISOString().split('T')[0],
                  status: 'Pending',
                  paymentStatus: 'Pending',
                  totalAmount: total,
                  paidAmount: 0,
                  items: [
                    {
                      productVariant: orderVariant,
                      quantity: qty,
                      unit: 'Liter',
                      unitPrice: unitRate,
                      total,
                    },
                  ],
                });
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shop / Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={orderShopName}
                  onChange={(e) => setOrderShopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Central Creamery & Cafe"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={orderContact}
                    onChange={(e) => setOrderContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Suresh Patil"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="+91 98877 66554"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Milk Variant</label>
                  <select
                    value={orderVariant}
                    onChange={(e) => setOrderVariant(e.target.value as MilkVariant)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Cow Milk">Cow Milk</option>
                    <option value="Buffalo Milk">Buffalo Milk</option>
                    <option value="Toned Milk">Toned Milk</option>
                    <option value="A2 Desi Cow Milk">A2 Desi Cow Milk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (L)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={orderRate}
                    onChange={(e) => setOrderRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Total (₹)</label>
                <div className="w-full px-3.5 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm font-bold text-purple-900">
                  ₹{((parseFloat(orderQty) || 0) * (parseFloat(orderRate) || 0)).toLocaleString('en-IN')}
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
                  Create Bulk Order
                </button>
              </div>
            </form>
          )}

          {/* Log Wastage Form */}
          {activeModal === 'logWastage' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                recordWastage(wastageVariant, parseFloat(wastageQty) || 0, wastageReason);
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milk Variant</label>
                <select
                  value={wastageVariant}
                  onChange={(e) => setWastageVariant(e.target.value as MilkVariant)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Cow Milk">Cow Milk</option>
                  <option value="Buffalo Milk">Buffalo Milk</option>
                  <option value="Toned Milk">Toned Milk</option>
                  <option value="A2 Desi Cow Milk">A2 Desi Cow Milk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Wastage Quantity (Liters)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  value={wastageQty}
                  onChange={(e) => setWastageQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Batch Cause</label>
                <input
                  type="text"
                  required
                  value={wastageReason}
                  onChange={(e) => setWastageReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Pouch sealing heat loss, testing sample, bottle cracked"
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Record Wastage
                </button>
              </div>
            </form>
          )}

          {/* Dairy Farm Profile & Location Modal */}
          {activeModal === 'dairyProfile' && (
            <form onSubmit={handleSaveDairyProfile} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your dairy farm location serves as the central depot and start point for all delivery route calculations.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dairy Farm / Business Name</label>
                  <input
                    type="text"
                    required
                    value={profileDairyName}
                    onChange={(e) => setProfileDairyName(e.target.value)}
                    placeholder="e.g. Amrut Dairy Farm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / Operator Name</label>
                  <input
                    type="text"
                    required
                    value={profileOwnerName}
                    onChange={(e) => setProfileOwnerName(e.target.value)}
                    placeholder="e.g. Ritesh Patil"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profileDairyPhone}
                    onChange={(e) => setProfileDairyPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileDairyEmail}
                    onChange={(e) => setProfileDairyEmail(e.target.value)}
                    placeholder="e.g. contact@amrutdairy.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={profileDairyCity}
                    onChange={(e) => setProfileDairyCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    required
                    value={profileDairyAddress}
                    onChange={(e) => setProfileDairyAddress(e.target.value)}
                    placeholder="e.g. Survey No. 42, Manjri Chilling Center, Hadapsar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Map Location Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Exact Dairy / Farm Location on Map</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-lg font-semibold">
                      {profileDairyLat.toFixed(4)}, {profileDairyLng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Click anywhere on the map or drag the pin to set your dairy processing plant or farm hub location.
                </p>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <MapLocationPicker
                    initialLat={profileDairyLat}
                    initialLng={profileDairyLng}
                    onLocationSelect={(lat, lng) => {
                      setProfileDairyLat(lat);
                      setProfileDairyLng(lng);
                    }}
                    label={profileDairyName || 'Dairy Plant Hub'}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDairy}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSavingDairy ? 'Saving Changes...' : 'Save Dairy Profile & Location'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
