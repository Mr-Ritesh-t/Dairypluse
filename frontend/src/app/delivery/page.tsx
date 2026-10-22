'use client';

import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Navigation,
  User,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { DeliveryTask } from '@/types';

export default function DeliveryManagementPage() {
  const { deliveries, updateDeliveryStatus, staff } = useDairyPulse();
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');

  const total = deliveries.length;
  const delivered = deliveries.filter((d) => d.status === 'Delivered').length;
  const inProgress = deliveries.filter((d) => d.status === 'In Progress').length;
  const pending = deliveries.filter((d) => d.status === 'Pending').length;

  const filteredDeliveries = deliveries.filter((d) => {
    if (selectedRoute === 'ALL') return true;
    return d.area === selectedRoute;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery & Route Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch planning, route sequencing, delivery boy assignments, and live doorstep tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/mobile/delivery"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Truck className="w-4 h-4" />
            <span>Open Delivery Partner View</span>
          </a>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Route Drops</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{total}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Morning & Evening scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Delivered Successfully</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">{delivered}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Doorstep verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">In Transit</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">{inProgress}</h3>
          <p className="text-[11px] text-slate-400 mt-1">On active delivery bike/van</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pending Stops</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">{pending}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</p>
        </div>
      </section>

      {/* Delivery Roster & Route Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Delivery Staff Roster (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delivery Boys On Duty</h3>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              3 Active
            </span>
          </div>

          <div className="space-y-3">
            {staff
              .filter((s) => s.role === 'Delivery Rider')
              .map((rider) => (
                <div key={rider.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {rider.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">{rider.name}</h4>
                        <p className="text-[10px] text-slate-400">{rider.assignedArea}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ★ {rider.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{rider.deliveriesToday} Drops assigned</span>
                    <a
                      href={`tel:${rider.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Route Stops Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Delivery Stops & Sequence</h3>
              <p className="text-xs text-slate-400 mt-0.5">Change status in real time or assign to a rider</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Route:</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Routes</option>
                <option value="Baner">Baner</option>
                <option value="Wanowrie">Wanowrie</option>
                <option value="Central Market">Central Market</option>
                <option value="Wakad">Wakad</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Stop #</th>
                  <th className="pb-2.5 font-medium">Customer / Address</th>
                  <th className="pb-2.5 font-medium">Milk Qty</th>
                  <th className="pb-2.5 font-medium">Rider</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.map((del, idx) => (
                  <tr key={del.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      <div>{del.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {del.address}
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-700 tabular-nums">
                      {del.quantityLiters} L ({del.productVariant.split(' ')[0]})
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{del.assignedRider}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          del.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : del.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {del.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      {del.status !== 'Delivered' && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, 'Delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                      {del.status === 'Pending' && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, 'In Progress')}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
