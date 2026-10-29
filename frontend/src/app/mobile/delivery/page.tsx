'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { useAuth } from '@/context/AuthContext';
import { useOfflineDeliverySync } from '@/lib/offlineSync';

export default function DeliveryPartnerMobileApp() {
  const { deliveries, updateDeliveryStatus } = useDairyPulse();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  // Offline Sync Hook
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingQueue,
    pendingCount,
    isSyncing,
    lastSyncResult,
    recordDeliveryStop,
    triggerManualSync,
  } = useOfflineDeliverySync(user?.name || 'Rahul Deshmukh');

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
      setSyncToast('Delivered & live synced to farm console!');
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
  const riderName = user?.name || '';
  const myDeliveries = ((user?.role === 'DELIVERY' && riderName)
    ? deliveries.filter((d) => !d.assignedRider || d.assignedRider.toLowerCase().includes(riderName.toLowerCase()) || riderName.toLowerCase().includes(d.assignedRider.toLowerCase()))
    : deliveries
  ).slice().sort((a, b) => (a.sequenceOrder ?? 9999) - (b.sequenceOrder ?? 9999));

  const pendingStops = myDeliveries.filter((d) => d.status !== 'Delivered');
  const completedStops = myDeliveries.filter((d) => d.status === 'Delivered');
  const progressPercent = Math.round((completedStops.length / (myDeliveries.length || 1)) * 100) || 0;

  return (
    <div className="py-2 flex justify-center w-full">
      <div className="w-full max-w-md min-h-[88vh] bg-slate-100 flex flex-col font-sans rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Mobile Header Bar */}
        <div className="bg-emerald-700 text-white p-4 pt-5 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              {user?.role === 'OWNER' && (
                <a
                  href="/delivery"
                  title="Return to Owner Delivery Management"
                  className="p-1 rounded-lg hover:bg-emerald-800 transition"
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
                <h1 className="font-extrabold text-base leading-tight">Delivery Partner PWA</h1>
                <p className="text-[11px] text-emerald-200">
                  {user?.name || 'Rahul Deshmukh'} • {user?.assignedAreaOrRoute || 'Baner Morning Route'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                Today
              </span>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 text-white transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Network & Offline Status Banner */}
          <div
            className={`p-2 rounded-xl mb-2.5 flex items-center justify-between transition-all ${
              !isOnline
                ? 'bg-amber-500/90 text-amber-950 font-semibold'
                : 'bg-emerald-800/60 text-emerald-100 text-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              {!isOnline ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-950 animate-pulse shrink-0" />
                  <div>
                    <span className="font-extrabold block text-xs">Offline Mode Active</span>
                    <span className="text-[10px] opacity-90">
                      {pendingCount} stop{pendingCount !== 1 ? 's' : ''} queued locally
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs text-white">Online & Synced</span>
                    <span className="text-[10px] text-emerald-200">
                      {pendingCount > 0 ? `${pendingCount} stops pending sync` : 'Direct cloud connection'}
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
                  className="px-2 py-1 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({pendingCount})</span>
                </button>
              )}

              {/* Demo Toggle Button */}
              <button
                onClick={toggleSimulatedOffline}
                title="Toggle simulated network disconnection for testing"
                className="px-2 py-1 bg-black/20 hover:bg-black/30 text-white rounded-lg text-[10px] font-bold border border-white/20 transition"
              >
                {isSimulatedOffline ? 'Go Online' : 'Cut Signal (Simulate)'}
              </button>
            </div>
          </div>

          {/* Route Progress Bar */}
          <div className="bg-emerald-900/40 p-2.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Route Progress</span>
              <span className="tabular-nums">
                {completedStops.length} of {deliveries.length} Stops ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-300 font-medium pt-0.5">
              <span>Delivery Sequence</span>
              <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-200">Standard Route</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-1 bg-emerald-900/60 p-1 rounded-xl mt-3 text-xs font-bold text-center">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'PENDING'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Pending Stops ({pendingStops.length})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'COMPLETED'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Delivered ({completedStops.length})
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {syncToast && (
          <div className="absolute top-44 left-4 right-4 z-40 bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Stops List */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto pb-12">
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
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-extrabold tabular-nums">
                            Stop #{stop.sequenceOrder || index + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            ETA: {estTimeString} • {stop.slot}
                          </span>
                          {isStopQueued && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              Queued Offline
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-slate-900">{stop.customerName}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl">
                        {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {stop.flatOrUnit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                            🚪 Flat / Door: {stop.flatOrUnit}
                          </span>
                        )}
                        {stop.societyOrLandmark && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold">
                            🏢 Society: {stop.societyOrLandmark}
                          </span>
                        )}
                        {stop.isExtraOrder && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                            ✨ Extra Shop Order
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span>{stop.address}</span>
                          {stop.landmark && (
                            <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                              📍 Near: {stop.landmark}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {stop.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                        Customer Note: {stop.notes}
                      </p>
                    )}

                    {/* Delivery Log Input: Cash Collection */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium flex items-center gap-1.5">
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
                          className="w-24 px-2.5 py-1 text-right font-bold text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Exact Doorstep GPS Navigation for Delivery Boy */}
                    {stop.latitude && stop.longitude && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50/90 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Exact GPS Pinned ({stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)})</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5"
                        >
                          <span>Open Nav</span>
                          <Navigation className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Actions: Call, Directions, Failed, Done */}
                    <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                      <a
                        href={`tel:${stop.customerPhone}`}
                        className="flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
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
                        className="flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition"
                        title={stop.latitude ? `Navigate to pinned coordinates (${stop.latitude}, ${stop.longitude})` : 'Search address in Google Maps'}
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>{stop.latitude ? 'Navigate' : 'Map'}</span>
                      </a>
                      <button
                        onClick={() => handleFail(stop.id)}
                        className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Failed
                      </button>
                      <button
                        onClick={() => handleDeliver(stop.id)}
                        className="flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">All Deliveries Complete!</h3>
                <p className="text-xs text-slate-500">
                  You have completed all assigned stops for this route run.
                </p>
                {pendingCount > 0 && (
                  <button
                    onClick={handleManualSyncNow}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Sync {pendingCount} Pending Stops Now
                  </button>
                )}
              </div>
            )
          ) : (
            completedStops.map((stop) => (
              <div
                key={stop.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 opacity-90 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{stop.customerName}</h4>
                    <p className="text-xs text-slate-500">{stop.address}</p>
                    {stop.notes && (
                      <p className="text-[10px] text-emerald-700 mt-1">{stop.notes}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    ✓ {stop.quantityLiters} L ({stop.deliveredAt || 'Delivered'})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
