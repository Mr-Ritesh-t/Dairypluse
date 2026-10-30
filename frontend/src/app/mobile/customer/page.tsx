'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Milk,
  Calendar,
  Clock,
  CheckCircle2,
  Pause,
  Play,
  Plus,
  CreditCard,
  ShieldCheck,
  LogOut,
  Sliders,
  CalendarX2,
  Sparkles,
  User,
  MapPin,
  X,
  Save,
  Phone,
  Mail,
  Home,
  Check,
  Compass,
  Star,
  ThumbsUp,
  Building2,
  Repeat,
  Search,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { DriverRatingModal } from '@/components/delivery/DriverRatingModal';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';

export default function CustomerSelfServiceApp() {
  const {
    allCustomers,
    customers,
    dairies,
    refreshDairies,
    subscriptions,
    toggleSubscriptionPause,
    updateCustomer,
    deliveries,
    staff,
    rateDriver,
    driverRatings,
    invoices,
    recordPayment,
  } = useDairyPulse();
  const { user, logout, updateUser } = useAuth();

  // Find current customer details from all customers or filtered customers
  const customerList = allCustomers && allCustomers.length > 0 ? allCustomers : customers;
  const currentCustomer =
    customerList.find(
      (c) =>
        (user?.customerId && c.id === user.customerId) ||
        c.id === user?.id ||
        (user?.name && c.name.toLowerCase() === user.name.toLowerCase()) ||
        (user?.email && c.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user?.phone && c.phone === user.phone)
    ) ||
    customerList[0] || {
      id: 'c1',
      name: user?.name || 'Priya Kulkarni',
      phone: user?.phone || '+91 94230 77812',
      email: user?.email || 'priya.kulkarni@gmail.com',
      address: 'Flat 402, Rohan Nilay, Baner Road',
      area: 'Baner',
      dairyName: user?.dairyName || 'Amrut Dairy Farm',
      latitude: 18.5593,
      longitude: 73.7788,
      status: 'Active',
      balance: 0,
    };

  const sub =
    subscriptions.find(
      (s) =>
        s.customerId === currentCustomer.id ||
        (currentCustomer.name && s.customerName.toLowerCase() === currentCustomer.name.toLowerCase())
    ) ||
    subscriptions[0] || {
      id: 'sub1',
      customerName: currentCustomer.name || 'Priya Kulkarni',
      productVariant: 'Cow Milk',
      quantityLiters: 1.5,
      timeSlot: 'Morning (6:00 AM - 7:30 AM)',
      status: 'Active',
      unitPrice: 62,
    };

  // Connected customer billing
  const customerInvoices = invoices.filter(
    (inv) =>
      inv.customerId === currentCustomer.id ||
      (currentCustomer.name && inv.customerName.toLowerCase() === currentCustomer.name.toLowerCase())
  );
  const pendingInvoices = customerInvoices.filter((inv) => inv.status !== 'Paid');
  const lastPaidInvoice = customerInvoices.find((inv) => inv.paidAmount > 0);
  const customerBalance = currentCustomer.balance !== undefined ? currentCustomer.balance : pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'SKIP' | 'QUANTITY' | 'EXTRA'>('SKIP');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Driver Rating Modal state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Delivery Task & Assigned Driver Resolution
  const customerDeliveries = deliveries.filter(
    (d) =>
      (currentCustomer.id && d.customerId === currentCustomer.id) ||
      d.customerName.toLowerCase() === (currentCustomer.name || '').toLowerCase() ||
      (currentCustomer.phone && d.customerPhone === currentCustomer.phone)
  );

  const activeOrTodayDelivery = customerDeliveries[0] || (deliveries.length > 0 ? deliveries[0] : null);

  const assignedDriver =
    staff.find(
      (s) =>
        s.role === 'Delivery Rider' &&
        (activeOrTodayDelivery?.assignedRider
          ? s.name.toLowerCase() === activeOrTodayDelivery.assignedRider.toLowerCase()
          : true)
    ) ||
    staff.find((s) => s.role === 'Delivery Rider') || {
      id: 'driver_default',
      name: activeOrTodayDelivery?.assignedRider || 'Rahul Deshmukh',
      role: 'Delivery Rider' as const,
      phone: '+91 98220 11984',
      assignedArea: currentCustomer.area || 'Baner Sector 4',
      status: 'On Duty' as const,
      deliveriesToday: 18,
      rating: 4.9,
      joiningDate: '2026-01-15',
    };

  const currentDriverRating = driverRatings.find(
    (r) =>
      (activeOrTodayDelivery && r.deliveryId && r.deliveryId === activeOrTodayDelivery.id) ||
      (r.driverName.toLowerCase() === assignedDriver.name.toLowerCase() &&
        (r.customerName.toLowerCase() === (currentCustomer.name || '').toLowerCase() ||
          (currentCustomer.id && r.customerId === currentCustomer.id)))
  );

  // Supplying Dairy Resolution & Switch state
  const currentDairyName =
    currentCustomer.dairyName ||
    user?.dairyName ||
    (dairies.length > 0 ? dairies[0].name : 'DairyPulse Farm HQ');

  const supplyingDairy =
    dairies.find((d) => d.name.toLowerCase() === currentDairyName.toLowerCase()) ||
    dairies[0] || {
      id: 'd-current',
      name: currentDairyName,
      ownerName: 'DairyPulse Partner',
      city: 'Pune',
      rating: 4.9,
    };

  const [isChangeDairyOpen, setIsChangeDairyOpen] = useState(false);
  const [dairySwitchSearch, setDairySwitchSearch] = useState('');
  const [isSwitchingDairy, setIsSwitchingDairy] = useState(false);

  const handleSwitchDairy = async (targetDairy: any) => {
    if (targetDairy.name.toLowerCase() === currentDairyName.toLowerCase()) {
      setIsChangeDairyOpen(false);
      return;
    }
    setIsSwitchingDairy(true);
    try {
      const custId = currentCustomer.id || user?.customerId || 'c1';
      await updateCustomer(custId, {
        dairyName: targetDairy.name,
      });
      updateUser({
        dairyName: targetDairy.name,
      });
      showToast(`Supplying farm changed to ${targetDairy.name}! Daily milk will now be delivered by ${targetDairy.name}.`);
      setIsChangeDairyOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to switch dairy farm. Please try again.');
    } finally {
      setIsSwitchingDairy(false);
    }
  };

  // Profile & Map Location Modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentCustomer.name || '');
  const [profilePhone, setProfilePhone] = useState(currentCustomer.phone || '');
  const [profileEmail, setProfileEmail] = useState(currentCustomer.email || '');
  const [profileAddress, setProfileAddress] = useState(currentCustomer.address || '');
  const [profileArea, setProfileArea] = useState(currentCustomer.area || 'Baner');
  const [profileLat, setProfileLat] = useState<number>(currentCustomer.latitude || 18.5593);
  const [profileLng, setProfileLng] = useState<number>(currentCustomer.longitude || 73.7788);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      setProfileName(currentCustomer.name || user?.name || 'Priya Kulkarni');
      setProfilePhone(currentCustomer.phone || user?.phone || '+91 94230 77812');
      setProfileEmail(currentCustomer.email || user?.email || 'priya.kulkarni@gmail.com');
      setProfileAddress(currentCustomer.address || 'Flat 402, Rohan Nilay, Baner Road');
      setProfileArea(currentCustomer.area || 'Baner');
      setProfileLat(currentCustomer.latitude || 18.5593);
      setProfileLng(currentCustomer.longitude || 73.7788);
    }
  }, [currentCustomer, user]);

  const openModal = (tab: 'SKIP' | 'QUANTITY' | 'EXTRA') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const customerId = currentCustomer.id || user?.customerId || 'c1';
      await updateCustomer(customerId, {
        name: profileName.trim(),
        phone: profilePhone.trim(),
        email: profileEmail.trim(),
        address: profileAddress.trim(),
        area: profileArea.trim(),
        latitude: profileLat,
        longitude: profileLng,
      });

      // Update auth context and local storage
      updateUser({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        email: profileEmail.trim(),
        assignedAreaOrRoute: `${profileAddress.trim()} (${profileArea.trim()})`,
      });

      setIsProfileOpen(false);
      showToast('Profile & doorstep map pin saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Error saving profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const customerInitials = (currentCustomer.name || user?.name || 'Priya Kulkarni')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="py-2 flex justify-center w-full">
      <div className="w-full max-w-md min-h-[85vh] bg-slate-100 flex flex-col font-sans rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Mobile Top Header */}
        <div className="bg-emerald-700 text-white p-5 pt-6 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="DairyPulse Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-tight">DairyPulse Customer</h1>
                <p className="text-[11px] text-emerald-200">Doorstep Pure Milk Subscription</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition cursor-pointer border border-white/25 shadow-xs"
                title="My Profile & Doorstep Location"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 text-white transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Address Banner with direct edit button */}
          <div className="flex items-center justify-between text-xs text-emerald-100 mt-2 bg-emerald-800/60 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-emerald-600/40">
            <div className="truncate pr-2">
              <span className="font-bold text-white block truncate">
                {currentCustomer.name || user?.name || 'Priya Kulkarni'}
              </span>
              <span className="text-[11px] text-emerald-200 truncate block">
                📍 {currentCustomer.address || 'Flat 402, Rohan Nilay, Baner'}
              </span>
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-[11px] font-bold text-emerald-200 hover:text-white bg-emerald-700/80 hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer border border-emerald-500/50"
            >
              Change Location
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-12">
          {/* Supplying Dairy Farm Card with Switch Option */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-4 shadow-md border border-emerald-700/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span>Supplying Dairy Farm</span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-800/80 px-1.5 py-0.2 rounded text-emerald-200">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {supplyingDairy.rating || 4.9}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white truncate leading-tight mt-0.5">
                  {supplyingDairy.name}
                </h4>
                <p className="text-[11px] text-emerald-200/90 truncate mt-0.5">
                  Owner: {supplyingDairy.ownerName || (supplyingDairy as any).owner_name || 'Farm Partner'} • {supplyingDairy.city || 'Pune'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                refreshDairies();
                setIsChangeDairyOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-700" />
              <span>Change</span>
            </button>
          </div>

          {/* Active Subscription Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
                  🥛
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Daily Subscription
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                    {sub.productVariant}
                  </h3>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sub.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {sub.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-700">
              <div>
                <span className="text-slate-400 text-[11px] block">Daily Quota:</span>
                <span className="font-extrabold text-slate-900 text-base">{sub.quantityLiters} Liters</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Delivery Slot:</span>
                <span className="font-bold text-slate-900 text-xs">Morning (6:00 AM - 7:30 AM)</span>
              </div>
            </div>

            {/* Smart Delivery Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => toggleSubscriptionPause(sub.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sub.status === 'Active'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {sub.status === 'Active' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Delivery</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Delivery</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openModal('EXTRA')}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order Extra Milk</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openModal('SKIP')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarX2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Skip a Date</span>
              </button>

              <button
                onClick={() => openModal('QUANTITY')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Change Liters</span>
              </button>
            </div>
          </div>

          {/* Doorstep Delivery Location & Profile Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Doorstep Address & Map
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {currentCustomer.name}
                  </h4>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                GPS Pin Active
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-medium shrink-0">Address:</span>
                <span className="text-slate-800 font-semibold">{currentCustomer.address || 'Flat 402, Rohan Nilay, Baner Road'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>
                  Area: <strong className="text-slate-700">{currentCustomer.area || 'Baner'}</strong>
                </span>
                <span>
                  GPS:{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-700 font-mono font-semibold">
                    {currentCustomer.latitude ? `${currentCustomer.latitude.toFixed(4)}, ${currentCustomer.longitude?.toFixed(4)}` : '18.5593, 73.7788'}
                  </code>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Edit Profile & Set Doorstep Map Location</span>
            </button>
          </div>

          {/* In-app Toast Feedback */}
          {toastMessage && (
            <div className="bg-emerald-800 text-white text-xs px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Today's Delivery Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Today's Milk Drop</h4>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                activeOrTodayDelivery?.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700'
                  : activeOrTodayDelivery?.status === 'Out for Delivery' || activeOrTodayDelivery?.status === 'In Progress'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {activeOrTodayDelivery?.status || 'Scheduled'}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  {activeOrTodayDelivery?.deliveredAt
                    ? `Delivered at ${activeOrTodayDelivery.deliveredAt}`
                    : 'Morning Doorstep Slot (6:00 AM - 7:30 AM)'}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Placed inside doorstep insulated milk bag by {assignedDriver.name} (Rider).
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Partner & Driver Rating Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Your Delivery Partner
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5 mt-0.5">
                  <span>{assignedDriver.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{assignedDriver.rating}</span>
                  </span>
                </h4>
              </div>
              <a
                href={`tel:${assignedDriver.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Driver</span>
              </a>
            </div>

            {currentDriverRating ? (
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= currentDriverRating.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1.5">
                      You rated {currentDriverRating.rating} / 5
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRateModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Edit Rating
                  </button>
                </div>
                {currentDriverRating.tags && (
                  <p className="text-[11px] text-emerald-900 font-semibold">
                    ✨ {currentDriverRating.tags}
                  </p>
                )}
                {currentDriverRating.feedback && (
                  <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded-xl border border-emerald-100">
                    &ldquo;{currentDriverRating.feedback}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Rate {assignedDriver.name}&apos;s Service:</span>
                  <span className="text-[10px] text-slate-400">Tap a star to rate</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setIsRateModalOpen(true)}
                      className="p-1 hover:scale-125 transition-transform text-slate-300 hover:text-amber-400 cursor-pointer"
                      title={`Rate ${s} stars`}
                    >
                      <Star className="w-7 h-7 text-amber-400 fill-amber-100 hover:fill-amber-400" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate Your Driver</span>
                </button>
              </div>
            )}
          </div>

          {/* Bill & Account Balance Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Account & Billing</h4>
              <span className={`text-xs font-bold ${customerBalance > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                ₹{customerBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {customerBalance > 0 ? 'Due' : 'Cleared'}
              </span>
            </div>
            {customerInvoices.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-600">
                  {pendingInvoices.length > 0
                    ? `Pending: ${pendingInvoices[0].invoiceNumber} for ${pendingInvoices[0].billingPeriod} (Due: ${pendingInvoices[0].dueDate})`
                    : 'All invoices cleared. Next bill will generate at end of cycle.'}
                </p>
                {lastPaidInvoice && (
                  <p className="text-[11px] text-slate-400">
                    Last payment: ₹{lastPaidInvoice.paidAmount.toLocaleString('en-IN')} on {lastPaidInvoice.issueDate}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Your billing cycle is 1st to 15th of every month. No outstanding dues at this time.
              </p>
            )}
            <button
              onClick={() => {
                if (pendingInvoices.length > 0) {
                  const dueAmt = pendingInvoices[0].totalAmount - pendingInvoices[0].paidAmount;
                  recordPayment(pendingInvoices[0].id, dueAmt);
                  showToast(`Payment of ₹${dueAmt.toLocaleString('en-IN')} recorded successfully!`);
                } else {
                  showToast('Opening UPI Intent (GPay / PhonePe / Paytm)...');
                }
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{customerBalance > 0 ? `Pay ₹${customerBalance.toLocaleString('en-IN')} via UPI` : 'Pay Advance via UPI'}</span>
            </button>
          </div>
        </div>

        {/* Flexible Subscription & Extra Milk Modal */}
        <FlexibleSubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subscriptionId={sub.id}
          customerName={currentCustomer.name || user?.name || sub.customerName}
          currentQuantity={sub.quantityLiters}
          productVariant={sub.productVariant}
          unitPrice={sub.unitPrice || 62}
          initialTab={modalTab}
          onSuccess={() => {
            showToast('Subscription updated successfully!');
          }}
        />

        {/* CUSTOMER PROFILE & MAP LOCATION MODAL */}
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">Customer Profile</h3>
                    <p className="text-xs text-emerald-100">Personal Info & Doorstep GPS Map</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Section 1: Personal Contact Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personal Information</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Priya Kulkarni"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Phone</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 94230 77812"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Email</span>
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address Information */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Doorstep Address</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Flat / House & Society Address</label>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Rohan Nilay, Baner Road"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Area / Neighborhood</label>
                    <select
                      value={profileArea}
                      onChange={(e) => setProfileArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition cursor-pointer"
                    >
                      <option value="Baner">Baner (Pune)</option>
                      <option value="Aundh">Aundh (Pune)</option>
                      <option value="Wakad">Wakad (Pune)</option>
                      <option value="Hinjawadi">Hinjawadi (Pune)</option>
                      <option value="Kothrud">Kothrud (Pune)</option>
                      <option value="Wanowrie">Wanowrie (Pune)</option>
                      <option value="Viman Nagar">Viman Nagar (Pune)</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Interactive Doorstep GPS Map Location */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Set Location on Map</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Rider GPS Guide
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap <strong>"Use My GPS"</strong> or select your landmark on the interactive map so our delivery boy drops your milk bottle accurately at your doorstep.
                  </p>

                  <MapLocationPicker
                    initialLat={profileLat}
                    initialLng={profileLng}
                    areaHint={profileArea}
                    label="Pin Exact Doorstep Coordinates"
                    onLocationSelect={(lat, lng) => {
                      setProfileLat(lat);
                      setProfileLng(lng);
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile & Pin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* DRIVER RATING MODAL */}
        <DriverRatingModal
          isOpen={isRateModalOpen}
          onClose={() => setIsRateModalOpen(false)}
          driverName={assignedDriver.name}
          driverId={assignedDriver.id}
          deliveryId={activeOrTodayDelivery?.id}
          customerId={currentCustomer.id}
          customerName={currentCustomer.name || user?.name || 'Customer'}
          currentRating={currentDriverRating?.rating || 5}
          currentFeedback={currentDriverRating?.feedback || ''}
          onSubmitRating={async (payload) => {
            return await rateDriver(payload);
          }}
          onSuccess={() => {
            showToast(`⭐ Rating saved for ${assignedDriver.name}! Thank you!`);
          }}
        />

        {/* SWITCH DAIRY MODAL */}
        {isChangeDairyOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Change Supplying Dairy</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose which local dairy farm delivers your daily fresh milk.
                  </p>
                </div>
                <button
                  onClick={() => setIsChangeDairyOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={dairySwitchSearch}
                  onChange={(e) => setDairySwitchSearch(e.target.value)}
                  placeholder="Search dairy farm, owner, or city..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Dairies List */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-72">
                {dairies
                  .filter((d) => {
                    const q = dairySwitchSearch.trim().toLowerCase();
                    if (!q) return true;
                    const dName = (d.name || '').toLowerCase();
                    const dCity = (d.city || '').toLowerCase();
                    const dOwner = (d.ownerName || (d as any).owner_name || '').toLowerCase();
                    return dName.includes(q) || dCity.includes(q) || dOwner.includes(q);
                  })
                  .map((d) => {
                    const isCurrent = d.name.toLowerCase() === currentDairyName.toLowerCase();
                    return (
                      <div
                        key={d.id}
                        onClick={() => !isSwitchingDairy && handleSwitchDairy(d)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isCurrent
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{d.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                                  Current Farm
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Owner: {d.ownerName || (d as any).owner_name || 'Farm Owner'} • {d.city || 'Pune'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {d.rating || 4.9}
                          </span>
                          {isCurrent ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200">
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{dairies.length} farms registered</span>
                <button
                  type="button"
                  onClick={() => setIsChangeDairyOpen(false)}
                  className="py-1.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
