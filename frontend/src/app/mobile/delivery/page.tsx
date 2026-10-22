'use client';

import React, { useState } from 'react';
import {
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function DeliveryPartnerMobileApp() {
  const { deliveries, updateDeliveryStatus } = useDairyPulse();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  const pendingStops = deliveries.filter((d) => d.status !== 'Delivered');
  const completedStops = deliveries.filter((d) => d.status === 'Delivered');
  const progressPercent = Math.round((completedStops.length / deliveries.length) * 100) || 0;

  return (
    <div className="py-2 flex justify-center w-full">
      <div className="w-full max-w-md min-h-[85vh] bg-slate-100 flex flex-col font-sans rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Mobile Header Bar */}
      <div className="bg-emerald-700 text-white p-4 pt-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <a href="/delivery" className="p-1 rounded-lg hover:bg-emerald-800 transition">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="font-extrabold text-base leading-tight">Delivery Partner</h1>
              <p className="text-[11px] text-emerald-200">Rahul Deshmukh • Baner Morning Route</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full">
            Today
          </span>
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
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1 bg-emerald-900/60 p-1 rounded-xl mt-3 text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'PENDING' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-200 hover:text-white'
            }`}
          >
            Pending Stops ({pendingStops.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'COMPLETED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-emerald-200 hover:text-white'
            }`}
          >
            Delivered ({completedStops.length})
          </button>
        </div>
      </div>

      {/* Stops List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-12">
        {activeTab === 'PENDING' ? (
          pendingStops.length > 0 ? (
            pendingStops.map((stop, index) => (
              <div
                key={stop.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Stop #{index + 1} • {stop.slot} Slot
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{stop.customerName}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl">
                    {stop.quantityLiters} L {stop.productVariant.split(' ')[0]}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{stop.address}</span>
                </div>

                {stop.notes && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    Note: {stop.notes}
                  </p>
                )}

                {/* Actions: Call, Directions, Mark Done */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={`tel:${stop.customerPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Call</span>
                  </a>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for failed delivery:');
                      if (reason) {
                        updateDeliveryStatus(stop.id, 'Failed', reason);
                      }
                    }}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition"
                  >
                    Failed
                  </button>
                  <button
                    onClick={() => updateDeliveryStatus(stop.id, 'Delivered')}
                    className="flex items-center justify-center gap-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Delivered</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">All Deliveries Complete!</h3>
              <p className="text-xs text-slate-500">You have completed all assigned stops for this route run.</p>
            </div>
          )
        ) : (
          completedStops.map((stop) => (
            <div key={stop.id} className="bg-white rounded-2xl p-4 border border-slate-200 opacity-90 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{stop.customerName}</h4>
                  <p className="text-xs text-slate-500">{stop.address}</p>
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
