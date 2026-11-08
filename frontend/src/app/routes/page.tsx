'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Truck,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  User,
  Building2,
  CheckCircle2,
  Search,
  Filter,
  Check,
  X,
  Gauge,
  Navigation,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { RouteBuildPayload } from '@/types';
import RouteBuilderStudio from '@/components/delivery/RouteBuilderStudio';

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
      totalStops: 0,
      totalLiters: 0,
      maxCapacityLiters: parseFloat(newRouteCapacity) || 60.0,
      dairyName: activeDairy?.name || 'Amrut Dairy Farm',
    });

    setIsCreateRouteOpen(false);
    setNewRouteCode('');
    setNewRouteName('');
    setNewRouteSocieties('');
    setActionNotice(`Route ${newRouteCode.toUpperCase()} added successfully!`);
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
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
              Fleet & Dispatch
            </span>
            <span className="text-xs text-slate-400 font-medium">• Live Routing Studio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-emerald-600" />
            Route Planning & Optimization
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure delivery zones, vehicle capacity constraints, and sequence doorstep stops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRouteStudioOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Open Real Map Route Studio</span>
          </button>

          <button
            onClick={() => setIsCreateRouteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>+ Add Route</span>
          </button>

          <Link
            href="/delivery"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Live Delivery Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Configured Routes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{totalRoutesCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Across active distribution hubs</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Delivery Drops</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{totalDeliveriesCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Assigned to daily morning & evening runs</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Route Volume (Liters)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {totalLitersScheduled.toFixed(1)} L
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Within vehicle load capacities</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Riders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{activeRidersCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Delivery fleet on duty today</div>
        </div>
      </div>

      {/* Route Cards Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Delivery Routes & Loops</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each route binds designated societies, vehicle capacity limits, and an assigned delivery rider.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route code, name, rider..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {filteredRoutes.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No matching routes found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;+ Add Route&apos; to create your first delivery zone.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((r) => {
              const routeStops = deliveries.filter(
                (d) => d.route === r.routeCode || d.area === r.area || (d.notes && d.notes.includes(r.routeCode))
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
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Route Code & Drops */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white tracking-wide">
                          {r.routeCode}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {r.area}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-800 tabular-nums">
                        {routeStops.length || r.totalStops} drops
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 mt-2.5">{r.name}</h3>

                    {/* Slot & Liters */}
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.slot}</span>
                      <span>&bull;</span>
                      <span className="font-bold text-emerald-700">{(routeLiters || r.totalLiters).toFixed(1)} L</span>
                    </div>

                    {/* Assigned Rider */}
                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200/70">
                      <span className="font-medium text-slate-500">Rider:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        🚴 {r.assignedRider || 'Unassigned'}
                      </span>
                    </div>

                    {/* Society Badges */}
                    {socList.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {socList.map((soc, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-medium truncate max-w-[150px]"
                            title={soc}
                          >
                            🏢 {soc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Vehicle Capacity Meter */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Crate Load:</span>
                        <span className={`font-bold tabular-nums ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                          {routeLiters.toFixed(1)} / {maxCap} L ({capPercent}%)
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
                        <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 text-rose-600" />
                          <span>Overloaded (+{(routeLiters - maxCap).toFixed(1)} L over capacity)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <Link
                      href={`/delivery`}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition text-center"
                    >
                      View Stops in Dispatch
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedRouteForAssign(r);
                        setAssignRiderName(r.assignedRider || defaultRider);
                        setAssignSlotTime(r.slot || 'Morning (6:00 AM - 7:30 AM)');
                        setIsAssignModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg transition"
                      title="Reassign Rider or Slot"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        await autoSequenceRoute(r.area);
                        setActionNotice(`Route ${r.routeCode} stops re-sequenced by society!`);
                        setTimeout(() => setActionNotice(null), 4000);
                      }}
                      className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg transition"
                      title="Auto-Sequence Route Stops"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create New Route */}
      {isCreateRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Configure New Delivery Route
              </h3>
              <button onClick={() => setIsCreateRouteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRouteSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Route Code *</label>
                  <input
                    type="text"
                    required
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    placeholder="e.g. R-05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Delivery Area *</label>
                  <input
                    type="text"
                    required
                    value={newRouteArea}
                    onChange={(e) => setNewRouteArea(e.target.value)}
                    placeholder="e.g. Baner"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Baner Morning Express Loop"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Assigned Rider</label>
                <select
                  value={newRouteRider}
                  onChange={(e) => setNewRouteRider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Delivery Shift</label>
                  <select
                    value={newRouteSlot}
                    onChange={(e) => setNewRouteSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                    <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Max Capacity (L)</label>
                  <input
                    type="number"
                    value={newRouteCapacity}
                    onChange={(e) => setNewRouteCapacity(e.target.value)}
                    min="10"
                    max="200"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Societies / Landmarks</label>
                <input
                  type="text"
                  value={newRouteSocieties}
                  onChange={(e) => setNewRouteSocieties(e.target.value)}
                  placeholder="e.g. Rohan Nilay, Green Glen, Marvel Zephyr"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRouteOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reassign Rider */}
      {isAssignModalOpen && selectedRouteForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Reassign Route {selectedRouteForAssign.routeCode}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignRiderSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Designated Rider</label>
                <select
                  value={assignRiderName}
                  onChange={(e) => setAssignRiderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {deliveryRiders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.assignedArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Time Slot</label>
                <select
                  value={assignSlotTime}
                  onChange={(e) => setAssignSlotTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                  <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 PM - 7:00 PM)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Update Rider
                </button>
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
