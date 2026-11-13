'use client';
import { PageHead } from '@/components/common/PageHead';

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
  ChevronRight,
  AlertTriangle,
  Droplets,
  PackageCheck,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  IndianRupee,
  Receipt,
  Edit2,
  Wallet,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { StaffMember } from '@/types';
import { isSupabaseConfigured, signUpWithEmailPassword } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function StaffManagementPage() {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    deliveries,
    routes,
    driverRatings,
    setRiderDailySalary,
    payRiderSalary,
    salaryPayments,
    attendanceList,
  } = useDairyPulse();

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
  const [dailySalaryInput, setDailySalaryInput] = useState<string>('500');

  // Daily Salary Inline Editing States
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [editingSalaryValue, setEditingSalaryValue] = useState<number>(500);
  const [isSavingSalary, setIsSavingSalary] = useState(false);

  // Settle Payout Modal state
  const [payoutStaff, setPayoutStaff] = useState<StaffMember | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMode, setPayoutMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [payoutReference, setPayoutReference] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const onDutyCount = staff.filter((s) => s.status === 'On Duty').length;
  const ridersCount = staff.filter((s) => s.role === 'Delivery Rider').length;
  const totalPendingSalary = staff.reduce((sum, s) => sum + (s.pendingSalary || 0), 0);
  const pendingRidersCount = staff.filter((s) => (s.pendingSalary || 0) > 0).length;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Save per-day salary rate
  const handleSaveDailySalary = async (staffId: string, newRate: number) => {
    setIsSavingSalary(true);
    try {
      await setRiderDailySalary(staffId, newRate);
      if (selectedStaff && selectedStaff.id === staffId) {
        setSelectedStaff({ ...selectedStaff, dailySalary: newRate });
      }
      setEditingSalaryId(null);
      setActionMessage(`✓ Daily wage updated to ₹${newRate}/day.`);
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsSavingSalary(false);
    }
  };

  // Open payout dialog
  const handleOpenPayoutModal = (staffMember: StaffMember) => {
    setPayoutStaff(staffMember);
    setPayoutAmount(staffMember.pendingSalary || staffMember.dailySalary || 500);
    setPayoutMode('UPI');
    setPayoutReference(`UPI-${Date.now().toString().slice(-6)}`);
    setPayoutNotes('Daily delivery shift payout');
  };

  // Execute payout to rider
  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutStaff || payoutAmount <= 0) return;
    setIsSubmittingPayout(true);
    try {
      await payRiderSalary({
        staffId: payoutStaff.id,
        staffName: payoutStaff.name,
        amount: payoutAmount,
        paymentMode: payoutMode,
        referenceId: payoutReference.trim() || undefined,
        notes: payoutNotes.trim() || undefined,
      });

      if (selectedStaff && selectedStaff.id === payoutStaff.id) {
        setSelectedStaff({
          ...selectedStaff,
          pendingSalary: Math.max(0, (selectedStaff.pendingSalary || 0) - payoutAmount),
          totalSalaryPaid: (selectedStaff.totalSalaryPaid || 0) + payoutAmount,
        });
      }

      setActionMessage(`🎉 Successfully paid ₹${payoutAmount} to ${payoutStaff.name} via ${payoutMode}!`);
      setPayoutStaff(null);
      setTimeout(() => setActionMessage(null), 4500);
    } finally {
      setIsSubmittingPayout(false);
    }
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
        dailySalary: dailySalaryInput ? parseFloat(dailySalaryInput) : 500,
        pendingSalary: 0,
        totalSalaryPaid: 0,
      });

      // Sync with Supabase Auth if configured
      if (isSupabaseConfigured && finalEmail && finalPassword) {
        try {
          await signUpWithEmailPassword(finalEmail, finalPassword, {
            full_name: name.trim(),
            role: 'DELIVERY',
            phone: phone.trim(),
          });
        } catch (sbErr) {
          console.warn('Supabase Auth user creation skipped or user already exists:', sbErr);
        }
      }

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
    const assignedDeliveries = deliveries.filter(
      (d) =>
        d.assignedRider?.toLowerCase() === member.name.toLowerCase() ||
        d.area?.toLowerCase().includes(member.assignedArea.toLowerCase().split(' ')[0])
    );
    const deliveredCount = assignedDeliveries.filter((d) => d.status === 'Delivered').length;
    const totalTodayDrops = Math.max(assignedDeliveries.length, member.deliveriesToday || 0);
    const totalTodayLitres = assignedDeliveries.reduce((sum, d) => sum + (d.quantityLiters || 0), 0);
    const completionRate = totalTodayDrops > 0 ? Math.round((deliveredCount / totalTodayDrops) * 100) : 100;

    const matchingRoute = routes.find(
      (r) =>
        r.assignedRider?.toLowerCase() === member.name.toLowerCase() ||
        member.assignedArea.toLowerCase().includes(r.area.toLowerCase())
    );

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
      <PageHead
        title="Staff & Delivery Fleet | DairyPulse"
        description="Manage farm employees, delivery riders, daily attendance, commission rates, and salary payouts."
      />

      {/* Toast / Banner Notification */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-sm font-bold p-1 rounded-lg focus-visible:outline-hidden"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Staff & Delivery Crew"
        description="Manage farm employees, delivery fleet riders, shift wages, door-to-door drops, and mobile access."
        badge={<Badge variant="teal" dot>{staff.length} Active Personnel</Badge>}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSuccessInfo(null);
              setShowAddModal(true);
            }}
          >
            Create Rider / Staff ID
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Crew"
          value={staff.length}
          subtitle="Active roster"
          icon={<Users className="w-4 h-4" />}
          variant="stone"
        />
        <StatCard
          title="On Duty Today"
          value={onDutyCount}
          subtitle="Clocked in"
          icon={<UserCheck className="w-4 h-4" />}
          variant="teal"
        />
        <StatCard
          title="Delivery Riders"
          value={ridersCount}
          subtitle="Active routes"
          icon={<Truck className="w-4 h-4" />}
          variant="blue"
        />
        <StatCard
          title="Pending Payouts"
          value={`₹${totalPendingSalary.toLocaleString('en-IN')}`}
          subtitle={`${pendingRidersCount} rider${pendingRidersCount !== 1 ? 's' : ''} unpaid`}
          icon={<Banknote className="w-4 h-4" />}
          variant={totalPendingSalary > 0 ? 'amber' : 'stone'}
        />
        <StatCard
          title="Fleet Avg Rating"
          value="4.9 ★"
          subtitle="Customer score"
          icon={<Star className="w-4 h-4" />}
          variant="amber"
        />
      </section>

      {/* Staff Directory Table */}
      <Card variant="default">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/70 gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">Delivery Rider & Staff Directory</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set per-day shift wages, settle completed deliveries, review route capacity, and issue credentials.
            </p>
          </div>
          <Badge variant="neutral">{staff.length} Registered Staff</Badge>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 mt-4">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="text-stone-400 border-b border-stone-100 font-medium">
                <th className="pb-3 font-semibold">Staff Member</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Daily Wage</th>
                <th className="pb-3 font-semibold">Pending Payout</th>
                <th className="pb-3 font-semibold">Assigned Route / Plant</th>
                <th className="pb-3 font-semibold">Today's Deliveries</th>
                <th className="pb-3 font-semibold">Rating</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-stone-300" />
                      <span className="font-semibold text-sm text-stone-700">No staff members enrolled yet</span>
                      <span className="text-xs text-stone-400">Click &apos;+ Create Rider / Staff ID&apos; above to onboard personnel</span>
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
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                      title="Click to view full staff profile, salary, and route metrics"
                    >
                      <td className="py-3.5 text-stone-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                              <span>{s.name}</span>
                              <span className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                Profile →
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-normal">Joined {s.joiningDate}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <Badge variant={s.role === 'Delivery Rider' ? 'teal' : 'neutral'} size="sm">
                          {s.role === 'Delivery Rider' && <Truck className="w-3 h-3 mr-1" />}
                          {s.role}
                        </Badge>
                      </td>

                      {/* Daily Wage Column */}
                      <td className="py-3.5 text-stone-800" onClick={(e) => e.stopPropagation()}>
                        {editingSalaryId === s.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-stone-400 text-xs">₹</span>
                            <input
                              type="number"
                              min={0}
                              step={10}
                              value={editingSalaryValue}
                              onChange={(e) => setEditingSalaryValue(parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 text-xs font-bold border border-teal-500 rounded-lg bg-white text-stone-900 focus-visible:outline-hidden"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={isSavingSalary}
                              onClick={() => handleSaveDailySalary(s.id, editingSalaryValue)}
                              className="p-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Save Daily Wage"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSalaryId(null)}
                              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/edit">
                            <span className="font-extrabold text-stone-900 text-xs tabular-nums">₹{s.dailySalary ?? 500}</span>
                            <span className="text-[10px] text-stone-400">/day</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSalaryId(s.id);
                                setEditingSalaryValue(s.dailySalary ?? 500);
                              }}
                              className="opacity-0 group-hover/edit:opacity-100 p-0.5 text-stone-400 hover:text-teal-700 transition-opacity cursor-pointer"
                              title="Edit Daily Wage"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Pending Salary Payout Balance */}
                      <td className="py-3.5">
                        {(s.pendingSalary || 0) > 0 ? (
                          <Badge variant="amber" size="sm">
                            ₹{s.pendingSalary} Pending
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Settled ✓
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 text-stone-600 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{s.assignedArea}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-stone-700 tabular-nums">
                        <div className="font-semibold text-[11px]">
                          {metrics.deliveredCount} / {metrics.totalTodayDrops} drops
                        </div>
                        <div className="w-20 mt-1">
                          <ProgressBar value={metrics.completionRate} size="sm" variant={metrics.completionRate === 100 ? 'green' : 'teal'} />
                        </div>
                      </td>

                      <td className="py-3.5 font-bold text-amber-700 tabular-nums">
                        ★ {s.rating}
                      </td>

                      <td className="py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(s);
                          }}
                          className="focus-visible:outline-hidden"
                          title="Click to toggle status"
                        >
                          <Badge variant={s.status === 'On Duty' ? 'emerald' : 'neutral'} dot size="sm">
                            {s.status}
                          </Badge>
                        </button>
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {(s.pendingSalary || 0) > 0 && (
                            <Button
                              variant="amber"
                              size="sm"
                              leftIcon={<Banknote className="w-3 h-3" />}
                              onClick={() => handleOpenPayoutModal(s)}
                            >
                              Pay ₹{s.pendingSalary}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedStaff(s)}
                          >
                            Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmStaff(s)}
                            title="Delete Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 1. DETAILED STAFF PROFILE MODAL */}
      {/* ======================================================== */}
      {selectedStaff && (() => {
        const metrics = getStaffMetrics(selectedStaff);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-left shadow-2xl border border-stone-200/80 max-h-[92vh] overflow-y-auto space-y-5">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">{selectedStaff.name}</h3>
                      <Badge variant={selectedStaff.status === 'On Duty' ? 'emerald' : 'neutral'} dot size="sm">
                        {selectedStaff.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-teal-200/50">
                        <Truck className="w-3 h-3" />
                        {selectedStaff.role}
                      </span>
                      <span>•</span>
                      <span>Joined: {selectedStaff.joiningDate}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold flex items-center gap-0.5">
                        ★ {selectedStaff.rating} rating
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Stats KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl">
                  <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Today's Deliveries</span>
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 mt-1 tabular-nums">
                    {metrics.deliveredCount} / {metrics.totalTodayDrops}
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                    {metrics.completionRate}% route finished
                  </p>
                </div>

                <div className="p-3.5 bg-teal-50/60 border border-teal-200/60 rounded-2xl">
                  <div className="text-[11px] font-bold text-teal-900 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-teal-600" />
                    <span>Volume Out</span>
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 mt-1 tabular-nums">
                    {metrics.totalTodayLitres || (metrics.totalTodayDrops * 1.5).toFixed(1)} L
                  </div>
                  <p className="text-[10px] text-teal-700 mt-0.5 font-medium">Dispatched milk</p>
                </div>

                <div className="p-3.5 bg-stone-100/70 border border-stone-200/80 rounded-2xl">
                  <div className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5 text-stone-600" />
                    <span>Total Deliveries</span>
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 mt-1 tabular-nums">
                    {metrics.lifetimeDrops}+
                  </div>
                  <p className="text-[10px] text-stone-600 mt-0.5 font-medium">Lifetime doorstep drops</p>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-2xl">
                  <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    <span>Customer Rating</span>
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 mt-1 tabular-nums">
                    {selectedStaff.rating} ★
                  </div>
                  <p className="text-[10px] text-amber-700 mt-0.5 font-medium">98.4% on-time rate</p>
                </div>
              </div>

              {/* Per-Day Salary & Payout Management */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-stone-900">Per-Day Salary & Shift Payouts</h4>
                      <p className="text-[10px] text-stone-500">Configure daily wage and settle completed milk delivery runs</p>
                    </div>
                  </div>
                  <Badge variant={(selectedStaff.pendingSalary || 0) > 0 ? 'amber' : 'success'} size="sm">
                    {(selectedStaff.pendingSalary || 0) > 0 ? `₹${selectedStaff.pendingSalary} Unpaid` : 'All Settled ✓'}
                  </Badge>
                </div>

                {/* Rate Editor & Balance Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Per-Day Wage Rate</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-stone-900">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={20}
                        value={selectedStaff.dailySalary ?? 500}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSelectedStaff({ ...selectedStaff, dailySalary: val });
                        }}
                        className="w-20 px-2 py-1 text-xs font-black bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSavingSalary}
                        onClick={() => handleSaveDailySalary(selectedStaff.id, selectedStaff.dailySalary ?? 500)}
                      >
                        {isSavingSalary ? '...' : 'Save'}
                      </Button>
                    </div>
                    <p className="text-[9px] text-stone-400">Credited upon completing run</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1 shadow-2xs">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Pending Payout Balance</span>
                    <div className="text-xl font-black text-amber-700 tabular-nums">
                      ₹{selectedStaff.pendingSalary || 0}
                    </div>
                    <p className="text-[9px] text-stone-500 font-medium">Earned from delivery runs</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1 shadow-2xs">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Total Lifetime Paid</span>
                    <div className="text-xl font-black text-teal-800 tabular-nums">
                      ₹{selectedStaff.totalSalaryPaid || 0}
                    </div>
                    <p className="text-[9px] text-stone-500 font-medium">Settled via UPI / Cash</p>
                  </div>
                </div>

                {/* Settle Payout Button */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-stone-200/80">
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 block">Settle Salary with Rider</span>
                    <span className="text-[10px] text-stone-500">
                      {(selectedStaff.pendingSalary || 0) > 0
                        ? `Outstanding balance of ₹${selectedStaff.pendingSalary} ready for settlement.`
                        : 'All previous delivery shifts have been settled.'}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Banknote className="w-4 h-4" />}
                    onClick={() => handleOpenPayoutModal(selectedStaff)}
                  >
                    {(selectedStaff.pendingSalary || 0) > 0 ? `Pay ₹${selectedStaff.pendingSalary} Now` : 'Record Salary Payment'}
                  </Button>
                </div>

                {/* Payout History */}
                {(() => {
                  const staffPayments = salaryPayments.filter((p) => p.staffId === selectedStaff.id);
                  if (staffPayments.length === 0) return null;
                  return (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">
                        Recent Payout Receipts ({staffPayments.length})
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {staffPayments.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 tabular-nums">₹{p.amount}</span>
                                <Badge variant="teal" size="xs">{p.paymentMode}</Badge>
                                <span className="text-[10px] text-stone-400 font-mono">Ref: {p.referenceId || 'N/A'}</span>
                              </div>
                              <p className="text-[10px] text-stone-400 mt-0.5">{p.paymentDate} • {p.notes || 'Shift payout'}</p>
                            </div>
                            <Badge variant="success" size="xs">Paid ✓</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Account Credentials */}
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Sign-In & Mobile App Account</h4>
                      <p className="text-[10px] text-stone-500">Credentials used to log into /mobile/delivery</p>
                    </div>
                  </div>
                  <Badge variant="teal" size="xs">Active Account</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-400 block font-semibold uppercase">Login Gmail / Email</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <a
                          href={`mailto:${selectedStaff.email || `${selectedStaff.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}`}
                          className="truncate hover:underline hover:text-teal-700"
                        >
                          {selectedStaff.email || `${selectedStaff.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}
                        </a>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStaff.email || `${selectedStaff.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`, 'drawer_email')}
                        className="text-stone-400 hover:text-teal-700 p-1 cursor-pointer focus-visible:outline-hidden"
                        title="Copy Email"
                      >
                        {copiedField === 'drawer_email' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-400 block font-semibold uppercase">Login Phone Number</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-stone-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <a href={`tel:${selectedStaff.phone}`} className="hover:underline hover:text-teal-700">
                          {selectedStaff.phone}
                        </a>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStaff.phone, 'drawer_phone')}
                        className="text-stone-400 hover:text-teal-700 p-1 cursor-pointer focus-visible:outline-hidden"
                        title="Copy Phone"
                      >
                        {copiedField === 'drawer_phone' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Route & Logistics Details */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Assigned Route & Logistics</h4>
                      <p className="text-[10px] text-stone-500">Live operational route for this partner</p>
                    </div>
                  </div>
                  {metrics.matchingRoute && (
                    <Badge variant="teal" size="xs">CODE: {metrics.matchingRoute.routeCode}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-400 block font-semibold uppercase">Assigned Area</span>
                    <span className="font-bold text-stone-800">{selectedStaff.assignedArea}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
                    <span className="text-[10px] text-stone-400 block font-semibold uppercase">Delivery Slot</span>
                    <span className="font-bold text-stone-800">
                      {metrics.matchingRoute?.slot || 'Morning (6:00 AM - 7:30 AM)'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80 sm:col-span-2">
                    <span className="text-[10px] text-stone-400 block font-semibold uppercase">Societies Covered</span>
                    <span className="font-semibold text-stone-700">
                      {metrics.matchingRoute?.societies || 'Rohan Nilay, Green Glen, Marvel Zephyr, High St'}
                    </span>
                  </div>
                  {metrics.matchingRoute?.maxCapacityLiters && (
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200/80 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Vehicle Crate Capacity</span>
                        <span className="font-bold text-stone-800 tabular-nums">
                          {metrics.totalTodayLitres.toFixed(1)} L / {metrics.matchingRoute.maxCapacityLiters} L max
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-teal-700">
                          {Math.round((metrics.totalTodayLitres / metrics.matchingRoute.maxCapacityLiters) * 100)}% load
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Ratings Section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Customer Ratings & Reviews</h4>
                      <p className="text-[10px] text-stone-500">Feedback submitted by subscribers</p>
                    </div>
                  </div>
                  <Badge variant="amber" size="sm">★ {selectedStaff.rating} Rating</Badge>
                </div>

                {(() => {
                  const riderReviews = (driverRatings || []).filter(
                    (r) => r.driverName.toLowerCase() === selectedStaff.name.toLowerCase()
                  );

                  if (riderReviews.length === 0) {
                    return (
                      <div className="p-4 bg-white rounded-xl border border-dashed border-stone-200 text-center space-y-1">
                        <p className="text-xs font-medium text-stone-600">No customer reviews yet</p>
                        <p className="text-[11px] text-stone-400">
                          Customers can rate this delivery partner after receiving morning milk.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {riderReviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <Star
                                  key={st}
                                  className={`w-3 h-3 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.tags && (
                            <div className="flex flex-wrap gap-1">
                              {rev.tags.split(',').map((tag, idx) => (
                                <Badge key={idx} variant="teal" size="xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {rev.feedback && (
                            <p className="text-xs text-stone-600 italic bg-stone-50 p-2 rounded-lg">
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
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    <span>Today's Assigned Doorstep Stops ({metrics.assignedDeliveries.length})</span>
                  </h4>
                  <span className="text-[10px] text-stone-500">Live morning run</span>
                </div>

                {metrics.assignedDeliveries.length > 0 ? (
                  <div className="border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-100 max-h-48 overflow-y-auto">
                    {metrics.assignedDeliveries.map((stop, idx) => (
                      <div key={stop.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-stone-50">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 font-mono font-bold text-[10px] flex items-center justify-center">
                            #{stop.sequenceOrder || idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-stone-800">{stop.customerName}</div>
                            <div className="text-[10px] text-stone-400">
                              {stop.societyOrLandmark || stop.address} • {stop.slot}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-stone-800">{stop.quantityLiters}L {stop.productVariant}</span>
                          <Badge
                            variant={
                              stop.status === 'Delivered'
                                ? 'success'
                                : stop.status === 'In Progress'
                                ? 'amber'
                                : 'neutral'
                            }
                            size="xs"
                          >
                            {stop.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-500">
                    No active delivery stops currently assigned to this rider for today's run.
                  </div>
                )}
              </div>

              {/* Contact Footer Banner */}
              <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-800">
                      Rider Mobile Login ID:{' '}
                      <a href={`tel:${selectedStaff.phone}`} className="font-mono text-teal-800 font-bold hover:underline">
                        {selectedStaff.phone}
                      </a>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Rider can log into <span className="font-mono text-teal-700 font-semibold">/mobile/delivery</span> using this phone.
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Phone className="w-3.5 h-3.5" />}
                  onClick={() => window.open(`tel:${selectedStaff.phone}`)}
                >
                  Call Rider
                </Button>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => setDeleteConfirmStaff(selectedStaff)}
                >
                  Delete Staff Member
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleStatus(selectedStaff)}
                  >
                    Set to {selectedStaff.status === 'On Duty' ? 'Off Duty' : 'On Duty'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedStaff(null)}
                  >
                    Close Profile
                  </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl border border-stone-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-stone-900 text-base">Delete Staff Member?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to remove <strong>{deleteConfirmStaff.name}</strong> from your staff roster?
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Role:</span>
                <span className="font-semibold text-stone-800">{deleteConfirmStaff.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone ID:</span>
                <span className="font-mono text-stone-800">{deleteConfirmStaff.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Route / Area:</span>
                <span className="font-semibold text-stone-800">{deleteConfirmStaff.assignedArea}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200/60 p-2 rounded-xl text-center">
              This will revoke login access and unassign pending deliveries.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmStaff(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                disabled={isDeleting}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CREATE RIDER / STAFF MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 text-left shadow-2xl border border-stone-200/80 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Create Rider / Staff ID</h3>
                  <p className="text-[11px] text-stone-500">Generate credentials for delivery partner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSuccessInfo(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successInfo ? (
              <div className="py-5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">Rider ID & Login Created!</h4>
                  <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                    <strong>{successInfo.name}</strong> has been enrolled as a {successInfo.role}. Provide these credentials to the rider for mobile login.
                  </p>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-xs text-left space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">Role:</span>
                    <span className="font-bold text-stone-800">{successInfo.role}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Login Email:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-teal-800">{successInfo.email}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.email, 'modal_email')}
                        className="p-1 text-stone-400 hover:text-teal-700 cursor-pointer focus-visible:outline-hidden"
                        title="Copy Email"
                      >
                        {copiedField === 'modal_email' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Login Password:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">{successInfo.password}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.password, 'modal_pwd')}
                        className="p-1 text-stone-400 hover:text-teal-700 cursor-pointer focus-visible:outline-hidden"
                        title="Copy Password"
                      >
                        {copiedField === 'modal_pwd' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Phone ID:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-stone-700">{successInfo.phone}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successInfo.phone, 'modal_phone')}
                        className="p-1 text-stone-400 hover:text-teal-700 cursor-pointer focus-visible:outline-hidden"
                        title="Copy Phone"
                      >
                        {copiedField === 'modal_phone' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <span className="text-stone-500 font-medium">Login URL:</span>
                    <span className="text-teal-700 font-medium">/login (Select &apos;Delivery Partner&apos;)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setSuccessInfo(null)}
                  >
                    Add Another Rider
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowAddModal(false);
                      setSuccessInfo(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRider} className="space-y-3.5 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
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
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer"
                    >
                      <option value="Delivery Rider">Delivery Rider</option>
                      <option value="Dairy Plant Operator">Dairy Plant Operator</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                      <option value="Store Manager">Store Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Login Credentials */}
                <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-200/60 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span className="text-xs font-bold text-stone-900">Rider App Login Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Login Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@gmail.com"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    The rider will sign into the Delivery App at <code className="bg-white px-1 py-0.5 rounded border border-stone-200">/login</code> using this email and password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Route / Delivery Area</label>
                  <input
                    type="text"
                    value={assignedArea}
                    onChange={(e) => setAssignedArea(e.target.value)}
                    placeholder="e.g. North Zone Express or Morning Route 1"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Per-Day Salary / Daily Wage (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={dailySalaryInput}
                      onChange={(e) => setDailySalaryInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Automatically credited when the rider completes their daily delivery drops.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Initial Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('On Duty')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        status === 'On Duty'
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      On Duty
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Off Duty')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        status === 'Off Duty'
                          ? 'bg-stone-200 text-stone-800 border-stone-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      Off Duty
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={isSubmitting}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Creating ID...' : 'Create Staff ID & Login'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SETTLE SALARY PAYOUT MODAL */}
      {/* ======================================================== */}
      {payoutStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 text-left shadow-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Settle Salary Payout</h3>
                  <p className="text-[11px] text-stone-500">Record wage payment to {payoutStaff.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayoutStaff(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Rider / Staff Member:</span>
                <strong className="text-stone-900">{payoutStaff.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Per-Day Wage Rate:</span>
                <span className="font-bold text-stone-800">₹{payoutStaff.dailySalary ?? 500}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Accumulated Pending Balance:</span>
                <span className="font-black text-amber-700 tabular-nums">₹{payoutStaff.pendingSalary || 0}</span>
              </div>
            </div>

            <form onSubmit={handleExecutePayout} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Payout Amount to Settle (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Mode *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayoutMode(mode)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        payoutMode === mode
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reference ID / Voucher Number
                </label>
                <input
                  type="text"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="e.g. UPI-TXN-984321 or Cash-Voucher-01"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Settled morning deliveries salary"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPayoutStaff(null)}
                  disabled={isSubmittingPayout}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmittingPayout || payoutAmount <= 0}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isSubmittingPayout ? 'Processing...' : `Confirm Payment of ₹${payoutAmount}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
