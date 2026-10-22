'use client';

import React from 'react';
import {
  Briefcase,
  UserCheck,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Plus,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';

export default function StaffManagementPage() {
  const { staff } = useDairyPulse();

  const onDutyCount = staff.filter((s) => s.status === 'On Duty').length;
  const ridersCount = staff.filter((s) => s.role === 'Delivery Rider').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & Operations Crew</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage delivery riders, plant operators, daily attendance, and route productivity.
          </p>
        </div>
        <button
          onClick={() => alert('Add Staff form opened')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee Profile</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Team Members</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{staff.length + 8}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Registered roster</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">On Duty Today</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{onDutyCount + 6}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Clocked in for shift</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Active Delivery Riders</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">{ridersCount + 3}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Doorstep morning route runners</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Average Delivery Rating</p>
          <h3 className="text-2xl font-extrabold text-amber-500 mt-1 tabular-nums">4.9 ★</h3>
          <p className="text-[11px] text-slate-400 mt-1">Customer satisfaction score</p>
        </div>
      </section>

      {/* Staff Directory Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Employee Directory & Attendance</h3>
          <span className="text-xs text-slate-400 font-medium">Shift Date: 23 Oct 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Staff Member</th>
                <th className="pb-2.5 font-medium">Role</th>
                <th className="pb-2.5 font-medium">Contact Phone</th>
                <th className="pb-2.5 font-medium">Assigned Route / Plant</th>
                <th className="pb-2.5 font-medium">Deliveries Today</th>
                <th className="pb-2.5 font-medium">Rating</th>
                <th className="pb-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 font-semibold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Joined {s.joiningDate}</div>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-700">{s.role}</td>
                  <td className="py-3.5 text-slate-600">
                    <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">
                      {s.phone}
                    </a>
                  </td>
                  <td className="py-3.5 text-slate-600">{s.assignedArea}</td>
                  <td className="py-3.5 font-bold text-slate-800 tabular-nums">
                    {s.deliveriesToday > 0 ? `${s.deliveriesToday} Drops` : '—'}
                  </td>
                  <td className="py-3.5 font-bold text-amber-600">★ {s.rating}</td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        s.status === 'On Duty'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      ></span>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
