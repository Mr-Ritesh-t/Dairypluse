'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  UserCheck,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  X,
  Truck,
  MapPin,
  ShieldCheck,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Droplets,
  PackageCheck,
  User,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { StaffMember } from '@/types';

export default function StaffManagementPage() {
  const { staff, addStaff, updateStaff, deleteStaff, deliveries, routes, driverRatings } = useDairyPulse();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    phone: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Delivery Rider' | 'Dairy Plant Operator' | 'Quality Inspector' | 'Store Manager'>('Delivery Rider');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('rider123');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedArea, setAssignedArea] = useState('Baner Morning Route R-04');
  const [status, setStatus] = useState<'On Duty' | 'Off Duty'>('On Duty');

  const onDutyCount = staff.filter((s) => s.status === 'On Duty').length;
  const ridersCount = staff.filter((s) => s.role === 'Delivery Rider').length;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Create staff
  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const finalEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const finalPassword = password.trim() || 'rider123';

    setIsSubmitting(true);
    try {
      await addStaff({
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: finalEmail,
        password: finalPassword,
        assignedArea: assignedArea.trim(),
        status,
        deliveriesToday: 0,
        rating: 5.0,
      });

      setSuccessInfo({
        name: name.trim(),
        phone: phone.trim(),
        email: finalEmail,
        password: finalPassword,
        role,
      });

      setName('');
      setPhone('');
      setEmail('');
      setPassword('rider123');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete staff
  const handleConfirmDelete = async () => {
    if (!deleteConfirmStaff) return;
    setIsDeleting(true);
    try {
      await deleteStaff(deleteConfirmStaff.id);
      setActionMessage(`Staff member "${deleteConfirmStaff.name}" was successfully removed.`);
      if (selectedStaff?.id === deleteConfirmStaff.id) {
        setSelectedStaff(null);
      }
      setDeleteConfirmStaff(null);
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle staff duty status
  const handleToggleStatus = async (staffMember: StaffMember) => {
    const nextStatus = staffMember.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    await updateStaff(staffMember.id, { status: nextStatus });
    if (selectedStaff?.id === staffMember.id) {
      setSelectedStaff({ ...selectedStaff, status: nextStatus });
    }
    setActionMessage(`${staffMember.name}'s status changed to ${nextStatus}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Helper metrics for a selected staff member
  const getStaffMetrics = (member: StaffMember) => {
    // Deliveries assigned to this rider today
    const assignedDeliveries = deliveries.filter(
      (d) =>
        d.assignedRider?.toLowerCase() === member.name.toLowerCase() ||
        d.area?.toLowerCase().includes(member.assignedArea.toLowerCase().split(' ')[0])
    );
    const deliveredCount = assignedDeliveries.filter((d) => d.status === 'Delivered').length;
    const totalTodayDrops = Math.max(assignedDeliveries.length, member.deliveriesToday || 0);
    const totalTodayLitres = assignedDeliveries.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
    const completionRate = totalTodayDrops > 0 ? Math.round((deliveredCount / totalTodayDrops) * 100) : 100;

    // Associated route
    const matchingRoute = routes.find(
      (r) =>
        r.assignedRider?.toLowerCase() === member.name.toLowerCase() ||
        member.assignedArea.toLowerCase().includes(r.area.toLowerCase())
    );

    // Lifetime drops based on logged deliveries
    const lifetimeDrops = (member.deliveriesToday || totalTodayDrops || 0);

    return {
      assignedDeliveries,
      deliveredCount,
      totalTodayDrops,
      totalTodayLitres,
      completionRate,
      matchingRoute,
      lifetimeDrops,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast / Banner Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-sm font-bold p-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & Delivery Crew</h2>
          <p className="text-xs text-slate-500 mt-1">
            Admin can manage delivery riders, review today's drop statistics, inspect route profiles, and manage staff IDs.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccessInfo(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Rider / Staff ID</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Crew</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{staff.length}</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">Active roster</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">On Duty</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{onDutyCount}</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">Clocked in</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Delivery Riders</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">{ridersCount}</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Route runners</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Avg Rating</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-1 tabular-nums">4.9 ★</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Customer score</p>
        </div>
      </section>

      {/* Staff Directory Table */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Delivery Rider & Staff Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any staff member row to view his full profile, route, and delivery history.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            {staff.length} Registered
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Staff Member</th>
                <th className="pb-2.5 font-medium">Role</th>
                <th className="pb-2.5 font-medium">Login (Phone / Gmail)</th>
                <th className="pb-2.5 font-medium">Assigned Route / Plant</th>
                <th className="pb-2.5 font-medium">Today's Deliveries</th>
                <th className="pb-2.5 font-medium">Rating</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-sm text-slate-600">No staff members enrolled yet</span>
                      <span className="text-xs text-slate-400">Click &apos;+ Add Staff Member&apos; above to onboard delivery riders or plant managers</span>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((s) => {
                const metrics = getStaffMetrics(s);
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStaff(s)}
                    className="hover:bg-emerald-50/40 transition cursor-pointer group"
                    title="Click to view full staff profile and deliveries"
                  >
                    <td className="py-3.5 font-semibold text-slate-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition font-medium">
                            View Profile →
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">Joined {s.joiningDate}</div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          s.role === 'Delivery Rider'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.role === 'Delivery Rider' && <Truck className="w-3 h-3" />}
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{s.phone}</span>
                        </div>
                        {s.email && (
                          <div className="text-[11px] font-sans font-medium text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[170px]" title={s.email}>{s.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.assignedArea}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700 tabular-nums">
                      <div className="font-semibold">
                        {metrics.deliveredCount} / {metrics.totalTodayDrops} drops
                      </div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${metrics.completionRate}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-amber-600">★ {s.rating}</td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(s);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer hover:opacity-80 ${
                          s.status === 'On Duty'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{s.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedStaff(s)}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                          title="Open Profile"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmStaff(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Staff Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 1. DETAILED STAFF PROFILE MODAL */}
      {/* ======================================================== */}
      {selectedStaff && (() => {
        const metrics = getStaffMetrics(selectedStaff);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-left shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900">{selectedStaff.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          selectedStaff.status === 'On Duty'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedStaff.status === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {selectedStaff.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {selectedStaff.role}
                      </span>
                      <span>•</span>
                      <span>Joined: {selectedStaff.joiningDate}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        ★ {selectedStaff.rating} rating
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Stats KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Today's Deliveries</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {metrics.deliveredCount} / {metrics.totalTodayDrops}
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                    {metrics.completionRate}% route finished
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Volume Out</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {metrics.totalTodayLitres || (metrics.totalTodayDrops * 1.5).toFixed(1)} L
                  </div>
                  <p className="text-[10px] text-blue-700 mt-0.5 font-medium">Today's dispatched milk</p>
                </div>

                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl">
                  <div className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Total Deliveries</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {metrics.lifetimeDrops}+
                  </div>
                  <p className="text-[10px] text-purple-700 mt-0.5 font-medium">Lifetime doorstep drops</p>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl">
                  <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    <span>Customer Rating</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {selectedStaff.rating} ★
                  </div>
                  <p className="text-[10px] text-amber-700 mt-0.5 font-medium">98.4% on-time delivery</p>
                </div>
              </div>

              {/* Account & Login Credentials */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sign-In & Mobile App Account</h4>
                      <p className="text-[10px] text-slate-500">Credentials used to log into /mobile/delivery</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Login Gmail / Email</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{selectedStaff.email || `${selectedStaff.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStaff.email || `${selectedStaff.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`, 'drawer_email')}
                        className="text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedField === 'drawer_email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Login Phone Number</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{selectedStaff.phone}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStaff.phone, 'drawer_phone')}
                        className="text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedField === 'drawer_phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Route & Logistics Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Assigned Route & Logistics</h4>
                      <p className="text-[10px] text-slate-500">Live operational sector for this partner</p>
                    </div>
                  </div>
                  {metrics.matchingRoute && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono">
                      CODE: {metrics.matchingRoute.routeCode}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned Area</span>
                    <span className="font-bold text-slate-800">{selectedStaff.assignedArea}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Delivery Slot</span>
                    <span className="font-bold text-slate-800">
                      {metrics.matchingRoute?.slot || 'Morning (6:00 AM - 7:30 AM)'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Societies & Streets Covered</span>
                    <span className="font-semibold text-slate-700">
                      {metrics.matchingRoute?.societies || 'Rohan Nilay, Green Glen, Marvel Zephyr, High St'}
                    </span>
                  </div>
                  {metrics.matchingRoute?.maxCapacityLiters && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Vehicle Crate Capacity</span>
                        <span className="font-bold text-slate-800">
                          {metrics.totalTodayLitres.toFixed(1)} L / {metrics.matchingRoute.maxCapacityLiters} L max capacity
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600">
                          {Math.round((metrics.totalTodayLitres / metrics.matchingRoute.maxCapacityLiters) * 100)}% load
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Ratings & Reviews Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Customer Ratings & Reviews</h4>
                      <p className="text-[10px] text-slate-500">Feedback submitted by subscribers</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span>{selectedStaff.rating} ★ Rating</span>
                  </span>
                </div>

                {(() => {
                  const riderReviews = (driverRatings || []).filter(
                    (r) => r.driverName.toLowerCase() === selectedStaff.name.toLowerCase()
                  );

                  if (riderReviews.length === 0) {
                    return (
                      <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                        <p className="text-xs font-medium text-slate-600">No customer reviews yet</p>
                        <p className="text-[11px] text-slate-400">
                          Customers can rate this delivery partner and leave feedback after deliveries via the Customer Mobile App.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {riderReviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.tags && (
                            <div className="flex flex-wrap gap-1">
                              {rev.tags.split(',').map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          {rev.feedback && (
                            <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                              &ldquo;{rev.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Today's Doorstep Stops List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Today's Assigned Doorstep Stops ({metrics.assignedDeliveries.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Live morning run</span>
                </div>

                {metrics.assignedDeliveries.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {metrics.assignedDeliveries.map((stop, idx) => (
                      <div key={stop.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center">
                            #{stop.sequenceOrder || idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800">{stop.customerName}</div>
                            <div className="text-[10px] text-slate-400">
                              {stop.societyOrLandmark || stop.address} • {stop.slot}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-slate-800">{stop.quantityLiters}L {stop.productVariant}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              stop.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stop.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {stop.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    No active delivery stops currently assigned to this rider for today's run.
                  </div>
                )}
              </div>

              {/* Contact & Mobile PWA Credentials */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">
                      Rider Mobile Login ID:{' '}
                      <span className="font-mono text-emerald-700 font-bold">{selectedStaff.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Rider can log directly into <span className="font-mono text-blue-700">/mobile/delivery</span> using this phone.
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${selectedStaff.phone}`}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmStaff(selectedStaff);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Staff Member</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedStaff)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Set to {selectedStaff.status === 'On Duty' ? 'Off Duty' : 'On Duty'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStaff(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* 2. DELETE CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Delete Staff Member?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{deleteConfirmStaff.name}</strong> from your staff roster?
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800">{deleteConfirmStaff.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone ID:</span>
                <span className="font-mono text-slate-800">{deleteConfirmStaff.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route / Area:</span>
                <span className="font-semibold text-slate-800">{deleteConfirmStaff.assignedArea}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg text-center">
              This will revoke his login access and unassign pending delivery stops.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
                disabled={isDeleting}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CREATE RIDER / STAFF MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 text-left shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Create Rider / Staff ID</h3>
                  <p className="text-[11px] text-slate-400">Generate credentials for delivery partner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSuccessInfo(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successInfo ? (
              <div className="py-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Rider ID & Login Created!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    <strong>{successInfo.name}</strong> has been enrolled as a {successInfo.role}. Give these credentials to the rider for app login.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Role:</span>
                    <span className="font-bold text-slate-800">{successInfo.role} (Delivery Partner)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Login Gmail / Email:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-emerald-700">{successInfo.email}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.email, 'modal_email')}
                        className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedField === 'modal_email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Login Password:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">{successInfo.password}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.password, 'modal_pwd')}
                        className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === 'modal_pwd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Login Phone ID:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-slate-700">{successInfo.phone}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.phone, 'modal_phone')}
                        className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedField === 'modal_phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Login URL:</span>
                    <span className="text-blue-600 font-medium">/login (Select &apos;Delivery Partner&apos;)</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-700 bg-emerald-50/80 p-2 rounded-xl text-center">
                  Rider can sign in instantly using either their Gmail or Phone Number with this password.
                </p>

                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSuccessInfo(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Add Another Rider
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSuccessInfo(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRider} className="space-y-3.5 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setName(newName);
                      if (!email || email.includes('@gmail.com') || email.includes('@dairypulse.farm')) {
                        setEmail(`${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`);
                      }
                    }}
                    placeholder="e.g. Rahul Deshmukh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Delivery Rider">Delivery Rider</option>
                      <option value="Dairy Plant Operator">Dairy Plant Operator</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                      <option value="Store Manager">Store Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Login Credentials: Gmail & Password */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Rider App Login Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Gmail / Email for Login *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@gmail.com"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password for Login *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    The rider will sign in to the Delivery App at <code className="bg-white px-1 py-0.5 rounded border border-slate-200">/login</code> using this Gmail and password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Route / Operating Sector</label>
                  <input
                    type="text"
                    value={assignedArea}
                    onChange={(e) => setAssignedArea(e.target.value)}
                    placeholder="e.g. Baner Morning Route R-04"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('On Duty')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        status === 'On Duty'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      On Duty
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Off Duty')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        status === 'Off Duty'
                          ? 'bg-slate-200 text-slate-800 border-slate-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Off Duty
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Creating ID...' : 'Create Staff ID & Login'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
