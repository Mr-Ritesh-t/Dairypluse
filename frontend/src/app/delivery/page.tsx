'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  Edit3,
  AlertTriangle,
  Gauge,
  CheckCheck,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { DeliveryTask, RouteBuildPayload } from '@/types';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';
import RouteBuilderStudio from '@/components/delivery/RouteBuilderStudio';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  ProgressBar,
} from '@/components/ui';

export default function DeliveryManagementPage() {
  const {
    deliveries,
    updateDeliveryStatus,
    staff,
    updateStaff,
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
    activeDairy,
  } = useDairyPulse();

  // Distinct delivery areas
  const dynamicAreas = useMemo<string[]>(() => {
    const set = new Set<string>();
    routes.forEach((r) => {
      if (r.area && r.area.trim()) set.add(r.area.trim());
    });
    deliveries.forEach((d) => {
      if (d.area && d.area.trim()) set.add(d.area.trim());
    });
    return Array.from(set);
  }, [routes, deliveries]);

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
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRouteStudioDispatch = async (payload: RouteBuildPayload) => {
    const success = await buildAndDispatchRoute(payload);
    if (success) {
      setActionNotice(
        `Route ${payload.routeCode} (${payload.name}) dispatched with ${payload.stops.length} sequenced stops to ${payload.assignedRider}!`
      );
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
  const [selectedRouteCustomerIds, setSelectedRouteCustomerIds] = useState<string[]>([]);
  const [routeCustomerSearch, setRouteCustomerSearch] = useState('');

  const [fleetToast, setFleetToast] = useState<string | null>(null);

  const filteredCustomersForNewRoute = useMemo(() => {
    if (!routeCustomerSearch.trim()) return customers;
    const q = routeCustomerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.area?.toLowerCase().includes(q)
    );
  }, [customers, routeCustomerSearch]);

  const selectedRouteCustomersTotalLiters = useMemo(() => {
    return selectedRouteCustomerIds.reduce((sum, cid) => {
      const sub = subscriptions.find((s) => s.customerId === cid && s.status === 'Active');
      return sum + (sub?.quantityLiters || 1.5);
    }, 0);
  }, [selectedRouteCustomerIds, subscriptions]);

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
  }, [products, newVariant]);

  const deliveryRiders = staff.filter((s) => s.role === 'Delivery Rider');
  const defaultRiderName = deliveryRiders[0]?.name || 'Rahul Deshmukh';

  // Overall KPI counts
  const total = deliveries.length;
  const delivered = deliveries.filter((d) => d.status === 'Delivered').length;
  const inProgress = deliveries.filter((d) => d.status === 'In Progress').length;
  const pending = deliveries.filter((d) => d.status === 'Pending').length;
  const failed = deliveries.filter((d) => d.status === 'Failed').length;

  const filteredDeliveries = deliveries.filter((d) => {
    if (selectedRoute !== 'ALL') {
      const activeRouteObj = routes.find(
        (r) => r.routeCode === selectedRoute || r.name === selectedRoute || r.area === selectedRoute
      );
      const matchesRouteCode =
        d.route && (d.route === selectedRoute || (activeRouteObj && d.route === activeRouteObj.routeCode));
      const matchesArea = d.area === selectedRoute || (activeRouteObj && d.area === activeRouteObj.area);
      const matchesNotes =
        d.notes && activeRouteObj && d.notes.toLowerCase().includes(activeRouteObj.routeCode.toLowerCase());
      if (!matchesRouteCode && !matchesArea && !matchesNotes) return false;
    }
    if (selectedRiderFilter !== 'ALL' && d.assignedRider !== selectedRiderFilter) return false;
    if (selectedSlotFilter !== 'ALL' && !d.slot?.includes(selectedSlotFilter)) return false;
    if (selectedStatusFilter !== 'ALL' && d.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.customerName.toLowerCase().includes(q);
      const matchAddress = d.address.toLowerCase().includes(q);
      const matchRider = d.assignedRider.toLowerCase().includes(q);
      const matchRoute = d.route?.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchRider && !matchRoute) return false;
    }
    return true;
  });

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
    setNewCustName('');
    setNewCustPhone('');
    setNewAddress('');
    setNewSociety('');
    setActionNotice('New delivery scheduled and dispatched to rider!');
    setTimeout(() => setActionNotice(null), 4000);
  };

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
      totalStops: selectedRouteCustomerIds.length,
      totalLiters: selectedRouteCustomersTotalLiters,
      maxCapacityLiters: parseFloat(newRouteCapacity) || 60.0,
      dairyName: activeDairy?.name || 'Amrut Dairy Farm',
      customerIds: selectedRouteCustomerIds,
    });
    setIsSubmitting(false);
    setIsCreateRouteOpen(false);
    setNewRouteCode('');
    setNewRouteName('');
    setNewRouteSocieties('');
    setSelectedRouteCustomerIds([]);
    setRouteCustomerSearch('');
    setActionNotice(
      `Route ${newRouteCode.toUpperCase()} created with ${selectedRouteCustomerIds.length} customers assigned to ${newRouteRider || defaultRiderName}!`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

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
      <PageHead
        title="Delivery Dispatch & Routes"
        description="Live morning and evening delivery run status, driver assigned routes, vehicle capacity loads, and doorstep proof."
      />

      {/* Notice Alert */}
      {actionNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-teal-700 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Delivery Fleet & Route Dispatch"
        description="Live status per rider, vehicle capacity loads, cluster sequencing by society, and doorstep proof of delivery."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setRouteRider(defaultRiderName);
                setIsAssignRouteOpen(true);
              }}
              leftIcon={<User className="w-3.5 h-3.5 text-[#0F766E]" />}
            >
              Assign Route
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewRider(defaultRiderName);
                setIsNewDeliveryOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Schedule Stop
            </Button>
          </>
        }
      />

      {/* ── Routes & Clusters Overview ── */}
      <Card
        title={`Delivery Routes & Society Loops (${routes.length})`}
        subtitle="Customer doorsteps clustered by housing society for quick consecutive deliveries"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewRouteRider(defaultRiderName);
                setIsCreateRouteOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Route
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const targetArea = selectedRoute === 'ALL' ? dynamicAreas[0] || 'Default Route' : selectedRoute;
                await autoSequenceRoute(targetArea);
                setActionNotice(`Stops in ${targetArea} auto-clustered by building & apartment sequence!`);
                setTimeout(() => setActionNotice(null), 4000);
              }}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
            >
              Auto-Cluster
            </Button>
          </div>
        }
      >
        {routes.length === 0 ? (
          <div className="p-8 text-center bg-[#F6F2EA] border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-bold text-stone-700">No delivery routes configured yet</p>
            <p className="text-[11px] text-stone-500 font-normal max-w-sm">
              Click &apos;+ Add Route&apos; to configure delivery zones, assign delivery riders, and cluster doorstep drops.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewRouteRider(defaultRiderName || 'Self / Dairy Owner');
                setIsCreateRouteOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="mt-1"
            >
              + Add Route
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {routes.map((r) => {
              const isFilterActive = selectedRoute === r.routeCode || selectedRoute === r.area;
              const areaStops = deliveries.filter(
                (d) =>
                  d.route === r.routeCode ||
                  d.area === r.area ||
                  (d.notes && d.notes.includes(r.routeCode))
              );
              const totalLiters = areaStops.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
              const socList: string[] = Array.isArray(r.societies)
                ? r.societies
                : typeof r.societies === 'string'
                ? r.societies.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

              const maxCap = r.maxCapacityLiters || 60.0;
              const liters = totalLiters || r.totalLiters;
              const capPercent = Math.round((liters / maxCap) * 100);
              const isOver = liters > maxCap;

              return (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-2xl border transition-colors relative flex flex-col justify-between space-y-2.5 ${
                    isFilterActive
                      ? 'border-[#0F766E] bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-stone-900 text-white tracking-wide">
                        {r.routeCode}
                      </span>
                      <span className="text-xs font-black text-stone-800 tabular-nums">
                        {areaStops.length || r.totalStops} drops
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-stone-900 truncate">{r.name}</h4>
                    <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{r.slot?.split(' ')[0] || 'Morning'}</span>
                      <span>•</span>
                      <span className="font-bold text-[#0F766E]">
                        {(totalLiters || r.totalLiters).toFixed(1)} L
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 font-semibold truncate">
                      🚴 {r.assignedRider || 'Unassigned'}
                    </div>

                    {socList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {socList.slice(0, 2).map((soc, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded text-[9px] font-medium truncate max-w-[100px]"
                            title={soc}
                          >
                            🏢 {soc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Capacity */}
                    <div className="pt-2 border-t border-stone-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-stone-500 font-medium">Load:</span>
                        <span className={`font-bold tabular-nums ${isOver ? 'text-orange-700' : 'text-stone-700'}`}>
                          {liters.toFixed(1)} / {maxCap} L ({capPercent}%)
                        </span>
                      </div>
                      <ProgressBar
                        value={capPercent}
                        variant={isOver ? 'orange' : capPercent > 85 ? 'amber' : 'teal'}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedRoute(isFilterActive ? 'ALL' : r.routeCode)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        isFilterActive
                          ? 'bg-[#0F766E] text-white'
                          : 'bg-[#F6F2EA] hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isFilterActive ? 'Active' : 'Filter Stops'}
                    </button>
                    <button
                      onClick={() => {
                        setRouteArea(r.area);
                        setRouteRider(r.assignedRider || defaultRiderName);
                        setRouteSlot(r.slot || 'Morning (6:00 AM - 7:30 AM)');
                        setIsAssignRouteOpen(true);
                      }}
                      title={`Assign ${r.area} Route to Rider`}
                      className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── 4 Metric KPI Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Route Drops"
          value={total}
          subtitle={`${deliveryRiders.length} Delivery Riders on duty`}
          icon={<Truck className="w-5 h-5" />}
          variant="teal"
        />

        <StatCard
          title="Delivered"
          value={delivered}
          subtitle={`${total > 0 ? Math.round((delivered / total) * 100) : 0}% completion`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Delivered', isPositive: true }}
        />

        <StatCard
          title="In Transit"
          value={inProgress}
          subtitle="On delivery bikes"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />

        <StatCard
          title="Pending Queue"
          value={pending}
          subtitle={failed > 0 ? `${failed} delivery exceptions` : 'In route queue'}
          icon={<AlertCircle className="w-5 h-5" />}
          variant="terracotta"
        />
      </section>

      {/* ── Main Split View: Rider Tracking (4 cols) & Route Stops Table (8 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Rider Tracking Panel */}
        <div className="lg:col-span-4">
          <Card
            title="Rider Live Fleet"
            subtitle="Progress per delivery partner"
            action={
              <Badge variant="success" size="xs">
                {deliveryRiders.filter((r) => r.status === 'On Duty').length} / {deliveryRiders.length} On Duty
              </Badge>
            }
          >
            {fleetToast && (
              <div className="p-2 mb-3 bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                <span>{fleetToast}</span>
                <button
                  type="button"
                  onClick={() => setFleetToast(null)}
                  className="text-teal-200 hover:text-white ml-2 text-xs font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {selectedRiderFilter !== 'ALL' && (
              <div className="flex items-center justify-between p-2 mb-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
                <span>
                  Filtering: <strong>{selectedRiderFilter}</strong>
                </span>
                <button
                  onClick={() => setSelectedRiderFilter('ALL')}
                  className="text-[11px] font-bold text-teal-800 underline cursor-pointer"
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
                const riderProgress =
                  riderStops.length > 0 ? Math.round((riderDelivered / riderStops.length) * 100) : 0;
                const isSelected = selectedRiderFilter === rider.name;

                return (
                  <div
                    key={rider.id}
                    onClick={() => setSelectedRiderFilter(isSelected ? 'ALL' : rider.name)}
                    className={`p-3.5 rounded-2xl border transition-colors cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#0F766E] bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-stone-200 bg-[#F6F2EA]/40 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-900 font-bold text-xs flex items-center justify-center">
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{rider.name}</h4>
                          <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-stone-400" />
                            {rider.assignedArea}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const nextStatus = rider.status === 'On Duty' ? 'Off Duty' : 'On Duty';
                            await updateStaff(rider.id, { status: nextStatus });
                            setFleetToast(`✓ ${rider.name} marked ${nextStatus}`);
                            setTimeout(() => setFleetToast(null), 3000);
                          }}
                          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                          title={`Click to set ${rider.name} ${rider.status === 'On Duty' ? 'Off Duty' : 'On Duty'}`}
                        >
                          <Badge
                            variant={rider.status === 'On Duty' ? 'emerald' : 'neutral'}
                            size="xs"
                            dot
                          >
                            {rider.status === 'On Duty' ? 'On Duty' : 'Off Duty'}
                          </Badge>
                        </button>
                        <Badge variant="amber" size="xs">
                          ★ {rider.rating}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-600 font-medium">
                        <span>{riderDelivered} of {riderStops.length} done</span>
                        <span className="font-bold tabular-nums">{riderProgress}%</span>
                      </div>
                      <ProgressBar value={riderProgress} variant="teal" size="sm" />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 border-t border-stone-100">
                      <span className="font-semibold text-emerald-700">
                        {riderDelivered} Delivered • {riderPending} Left
                      </span>
                      <a
                        href={`tel:${rider.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Active Delivery Stops Table */}
        <div className="lg:col-span-8">
          <Card
            title={`Active Stops (${filteredDeliveries.length})`}
            subtitle="Sequenced doorstep drops. Use ▲ ▼ or Auto-Sequence to optimize"
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const targetArea = selectedRoute === 'ALL' ? dynamicAreas[0] || 'Default Route' : selectedRoute;
                    await autoSequenceRoute(targetArea);
                    setActionNotice(`Stops re-ordered! Clustered by building & apartment.`);
                    setTimeout(() => setActionNotice(null), 4000);
                  }}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                >
                  Auto-Sequence
                </Button>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stop..."
                    className="pl-8 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>
            }
          >
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-stone-100 text-xs">
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-2.5 py-1 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              >
                <option value="ALL">All Routes ({deliveries.length} drops)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.routeCode}>
                    {r.routeCode} - {r.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSlotFilter}
                onChange={(e) => setSelectedSlotFilter(e.target.value)}
                className="px-2.5 py-1 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              >
                <option value="ALL">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Stops Table */}
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs min-w-[700px]" aria-label="Delivery Stops Table">
                <thead>
                  <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                    <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Seq</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Customer & Address</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-center">Milk Qty</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Rider & Shift</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold">Status</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Truck className="w-8 h-8 text-stone-300" />
                          <span className="font-bold text-sm text-stone-800">No matching delivery stops</span>
                          <span className="text-xs text-stone-500 font-normal">
                            Try resetting filters or click &apos;+ Schedule Stop&apos; above
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((task, idx) => (
                      <tr key={task.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="w-6 h-6 rounded-md bg-[#F6F2EA] text-stone-800 font-black text-[11px] flex items-center justify-center tabular-nums">
                              {task.sequenceOrder || idx + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveDeliveryStop(task.id, 'UP')}
                                disabled={idx === 0}
                                className="text-stone-400 hover:text-[#0F766E] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveDeliveryStop(task.id, 'DOWN')}
                                disabled={idx === filteredDeliveries.length - 1}
                                className="text-stone-400 hover:text-[#0F766E] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-stone-800">
                          <div className="font-bold text-stone-900">{task.customerName}</div>
                          <div className="text-[10px] text-stone-500 font-normal flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{task.address}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-extrabold text-stone-900 tabular-nums">
                          {task.quantityLiters} L ({task.productVariant.split(' ')[0]})
                        </td>

                        <td className="py-3 px-3 text-stone-700">
                          <div className="font-semibold text-xs text-stone-900">{task.assignedRider}</div>
                          <div className="text-[10px] text-stone-500">{task.slot}</div>
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              task.status === 'Delivered'
                                ? 'success'
                                : task.status === 'In Progress'
                                ? 'info'
                                : task.status === 'Failed'
                                ? 'danger'
                                : 'warning'
                            }
                            dot
                            size="xs"
                          >
                            {task.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {task.status !== 'Delivered' && (
                              <button
                                onClick={() => updateDeliveryStatus(task.id, 'Delivered')}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                title="Mark Delivered"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingAddressTask(task);
                                setEditFlat(task.flatOrUnit || '');
                                setEditSociety(task.societyOrLandmark || '');
                                setEditLandmark(task.landmark || '');
                                setEditAddress(task.address || '');
                                setEditArea(task.area || '');
                                setEditNotes(task.notes || '');
                                setEditLat(task.latitude || 18.5593);
                                setEditLng(task.longitude || 73.7788);
                              }}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit Location GPS"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setReassigningTask(task);
                                setTargetRider(task.assignedRider);
                                setTargetSlot(task.slot);
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Reassign Rider / Shift"
                            >
                              <User className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ── MODAL: BULK ROUTE ASSIGN ── */}
      {isAssignRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm">Assign Area Route to Rider</h3>
              <button onClick={() => setIsAssignRouteOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignRouteSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Select Delivery Area</label>
                <select
                  value={routeArea}
                  onChange={(e) => setRouteArea(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  {dynamicAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Designated Rider</label>
                <select
                  value={routeRider}
                  onChange={(e) => setRouteRider(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.assignedArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Delivery Shift</label>
                <select
                  value={routeSlot}
                  onChange={(e) => setRouteSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                  <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAssignRouteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Assign All Stops
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE NEW STOP ── */}
      {isNewDeliveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm">Schedule Individual Delivery Stop</h3>
              <button onClick={() => setIsNewDeliveryOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverySubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Priya Kulkarni"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 94230 77812"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Doorstep Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Flat 402, Rohan Nilay"
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Milk Variety</label>
                  <select
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.variant}>
                        {p.variant}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Quantity (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs tabular-nums focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Shift</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  >
                    <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                    <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Assigned Rider</label>
                  <select
                    value={newRider}
                    onChange={(e) => setNewRider(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  >
                    {deliveryRiders.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsNewDeliveryOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Schedule Stop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT ADDRESS & MAP LOCATION ── */}
      {editingAddressTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Update Delivery Location</h3>
                <p className="text-[11px] text-stone-500 font-normal">
                  {editingAddressTask.customerName} (#{editingAddressTask.deliveryNumber})
                </p>
              </div>
              <button
                onClick={() => setEditingAddressTask(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditAddressSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Flat / Unit</label>
                  <input
                    type="text"
                    value={editFlat}
                    onChange={(e) => setEditFlat(e.target.value)}
                    placeholder="e.g. Flat 402"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Society / Building</label>
                  <input
                    type="text"
                    value={editSociety}
                    onChange={(e) => setEditSociety(e.target.value)}
                    placeholder="e.g. Rohan Nilay"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Full Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street address, landmark"
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              {/* Map Location Picker Component */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  GPS Pin Placement (Draggable Pin)
                </label>
                <MapLocationPicker
                  initialLat={editLat}
                  initialLng={editLng}
                  onLocationSelect={(lat: number, lng: number) => {
                    setEditLat(lat);
                    setEditLng(lng);
                  }}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditingAddressTask(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Save Coordinates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE NEW ROUTE ── */}
      {isCreateRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0F766E]" />
                Configure New Delivery Route
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateRouteOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRouteSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Route Code *</label>
                  <input
                    type="text"
                    required
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    placeholder="e.g. R-05"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs uppercase font-extrabold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Delivery Area *</label>
                  <input
                    type="text"
                    required
                    value={newRouteArea}
                    onChange={(e) => setNewRouteArea(e.target.value)}
                    placeholder="e.g. Baner"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Baner Morning Express Loop"
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Assigned Rider</label>
                <select
                  value={newRouteRider}
                  onChange={(e) => setNewRouteRider(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.assignedArea || 'Delivery Rider'})
                    </option>
                  ))}
                  {deliveryRiders.length === 0 && (
                    <>
                      <option value="Self / Dairy Owner">Self / Dairy Owner</option>
                      <option value="Default Delivery Rider">Default Delivery Rider</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Delivery Shift</label>
                  <select
                    value={newRouteSlot}
                    onChange={(e) => setNewRouteSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
                  >
                    <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                    <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Max Capacity (L)</label>
                  <input
                    type="number"
                    value={newRouteCapacity}
                    onChange={(e) => setNewRouteCapacity(e.target.value)}
                    min="10"
                    max="200"
                    className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs tabular-nums focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Societies / Landmarks</label>
                <input
                  type="text"
                  value={newRouteSocieties}
                  onChange={(e) => setNewRouteSocieties(e.target.value)}
                  placeholder="e.g. Rohan Nilay, Green Glen, Marvel Zephyr"
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              {/* Customer Checklist */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-900">
                      Select Customers ({selectedRouteCustomerIds.length} selected)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Rider will deliver to these households
                    </p>
                  </div>
                  {filteredCustomersForNewRoute.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRouteCustomerIds(filteredCustomersForNewRoute.map((c) => c.id))
                        }
                        className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedRouteCustomerIds([])}
                        className="text-[11px] font-bold text-stone-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {customers.length > 0 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={routeCustomerSearch}
                      onChange={(e) => setRouteCustomerSearch(e.target.value)}
                      placeholder="Search customers by name, phone, address..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>
                )}

                <div className="max-h-44 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 bg-[#F6F2EA]/50">
                  {filteredCustomersForNewRoute.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 font-medium">
                      {customers.length === 0
                        ? 'No customers registered yet. You can create the route now and assign customers later.'
                        : 'No matching customers found.'}
                    </div>
                  ) : (
                    filteredCustomersForNewRoute.map((cust) => {
                      const isSelected = selectedRouteCustomerIds.includes(cust.id);
                      const sub = subscriptions.find(
                        (s) => s.customerId === cust.id && s.status === 'Active'
                      );
                      const qty = sub?.quantityLiters || 1.5;
                      const variant = sub?.productVariant || 'Cow Milk';

                      return (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedRouteCustomerIds((prev) =>
                              isSelected ? prev.filter((id) => id !== cust.id) : [...prev, cust.id]
                            );
                          }}
                          className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/90' : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-stone-300 text-[#0F766E] focus:ring-[#0F766E] shrink-0 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-stone-900 truncate block">
                                {cust.name}
                              </span>
                              <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-stone-400" />
                                <span>{cust.address}</span>
                              </p>
                            </div>
                          </div>
                          <Badge variant="teal" size="xs">
                            🥛 {qty} L {variant}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-stone-900">
                    {selectedRouteCustomerIds.length} drops ({selectedRouteCustomersTotalLiters.toFixed(1)} L)
                  </span>
                  <span className="font-bold text-stone-600">
                    Capacity: {selectedRouteCustomersTotalLiters.toFixed(1)} / {newRouteCapacity || 60} L
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsCreateRouteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Save Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded RouteBuilderStudio Modal */}
      {isRouteStudioOpen && (
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
      )}
    </div>
  );
}
