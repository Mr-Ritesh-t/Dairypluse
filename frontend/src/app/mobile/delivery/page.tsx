'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  MapPin,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  Milk,
  Receipt,
  Plus,
  Minus,
  Compass,
  Star,
  User,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  Power,
  Award,
  TrendingUp,
  PhoneCall,
  Mail,
  ChevronRight,
  Package,
  Sun,
  Box,
  Check,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { useOfflineDeliverySync } from '@/lib/offlineSync';

export default function DeliveryPartnerMobileApp() {
  const {
    deliveries,
    updateDeliveryStatus,
    dairies,
    activeDairy,
    staff,
    updateStaff,
    getRatingsForDriver,
    riderShiftStatus,
    markAttendance,
    confirmMilkPickup,
    refreshRiderShift,
  } = useDairyPulse();
  const { user, logout } = useAuth();

  // Navigation tab: Deliveries | Stats | Profile
  const [navTab, setNavTab] = useState<'DELIVERIES' | 'STATS' | 'PROFILE'>('DELIVERIES');
  // Stops sub-tab: Pending vs Delivered
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  // Find matching staff record for logged-in rider
  const riderPhoneClean = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const matchedStaff = useMemo(() => {
    return staff.find((s) => {
      if (user?.id && s.id === user.id) return true;
      if (riderPhoneClean && s.phone && s.phone.replace(/\D/g, '').slice(-10) === riderPhoneClean) return true;
      if (user?.name && s.name.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
      return false;
    });
  }, [staff, user, riderPhoneClean]);

  // Determine which dairy the rider belongs to
  const affiliatedDairyName =
    user?.dairyName ||
    matchedStaff?.dairyName ||
    activeDairy?.name ||
    'DairyPulse Farm HQ';

  const matchedDairy = useMemo(() => {
    return (
      dairies.find(
        (d) => d.name.trim().toLowerCase() === affiliatedDairyName.trim().toLowerCase()
      ) ||
      activeDairy ||
      dairies[0] || {
        id: 'dairy-hq',
        name: affiliatedDairyName,
        owner_name: 'Suresh Patil',
        ownerName: 'Suresh Patil',
        email: 'operations@dairypulse.in',
        phone: '+91 98220 12345',
        city: 'Pune, Maharashtra',
        address: 'Survey No. 42, Green Valley Dairy Farm Road, Baner, Pune',
        rating: 4.9,
      }
    );
  }, [dairies, activeDairy, affiliatedDairyName]);

  // Duty status state
  const [isOnDuty, setIsOnDuty] = useState<boolean>(
    matchedStaff ? matchedStaff.status === 'On Duty' : true
  );

  const toggleDutyStatus = async () => {
    const nextStatus = !isOnDuty;
    setIsOnDuty(nextStatus);
    if (matchedStaff?.id) {
      await updateStaff(matchedStaff.id, {
        status: nextStatus ? 'On Duty' : 'Off Duty',
      });
    }
    setSyncToast(
      nextStatus ? '🟢 You are now marked ON DUTY' : '⚪ You are now marked OFF DUTY'
    );
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Offline Sync Hook
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingQueue,
    pendingCount,
    isSyncing,
    recordDeliveryStop,
    triggerManualSync,
  } = useOfflineDeliverySync(user?.name || matchedStaff?.name || 'Rahul Deshmukh');

  // Local state for cash collection per stop
  const [stopData, setStopData] = useState<
    Record<string, { cash: number; notes: string }>
  >({});
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const getStopForm = (id: string) => {
    return stopData[id] || { cash: 0, notes: '' };
  };

  const updateStopForm = (
    id: string,
    field: 'cash' | 'notes',
    value: any
  ) => {
    setStopData((prev) => ({
      ...prev,
      [id]: {
        ...getStopForm(id),
        [field]: value,
      },
    }));
  };

  const handleDeliver = async (stopId: string) => {
    const data = getStopForm(stopId);
    const notesStr = [
      data.notes,
      data.cash > 0 ? `Collected ₹${data.cash} cash` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    // 1. Record via offline sync engine
    const syncRes = await recordDeliveryStop(
      stopId,
      'Delivered',
      notesStr,
      0,
      data.cash
    );

    // 2. Update local DairyPulse context
    updateDeliveryStatus(stopId, 'Delivered', notesStr);

    if (syncRes.offlineQueued) {
      setSyncToast(`Stop queued offline (${pendingCount + 1} pending sync).`);
    } else {
      setSyncToast('✓ Delivered & live synced to farm console!');
    }
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleFail = async (stopId: string) => {
    const reason = prompt('Reason for failed delivery (e.g. Door locked, customer refused):');
    if (!reason) return;

    await recordDeliveryStop(stopId, 'Failed', reason);
    updateDeliveryStatus(stopId, 'Failed', reason);

    setSyncToast('Failed delivery logged.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleManualSyncNow = async () => {
    const res = await triggerManualSync();
    if (res && res.success) {
      setSyncToast(`Synchronized ${res.synced_count} offline stops!`);
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // Show stops assigned to the logged-in rider (or all if admin), ordered by sequence
  const riderName = user?.name || matchedStaff?.name || '';
  const myDeliveries = useMemo(() => {
    return ((user?.role === 'DELIVERY' && riderName)
      ? deliveries.filter(
          (d) =>
            !d.assignedRider ||
            d.assignedRider.toLowerCase().includes(riderName.toLowerCase()) ||
            riderName.toLowerCase().includes(d.assignedRider.toLowerCase())
        )
      : deliveries
    )
      .slice()
      .sort((a, b) => (a.sequenceOrder ?? 9999) - (b.sequenceOrder ?? 9999));
  }, [deliveries, user, riderName]);

  const pendingStops = myDeliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Failed');
  const completedStops = myDeliveries.filter((d) => d.status === 'Delivered');
  const failedStops = myDeliveries.filter((d) => d.status === 'Failed');

  const totalStopsCount = myDeliveries.length;
  const progressPercent =
    totalStopsCount > 0 ? Math.round((completedStops.length / totalStopsCount) * 100) : 0;

  // Liters calculations
  const totalLitersAssigned = myDeliveries.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
  const totalLitersDelivered = completedStops.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
  const totalLitersPending = pendingStops.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);

  // Cash collection total today
  const totalCashCollectedToday = Object.values(stopData).reduce((sum, s) => sum + (s.cash || 0), 0);

  // Lifetime deliveries & rating
  const lifetimeDeliveries = (matchedStaff?.deliveriesToday || 0) + completedStops.length + 842;
  const driverReviews = getRatingsForDriver ? getRatingsForDriver(riderName || 'Rahul Deshmukh') : [];
  const riderRating =
    matchedStaff?.rating ||
    (driverReviews.length > 0
      ? (driverReviews.reduce((sum, r) => sum + r.rating, 0) / driverReviews.length).toFixed(1)
      : 4.9);

  // Variant breakdown
  const variantBreakdown = useMemo(() => {
    const counts: Record<string, { liters: number; stops: number }> = {};
    myDeliveries.forEach((d) => {
      const v = d.productVariant || 'Cow Milk';
      if (!counts[v]) counts[v] = { liters: 0, stops: 0 };
      counts[v].liters += d.quantityLiters || 0;
      counts[v].stops += 1;
    });
    return counts;
  }, [myDeliveries]);

  // Attendance and Milk Pickup States
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState<boolean>(false);
  const [currentTimeString, setCurrentTimeString] = useState<string>('05:30 AM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeString(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's shift status on load
  useEffect(() => {
    if (riderName) {
      refreshRiderShift(riderName, matchedDairy.name);
    }
  }, [riderName, matchedDairy.name]);

  const cratesCount = Math.max(1, Math.ceil(totalLitersAssigned / 12));

  const handleMarkAttendance = async () => {
    setIsCheckingIn(true);
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    await markAttendance(riderName, matchedDairy.name, 'Morning Shift Check-in');
    setIsOnDuty(true);
    if (matchedStaff?.id) {
      updateStaff(matchedStaff.id, { status: 'On Duty' });
    }
    setSyncToast(`🌅 Morning Attendance marked Present at ${nowTime}!`);
    setTimeout(() => setSyncToast(null), 3500);
    setIsCheckingIn(false);
  };

  const handleConfirmPickup = async () => {
    setIsConfirmingPickup(true);
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    await confirmMilkPickup(riderName, totalLitersAssigned, cratesCount, matchedDairy.name, 'Morning route crates verified & sealed');
    setSyncToast(`🥛 Confirmed ${totalLitersAssigned}L (${cratesCount} crates) picked up from ${matchedDairy.name}! Ready for route.`);
    setTimeout(() => setSyncToast(null), 4000);
    setIsConfirmingPickup(false);
  };

  return (
    <div className="py-2 flex justify-center w-full min-h-screen bg-slate-100">
      <div className="w-full max-w-md min-h-[92vh] bg-slate-50 flex flex-col font-sans rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative pb-16">
        
        {/* ================= TOP HEADER BAR ================= */}
        <div className="bg-emerald-800 text-white p-4 pt-5 sticky top-0 z-30 shadow-md">
          {/* Main Bar: Logo, Title, Dairy Badge, and Logout */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {user?.role === 'OWNER' && (
                <a
                  href="/delivery"
                  title="Return to Owner Delivery Management"
                  className="p-1 rounded-lg hover:bg-emerald-700 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </a>
              )}
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="DairyPulse Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm leading-tight tracking-tight">DairyPulse Rider</h1>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isOnDuty ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-500/30 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        isOnDuty ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                  </span>
                </div>
                {/* Rider Name & Role */}
                <p className="text-[11px] text-emerald-200 font-medium">
                  {user?.name || matchedStaff?.name || 'Rahul Deshmukh'} • {user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Baner Route'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Profile Tab Button */}
              <button
                onClick={() => setNavTab(navTab === 'PROFILE' ? 'DELIVERIES' : 'PROFILE')}
                title="View Rider Profile & Dairy Details"
                className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  navTab === 'PROFILE'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'bg-emerald-700/80 hover:bg-emerald-700 text-white'
                }`}
              >
                <User className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                title="Sign Out"
                className="p-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-950 text-white transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DAIRY AFFILIATION BANNER */}
          <div
            onClick={() => setNavTab('PROFILE')}
            className="cursor-pointer bg-emerald-900/70 hover:bg-emerald-900/90 transition-all rounded-xl p-2.5 mb-2.5 flex items-center justify-between border border-emerald-700/60 shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0 text-emerald-100">
                <Building2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Affiliated Dairy Farm
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-500/30 text-emerald-100 px-1.5 py-0.2 rounded">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <h2 className="text-xs font-bold text-white truncate">
                  {matchedDairy.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-200 font-semibold shrink-0 pl-2">
              <span>View Dairy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* QUICK METRICS STRIP: Drops, Liters, Cash, Rating */}
          <div className="grid grid-cols-4 gap-1.5 bg-emerald-950/40 p-2 rounded-xl text-center">
            <div className="p-1">
              <span className="text-[10px] block text-emerald-300 font-medium">Drops</span>
              <span className="text-xs font-extrabold text-white">
                {completedStops.length}/{totalStopsCount}
              </span>
            </div>
            <div className="p-1 border-l border-emerald-800/60">
              <span className="text-[10px] block text-emerald-300 font-medium">Liters</span>
              <span className="text-xs font-extrabold text-emerald-200">
                {totalLitersDelivered}L
              </span>
            </div>
            <div className="p-1 border-l border-emerald-800/60">
              <span className="text-[10px] block text-emerald-300 font-medium">Cash</span>
              <span className="text-xs font-extrabold text-amber-300">
                ₹{totalCashCollectedToday}
              </span>
            </div>
            <div className="p-1 border-l border-emerald-800/60">
              <span className="text-[10px] block text-emerald-300 font-medium">Rating</span>
              <span className="text-xs font-extrabold text-amber-200 inline-flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300 inline" />
                {riderRating}
              </span>
            </div>
          </div>

          {/* VIEW SWITCHER TABS: Deliveries vs Shift Stats vs Profile */}
          <div className="grid grid-cols-3 gap-1 bg-emerald-950/60 p-1 rounded-xl mt-2.5 text-xs font-bold text-center">
            <button
              data-tab="deliveries"
              onClick={() => setNavTab('DELIVERIES')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                navTab === 'DELIVERIES'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Stops ({pendingStops.length})</span>
            </button>
            <button
              data-tab="stats"
              onClick={() => setNavTab('STATS')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                navTab === 'STATS'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stats & Cash</span>
            </button>
            <button
              data-tab="profile"
              onClick={() => setNavTab('PROFILE')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                navTab === 'PROFILE'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Dairy & Profile</span>
            </button>
          </div>
        </div>

        {/* ================= FLOATING TOAST NOTIFICATION ================= */}
        {syncToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-500/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-slate-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* ================= MAIN VIEW CONTENT ================= */}

        {/* 1. DELIVERIES TAB */}
        {navTab === 'DELIVERIES' && (
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {/* ================= MORNING ATTENDANCE & DAIRY PICKUP CHECKLIST ================= */}
            {!riderShiftStatus?.attendanceMarked ? (
              // STEP 1: ATTENDANCE CHECK-IN CARD
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                        Step 1: Daily Check-in
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                        Mark Morning Attendance
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs tabular-nums">
                    {currentTimeString}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Good Morning, <strong>{riderName}</strong>! Please mark your daily shift attendance at <strong>{matchedDairy.name}</strong> before picking up your milk crates and starting your route.
                </p>

                <button
                  onClick={handleMarkAttendance}
                  disabled={isCheckingIn}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCheckingIn ? 'Marking Attendance...' : 'Mark Present for Morning Shift'}</span>
                </button>
              </div>
            ) : !riderShiftStatus?.pickupConfirmed ? (
              // STEP 2: DAIRY HUB MILK PICKUP CONFIRMATION CARD
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Milk className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-200/70 px-2 py-0.5 rounded-full">
                        Step 2: Milk Loadout
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                        Confirm Dairy Milk Pickup
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Attended ({riderShiftStatus?.checkInTime || '05:30 AM'})</span>
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Dairy Hub Location:</span>
                    <strong className="text-slate-900">{matchedDairy.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Assigned Route Volume:</span>
                    <strong className="text-emerald-700 text-sm font-black">{totalLitersAssigned} Liters</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Estimated Crates:</span>
                    <strong className="text-blue-700 font-bold">{cratesCount} Crates ({totalStopsCount} stops)</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Route Area:</span>
                    <span className="text-slate-800 font-semibold">{user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Baner Route'}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPickup}
                  disabled={isConfirmingPickup}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Box className="w-4 h-4" />
                  <span>{isConfirmingPickup ? 'Confirming Pickup...' : 'Confirm Milk Picked Up & Start Route 🚀'}</span>
                </button>
              </div>
            ) : (
              // STEP 3: SHIFT & PICKUP ACTIVE SUMMARY
              <div className="bg-white border border-emerald-200 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900">Morning Shift Dispatched</span>
                      <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        ROUTE ACTIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Checked in: {riderShiftStatus?.checkInTime} • Picked Up: {riderShiftStatus?.pickupLiters || totalLitersAssigned}L at {riderShiftStatus?.pickupTime || '06:00 AM'} from {matchedDairy.name}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shrink-0">
                  Ready
                </span>
              </div>
            )}

            {/* Network & Offline Status Banner */}
            <div
              className={`p-2.5 rounded-2xl flex items-center justify-between transition-all border ${
                !isOnline
                  ? 'bg-amber-500/10 border-amber-400/40 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <span className="font-extrabold block text-xs text-amber-950">Offline Sync Active</span>
                      <span className="text-[10px] text-amber-800">
                        {pendingCount} stop{pendingCount !== 1 ? 's' : ''} saved locally
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-xs text-emerald-950">Cloud Connected</span>
                      <span className="text-[10px] text-emerald-700">
                        {pendingCount > 0 ? `${pendingCount} stops pending sync` : 'Live synchronized to dairy farm'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {pendingCount > 0 && isOnline && (
                  <button
                    onClick={handleManualSyncNow}
                    disabled={isSyncing}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync ({pendingCount})</span>
                  </button>
                )}

                {/* Simulated Offline Toggle */}
                <button
                  onClick={toggleSimulatedOffline}
                  title="Toggle simulated network disconnection for offline delivery testing"
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[10px] font-bold transition"
                >
                  {isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}
                </button>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Route Run Progress</span>
                </span>
                <span className="tabular-nums text-emerald-700">
                  {completedStops.length} of {totalStopsCount} Stops ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Total Route Volume: <strong className="text-slate-800">{totalLitersAssigned} Liters</strong></span>
                <span>Remaining: <strong className="text-amber-600">{totalLitersPending} Liters</strong></span>
              </div>
            </div>

            {/* Pending vs Delivered sub-tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-center">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Deliveries ({pendingStops.length})
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delivered Completed ({completedStops.length})
              </button>
            </div>

            {/* Stops List */}
            <div className="space-y-3">
              {activeTab === 'PENDING' ? (
                pendingStops.length > 0 ? (
                  pendingStops.map((stop, index) => {
                    const estimatedMinutes = 45 + index * 8;
                    const estHour = Math.floor(estimatedMinutes / 60) + 5;
                    const estMin = estimatedMinutes % 60;
                    const estTimeString = `0${estHour}:${estMin < 10 ? '0' : ''}${estMin} AM`;

                    const formData = getStopForm(stop.id);
                    const isStopQueued = pendingQueue.some((q) => q.delivery_id === stop.id);

                    return (
                      <div
                        key={stop.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 transition-all hover:border-emerald-300"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-extrabold tabular-nums">
                                Stop #{stop.sequenceOrder || index + 1}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                ETA: {estTimeString} • {stop.slot}
                              </span>
                              {isStopQueued && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                  Queued Offline
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-base text-slate-900 leading-snug">{stop.customerName}</h3>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl shrink-0">
                            {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {stop.flatOrUnit && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                                🚪 Door: {stop.flatOrUnit}
                              </span>
                            )}
                            {stop.societyOrLandmark && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold">
                                🏢 Society: {stop.societyOrLandmark}
                              </span>
                            )}
                            {stop.isExtraOrder && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                                ✨ Extra Order
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span>{stop.address}</span>
                              {stop.landmark && (
                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                  📍 Landmark: {stop.landmark}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {stop.notes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl font-medium">
                            📝 Note: {stop.notes}
                          </p>
                        )}

                        {/* Cash Collection Input */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-purple-600" />
                              <span>Cash Collected (₹):</span>
                            </span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={formData.cash || ''}
                              onChange={(e) =>
                                updateStopForm(
                                  stop.id,
                                  'cash',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 px-2.5 py-1 text-right font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Exact Doorstep GPS Navigation */}
                        {stop.latitude && stop.longitude && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50/90 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Exact GPS Doorstep Pinned</span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5"
                            >
                              <span>Navigate</span>
                              <Navigation className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Actions: Call, Directions, Failed, Done */}
                        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                          <a
                            href={`tel:${stop.customerPhone}`}
                            className="flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span>Call</span>
                          </a>
                          <a
                            href={
                              stop.latitude && stop.longitude
                                ? `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition"
                            title={stop.latitude ? `Navigate to pinned coordinates (${stop.latitude}, ${stop.longitude})` : 'Search address in Google Maps'}
                          >
                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                            <span>{stop.latitude ? 'GPS' : 'Map'}</span>
                          </a>
                          <button
                            onClick={() => handleFail(stop.id)}
                            className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Failed
                          </button>
                          <button
                            onClick={() => handleDeliver(stop.id)}
                            className="flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">All Route Deliveries Complete!</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Great job! You have completed all assigned stops for {matchedDairy.name}.
                    </p>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                      <div className="font-bold">Total Delivered Today: {totalLitersDelivered} Liters</div>
                      <div>Cash Collected: ₹{totalCashCollectedToday}</div>
                    </div>
                    {pendingCount > 0 && (
                      <button
                        onClick={handleManualSyncNow}
                        className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                      >
                        Sync {pendingCount} Pending Stops Now
                      </button>
                    )}
                  </div>
                )
              ) : (
                completedStops.length > 0 ? (
                  completedStops.map((stop) => (
                    <div
                      key={stop.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs opacity-95 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              ✓ Delivered
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Stop #{stop.sequenceOrder}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{stop.customerName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{stop.address}</p>
                          {stop.notes && (
                            <p className="text-[10px] text-emerald-700 mt-1 bg-emerald-50 p-1.5 rounded-lg">
                              {stop.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                          {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500 text-xs">
                    No stops marked as delivered yet today.
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 2. STATS & PERFORMANCE VIEW */}
        {navTab === 'STATS' && (
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {/* Shift Performance Summary */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Today's Delivery Shift</h3>
                  <p className="text-[11px] text-slate-500">Live stats for {matchedDairy.name}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Active Shift
                </span>
              </div>

              {/* 4 Large Highlight Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Stops Completed
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-950">{completedStops.length}</span>
                    <span className="text-xs font-bold text-emerald-600">/ {totalStopsCount}</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                    {progressPercent}% route finished
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Volume Delivered
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-blue-950">{totalLitersDelivered}</span>
                    <span className="text-xs font-bold text-blue-600">L / {totalLitersAssigned}L</span>
                  </div>
                  <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${totalLitersAssigned ? (totalLitersDelivered / totalLitersAssigned) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 mt-1 block">
                    {totalLitersPending} L remaining
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Cash in Hand
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-950">₹{totalCashCollectedToday}</span>
                  </div>
                  <span className="text-[10px] text-amber-800 mt-1.5 block">
                    Collected at doorsteps today
                  </span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Partner Rating
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-2xl font-black text-purple-950">{riderRating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-800 mt-1.5 block">
                    {driverReviews.length > 0 ? `${driverReviews.length} customer ratings` : '5-star certified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Milk Volume Breakdown by Variant */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Milk className="w-4 h-4 text-emerald-600" />
                <span>Today's Milk Variety Distribution</span>
              </h4>
              <div className="space-y-2 pt-1">
                {Object.entries(variantBreakdown).map(([variant, data]) => (
                  <div
                    key={variant}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{variant}</span>
                        <span className="text-[10px] text-slate-500">{data.stops} drop-offs</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                      {data.liters} Liters
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime Rider Achievements */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">Lifetime Rider Achievements</h4>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-amber-300 block">{lifetimeDeliveries}+</span>
                  <span className="text-[9px] text-emerald-200 uppercase font-semibold">Total Drops</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-emerald-300 block">98.8%</span>
                  <span className="text-[9px] text-emerald-200 uppercase font-semibold">On-Time</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-white block">100%</span>
                  <span className="text-[9px] text-emerald-200 uppercase font-semibold">Freshness</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews for Driver */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Recent Customer Compliments</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-500">Verified Doorstep</span>
              </div>

              <div className="space-y-2 pt-1">
                {driverReviews.length > 0 ? (
                  driverReviews.slice(0, 3).map((rev, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{rev.customerName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        "{rev.feedback || 'Always on time and leaves milk safely in pouch!'}"
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Priya Kulkarni</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        "Extremely punctual delivery every morning at 6:30 AM sharp. Very polite and handles milk bottles with care."
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Amit Verma</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        "Great service! Even during rainy days milk is always sealed and dry."
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. PROFILE & DAIRY AFFILIATION VIEW */}
        {navTab === 'PROFILE' && (
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {/* DAIRY AFFILIATION CARD */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Your Affiliated Dairy
                </span>
                <span className="text-[10px] font-bold text-emerald-300">
                  {matchedDairy.city || 'Pune, MH'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {matchedDairy.name}
                </h2>
                <p className="text-xs text-emerald-200 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>{matchedDairy.address || 'Green Valley Milk District, Pune'}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-300 font-semibold block">Farm Manager / Owner</span>
                  <span className="font-bold text-white">{matchedDairy.owner_name || matchedDairy.ownerName || 'Suresh Patil'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${matchedDairy.phone || '+919822012345'}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl shadow-xs transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Hub</span>
                  </a>
                </div>
              </div>
            </div>

            {/* TODAY'S ATTENDANCE & DAIRY PICKUP LOG */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Today's Morning Shift Status</h4>
                    <p className="text-[11px] text-slate-500">
                      {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  riderShiftStatus?.attendanceMarked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {riderShiftStatus?.attendanceMarked ? 'Present 🟢' : 'Pending Check-in'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 block">Morning Check-in</span>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {riderShiftStatus?.checkInTime || 'Pending'}
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    riderShiftStatus?.attendanceMarked ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{riderShiftStatus?.attendanceMarked ? 'Attendance Marked' : 'Not Checked In'}</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 block">Dairy Hub Pickup</span>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {riderShiftStatus?.pickupConfirmed ? (riderShiftStatus.pickupTime || 'Done') : 'Pending'}
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    riderShiftStatus?.pickupConfirmed ? 'text-blue-700' : 'text-slate-500'
                  }`}>
                    <Box className="w-3 h-3" />
                    <span>
                      {riderShiftStatus?.pickupConfirmed
                        ? `${riderShiftStatus.pickupLiters || totalLitersAssigned}L (${riderShiftStatus.pickupCrates || cratesCount} Crates)`
                        : 'Awaiting Pickup'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Quick Action buttons if either step is pending */}
              {(!riderShiftStatus?.attendanceMarked || !riderShiftStatus?.pickupConfirmed) && (
                <div className="flex gap-2 pt-1">
                  {!riderShiftStatus?.attendanceMarked && (
                    <button
                      onClick={handleMarkAttendance}
                      disabled={isCheckingIn}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                    >
                      {isCheckingIn ? 'Marking...' : 'Mark Attendance'}
                    </button>
                  )}
                  {riderShiftStatus?.attendanceMarked && !riderShiftStatus?.pickupConfirmed && (
                    <button
                      onClick={handleConfirmPickup}
                      disabled={isConfirmingPickup}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                    >
                      {isConfirmingPickup ? 'Confirming...' : 'Confirm Milk Pickup'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* RIDER PROFILE & IDENTITY CARD */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {(user?.name || matchedStaff?.name || 'R')[0]}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">
                      {user?.name || matchedStaff?.name || 'Rahul Deshmukh'}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-emerald-700">Official Delivery Partner</p>
                  <p className="text-[11px] text-slate-500">
                    Staff ID: #{matchedStaff?.id || user?.id || 'RDR-2024'}
                  </p>
                </div>
              </div>

              {/* Duty Toggle Card */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Duty Status</span>
                  <span className="text-[11px] text-slate-500">
                    {isOnDuty ? 'Receiving deliveries & tracking live' : 'Offline / On Break'}
                  </span>
                </div>
                <button
                  onClick={toggleDutyStatus}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs ${
                    isOnDuty
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
                </button>
              </div>

              {/* Rider Identity Breakdown */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Registered Phone</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {user?.phone || matchedStaff?.phone || '+91 98765 43210'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {user?.email || matchedStaff?.email || 'rider@dairypulse.in'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned Route & Area</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Baner Route - Sector 4 & 5'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shift Slot</span>
                  </span>
                  <span className="font-bold text-slate-800">Morning (5:30 AM - 8:30 AM)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joining Date</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {matchedStaff?.joiningDate || '15 Jan 2024'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vehicle & Crate</span>
                  </span>
                  <span className="font-bold text-slate-800">Two-Wheeler + Chiller Bag</span>
                </div>
              </div>

              {/* Emergency Hotline */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-rose-950 block">Emergency Dispatch Line</span>
                  <span className="text-[10px] text-rose-700">Call if flat tyre or delivery block</span>
                </div>
                <a
                  href={`tel:${matchedDairy.phone || '+919822012345'}`}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Dispatch</span>
                </a>
              </div>

              {/* Log Out Button */}
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-rose-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Rider Account</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= BOTTOM APP NAVIGATION BAR ================= */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
          <button
            data-bottom-tab="deliveries"
            onClick={() => setNavTab('DELIVERIES')}
            className={`flex flex-col items-center gap-1 transition ${
              navTab === 'DELIVERIES' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <Truck className="w-5 h-5" />
              {pendingStops.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingStops.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Stops</span>
          </button>

          <button
            data-bottom-tab="stats"
            onClick={() => setNavTab('STATS')}
            className={`flex flex-col items-center gap-1 transition ${
              navTab === 'STATS' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Shift Stats</span>
          </button>

          <button
            data-bottom-tab="profile"
            onClick={() => setNavTab('PROFILE')}
            className={`flex flex-col items-center gap-1 transition ${
              navTab === 'PROFILE' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile & Dairy</span>
          </button>
        </div>

      </div>
    </div>
  );
}
