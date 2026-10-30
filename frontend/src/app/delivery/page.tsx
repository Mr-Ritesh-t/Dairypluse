'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  User,
  Plus,
  Compass,
  Filter,
  Check,
  X,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Building2,
  RefreshCw,
  Search,
  BadgeAlert,
  Send,
  Edit3,
  AlertTriangle,
  Gauge,
  CheckCheck,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { DeliveryTask, StaffMember, RouteBuildPayload } from '@/types';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';
import RouteBuilderStudio from '@/components/delivery/RouteBuilderStudio';

export default function DeliveryManagementPage() {
  const {
    deliveries,
    updateDeliveryStatus,
    staff,
    assignDelivery,
    assignRouteToRider,
    addDeliveryTask,
    routes,
    moveDeliveryStop,
    autoSequenceRoute,
    createRoute,
    buildAndDispatchRoute,
    customers,
    subscriptions,
    updateDeliveryAddress,
    generateDailyDeliveries,
    dairies,
    products,
  } = useDairyPulse();

  // Filters
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
  const [selectedRiderFilter, setSelectedRiderFilter] = useState<string>('ALL');
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isRouteStudioOpen, setIsRouteStudioOpen] = useState(false);
  const [isAssignRouteOpen, setIsAssignRouteOpen] = useState(false);
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [editingAddressTask, setEditingAddressTask] = useState<DeliveryTask | null>(null);
  const [failModalTask, setFailModalTask] = useState<DeliveryTask | null>(null);
  const [failReasonSelect, setFailReasonSelect] = useState('Door locked / No one answered');
  const [customFailReason, setCustomFailReason] = useState('');
  const [reassigningTask, setReassigningTask] = useState<DeliveryTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDaily, setIsGeneratingDaily] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRouteStudioDispatch = async (payload: RouteBuildPayload) => {
    const success = await buildAndDispatchRoute(payload);
    if (success) {
      setActionNotice(`Route ${payload.routeCode} (${payload.name}) dispatched with ${payload.stops.length} sequenced stops to ${payload.assignedRider}!`);
      setTimeout(() => setActionNotice(null), 5000);
    }
    return success;
  };

  // Form State: Bulk Route Assign
  const [routeArea, setRouteArea] = useState('Baner');
  const [routeRider, setRouteRider] = useState('');
  const [routeSlot, setRouteSlot] = useState('Morning (6:00 AM - 7:30 AM)');

  // Form State: Create New Route
  const [newRouteCode, setNewRouteCode] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteArea, setNewRouteArea] = useState('Baner');
  const [newRouteRider, setNewRouteRider] = useState('');
  const [newRouteSlot, setNewRouteSlot] = useState('Morning (6:00 AM - 7:30 AM)');
  const [newRouteSocieties, setNewRouteSocieties] = useState('');
  const [newRouteCapacity, setNewRouteCapacity] = useState('60');

  // Form State: Edit Address
  const [editFlat, setEditFlat] = useState('');
  const [editSociety, setEditSociety] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLat, setEditLat] = useState<number>(18.5593);
  const [editLng, setEditLng] = useState<number>(73.7788);

  // Form State: New Delivery Stop
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSociety, setNewSociety] = useState('');
  const [newArea, setNewArea] = useState('Baner');
  const [newVariant, setNewVariant] = useState('Cow Milk');
  const [newQty, setNewQty] = useState('1.5');
  const [newSlot, setNewSlot] = useState('Morning (6:00 AM - 7:30 AM)');
  const [newRider, setNewRider] = useState('');

  // Form State: Single Reassign
  const [targetRider, setTargetRider] = useState('');
  const [targetSlot, setTargetSlot] = useState('');

  useEffect(() => {
    if (products && products.length > 0 && !products.some((p) => p.variant === newVariant)) {
      setNewVariant(products[0].variant);
    }
  }, [products]);

  // Active Delivery Riders
  const deliveryRiders = staff.filter((s) => s.role === 'Delivery Rider');
  const defaultRiderName = deliveryRiders[0]?.name || 'Rahul Deshmukh';

  // Overall KPI counts
  const total = deliveries.length;
  const delivered = deliveries.filter((d) => d.status === 'Delivered').length;
  const inProgress = deliveries.filter((d) => d.status === 'In Progress').length;
  const pending = deliveries.filter((d) => d.status === 'Pending').length;
  const failed = deliveries.filter((d) => d.status === 'Failed').length;

  // Filtered Deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    if (selectedRoute !== 'ALL' && d.area !== selectedRoute) return false;
    if (selectedRiderFilter !== 'ALL' && d.assignedRider !== selectedRiderFilter) return false;
    if (selectedSlotFilter !== 'ALL' && !d.slot?.includes(selectedSlotFilter)) return false;
    if (selectedStatusFilter !== 'ALL' && d.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.customerName.toLowerCase().includes(q);
      const matchAddress = d.address.toLowerCase().includes(q);
      const matchRider = d.assignedRider.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchRider) return false;
    }
    return true;
  });

  // Handle Route Assign Submit
  const handleAssignRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rider = routeRider || defaultRiderName;
    setIsSubmitting(true);
    await assignRouteToRider(routeArea, rider, routeSlot);
    setIsSubmitting(false);
    setIsAssignRouteOpen(false);
    setActionNotice(`Successfully assigned all ${routeArea} stops to ${rider} for ${routeSlot}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Individual Reassign Submit
  const handleSingleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningTask) return;
    const rider = targetRider || reassigningTask.assignedRider;
    const slot = targetSlot || reassigningTask.slot;

    setIsSubmitting(true);
    await assignDelivery(reassigningTask.id, rider, slot);
    setIsSubmitting(false);
    setReassigningTask(null);
    setActionNotice(`Stop #${reassigningTask.deliveryNumber} reassigned to ${rider} (${slot})!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Create New Delivery
  const handleCreateDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newAddress.trim()) return;

    setIsSubmitting(true);
    await addDeliveryTask({
      customerName: newCustName.trim(),
      customerPhone: newCustPhone.trim() || '+91 98000 00000',
      address: newAddress.trim(),
      societyOrLandmark: newSociety.trim() || undefined,
      area: newArea,
      productVariant: newVariant,
      quantityLiters: parseFloat(newQty) || 1.0,
      slot: newSlot,
      assignedRider: newRider || defaultRiderName,
    });
    setIsSubmitting(false);
    setIsNewDeliveryOpen(false);
    // Reset
    setNewCustName('');
    setNewCustPhone('');
    setNewAddress('');
    setNewSociety('');
    setActionNotice('New delivery scheduled and dispatched to rider!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Generate Daily Deliveries
  const handleGenerateDailyDeliveries = async () => {
    setIsGeneratingDaily(true);
    const res = await generateDailyDeliveries();
    setIsGeneratingDaily(false);
    if (res && res.success) {
      setActionNotice(
        `Generated ${res.created_count} daily stops! Deduplication skipped ${res.skipped_duplicates} duplicate subscriptions.`
      );
    } else {
      setActionNotice('Daily deliveries generated and sequenced by society!');
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Create Route Submit
  const handleCreateRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteCode.trim() || !newRouteName.trim()) return;

    setIsSubmitting(true);
    await createRoute({
      routeCode: newRouteCode.trim().toUpperCase(),
      name: newRouteName.trim(),
      area: newRouteArea,
      assignedRider: newRouteRider || defaultRiderName,
      slot: newRouteSlot,
      societies: newRouteSocieties.trim() || undefined,
      totalStops: 0,
      totalLiters: 0,
      maxCapacityLiters: parseFloat(newRouteCapacity) || 60.0,
    });
    setIsSubmitting(false);
    setIsCreateRouteOpen(false);
    setNewRouteCode('');
    setNewRouteName('');
    setNewRouteSocieties('');
    setActionNotice(`Route ${newRouteCode.toUpperCase()} created & assigned to ${newRouteRider || defaultRiderName}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Edit Address Submit
  const handleEditAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddressTask) return;

    setIsSubmitting(true);
    await updateDeliveryAddress(editingAddressTask.id, {
      flatOrUnit: editFlat.trim() || undefined,
      societyOrLandmark: editSociety.trim() || undefined,
      landmark: editLandmark.trim() || undefined,
      address: editAddress.trim() || editingAddressTask.address,
      area: editArea || editingAddressTask.area,
      latitude: editLat,
      longitude: editLng,
      notes: editNotes.trim() || undefined,
    });
    setIsSubmitting(false);
    setEditingAddressTask(null);
    setActionNotice(`Delivery location updated for ${editingAddressTask.customerName}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Log Failed Submit
  const handleLogFailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failModalTask) return;
    const finalReason = failReasonSelect === 'Other' ? customFailReason.trim() : failReasonSelect;

    updateDeliveryStatus(failModalTask.id, 'Failed', finalReason || 'Door locked / Customer unavailable');
    setFailModalTask(null);
    setActionNotice(`Stop #${failModalTask.deliveryNumber} marked Failed (${finalReason}).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Notice Alert */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery & Dispatch Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculate actual rider loads against vehicle capacities, cluster by society, eliminate duplicates, and manage live dispatches.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* 1. Generate Daily Runs (Deduplicated) */}
          <button
            onClick={handleGenerateDailyDeliveries}
            disabled={isGeneratingDaily}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Consolidate active subscriptions + shop orders for today with zero duplicates"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isGeneratingDaily ? 'animate-spin' : ''}`} />
            <span>{isGeneratingDaily ? 'Generating...' : '⚡ Generate Today’s Runs'}</span>
          </button>

          {/* 2. Interactive Route Studio */}
          <button
            onClick={() => setIsRouteStudioOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition transform active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🗺️ Real Map Route Studio</span>
          </button>

          {/* 3. Assign Route */}
          <button
            onClick={() => {
              setRouteRider(defaultRiderName);
              setIsAssignRouteOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Assign Route</span>
          </button>

          {/* 4. Schedule Stop */}
          <button
            onClick={() => {
              setNewRider(defaultRiderName);
              setIsNewDeliveryOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Schedule Stop</span>
          </button>
        </div>
      </section>

      {/* Distribution Routes & Society Clusters Overview */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <Compass className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Delivery Routes & Society Clusters ({routes.length})
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fixed sector routes cluster customer doorsteps by housing society and street for rapid consecutive deliveries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRouteStudioOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Real Map Route Studio</span>
            </button>
            <button
              onClick={async () => {
                const targetArea = selectedRoute === 'ALL' ? 'Baner' : selectedRoute;
                await autoSequenceRoute(targetArea);
                setActionNotice(`Stops in ${targetArea} auto-clustered by building & apartment sequence!`);
                setTimeout(() => setActionNotice(null), 4000);
              }}
              title="Automatically arrange stops so customers in the same building/society are delivered consecutively"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Auto-Cluster Stops by Society</span>
            </button>
          </div>
        </div>

        {/* 5 Route Sector Cards */}
        {routes.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs font-semibold text-slate-600">No route sectors configured yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;+ Add Route Sector&apos; or use &apos;🗺️ Real Map Route Studio&apos; to dispatch runs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {routes.map((r) => {
            const isFilterActive = selectedRoute === r.area;
            const areaStops = deliveries.filter((d) => d.area === r.area);
            const totalLiters = areaStops.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
            const socList: string[] = Array.isArray(r.societies)
              ? r.societies
              : typeof r.societies === 'string'
              ? r.societies.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={r.id}
                className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                  isFilterActive
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white tracking-wide">
                      {r.routeCode}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 tabular-nums">
                      {areaStops.length || r.totalStops} drops
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 mt-2">{r.name}</h4>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{r.slot?.split(' ')[0] || 'Morning'}</span>
                    <span>&bull;</span>
                    <span className="font-bold text-emerald-700">{(totalLiters || r.totalLiters).toFixed(1)} L</span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 font-semibold truncate" title={r.assignedRider}>
                    🚴 {r.assignedRider || 'Unassigned'}
                  </div>

                  {/* Society Badges */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {socList.slice(0, 2).map((soc, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[9px] font-medium truncate max-w-[105px]"
                        title={soc}
                      >
                        🏢 {soc}
                      </span>
                    ))}
                    {socList.length > 2 && (
                      <span className="px-1 py-0.5 bg-white border border-slate-200 text-slate-400 rounded text-[9px] font-medium">
                        +{socList.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Vehicle Capacity Meter */}
                  {(() => {
                    const maxCap = r.maxCapacityLiters || 60.0;
                    const liters = totalLiters || r.totalLiters;
                    const capPercent = Math.round((liters / maxCap) * 100);
                    const isOver = liters > maxCap;
                    return (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">Vehicle Load:</span>
                          <span className={`font-bold tabular-nums ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                            {liters.toFixed(1)} / {maxCap} L ({capPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver ? 'bg-rose-500' : capPercent > 85 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, capPercent)}%` }}
                          />
                        </div>
                        {isOver && (
                          <div className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-rose-600" />
                            <span>Overload (+{(liters - maxCap).toFixed(1)} L)</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions: View stops & assign */}
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedRoute(isFilterActive ? 'ALL' : r.area)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${
                      isFilterActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isFilterActive ? 'Active Route' : 'Filter Stops'}
                  </button>
                  <button
                    onClick={() => {
                      setRouteArea(r.area);
                      setRouteRider(r.assignedRider || defaultRiderName);
                      setRouteSlot(r.slot || 'Morning (6:00 AM - 7:30 AM)');
                      setIsAssignRouteOpen(true);
                    }}
                    title={`Assign ${r.area} Route to Rider`}
                    className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* 4 Metric KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Route Drops</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{total}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{deliveryRiders.length} Delivery Riders</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Delivered</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">{delivered}</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
            {total > 0 ? Math.round((delivered / total) * 100) : 0}% completion
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">In Transit</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">{inProgress}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">On delivery bikes</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Pending</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">{pending}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{failed > 0 ? `${failed} exceptions` : 'In queue'}</p>
        </div>
      </section>

      {/* Delivery Staff Tracking & Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: RIDER LIVE TRACKING & ROSTER (4 cols)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rider Live Tracking</h3>
              <p className="text-[11px] text-slate-400">Real-time progress per delivery boy</p>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              {deliveryRiders.length} On Duty
            </span>
          </div>

          {selectedRiderFilter !== 'ALL' && (
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              <span>Filtering by: <strong>{selectedRiderFilter}</strong></span>
              <button
                onClick={() => setSelectedRiderFilter('ALL')}
                className="text-[11px] font-bold text-blue-700 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          <div className="space-y-3">
            {deliveryRiders.map((rider) => {
              const riderStops = deliveries.filter((d) => d.assignedRider === rider.name);
              const riderDelivered = riderStops.filter((d) => d.status === 'Delivered').length;
              const riderPending = riderStops.filter((d) => d.status === 'Pending').length;
              const riderProgress = riderStops.length > 0 ? Math.round((riderDelivered / riderStops.length) * 100) : 0;
              const isSelected = selectedRiderFilter === rider.name;

              return (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRiderFilter(isSelected ? 'ALL' : rider.name)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {rider.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{rider.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {rider.assignedArea}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ★ {rider.rating}
                    </span>
                  </div>

                  {/* Rider Live Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">
                        {riderDelivered} of {riderStops.length} drops done
                      </span>
                      <span className="font-bold text-slate-800 tabular-nums">{riderProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${riderProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric Chips & Call */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-semibold">{riderDelivered} Delivered</span>
                      <span>&bull;</span>
                      <span className="text-amber-700 font-semibold">{riderPending} Pending</span>
                    </div>
                    <a
                      href={`tel:${rider.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: ROUTE STOPS & LIVE TRACKING TABLE (8 cols)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Delivery Stops ({filteredDeliveries.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stops are sequenced building-by-building. Use ▲ ▼ or Auto-Sequence to optimize rider path.
              </p>
            </div>

            {/* Action / Search Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const targetArea = selectedRoute === 'ALL' ? 'Baner' : selectedRoute;
                  await autoSequenceRoute(targetArea);
                  setActionNotice(`Stops re-ordered! All flats in same society clustered consecutively.`);
                  setTimeout(() => setActionNotice(null), 4000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Sort stops so all flats in the same society are delivered consecutively"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Auto-Sequence</span>
              </button>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, area, or rider..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Filter Bar: Route, Slot, Status */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 text-xs">
            {/* Route Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium">Route:</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Routes</option>
                <option value="Baner">Baner</option>
                <option value="Aundh">Aundh</option>
                <option value="Kothrud">Kothrud</option>
                <option value="Wanowrie">Wanowrie</option>
                <option value="Wakad">Wakad</option>
              </select>
            </div>

            {/* Time Slot Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium">Shift:</span>
              <select
                value={selectedSlotFilter}
                onChange={(e) => setSelectedSlotFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Shifts</option>
                <option value="Morning">Morning (6:00 - 7:30 AM)</option>
                <option value="Evening">Evening (5:30 - 7:00 PM)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed / Locked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Seq & Shift</th>
                  <th className="pb-2.5 font-medium">Customer & Society Address</th>
                  <th className="pb-2.5 font-medium">Milk Qty</th>
                  <th className="pb-2.5 font-medium">Assigned Rider</th>
                  <th className="pb-2.5 font-medium">Status & Time</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Truck className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-sm text-slate-600">No delivery stops found</span>
                        <span className="text-xs text-slate-400">Click &apos;+ Generate Drops&apos; or build a custom route from Real Map Route Studio</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((del, idx) => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition">
                    {/* Stop Sequence Order & Slot */}
                    <td className="py-3 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => moveDeliveryStop(del.id, 'UP')}
                            title="Move Stop Earlier (Up in Sequence)"
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveDeliveryStop(del.id, 'DOWN')}
                            title="Move Stop Later (Down in Sequence)"
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs px-2 py-0.5 bg-slate-900 text-white rounded-md tabular-nums">
                              #{del.sequenceOrder || idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {del.deliveryNumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{del.slot?.includes('Evening') ? 'Evening' : 'Morning'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer & Address & Society Badge */}
                    <td className="py-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{del.customerName}</span>
                        {del.isExtraOrder && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-extrabold uppercase">
                            Extra
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {del.flatOrUnit && (
                          <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold shrink-0">
                            🚪 {del.flatOrUnit}
                          </span>
                        )}
                        {del.societyOrLandmark && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold shrink-0">
                            🏢 {del.societyOrLandmark}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-normal flex items-center gap-1 max-w-xs truncate" title={del.address}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{del.address}</span>
                        </span>
                        {del.landmark && (
                          <span className="text-[10px] text-slate-400 italic">
                            (Near {del.landmark})
                          </span>
                        )}
                        {del.latitude && del.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${del.latitude},${del.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline pt-0.5"
                            title="Direct Google Maps turn-by-turn navigation link"
                          >
                            <Compass className="w-2.5 h-2.5 text-blue-500" />
                            <span>GPS Pin ({del.latitude.toFixed(3)}, {del.longitude.toFixed(3)})</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Milk Variant & Quantity */}
                    <td className="py-3.5 font-bold text-slate-700 tabular-nums">
                      <div>{del.quantityLiters} L</div>
                      <div className="text-[10px] text-slate-400 font-normal">{del.productVariant}</div>
                    </td>

                    {/* Assigned Rider (Inline Select) */}
                    <td className="py-3.5">
                      <select
                        value={del.assignedRider}
                        onChange={(e) => assignDelivery(del.id, e.target.value, del.slot, del.area)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {deliveryRiders.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name} ({r.assignedArea})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status & Delivery Timestamp */}
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            del.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : del.status === 'Out for Delivery' || del.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : del.status === 'Failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : del.status === 'Assigned'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {del.status}
                        </span>
                        {del.deliveredAt && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            at {del.deliveredAt}
                          </div>
                        )}
                        {del.failedReason && (
                          <div className="text-[10px] text-rose-600 font-medium" title={del.failedReason}>
                            ⚠️ {del.failedReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right space-x-1 whitespace-nowrap">
                      {del.status !== 'Delivered' && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, 'Delivered')}
                          title="Mark Delivered"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                      {(del.status === 'Pending' || del.status === 'Assigned') && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, 'Out for Delivery')}
                          title="Dispatch Stop (Out for Delivery)"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}
                      {del.status !== 'Delivered' && del.status !== 'Failed' && (
                        <button
                          onClick={() => {
                            setFailModalTask(del);
                            setFailReasonSelect('Door locked / No one answered');
                            setCustomFailReason('');
                          }}
                          title="Log Delivery Failure / Exception"
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Failed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingAddressTask(del);
                          setEditFlat(del.flatOrUnit || '');
                          setEditSociety(del.societyOrLandmark || '');
                          setEditLandmark(del.landmark || '');
                          setEditAddress(del.address);
                          setEditArea(del.area);
                          setEditNotes(del.notes || '');
                          setEditLat(del.latitude || 18.5593);
                          setEditLng(del.longitude || 73.7788);
                        }}
                        title="Edit Delivery Address / Society / Flat"
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-[10px] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit Loc</span>
                      </button>
                      <button
                        onClick={() => {
                          setReassigningTask(del);
                          setTargetRider(del.assignedRider);
                          setTargetSlot(del.slot || 'Morning (6:00 AM - 7:30 AM)');
                        }}
                        title="Reassign Rider & Time Slot"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ASSIGN ENTIRE ROUTE TO RIDER                    */}
      {/* ======================================================== */}
      {isAssignRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Route to Delivery Rider</h3>
                <p className="text-[11px] text-slate-400">Allocate all stops in a geographic route to a rider</p>
              </div>
              <button
                onClick={() => setIsAssignRouteOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Delivery Route / Area *
                </label>
                <select
                  value={routeArea}
                  onChange={(e) => setRouteArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Baner">Baner (Morning Route R-04)</option>
                  <option value="Aundh">Aundh (Route A-01)</option>
                  <option value="Kothrud">Kothrud (Route K-02)</option>
                  <option value="Wanowrie">Wanowrie (Route W-01)</option>
                  <option value="Wakad">Wakad (Route WK-03)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Delivery Rider *
                </label>
                <select
                  value={routeRider}
                  onChange={(e) => setRouteRider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Time Slot / Shift *
                </label>
                <select
                  value={routeSlot}
                  onChange={(e) => setRouteSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Morning (6:00 AM - 7:30 AM)">Morning Shift (6:00 AM - 7:30 AM)</option>
                  <option value="Evening (5:30 PM - 7:00 PM)">Evening Shift (5:30 PM - 7:00 PM)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800">
                All scheduled household drops in <strong>{routeArea}</strong> will immediately synchronize to this rider&apos;s mobile app.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignRouteOpen(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Assigning...' : 'Confirm Route Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SCHEDULE / DISPATCH ON-DEMAND STOP             */}
      {/* ======================================================== */}
      {isNewDeliveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule & Dispatch Stop</h3>
                <p className="text-[11px] text-slate-400">Add an on-demand doorstep delivery task</p>
              </div>
              <button
                onClick={() => setIsNewDeliveryOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Route / Area *
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Baner">Baner</option>
                    <option value="Aundh">Aundh</option>
                    <option value="Kothrud">Kothrud</option>
                    <option value="Wanowrie">Wanowrie</option>
                    <option value="Wakad">Wakad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doorstep Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Flat 304, Marvel Zephyr, Baner"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Housing Society / Building Complex (for Route Clustering)
                </label>
                <input
                  type="text"
                  value={newSociety}
                  onChange={(e) => setNewSociety(e.target.value)}
                  placeholder="e.g. Marvel Zephyr / Rohan Nilay / Green Glen"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Milk Variant
                  </label>
                  <select
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {products && products.length > 0 ? (
                      products.map((p) => (
                        <option key={p.id || p.variant} value={p.variant}>
                          {p.name} ({p.variant})
                        </option>
                      ))
                    ) : (
                      <option value="Cow Milk">No varieties added yet</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Slot / Shift
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 - 7:30 AM)</option>
                    <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 - 7:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Rider *
                  </label>
                  <select
                    value={newRider}
                    onChange={(e) => setNewRider(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {deliveryRiders.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDeliveryOpen(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Scheduling...' : 'Schedule & Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REASSIGN INDIVIDUAL STOP RIDER & TIME           */}
      {/* ======================================================== */}
      {reassigningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reassign Delivery Stop</h3>
                <p className="text-[11px] text-slate-400 font-medium">#{reassigningTask.deliveryNumber} &bull; {reassigningTask.customerName}</p>
              </div>
              <button
                onClick={() => setReassigningTask(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSingleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Rider *
                </label>
                <select
                  value={targetRider}
                  onChange={(e) => setTargetRider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.assignedArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Time Slot / Shift *
                </label>
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                  <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div><strong>Address:</strong> {reassigningTask.address}</div>
                <div><strong>Requirement:</strong> {reassigningTask.quantityLiters}L {reassigningTask.productVariant}</div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setReassigningTask(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CREATE NEW ROUTE                                */}
      {/* ======================================================== */}
      {isCreateRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Route</h3>
                <p className="text-[11px] text-slate-400">Define a new sector, cluster societies, and configure vehicle load limit</p>
              </div>
              <button
                onClick={() => setIsCreateRouteOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRouteSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    placeholder="e.g. H-05"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRouteArea}
                    onChange={(e) => setNewRouteArea(e.target.value)}
                    placeholder="e.g. Hinjawadi"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Hinjawadi Tech Park Morning Loop"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Rider *
                  </label>
                  <select
                    value={newRouteRider}
                    onChange={(e) => setNewRouteRider(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {deliveryRiders.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Capacity (L)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={newRouteCapacity}
                    onChange={(e) => setNewRouteCapacity(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold tabular-nums focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Housing Societies / Complexes in Route
                </label>
                <input
                  type="text"
                  value={newRouteSocieties}
                  onChange={(e) => setNewRouteSocieties(e.target.value)}
                  placeholder="e.g. Blue Ridge, Megapolis, Life Republic"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Comma-separated building names to cluster together</p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRouteOpen(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating...' : 'Create & Assign Route'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT DELIVERY ADDRESS & LOCATION (SUPPORT INACCURATE ADDRESSES) */}
      {/* ======================================================== */}
      {editingAddressTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Delivery Location</h3>
                <p className="text-[11px] text-slate-400">Correct address, flat number, society, or landmark</p>
              </div>
              <button
                onClick={() => setEditingAddressTask(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAddressSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                Updating location for <strong>{editingAddressTask.customerName}</strong> ({editingAddressTask.deliveryNumber}).
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Flat / Unit / Door #
                  </label>
                  <input
                    type="text"
                    value={editFlat}
                    onChange={(e) => setEditFlat(e.target.value)}
                    placeholder="e.g. Flat 302, B-Wing"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Housing Society / Complex *
                  </label>
                  <input
                    type="text"
                    value={editSociety}
                    onChange={(e) => setEditSociety(e.target.value)}
                    placeholder="e.g. Marvel Zephyr"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-purple-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. Flat 302, B-Wing, Marvel Zephyr, Baner"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Exact Map Pin Location for Delivery Rider */}
              <MapLocationPicker
                initialLat={editLat}
                initialLng={editLng}
                areaHint={editArea}
                onLocationSelect={(lat, lng) => {
                  setEditLat(lat);
                  setEditLng(lng);
                }}
                label="Pin Exact Delivery Doorstep on Map"
                compact={false}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    placeholder="e.g. Opposite DMart"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Route Sector
                  </label>
                  <select
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Baner">Baner</option>
                    <option value="Aundh">Aundh</option>
                    <option value="Kothrud">Kothrud</option>
                    <option value="Wanowrie">Wanowrie</option>
                    <option value="Wakad">Wakad</option>
                    <option value="Hinjawadi">Hinjawadi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rider Delivery Note
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Leave milk in bag at door handle"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAddressTask(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: LOG DELIVERY FAILURE / EXCEPTION WITH REASON    */}
      {/* ======================================================== */}
      {failModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Delivery Exception</h3>
                <p className="text-[11px] text-slate-400">Record reason for undelivered stop #{failModalTask.deliveryNumber}</p>
              </div>
              <button
                onClick={() => setFailModalTask(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogFailedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Failure / Return *
                </label>
                <select
                  value={failReasonSelect}
                  onChange={(e) => setFailReasonSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Door locked / No one answered">Door locked / No one answered</option>
                  <option value="Customer out of station (Unnotified)">Customer out of station (Unnotified)</option>
                  <option value="Customer refused delivery">Customer refused delivery</option>
                  <option value="Wrong / Incomplete address">Wrong / Incomplete address</option>
                  <option value="Aggressive pet / Gate inaccessible">Aggressive pet / Gate inaccessible</option>
                  <option value="Payment / Cash dispute">Payment / Cash dispute</option>
                  <option value="Other">Other (Enter custom reason)</option>
                </select>
              </div>

              {failReasonSelect === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe Exception Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={customFailReason}
                    onChange={(e) => setCustomFailReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setFailModalTask(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Exception</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERACTIVE ROUTE BUILDER STUDIO (MAP + SEQUENCING) */}
      {/* ======================================================== */}
      <RouteBuilderStudio
        isOpen={isRouteStudioOpen}
        onClose={() => setIsRouteStudioOpen(false)}
        customers={customers}
        subscriptions={subscriptions}
        staff={staff}
        routes={routes}
        dairies={dairies}
        onDispatch={handleRouteStudioDispatch}
      />
    </div>
  );
}
