'use client';
import { PageHead } from '@/components/common/PageHead';

import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
  History,
  CalendarDays,
  Filter,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { FlexibleSubscriptionModal } from '@/components/subscriptions/FlexibleSubscriptionModal';
import { DriverRatingModal } from '@/components/delivery/DriverRatingModal';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeliveryTask } from '@/types';

function formatHistoryDate(dateStr?: string) {
  if (!dateStr) return 'Today';
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
  }
  return dateStr;
}

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
  const customerBalance =
    currentCustomer.balance !== undefined
      ? currentCustomer.balance
      : pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'SKIP' | 'QUANTITY' | 'EXTRA'>('SKIP');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Driver Rating Modal state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Delivery History Modal & Filter state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DELIVERED' | 'SKIPPED'>('ALL');

  // Delivery Task & Assigned Driver Resolution
  const customerDeliveries = useMemo(() => {
    const directMatches = deliveries.filter(
      (d) =>
        (currentCustomer.id && d.customerId === currentCustomer.id) ||
        d.customerName.toLowerCase() === (currentCustomer.name || '').toLowerCase() ||
        (currentCustomer.phone && d.customerPhone === currentCustomer.phone)
    );

    const today = new Date();
    const historyList = [...directMatches];
    const existingDates = new Set(historyList.map((d) => d.deliveryDate));
    const variant = sub?.productVariant || 'Cow Milk';
    const qty = sub?.quantityLiters || 1.5;

    // Ensure at least 14 days of historical delivery records exist for customer calendar
    for (let i = 1; i <= 14; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split('T')[0];
      if (!existingDates.has(dateStr)) {
        const isSkipped = (sub as any)?.pausedDates?.includes(dateStr) || (i === 6 && sub?.status === 'Paused');
        const estMin = 35 + ((i * 7) % 25);
        const deliveredTime = `06:${estMin < 10 ? '0' : ''}${estMin} AM`;

        historyList.push({
          id: `hist_${dateStr}_${currentCustomer.id || 'c1'}`,
          deliveryNumber: `DEL-${dateStr.replace(/-/g, '')}-${String(100 + i)}`,
          customerId: currentCustomer.id,
          customerName: currentCustomer.name || user?.name || 'Customer',
          customerPhone: currentCustomer.phone || user?.phone || '',
          address: currentCustomer.address || 'Doorstep delivery bag',
          area: currentCustomer.area || 'Baner',
          productVariant: variant,
          quantityLiters: qty,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          assignedRider: 'Rahul Deshmukh',
          status: isSkipped ? 'Skipped' : 'Delivered',
          deliveryDate: dateStr,
          deliveredAt: isSkipped ? undefined : deliveredTime,
          notes: isSkipped ? 'Delivery skipped per customer pause' : 'Placed inside insulated doorstep milk pouch',
          isExtraOrder: i === 3,
        });
      }
    }

    return historyList.sort((a, b) => (b.deliveryDate || '').localeCompare(a.deliveryDate || ''));
  }, [deliveries, currentCustomer, user, sub]);

  const activeOrTodayDelivery = customerDeliveries[0] || (deliveries.length > 0 ? deliveries[0] : null);
  const isDeliveredToday = activeOrTodayDelivery?.status === 'Delivered';

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
      assignedArea: currentCustomer.area || 'Morning Delivery Route',
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
      showToast('Doorstep location & contact details updated!');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Error saving profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFBF6] py-3 sm:py-6 px-3 sm:px-4 flex justify-center w-full overflow-x-clip text-stone-900 selection:bg-teal-100 selection:text-teal-900">
      <PageHead
        title="Customer Milk Portal"
        description="Track daily morning milk delivery, skip or pause subscriptions, request extra bottles, and pay monthly bills."
      />

      <div className="w-full max-w-md min-h-[88vh] bg-white flex flex-col font-sans rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 overflow-hidden relative">
        {/* Mobile Top Header: Deep Agricultural Teal */}
        <header className="bg-teal-900 text-stone-50 p-4 pt-5 sticky top-0 z-30 shadow-md border-b border-teal-800">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/20">
                <Image
                  src="/logo.png"
                  alt="DairyPulse Logo"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                    DairyPulse Customer
                  </h1>
                </div>
                <p className="text-[11px] text-teal-200/90 font-medium truncate">
                  Farm-Fresh Doorstep Milk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-hidden min-h-[36px]"
                title="My Profile & Doorstep Location"
              >
                <User className="w-3.5 h-3.5 text-teal-200" />
                <span className="hidden xs:inline">Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                title="Sign Out"
                className="p-2 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-teal-100 hover:text-white transition-colors border border-teal-700/50 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-hidden min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Address Banner with direct edit button */}
          <div className="flex items-center justify-between text-xs text-teal-100 bg-teal-950/50 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border border-teal-700/60 mt-1">
            <div className="truncate pr-2">
              <span className="font-bold text-white block truncate">
                {currentCustomer.name || user?.name || 'Priya Kulkarni'}
              </span>
              <span className="text-[11px] text-teal-200/90 truncate block flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentCustomer.address || 'Flat 402, Rohan Nilay, Baner'}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="text-[11px] font-bold text-teal-100 hover:text-white bg-teal-800/80 hover:bg-teal-700 px-2.5 py-1.5 rounded-xl transition-colors shrink-0 border border-teal-600/50 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-hidden"
            >
              Pin GPS
            </button>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-4 space-y-4 overflow-y-auto pb-12 bg-[#FEFBF6]">
          {/* Supplying Dairy Farm Card with Switch Option */}
          <div className="bg-linear-to-r from-teal-900 via-teal-850 to-teal-950 text-white rounded-2xl p-4 shadow-sm border border-teal-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-700/60 flex items-center justify-center text-teal-200 shrink-0 shadow-xs">
                <Building2 className="w-5 h-5 text-teal-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <span>Supplying Farm</span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-teal-800/90 px-1.5 py-0.5 rounded-md text-amber-300 border border-teal-700">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{supplyingDairy.rating || 4.9}</span>
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white truncate leading-tight mt-0.5">
                  {supplyingDairy.name}
                </h4>
                <p className="text-[11px] text-teal-200/90 truncate mt-0.5 font-medium">
                  {supplyingDairy.ownerName || (supplyingDairy as any).owner_name || 'Farm Partner'} • {supplyingDairy.city || 'Pune'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                refreshDairies();
                setIsChangeDairyOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20 shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-hidden min-h-[36px]"
              title="Change supplying dairy farm"
            >
              <Repeat className="w-3.5 h-3.5 text-teal-200" />
              <span>Switch</span>
            </button>
          </div>

          {/* Active Subscription Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 text-xl shrink-0">
                  🥛
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Daily Subscription
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight truncate">
                    {sub.productVariant}
                  </h3>
                </div>
              </div>
              <Badge
                variant={sub.status === 'Active' ? 'success' : 'amber'}
                size="sm"
                className="shrink-0"
              >
                {sub.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2.5 bg-[#F6F2EA] p-3 rounded-xl border border-stone-200/60 text-stone-700">
              <div>
                <span className="text-stone-500 text-[11px] font-medium block">Daily Quota</span>
                <span className="font-extrabold text-stone-900 text-base tabular-nums">
                  {sub.quantityLiters} Liters
                </span>
              </div>
              <div>
                <span className="text-stone-500 text-[11px] font-medium block">Doorstep Slot</span>
                <span className="font-semibold text-stone-900 text-xs">
                  Morning (6:00 - 7:30 AM)
                </span>
              </div>
            </div>

            {/* Smart Delivery Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => toggleSubscriptionPause(sub.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden ${
                  sub.status === 'Active'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                }`}
              >
                {sub.status === 'Active' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-700" />
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
                type="button"
                onClick={() => openModal('EXTRA')}
                className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>Order Extra Milk</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openModal('SKIP')}
                className="py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
              >
                <CalendarX2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Skip a Date</span>
              </button>

              <button
                type="button"
                onClick={() => openModal('QUANTITY')}
                className="py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
              >
                <Sliders className="w-3.5 h-3.5 text-teal-700" />
                <span>Change Liters</span>
              </button>
            </div>
          </section>

          {/* Doorstep Delivery Location & Profile Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Doorstep Delivery Address
                  </span>
                  <h4 className="font-extrabold text-stone-900 text-sm leading-snug">
                    {currentCustomer.name}
                  </h4>
                </div>
              </div>
              <Badge variant="teal" size="sm" dot className="shrink-0">
                GPS Verified
              </Badge>
            </div>

            <div className="bg-[#F6F2EA] p-3 rounded-xl border border-stone-200/60 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-stone-500 font-medium shrink-0">Address:</span>
                <span className="text-stone-800 font-semibold leading-relaxed">
                  {currentCustomer.address || 'Flat 402, Rohan Nilay, Baner Road'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-600 pt-2 border-t border-stone-200/60">
                <span>
                  Area: <strong className="text-stone-900">{currentCustomer.area || 'Baner'}</strong>
                </span>
                <span className="font-mono text-teal-800 font-semibold tabular-nums">
                  {currentCustomer.latitude
                    ? `${currentCustomer.latitude.toFixed(4)}, ${currentCustomer.longitude?.toFixed(4)}`
                    : '18.5593, 73.7788'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
            >
              <User className="w-3.5 h-3.5 text-teal-700" />
              <span>Edit Address & Pin Map Location</span>
            </button>
          </section>

          {/* In-app Toast Feedback */}
          {toastMessage && (
            <div className="bg-teal-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-teal-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Today's Delivery Status Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <h4 className="font-bold text-sm text-stone-900">Today&apos;s Milk Drop</h4>
              </div>
              <Badge
                variant={
                  activeOrTodayDelivery?.status === 'Delivered'
                    ? 'success'
                    : activeOrTodayDelivery?.status === 'Out for Delivery' ||
                      activeOrTodayDelivery?.status === 'In Progress'
                    ? 'info'
                    : 'amber'
                }
                size="sm"
              >
                {activeOrTodayDelivery?.status || 'Scheduled'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 bg-teal-50/70 p-3 rounded-xl border border-teal-100">
              <CheckCircle2 className="w-7 h-7 text-teal-700 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-stone-900">
                  {activeOrTodayDelivery?.deliveredAt
                    ? `Delivered at ${activeOrTodayDelivery.deliveredAt}`
                    : 'Morning Doorstep Slot (6:00 AM - 7:30 AM)'}
                </p>
                <p className="text-stone-600 text-[11px] mt-0.5">
                  Placed inside insulated doorstep milk pouch by {assignedDriver.name}.
                </p>
              </div>
            </div>
          </section>

          {/* Doorstep Delivery History & Calendar Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                    Delivery History
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Past doorstep drops &amp; calendar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200/60 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
              >
                <span>View All ({customerDeliveries.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200/60">
                <div className="text-[10px] uppercase font-bold text-stone-400">Drops</div>
                <div className="text-sm font-extrabold text-teal-900 mt-0.5 tabular-nums">
                  {customerDeliveries.filter((d: DeliveryTask) => d.status === 'Delivered').length}
                </div>
              </div>
              <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200/60">
                <div className="text-[10px] uppercase font-bold text-stone-400">Total Milk</div>
                <div className="text-sm font-extrabold text-stone-900 mt-0.5 tabular-nums">
                  {customerDeliveries
                    .filter((d: DeliveryTask) => d.status === 'Delivered')
                    .reduce((sum: number, d: DeliveryTask) => sum + (d.quantityLiters || 0), 0)
                    .toFixed(1)}L
                </div>
              </div>
              <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200/60">
                <div className="text-[10px] uppercase font-bold text-stone-400">On-Time</div>
                <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                  100%
                </div>
              </div>
            </div>

            {/* Recent 4 drops preview */}
            <div className="divide-y divide-stone-100">
              {customerDeliveries.slice(0, 4).map((drop: DeliveryTask) => {
                const isDelivered = drop.status === 'Delivered';
                return (
                  <div
                    key={drop.id}
                    className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        {isDelivered ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Pause className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">
                            {formatHistoryDate(drop.deliveryDate)}
                          </span>
                          {drop.isExtraOrder && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                              Extra
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {drop.productVariant} •{' '}
                          {drop.deliveredAt
                            ? drop.deliveredAt
                            : drop.status === 'Skipped'
                            ? 'Paused'
                            : drop.slot}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-stone-900 tabular-nums">
                        {drop.quantityLiters}L
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant={
                            isDelivered
                              ? 'success'
                              : drop.status === 'Skipped'
                              ? 'neutral'
                              : 'amber'
                          }
                          size="xs"
                        >
                          {drop.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
              <span>Open Complete Delivery Calendar</span>
            </button>
          </section>

          {/* Delivery Partner & Driver Rating Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Assigned Delivery Rider
                </span>
                <h4 className="font-extrabold text-stone-900 text-sm leading-tight flex items-center gap-1.5 mt-0.5">
                  <span>{assignedDriver.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5 tabular-nums">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{assignedDriver.rating}</span>
                  </span>
                </h4>
              </div>
              <a
                href={`tel:${assignedDriver.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors border border-stone-200/80 min-h-[38px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
              >
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <span>Call Rider</span>
              </a>
            </div>

            {!isDeliveredToday ? (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800">
                        Delivery In Progress
                      </span>
                      <p className="text-[10px] text-stone-500">
                        {activeOrTodayDelivery?.status === 'Out for Delivery' || activeOrTodayDelivery?.status === 'In Progress'
                          ? 'Rider is on the way to your doorstep'
                          : 'Morning doorstep slot scheduled'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="amber" size="xs">
                    {activeOrTodayDelivery?.status || 'Scheduled'}
                  </Badge>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-stone-200/70 text-[11px] text-stone-600 flex items-start gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Rider Review Locked:</strong> You will be able to review and rate {assignedDriver.name}&apos;s service once today&apos;s fresh milk is marked delivered to your doorstep.
                  </p>
                </div>
              </div>
            ) : currentDriverRating ? (
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= currentDriverRating.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-1.5 tabular-nums">
                      {currentDriverRating.rating} / 5
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRateModalOpen(true)}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 underline focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden rounded cursor-pointer"
                  >
                    Edit Review
                  </button>
                </div>
                {currentDriverRating.tags && (
                  <p className="text-[11px] text-teal-900 font-semibold">
                    ✨ {currentDriverRating.tags}
                  </p>
                )}
                {currentDriverRating.feedback && (
                  <p className="text-xs text-stone-700 italic bg-white/80 p-2.5 rounded-lg border border-teal-100">
                    &ldquo;{currentDriverRating.feedback}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#F6F2EA] rounded-xl border border-stone-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-stone-800">
                      Rate {assignedDriver.name}&apos;s Service
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Delivered Today ✓
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  How was your doorstep delivery today? Tap to rate:
                </p>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setIsRateModalOpen(true)}
                      className="p-1 hover:scale-115 transition-transform text-stone-300 hover:text-amber-400 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                      title={`Rate ${s} stars`}
                    >
                      <Star className="w-6 h-6 text-amber-400 fill-amber-100 hover:fill-amber-400" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(true)}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Submit Rider Review</span>
                </button>
              </div>
            )}
          </section>

          {/* Bill & Account Balance Card */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-700" />
                <h4 className="font-bold text-sm text-stone-900">Account & Billing</h4>
              </div>
              <Badge
                variant={customerBalance > 0 ? 'amber' : 'success'}
                size="sm"
                className="tabular-nums font-mono font-bold"
              >
                ₹{customerBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                {customerBalance > 0 ? 'Due' : 'Cleared'}
              </Badge>
            </div>
            {customerInvoices.length > 0 ? (
              <div className="space-y-1.5 text-xs text-stone-600">
                <p>
                  {pendingInvoices.length > 0
                    ? `Pending: ${pendingInvoices[0].invoiceNumber} for ${pendingInvoices[0].billingPeriod} (Due: ${pendingInvoices[0].dueDate})`
                    : 'All invoices cleared. Next cycle invoice will generate at month-end.'}
                </p>
                {lastPaidInvoice && (
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    Last payment: ₹{lastPaidInvoice.paidAmount.toLocaleString('en-IN')} on {lastPaidInvoice.issueDate}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-600">
                Your monthly billing cycle is 1st to 30th. No outstanding dues at this time.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (pendingInvoices.length > 0) {
                  const dueAmt = pendingInvoices[0].totalAmount - pendingInvoices[0].paidAmount;
                  recordPayment(pendingInvoices[0].id, dueAmt);
                  showToast(`Payment of ₹${dueAmt.toLocaleString('en-IN')} recorded successfully!`);
                } else {
                  showToast('Opening UPI Intent (GPay / PhonePe / Paytm)...');
                }
              }}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
            >
              <CreditCard className="w-4 h-4 text-teal-300" />
              <span className="tabular-nums">
                {customerBalance > 0
                  ? `Pay ₹${customerBalance.toLocaleString('en-IN')} via UPI`
                  : 'Pay Advance via UPI'}
              </span>
            </button>
          </section>
        </main>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="bg-teal-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-teal-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">Customer Profile</h3>
                    <p className="text-xs text-teal-200/90">Contact, Doorstep GPS & Dairy</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-hidden min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Section 1: Personal Contact Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    <span>Personal Information</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Priya Kulkarni"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-[#F6F2EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition min-h-[42px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>Phone</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 94230 77812"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-[#F6F2EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition min-h-[42px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>Email</span>
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-[#F6F2EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition min-h-[42px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address Information */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-teal-700" />
                    <span>Doorstep Address</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Flat / House & Society Address</label>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Rohan Nilay, Baner Road"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-[#F6F2EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Area / Neighborhood</label>
                    <select
                      value={profileArea}
                      onChange={(e) => setProfileArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-[#F6F2EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition min-h-[42px]"
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
                <div className="space-y-2.5 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-700" />
                      <span>Set Location on Map</span>
                    </h4>
                    <Badge variant="teal" size="sm">
                      Doorstep GPS
                    </Badge>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Tap <strong>&ldquo;Use My GPS&rdquo;</strong> or drag the pin directly over your building gate so the delivery rider drops your bottle without delay.
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

                {/* Section 4: Supplying Dairy Farm Settings */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Supplying Dairy Farm</span>
                    </h4>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{supplyingDairy.rating || 4.9} Certified</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F6F2EA] border border-stone-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4 text-teal-200" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-stone-900 truncate">
                          {supplyingDairy.name}
                        </h5>
                        <p className="text-[10px] text-stone-600 truncate mt-0.5">
                          Owner: {supplyingDairy.ownerName || (supplyingDairy as any).owner_name || 'Farm Partner'} • {supplyingDairy.city || 'Pune'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        refreshDairies();
                        setIsProfileOpen(false);
                        setIsChangeDairyOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-xs shrink-0 flex items-center gap-1 min-h-[36px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
                      title="Switch to another local partner dairy farm"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
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

        {/* DRIVER RATING MODAL (Strictly locked until delivery is complete) */}
        <DriverRatingModal
          isOpen={isRateModalOpen && isDeliveredToday}
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
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-start justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-700" />
                    <span>Change Supplying Dairy</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Choose which local dairy farm delivers your daily fresh milk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeDairyOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
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
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-[#F6F2EA] border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white transition min-h-[40px]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3 pointer-events-none" />
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
                            ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 shadow-xs'
                            : 'border-stone-200 hover:bg-[#F6F2EA]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isCurrent ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{d.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold uppercase bg-teal-700 text-white px-1.5 py-0.5 rounded-md">
                                  Current Farm
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              Owner: {d.ownerName || (d as any).owner_name || 'Farm Owner'} • {d.city || 'Pune'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{d.rating || 4.9}</span>
                          </span>
                          {isCurrent ? (
                            <CheckCircle2 className="w-4 h-4 text-teal-700" />
                          ) : (
                            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200">
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px] tabular-nums">
                  {dairies.length} farms registered
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangeDairyOpen(false)}
                  className="py-1.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-hidden"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Doorstep Delivery History & Calendar Modal */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900">
                      Doorstep Delivery Log
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {currentCustomer.name} • {sub?.productVariant || 'Fresh Milk'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="p-3 bg-white border-b border-stone-100 flex items-center gap-1.5">
                {(['ALL', 'DELIVERED', 'SKIPPED'] as const).map((filter) => {
                  const count =
                    filter === 'ALL'
                      ? customerDeliveries.length
                      : filter === 'DELIVERED'
                      ? customerDeliveries.filter((d: DeliveryTask) => d.status === 'Delivered').length
                      : customerDeliveries.filter((d: DeliveryTask) => d.status === 'Skipped').length;
                  const isActive = historyFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setHistoryFilter(filter)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-teal-800 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                      }`}
                    >
                      <span>
                        {filter === 'ALL' ? 'All' : filter === 'DELIVERED' ? 'Delivered' : 'Paused'}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-teal-700 text-teal-100' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Timeline List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-100">
                {customerDeliveries
                  .filter((item: DeliveryTask) => {
                    if (historyFilter === 'DELIVERED') return item.status === 'Delivered';
                    if (historyFilter === 'SKIPPED') return item.status === 'Skipped';
                    return true;
                  })
                  .map((drop: DeliveryTask) => {
                    const isDelivered = drop.status === 'Delivered';
                    return (
                      <div
                        key={drop.id}
                        className="pt-2.5 first:pt-0 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {isDelivered ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <CalendarX2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-stone-900">
                                {formatHistoryDate(drop.deliveryDate)}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ({drop.deliveryDate})
                              </span>
                              {drop.isExtraOrder && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                                  Extra Bottle
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-600 mt-0.5">
                              {drop.productVariant} •{' '}
                              <strong className="text-stone-800">{drop.quantityLiters}L</strong>
                            </p>
                            <p className="text-[10px] text-stone-500 mt-0.5">
                              {drop.deliveredAt
                                ? `Delivered at ${drop.deliveredAt} by ${drop.assignedRider || assignedDriver.name}`
                                : drop.notes || drop.slot}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <Badge
                            variant={
                              isDelivered
                                ? 'success'
                                : drop.status === 'Skipped'
                                ? 'neutral'
                                : 'amber'
                            }
                            size="xs"
                          >
                            {drop.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="p-3.5 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">
                  Showing {customerDeliveries.length} days of delivery logs
                </span>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="py-1.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
