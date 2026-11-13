'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  User,
  CheckCircle2,
  Search,
  Check,
  X,
  Gauge,
  Navigation,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { RouteBuildPayload } from '@/types';
import RouteBuilderStudio from '@/components/delivery/RouteBuilderStudio';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  ProgressBar,
} from '@/components/ui';

export default function RoutesManagementPage() {
  const {
    routes,
    deliveries,
    staff,
    customers,
    subscriptions,
    dairies,
    createRoute,
    assignRouteToRider,
    buildAndDispatchRoute,
    autoSequenceRoute,
    activeDairy,
  } = useDairyPulse();

  const [isRouteStudioOpen, setIsRouteStudioOpen] = useState(false);
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRouteForAssign, setSelectedRouteForAssign] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form states for creating a new route
  const [newRouteCode, setNewRouteCode] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteArea, setNewRouteArea] = useState('Baner');
  const [newRouteRider, setNewRouteRider] = useState('');
  const [newRouteSlot, setNewRouteSlot] = useState('Morning (6:00 AM - 7:30 AM)');
  const [newRouteSocieties, setNewRouteSocieties] = useState('');
  const [newRouteCapacity, setNewRouteCapacity] = useState('60');
  const [selectedRouteCustomerIds, setSelectedRouteCustomerIds] = useState<string[]>([]);
  const [routeCustomerSearch, setRouteCustomerSearch] = useState('');

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

  // Form states for rider reassignment
  const [assignRiderName, setAssignRiderName] = useState('');
  const [assignSlotTime, setAssignSlotTime] = useState('Morning (6:00 AM - 7:30 AM)');

  const deliveryRiders = useMemo(() => staff.filter((s) => s.role === 'Delivery Rider'), [staff]);
  const defaultRider = deliveryRiders[0]?.name || 'Rahul Deshmukh';

  // Overall KPIs
  const totalRoutesCount = routes.length;
  const totalDeliveriesCount = deliveries.length;
  const totalLitersScheduled = routes.reduce((sum, r) => sum + (r.totalLiters || 0), 0);
  const activeRidersCount = new Set(routes.map((r) => r.assignedRider).filter(Boolean)).size;

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return routes;
    const q = searchQuery.toLowerCase();
    return routes.filter(
      (r) =>
        r.routeCode.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.assignedRider?.toLowerCase().includes(q) ||
        (typeof r.societies === 'string' && r.societies.toLowerCase().includes(q))
    );
  }, [routes, searchQuery]);

  const handleRouteStudioDispatch = async (payload: RouteBuildPayload) => {
    const success = await buildAndDispatchRoute(payload);
    if (success) {
      setActionNotice(
        `Route ${payload.routeCode} (${payload.name}) dispatched with ${payload.stops.length} stops to ${payload.assignedRider}!`
      );
      setTimeout(() => setActionNotice(null), 5000);
    }
    return success;
  };

  const handleCreateRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteCode.trim() || !newRouteName.trim()) return;

    await createRoute({
      routeCode: newRouteCode.trim().toUpperCase(),
      name: newRouteName.trim(),
      area: newRouteArea,
      assignedRider: newRouteRider || defaultRider,
      slot: newRouteSlot,
      societies: newRouteSocieties.trim(),
      totalStops: selectedRouteCustomerIds.length,
      totalLiters: selectedRouteCustomersTotalLiters,
      maxCapacityLiters: parseFloat(newRouteCapacity) || 60.0,
      dairyName: activeDairy?.name || 'Amrut Dairy Farm',
      customerIds: selectedRouteCustomerIds,
    });

    setIsCreateRouteOpen(false);
    setNewRouteCode('');
    setNewRouteName('');
    setNewRouteSocieties('');
    setSelectedRouteCustomerIds([]);
    setRouteCustomerSearch('');
    setActionNotice(
      `Route ${newRouteCode.toUpperCase()} created with ${selectedRouteCustomerIds.length} customers assigned to ${newRouteRider || defaultRider}!`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAssignRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteForAssign) return;

    await assignRouteToRider(
      selectedRouteForAssign.routeCode,
      assignRiderName || defaultRider,
      assignSlotTime
    );

    setIsAssignModalOpen(false);
    setSelectedRouteForAssign(null);
    setActionNotice(
      `Assigned ${assignRiderName || defaultRider} to Route ${selectedRouteForAssign.routeCode}!`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Route Planning & Optimization"
        description="Visual route builder, doorstep sequence mapping, and driver capacity allocation."
      />

      {/* Floating Toast Notification Banner */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-teal-500/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-stone-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Delivery Routes & Loop Studio"
        description="Configure delivery zones, vehicle capacity constraints, and sequence doorstep stops for maximum fuel efficiency."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateRouteOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5 text-stone-500" />}
            >
              + Add Route
            </Button>
            <Link href="/delivery">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Truck className="w-3.5 h-3.5 text-teal-200" />}
                rightIcon={<ArrowRight className="w-3 h-3 ml-0.5" />}
              >
                Live Delivery Dispatch
              </Button>
            </Link>
          </>
        }
      />

      {/* ── KPI Stats Grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Configured Routes"
          value={totalRoutesCount}
          subtitle="Across active delivery zones"
          icon={<Navigation className="w-5 h-5" />}
          variant="teal"
        />

        <StatCard
          title="Delivery Drops"
          value={totalDeliveriesCount}
          subtitle="Assigned to morning & evening shifts"
          icon={<Truck className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Active', isPositive: true }}
        />

        <StatCard
          title="Route Volume"
          value={`${totalLitersScheduled.toFixed(1)} L`}
          subtitle="Within vehicle load capacities"
          icon={<Gauge className="w-5 h-5" />}
          variant="amber"
        />

        <StatCard
          title="Assigned Riders"
          value={activeRidersCount}
          subtitle="Delivery crew on duty today"
          icon={<User className="w-5 h-5" />}
          variant="terracotta"
        />
      </section>

      {/* ── Route Cards Grid ── */}
      <Card
        title="Active Delivery Routes & Loops"
        subtitle="Designated apartment societies, capacity limits, and assigned delivery riders"
        action={
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route, area, rider..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              aria-label="Search routes"
            />
          </div>
        }
      >
        {filteredRoutes.length === 0 ? (
          <div className="p-10 text-center bg-[#F6F2EA] border border-dashed border-stone-300 rounded-2xl">
            <Navigation className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-stone-700">No matching routes found</p>
            <p className="text-[11px] text-stone-500 mt-0.5 font-normal">
              Click &apos;+ Add Route&apos; to create your first delivery zone.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((r) => {
              const routeStops = deliveries.filter(
                (d) =>
                  d.route === r.routeCode ||
                  d.area === r.area ||
                  (d.notes && d.notes.includes(r.routeCode))
              );
              const routeLiters = routeStops.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
              const maxCap = r.maxCapacityLiters || 60.0;
              const capPercent = Math.round((routeLiters / maxCap) * 100);
              const isOver = routeLiters > maxCap;

              const socList: string[] = Array.isArray(r.societies)
                ? r.societies
                : typeof r.societies === 'string'
                ? r.societies.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={r.id || r.routeCode}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Header: Route Code & Drops */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-stone-900 text-white tracking-wide">
                          {r.routeCode}
                        </span>
                        <Badge variant="neutral" size="xs">
                          {r.area}
                        </Badge>
                      </div>
                      <span className="text-xs font-black text-stone-800 tabular-nums">
                        {routeStops.length || r.totalStops} drops
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-stone-900 mt-1">{r.name}</h3>

                    {/* Slot & Liters */}
                    <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{r.slot}</span>
                      <span>•</span>
                      <span className="font-bold text-[#0F766E]">
                        {(routeLiters || r.totalLiters).toFixed(1)} L
                      </span>
                    </div>

                    {/* Assigned Rider */}
                    <div className="flex items-center justify-between text-xs text-stone-700 bg-[#F6F2EA] p-2 rounded-xl border border-stone-200/60">
                      <span className="font-medium text-stone-500">Rider:</span>
                      <span className="font-bold text-stone-900 flex items-center gap-1">
                        🚴 {r.assignedRider || 'Unassigned'}
                      </span>
                    </div>

                    {/* Societies */}
                    {socList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {socList.map((soc, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-stone-100 border border-stone-200/80 text-stone-600 rounded-md text-[10px] font-medium truncate max-w-[140px]"
                            title={soc}
                          >
                            🏢 {soc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Vehicle Capacity Meter */}
                    <div className="pt-2 border-t border-stone-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">Crate Load:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            isOver ? 'text-orange-700' : 'text-stone-700'
                          }`}
                        >
                          {routeLiters.toFixed(1)} / {maxCap} L ({capPercent}%)
                        </span>
                      </div>
                      <ProgressBar
                        value={capPercent}
                        variant={isOver ? 'orange' : capPercent > 85 ? 'amber' : 'teal'}
                        size="sm"
                      />
                      {isOver && (
                        <div className="text-[10px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 text-orange-600" />
                          <span>Overloaded (+{(routeLiters - maxCap).toFixed(1)} L over capacity)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                    <Link
                      href="/delivery"
                      className="flex-1 py-1.5 bg-[#F6F2EA] hover:bg-stone-200 text-stone-800 text-[11px] font-bold rounded-lg transition-colors text-center"
                    >
                      View Stops
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedRouteForAssign(r);
                        setAssignRiderName(r.assignedRider || defaultRider);
                        setAssignSlotTime(r.slot || 'Morning (6:00 AM - 7:30 AM)');
                        setIsAssignModalOpen(true);
                      }}
                      className="p-1.5 bg-teal-50 hover:bg-teal-100 text-[#0F766E] rounded-lg transition-colors cursor-pointer"
                      title="Reassign Rider or Slot"
                      aria-label="Reassign rider"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        await autoSequenceRoute(r.area);
                        setActionNotice(`Route ${r.routeCode} stops re-sequenced by society!`);
                        setTimeout(() => setActionNotice(null), 4000);
                      }}
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors cursor-pointer"
                      title="Auto-Sequence Route Stops"
                      aria-label="Auto-sequence stops"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

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
                      {r.name} ({r.assignedArea})
                    </option>
                  ))}
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
                </div>

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

                <div className="max-h-44 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 bg-[#F6F2EA]/50">
                  {filteredCustomersForNewRoute.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 font-medium">
                      No matching customers found
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
                <Button type="submit" variant="primary" size="md">
                  Save Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REASSIGN RIDER ── */}
      {isAssignModalOpen && selectedRouteForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-sm">
                Reassign Route {selectedRouteForAssign.routeCode}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignRiderSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Designated Rider</label>
                <select
                  value={assignRiderName}
                  onChange={(e) => setAssignRiderName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.assignedArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Time Shift</label>
                <select
                  value={assignSlotTime}
                  onChange={(e) => setAssignSlotTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] cursor-pointer"
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
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Update Rider
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
