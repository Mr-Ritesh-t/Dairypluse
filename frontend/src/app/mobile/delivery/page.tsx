'use client';
import { PageHead } from '@/components/common/PageHead';

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
  Home,
  FileText,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { useOfflineDeliverySync } from '@/lib/offlineSync';
import { calculateRouteProgress } from '@/lib/calculations/delivery';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
    completeShift,
    salaryPayments,
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

  const routeProgress = calculateRouteProgress(completedStops.length, myDeliveries.length);
  const totalStopsCount = routeProgress.total;
  const progressPercent = routeProgress.percentage;

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

  // Shift Completion & Daily Salary Claiming
  const [isCompletingShift, setIsCompletingShift] = useState<boolean>(false);
  const dailySalaryRate = matchedStaff?.dailySalary || riderShiftStatus?.dailySalaryRate || 500;
  const isAllStopsDelivered = totalStopsCount > 0 && pendingStops.length === 0;

  const handleCompleteShiftAndClaimSalary = async () => {
    setIsCompletingShift(true);
    try {
      await completeShift(completedStops.length, 'All daily morning milk bottles delivered to doorsteps');
      setSyncToast(`🎉 Shift Complete! ₹${dailySalaryRate} credited to your salary account!`);
      setTimeout(() => setSyncToast(null), 4500);
    } finally {
      setIsCompletingShift(false);
    }
  };

  return (
    <div className="py-2 sm:py-6 flex justify-center w-full min-h-screen bg-[#FEFBF6] overflow-x-clip">
      <PageHead
        title="Rider Delivery Dispatch | DairyPulse"
        description="Live mobile doorstep delivery run, turn-by-turn navigation, and digital proof of delivery."
      />

      <div className="w-full max-w-md min-h-[92vh] bg-white flex flex-col font-sans rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden relative pb-16">
        
        {/* ================= TOP HEADER BAR ================= */}
        <div className="bg-[#0F766E] text-white p-4 pt-5 sticky top-0 z-30 shadow-md">
          {/* Main Bar: Logo, Title, Duty status, and Logout */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {user?.role === 'OWNER' && (
                <a
                  href="/delivery"
                  title="Return to Owner Delivery Management"
                  className="p-1 rounded-lg hover:bg-teal-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </a>
              )}
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
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm leading-tight tracking-tight">DairyPulse Rider</h1>
                  <Badge variant={isOnDuty ? 'emerald' : 'neutral'} dot size="xs">
                    {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                  </Badge>
                </div>
                <p className="text-[11px] text-teal-100 font-medium mt-0.5 truncate max-w-[180px]">
                  {user?.name || matchedStaff?.name || 'Rahul Deshmukh'} • {user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Baner Route'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setNavTab(navTab === 'PROFILE' ? 'DELIVERIES' : 'PROFILE')}
                title="View Rider Profile & Dairy Details"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  navTab === 'PROFILE'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'bg-teal-800/80 hover:bg-teal-800 text-white'
                }`}
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                title="Sign Out"
                className="p-1.5 rounded-xl bg-teal-900/80 hover:bg-teal-950 text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DAIRY AFFILIATION BANNER */}
          <div
            onClick={() => setNavTab('PROFILE')}
            className="cursor-pointer bg-teal-900/80 hover:bg-teal-900 transition-colors rounded-xl p-2.5 mb-2.5 flex items-center justify-between border border-teal-700/60 shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center shrink-0 text-teal-100">
                <Building2 className="w-4 h-4 text-teal-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    Affiliated Dairy Farm
                  </span>
                  <Badge variant="teal" size="xs">Verified</Badge>
                </div>
                <h2 className="text-xs font-bold text-white truncate">
                  {matchedDairy.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-teal-200 font-semibold shrink-0 pl-2">
              <span>View Dairy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* QUICK METRICS STRIP: Drops, Liters, Cash, Rating */}
          <div className="grid grid-cols-4 gap-1.5 bg-teal-950/40 p-2 rounded-xl text-center">
            <div className="p-1">
              <span className="text-[10px] block text-teal-300 font-medium">Drops</span>
              <span className="text-xs font-extrabold text-white tabular-nums">
                {completedStops.length}/{totalStopsCount}
              </span>
            </div>
            <div className="p-1 border-l border-teal-800/60">
              <span className="text-[10px] block text-teal-300 font-medium">Liters</span>
              <span className="text-xs font-extrabold text-teal-200 tabular-nums">
                {totalLitersDelivered}L
              </span>
            </div>
            <div className="p-1 border-l border-teal-800/60">
              <span className="text-[10px] block text-teal-300 font-medium">Cash</span>
              <span className="text-xs font-extrabold text-amber-300 tabular-nums">
                ₹{totalCashCollectedToday}
              </span>
            </div>
            <div className="p-1 border-l border-teal-800/60">
              <span className="text-[10px] block text-teal-300 font-medium">Rating</span>
              <span className="text-xs font-extrabold text-amber-200 inline-flex items-center justify-center gap-0.5 tabular-nums">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300 inline" />
                {riderRating}
              </span>
            </div>
          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="grid grid-cols-3 gap-1 bg-teal-950/60 p-1 rounded-xl mt-2.5 text-xs font-bold text-center">
            <button
              data-tab="deliveries"
              onClick={() => setNavTab('DELIVERIES')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                navTab === 'DELIVERIES'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Stops ({pendingStops.length})</span>
            </button>
            <button
              data-tab="stats"
              onClick={() => setNavTab('STATS')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                navTab === 'STATS'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stats & Cash</span>
            </button>
            <button
              data-tab="profile"
              onClick={() => setNavTab('PROFILE')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                navTab === 'PROFILE'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Dairy & Profile</span>
            </button>
          </div>
        </div>

        {/* ================= FLOATING TOAST NOTIFICATION ================= */}
        {syncToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 bg-stone-900 text-white text-xs p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-teal-500/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-semibold">{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-stone-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* ================= MAIN VIEW CONTENT ================= */}

        {/* 1. DELIVERIES TAB */}
        {navTab === 'DELIVERIES' && (
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {/* Morning Attendance & Dairy Pickup Checklist */}
            {!riderShiftStatus?.attendanceMarked ? (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                        Step 1: Daily Check-in
                      </span>
                      <h3 className="font-extrabold text-sm text-stone-900 mt-0.5">
                        Mark Morning Attendance
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs tabular-nums">
                    {currentTimeString}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Good Morning, <strong>{riderName}</strong>! Please mark your daily shift attendance at <strong>{matchedDairy.name}</strong> before picking up your milk crates and starting your route.
                </p>

                <button
                  onClick={handleMarkAttendance}
                  disabled={isCheckingIn}
                  className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCheckingIn ? 'Marking Attendance...' : 'Mark Present for Morning Shift'}</span>
                </button>
              </div>
            ) : !riderShiftStatus?.pickupConfirmed ? (
              <div className="bg-sky-50/80 border-2 border-sky-300 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                      <Milk className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        Step 2: Milk Loadout
                      </span>
                      <h3 className="font-extrabold text-sm text-stone-900 mt-0.5">
                        Confirm Dairy Milk Pickup
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>Attended ({riderShiftStatus?.checkInTime || '05:30 AM'})</span>
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Dairy Hub Location:</span>
                    <strong className="text-stone-900">{matchedDairy.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Assigned Route Volume:</span>
                    <strong className="text-teal-800 text-sm font-black tabular-nums">{totalLitersAssigned} Liters</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Estimated Crates:</span>
                    <strong className="text-sky-700 font-bold tabular-nums">{cratesCount} Crates ({totalStopsCount} stops)</strong>
                  </div>
                  <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100 flex items-center justify-between">
                    <span>Route Area:</span>
                    <span className="text-stone-800 font-semibold">{user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Baner Route'}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPickup}
                  disabled={isConfirmingPickup}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Box className="w-4 h-4" />
                  <span>{isConfirmingPickup ? 'Confirming Pickup...' : 'Confirm Milk Picked Up & Start Route 🚀'}</span>
                </button>
              </div>
            ) : isAllStopsDelivered && !riderShiftStatus?.shiftCompleted ? (
              <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-2xl p-4 shadow-lg space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                      <Award className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-100 bg-white/10 px-2 py-0.5 rounded-full">
                        All Deliveries Complete 🎉
                      </span>
                      <h3 className="font-extrabold text-sm text-white mt-0.5">
                        Claim Today's Salary
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-amber-400 text-stone-950 px-2.5 py-1 rounded-xl shadow-xs tabular-nums">
                    +₹{dailySalaryRate}
                  </span>
                </div>

                <p className="text-xs text-teal-50 leading-relaxed">
                  Excellent work, <strong>{riderName}</strong>! All <strong>{totalLitersDelivered} Liters</strong> across <strong>{completedStops.length} customer stops</strong> have been successfully delivered. Click below to close your shift and credit today&apos;s daily wage to your account balance.
                </p>

                <button
                  onClick={handleCompleteShiftAndClaimSalary}
                  disabled={isCompletingShift}
                  className="w-full py-3 bg-white hover:bg-stone-100 text-teal-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>
                    {isCompletingShift
                      ? 'Crediting Daily Salary...'
                      : `Complete Shift & Add ₹${dailySalaryRate} to Account 💰`}
                  </span>
                </button>
              </div>
            ) : riderShiftStatus?.shiftCompleted ? (
              <div className="bg-teal-50/70 border-2 border-teal-300 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-stone-900">Shift Finished & Milk Delivered</span>
                      <span className="text-[9px] font-extrabold bg-[#0F766E] text-white px-2 py-0.5 rounded-full tabular-nums">
                        ₹{riderShiftStatus.dailySalaryEarned || dailySalaryRate} CREDITED
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-0.5 truncate">
                      Completed at {riderShiftStatus.shiftCompletedTime || currentTimeString} • Daily wage added to your pending balance
                    </p>
                  </div>
                </div>
                <Badge variant={riderShiftStatus.payoutStatus === 'PAID' ? 'success' : 'amber'} size="xs">
                  {riderShiftStatus.payoutStatus === 'PAID' ? 'PAID ✓' : 'PAYOUT PENDING'}
                </Badge>
              </div>
            ) : (
              <div className="bg-white border border-teal-200 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-stone-900">Morning Shift Dispatched</span>
                      <Badge variant="teal" size="xs">ROUTE ACTIVE</Badge>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                      Checked in: {riderShiftStatus?.checkInTime} • Picked Up: {riderShiftStatus?.pickupLiters || totalLitersAssigned}L at {riderShiftStatus?.pickupTime || '06:00 AM'}
                    </p>
                  </div>
                </div>
                <Badge variant="neutral" size="xs">Ready</Badge>
              </div>
            )}

            {/* Network & Offline Status Banner */}
            <div
              className={`p-2.5 rounded-2xl flex items-center justify-between transition-colors border ${
                !isOnline
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-teal-50/70 border-teal-200/80 text-teal-900'
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
                    <Wifi className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-bold block text-xs text-teal-950">Cloud Connected</span>
                      <span className="text-[10px] text-teal-700">
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
                    className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync ({pendingCount})</span>
                  </button>
                )}

                <button
                  onClick={toggleSimulatedOffline}
                  title="Toggle simulated network disconnection for offline delivery testing"
                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                >
                  {isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}
                </button>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-700" />
                  <span>Route Run Progress</span>
                </span>
                <span className="tabular-nums text-teal-800 font-extrabold">
                  {completedStops.length} of {totalStopsCount} Stops ({progressPercent}%)
                </span>
              </div>
              <ProgressBar value={progressPercent} size="sm" variant={progressPercent === 100 ? 'green' : 'teal'} />
              <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>Total Route Volume: <strong className="text-stone-800 tabular-nums">{totalLitersAssigned} Liters</strong></span>
                <span>Remaining: <strong className="text-amber-700 tabular-nums">{totalLitersPending} Liters</strong></span>
              </div>
            </div>

            {/* Pending vs Delivered sub-tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-stone-200/70 p-1 rounded-xl text-xs font-bold text-center">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pending Deliveries ({pendingStops.length})
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
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
                        className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 transition-colors hover:border-teal-300"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="bg-stone-900 text-white px-2 py-0.5 rounded text-[10px] font-extrabold tabular-nums">
                                Stop #{stop.sequenceOrder || index + 1}
                              </span>
                              <span className="text-[10px] font-bold text-stone-500 tracking-wider">
                                ETA: {estTimeString} • {stop.slot}
                              </span>
                              {isStopQueued && (
                                <Badge variant="amber" size="xs">Queued Offline</Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-base text-stone-900 leading-snug">{stop.customerName}</h3>
                          </div>
                          <Badge variant="teal" size="sm">
                            {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {stop.flatOrUnit && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md text-[10px] font-bold">
                                <Home className="w-3 h-3 text-sky-600" /> Door: {stop.flatOrUnit}
                              </span>
                            )}
                            {stop.societyOrLandmark && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-md text-[10px] font-bold">
                                <Building2 className="w-3 h-3 text-stone-600" /> Society: {stop.societyOrLandmark}
                              </span>
                            )}
                            {stop.isExtraOrder && (
                              <Badge variant="amber" size="xs">
                                <Sparkles className="w-3 h-3 mr-0.5" /> Extra Order
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-stone-600 flex items-start gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                            <div>
                              <span>{stop.address}</span>
                              {stop.landmark && (
                                <span className="block text-[11px] text-stone-500 font-medium mt-0.5">
                                  Landmark: {stop.landmark}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {stop.notes && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600 shrink-0" /> Note: {stop.notes}
                          </p>
                        )}

                        {/* Cash Collection Input */}
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-stone-700 font-semibold flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-teal-700" />
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
                              className="w-24 px-2.5 py-1 text-right font-bold text-xs bg-white border border-stone-300 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 text-stone-900 tabular-nums"
                            />
                          </div>
                        </div>

                        {/* Exact Doorstep GPS Navigation */}
                        {stop.latitude && stop.longitude && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>Exact GPS Doorstep Pinned</span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5"
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
                            className="flex items-center justify-center gap-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
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
                            className="flex items-center justify-center gap-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors"
                            title={stop.latitude ? `Navigate to pinned coordinates (${stop.latitude}, ${stop.longitude})` : 'Search address in Google Maps'}
                          >
                            <Navigation className="w-3.5 h-3.5 text-sky-600" />
                            <span>{stop.latitude ? 'GPS' : 'Map'}</span>
                          </a>
                          <button
                            onClick={() => handleFail(stop.id)}
                            className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Failed
                          </button>
                          <button
                            onClick={() => handleDeliver(stop.id)}
                            className="flex items-center justify-center gap-1 py-2 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-stone-900 text-lg">All Route Deliveries Complete!</h3>
                    <p className="text-xs text-stone-600 max-w-xs mx-auto">
                      Great job! You have completed all assigned stops for {matchedDairy.name}.
                    </p>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1">
                      <div className="font-bold tabular-nums">Total Delivered Today: {totalLitersDelivered} Liters</div>
                      <div className="tabular-nums">Cash Collected: ₹{totalCashCollectedToday}</div>
                    </div>
                    {pendingCount > 0 && (
                      <button
                        onClick={handleManualSyncNow}
                        className="mt-2 px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
                      className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs opacity-95 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="success" size="xs">✓ Delivered</Badge>
                            <span className="text-[10px] text-stone-500 font-medium tabular-nums">
                              Stop #{stop.sequenceOrder}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-stone-900">{stop.customerName}</h4>
                          <p className="text-xs text-stone-500 mt-0.5">{stop.address}</p>
                          {stop.notes && (
                            <p className="text-[10px] text-teal-800 mt-1 bg-teal-50 p-1.5 rounded-lg border border-teal-200/50">
                              {stop.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="teal" size="sm">
                          {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 p-6 text-stone-500 text-xs">
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
            {/* Rider Wallet Card */}
            <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg space-y-3 border border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Rider Wallet & Salary</h4>
                    <p className="text-[10px] text-stone-400">Daily wage managed by {matchedDairy.name}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    (matchedStaff?.pendingSalary ?? riderShiftStatus?.pendingSalary ?? 0) > 0
                      ? 'amber'
                      : 'success'
                  }
                  size="xs"
                >
                  {(matchedStaff?.pendingSalary ?? riderShiftStatus?.pendingSalary ?? 0) > 0
                    ? 'Payout Pending'
                    : 'All Settled ✓'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Daily Wage Rate</span>
                  <span className="text-base font-black text-white mt-0.5 block tabular-nums">₹{dailySalaryRate}/day</span>
                  <span className="text-[9px] text-teal-300">Owner set</span>
                </div>

                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Today&apos;s Shift</span>
                  <span className="text-base font-black text-amber-300 mt-0.5 block tabular-nums">
                    ₹{riderShiftStatus?.shiftCompleted ? (riderShiftStatus.dailySalaryEarned || dailySalaryRate) : 0}
                  </span>
                  <span className="text-[9px] text-stone-300">
                    {riderShiftStatus?.shiftCompleted ? '✓ Credited' : isAllStopsDelivered ? 'Ready to Claim' : 'In Progress'}
                  </span>
                </div>

                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Pending Payout</span>
                  <span className="text-base font-black text-rose-300 mt-0.5 block tabular-nums">
                    ₹{matchedStaff?.pendingSalary ?? riderShiftStatus?.pendingSalary ?? 0}
                  </span>
                  <span className="text-[9px] text-rose-200">Owner to pay</span>
                </div>

                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Paid</span>
                  <span className="text-base font-black text-teal-300 mt-0.5 block tabular-nums">
                    ₹{matchedStaff?.totalSalaryPaid ?? riderShiftStatus?.totalSalaryPaid ?? 0}
                  </span>
                  <span className="text-[9px] text-teal-200">Received to date</span>
                </div>
              </div>
            </div>

            {/* Shift Performance Summary */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Today's Delivery Shift</h3>
                  <p className="text-[11px] text-stone-500">Live stats for {matchedDairy.name}</p>
                </div>
                <Badge variant="teal" size="xs">Active Shift</Badge>
              </div>

              {/* 4 Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                    Stops Completed
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-stone-900 tabular-nums">{completedStops.length}</span>
                    <span className="text-xs font-bold text-teal-700 tabular-nums">/ {totalStopsCount}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={progressPercent} size="sm" variant={progressPercent === 100 ? 'green' : 'teal'} />
                  </div>
                  <span className="text-[10px] font-semibold text-teal-800 mt-1 block">
                    {progressPercent}% route finished
                  </span>
                </div>

                <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Volume Delivered
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-stone-900 tabular-nums">{totalLitersDelivered}</span>
                    <span className="text-xs font-bold text-sky-700 tabular-nums">L / {totalLitersAssigned}L</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={totalLitersAssigned ? Math.round((totalLitersDelivered / totalLitersAssigned) * 100) : 0}
                      size="sm"
                      variant="sky"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-sky-800 mt-1 block tabular-nums">
                    {totalLitersPending} L remaining
                  </span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Cash in Hand
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-stone-900 tabular-nums">₹{totalCashCollectedToday}</span>
                  </div>
                  <span className="text-[10px] text-amber-800 mt-1.5 block">
                    Collected at doorsteps today
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                    Partner Rating
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-2xl font-black text-stone-900 tabular-nums">{riderRating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1.5 block">
                    {driverReviews.length > 0 ? `${driverReviews.length} customer ratings` : '5-star certified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Milk Volume Breakdown by Variant */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
              <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                <Milk className="w-4 h-4 text-teal-700" />
                <span>Today's Milk Variety Distribution</span>
              </h4>
              <div className="space-y-2 pt-1">
                {Object.entries(variantBreakdown).map(([variant, data]) => (
                  <div
                    key={variant}
                    className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">{variant}</span>
                        <span className="text-[10px] text-stone-500 tabular-nums">{data.stops} drop-offs</span>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">
                      {data.liters} Liters
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime Achievements */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-xs space-y-3 border border-stone-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">Lifetime Rider Achievements</h4>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-amber-300 block tabular-nums">{lifetimeDeliveries}+</span>
                  <span className="text-[9px] text-teal-200 uppercase font-semibold">Total Drops</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-teal-300 block tabular-nums">98.8%</span>
                  <span className="text-[9px] text-teal-200 uppercase font-semibold">On-Time</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-base font-black text-white block tabular-nums">100%</span>
                  <span className="text-[9px] text-teal-200 uppercase font-semibold">Freshness</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews for Driver */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Recent Customer Compliments</span>
                </h4>
                <Badge variant="teal" size="xs">Verified Doorstep</Badge>
              </div>

              <div className="space-y-2 pt-1">
                {driverReviews.length > 0 ? (
                  driverReviews.slice(0, 3).map((rev, i) => (
                    <div key={i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800">{rev.customerName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 italic">
                        &ldquo;{rev.feedback || 'Always on time and leaves milk safely in pouch!'}&rdquo;
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800">Priya Kulkarni</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 italic">
                        &ldquo;Extremely punctual delivery every morning at 6:30 AM sharp. Very polite and handles milk bottles with care.&rdquo;
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800">Amit Verma</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 italic">
                        &ldquo;Great service! Even during rainy days milk is always sealed and dry.&rdquo;
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
            {/* Dairy Affiliation Card */}
            <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-3 border border-stone-800">
              <div className="flex items-center justify-between">
                <Badge variant="teal" size="xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Your Affiliated Dairy
                </Badge>
                <span className="text-[10px] font-bold text-teal-300">
                  {matchedDairy.city || 'Pune, MH'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {matchedDairy.name}
                </h2>
                <p className="text-xs text-stone-300 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{matchedDairy.address || 'Green Valley Milk District, Pune'}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold block">Farm Manager / Owner</span>
                  <span className="font-bold text-white">{matchedDairy.owner_name || matchedDairy.ownerName || 'Suresh Patil'}</span>
                </div>
                <a
                  href={`tel:${matchedDairy.phone || '+919822012345'}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] hover:bg-[#0D6560] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Hub</span>
                </a>
              </div>
            </div>

            {/* Today's Attendance & Pickup Log */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Today's Morning Shift Status</h4>
                    <p className="text-[11px] text-stone-500">
                      {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Badge variant={riderShiftStatus?.attendanceMarked ? 'success' : 'amber'} size="xs">
                  {riderShiftStatus?.attendanceMarked ? 'Present 🟢' : 'Pending Check-in'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 block">Morning Check-in</span>
                  <span className="font-extrabold text-stone-900 text-sm block tabular-nums">
                    {riderShiftStatus?.checkInTime || 'Pending'}
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    riderShiftStatus?.attendanceMarked ? 'text-teal-800' : 'text-amber-800'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{riderShiftStatus?.attendanceMarked ? 'Attendance Marked' : 'Not Checked In'}</span>
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 block">Dairy Hub Pickup</span>
                  <span className="font-extrabold text-stone-900 text-sm block">
                    {riderShiftStatus?.pickupConfirmed ? (riderShiftStatus.pickupTime || 'Done') : 'Pending'}
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    riderShiftStatus?.pickupConfirmed ? 'text-sky-800' : 'text-stone-500'
                  }`}>
                    <Box className="w-3 h-3" />
                    <span>
                      {riderShiftStatus?.pickupConfirmed
                        ? `${riderShiftStatus.pickupLiters || totalLitersAssigned}L (${riderShiftStatus.pickupCrates || cratesCount} Crates)`
                        : 'Awaiting Pickup'}
                    </span>
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 block">Deliveries Run</span>
                  <span className="font-extrabold text-stone-900 text-sm block tabular-nums">
                    {completedStops.length} / {totalStopsCount} Stops
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isAllStopsDelivered ? 'text-teal-800' : 'text-amber-800'
                  }`}>
                    <Truck className="w-3 h-3" />
                    <span>{isAllStopsDelivered ? '100% Completed' : `${progressPercent}% Finished`}</span>
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 block">Today's Daily Wage</span>
                  <span className="font-extrabold text-teal-800 text-sm block tabular-nums">
                    ₹{dailySalaryRate}/day
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    riderShiftStatus?.shiftCompleted
                      ? riderShiftStatus.payoutStatus === 'PAID'
                        ? 'text-teal-800 font-bold'
                        : 'text-amber-800 font-bold'
                      : 'text-stone-500'
                  }`}>
                    <IndianRupee className="w-3 h-3" />
                    <span>
                      {riderShiftStatus?.shiftCompleted
                        ? riderShiftStatus.payoutStatus === 'PAID'
                          ? 'Settled & Paid'
                          : 'Credited to Balance'
                        : 'Earn upon completion'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action buttons if shift actions pending */}
              {(!riderShiftStatus?.attendanceMarked ||
                !riderShiftStatus?.pickupConfirmed ||
                (isAllStopsDelivered && !riderShiftStatus?.shiftCompleted)) && (
                <div className="flex flex-col gap-2 pt-1">
                  {!riderShiftStatus?.attendanceMarked && (
                    <button
                      onClick={handleMarkAttendance}
                      disabled={isCheckingIn}
                      className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {isCheckingIn ? 'Marking...' : 'Mark Present for Morning Shift'}
                    </button>
                  )}
                  {riderShiftStatus?.attendanceMarked && !riderShiftStatus?.pickupConfirmed && (
                    <button
                      onClick={handleConfirmPickup}
                      disabled={isConfirmingPickup}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {isConfirmingPickup ? 'Confirming...' : 'Confirm Milk Pickup from Dairy'}
                    </button>
                  )}
                  {riderShiftStatus?.attendanceMarked &&
                    riderShiftStatus?.pickupConfirmed &&
                    isAllStopsDelivered &&
                    !riderShiftStatus?.shiftCompleted && (
                      <button
                        onClick={handleCompleteShiftAndClaimSalary}
                        disabled={isCompletingShift}
                        className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>{isCompletingShift ? 'Crediting...' : `Complete Shift & Claim ₹${dailySalaryRate} 💰`}</span>
                      </button>
                    )}
                </div>
              )}
            </div>

            {/* Payout Receipts */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Salary Payout Receipts</h4>
                    <p className="text-[10px] text-stone-500">Payments made by {matchedDairy.name}</p>
                  </div>
                </div>
                <Badge variant="neutral" size="xs">
                  {salaryPayments.filter(
                    (p) =>
                      p.staffId === matchedStaff?.id ||
                      (riderName && p.staffName && p.staffName.toLowerCase().includes(riderName.toLowerCase()))
                  ).length}{' '}
                  Settled
                </Badge>
              </div>

              {(() => {
                const myPayments = salaryPayments.filter(
                  (p) =>
                    p.staffId === matchedStaff?.id ||
                    (riderName && p.staffName && p.staffName.toLowerCase().includes(riderName.toLowerCase()))
                );

                if (myPayments.length === 0) {
                  return (
                    <div className="p-4 bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-center space-y-1">
                      <p className="text-xs font-semibold text-stone-700">No payout receipts yet</p>
                      <p className="text-[10px] text-stone-400">
                        When the dairy owner settles your pending shift salary via UPI or Cash, transaction receipts will appear here.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {myPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs hover:bg-teal-50/50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-stone-900">
                            <span className="tabular-nums">₹{p.amount}</span>
                            <Badge variant="teal" size="xs">
                              {p.paymentMode}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            {p.paymentDate} • Ref: {p.referenceId || 'N/A'}
                          </p>
                          {p.notes && <p className="text-[10px] text-stone-600 italic">&ldquo;{p.notes}&rdquo;</p>}
                        </div>
                        <Badge variant="success" size="xs">
                          Paid ✓
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Rider Identity Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                    {(user?.name || matchedStaff?.name || 'R')[0]}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isOnDuty ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-stone-900 truncate">
                      {user?.name || matchedStaff?.name || 'Rahul Deshmukh'}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-teal-800">Official Delivery Partner</p>
                  <p className="text-[11px] text-stone-500">
                    Staff ID: #{matchedStaff?.id || user?.id || 'RDR-2024'}
                  </p>
                </div>
              </div>

              {/* Duty Toggle Card */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-stone-900 block">Duty Status</span>
                  <span className="text-[11px] text-stone-500">
                    {isOnDuty ? 'Receiving deliveries & tracking live' : 'Offline / On Break'}
                  </span>
                </div>
                <button
                  onClick={toggleDutyStatus}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                    isOnDuty
                      ? 'bg-[#0F766E] hover:bg-[#0D6560] text-white'
                      : 'bg-stone-300 hover:bg-stone-400 text-stone-800'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
                </button>
              </div>

              {/* Rider Identity Breakdown */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Registered Phone</span>
                  </span>
                  <span className="font-bold text-stone-800 font-mono">
                    {user?.phone || matchedStaff?.phone || '+91 98765 43210'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email Address</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    {user?.email || matchedStaff?.email || 'rider@dairypulse.in'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-stone-400" />
                    <span>Assigned Route & Area</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    {user?.assignedAreaOrRoute || matchedStaff?.assignedArea || 'Morning Express Route'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Shift Slot</span>
                  </span>
                  <span className="font-bold text-stone-800">Morning (5:30 AM - 8:30 AM)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Joining Date</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    {matchedStaff?.joiningDate || '15 Jan 2024'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Vehicle & Crate</span>
                  </span>
                  <span className="font-bold text-stone-800">Two-Wheeler + Chiller Bag</span>
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
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
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
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-rose-700 font-extrabold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Rider Account</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= BOTTOM APP NAVIGATION BAR ================= */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200/90 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
          <button
            data-bottom-tab="deliveries"
            onClick={() => setNavTab('DELIVERIES')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              navTab === 'DELIVERIES' ? 'text-teal-800 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
            }`}
          >
            <div className="relative">
              <Truck className="w-5 h-5" />
              {pendingStops.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#0F766E] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {pendingStops.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Stops</span>
          </button>

          <button
            data-bottom-tab="stats"
            onClick={() => setNavTab('STATS')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              navTab === 'STATS' ? 'text-teal-800 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Shift Stats</span>
          </button>

          <button
            data-bottom-tab="profile"
            onClick={() => setNavTab('PROFILE')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              navTab === 'PROFILE' ? 'text-teal-800 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
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
