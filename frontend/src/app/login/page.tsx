'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { MilkVariant, UserRole } from '@/types';
import {
  ShieldCheck,
  Truck,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Phone,
  User,
  MapPin,
  Milk,
  AlertCircle,
  Clock,
  Building2,
  Star,
  ChevronRight,
  Search,
  BadgeCheck,
} from 'lucide-react';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';
export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithPhoneOtp, verifyPhoneOtp } = useAuth();
  const { dairies, addDairy, addCustomer, addSubscription, refreshDairies, products } = useDairyPulse();

  // Tab: 'signin' | 'customer' | 'dairy'
  const [activeTab, setActiveTab] = useState<'signin' | 'customer' | 'dairy'>('signin');

  // Sign In state
  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'phone_otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Account Not Found Interactivity State
  const [notFoundPrompt, setNotFoundPrompt] = useState(false);
  const [notFoundId, setNotFoundId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CUSTOMER REGISTRATION 3-STEP WIZARD STATE
  // Step 1: Account Info -> Step 2: Select Dairy -> Step 3: Address & Milk Requirements
  // -------------------------------------------------------------
  const [customerStep, setCustomerStep] = useState<1 | 2 | 3>(1);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');

  const [selectedDairyName, setSelectedDairyName] = useState(dairies[0]?.name || '');
  const [dairySearch, setDairySearch] = useState('');

  // Keep selectedDairyName synchronized with available dairies list
  React.useEffect(() => {
    refreshDairies();
  }, []);

  React.useEffect(() => {
    if (dairies && dairies.length > 0) {
      if (!selectedDairyName || !dairies.some((d) => d.name.toLowerCase() === selectedDairyName.toLowerCase())) {
        setSelectedDairyName(dairies[0].name);
      }
    }
  }, [dairies, selectedDairyName]);

  const [custAddress, setCustAddress] = useState('');
  const [custArea, setCustArea] = useState('Baner');
  const [custLat, setCustLat] = useState<number>(18.5593);
  const [custLng, setCustLng] = useState<number>(73.7788);
  const [custVariant, setCustVariant] = useState<MilkVariant>('Cow Milk');
  const [custQuantity, setCustQuantity] = useState('1.0');
  const [custSlot, setCustSlot] = useState<'Morning (6:00 AM - 7:30 AM)' | 'Evening (5:30 PM - 7:00 PM)' | 'Both'>('Morning (6:00 AM - 7:30 AM)');
  const [custPreferredTime, setCustPreferredTime] = useState('6:00 AM - 7:30 AM');
  const [custSuccess, setCustSuccess] = useState<{ id: string; name: string; phone: string; dairyName: string } | null>(null);

  // -------------------------------------------------------------
  // DAIRY OWNER REGISTRATION STATE (Multi-Dairy)
  // -------------------------------------------------------------
  const [newDairyName, setNewDairyName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newDairyPhone, setNewDairyPhone] = useState('');
  const [newDairyEmail, setNewDairyEmail] = useState('');
  const [newDairyCity, setNewDairyCity] = useState('Pune');
  const [newDairyAddress, setNewDairyAddress] = useState('');
  const [newDairyLat, setNewDairyLat] = useState<number>(18.5089);
  const [newDairyLng, setNewDairyLng] = useState<number>(73.9259);
  const [newDairyPassword, setNewDairyPassword] = useState('');
  const [dairySuccess, setDairySuccess] = useState<{
    name: string;
    ownerName: string;
    email: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null>(null);

  // Role Selection
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotFoundPrompt(false);
  };

  const redirectToRole = (role: UserRole) => {
    let target = '/';
    if (role === 'DELIVERY') {
      target = '/mobile/delivery';
    } else if (role === 'CUSTOMER') {
      target = '/mobile/customer';
    }
    setTimeout(() => {
      router.push(target);
    }, 400);
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotFoundPrompt(false);

    if (!loginId.trim()) {
      setErrorMessage('Please enter your email or phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'phone_otp') {
        if (!otpSent) {
          const res = await loginWithPhoneOtp(loginId.trim());
          if (res.success) {
            setOtpSent(true);
            setSuccessMessage(`SMS OTP sent to ${loginId}. Please enter the code below.`);
          } else {
            setErrorMessage(res.error || 'Failed to send OTP code.');
          }
          return;
        } else {
          if (!otpCode.trim()) {
            setErrorMessage('Please enter the 6-digit verification code.');
            return;
          }
          const res = await verifyPhoneOtp(loginId.trim(), otpCode.trim(), selectedRole);
          if (res.success) {
            setSuccessMessage(`Verified! Redirecting to ${selectedRole.toLowerCase()} portal...`);
            redirectToRole(selectedRole);
          } else {
            setErrorMessage(res.error || 'Invalid or expired OTP code.');
          }
          return;
        }
      }

      // Password Authentication
      if (!password.trim()) {
        setErrorMessage('Please enter your password.');
        return;
      }

      const res = await login({
        loginId: loginId.trim(),
        password: password.trim(),
        role: selectedRole,
      });

      if (res.success) {
        setSuccessMessage(`Welcome back, ${res.user?.name || 'DairyPulse user'}! Redirecting...`);
        redirectToRole(selectedRole);
      } else {
        if (res.notFound) {
          setNotFoundPrompt(true);
          setNotFoundId(loginId.trim());
        }
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In with Supabase
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotFoundPrompt(false);
    setIsSubmitting(true);
    try {
      await loginWithGoogle(selectedRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in error.');
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER WIZARD STEP HANDLERS
  // -------------------------------------------------------------
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!custName.trim() || !custPhone.trim()) {
      setErrorMessage('Please provide your Full Name and Mobile Phone.');
      return;
    }
    refreshDairies();
    setCustomerStep(2);
  };

  const handleStep2Next = () => {
    setErrorMessage(null);
    if (!selectedDairyName) {
      setErrorMessage('Please select a dairy farm to proceed.');
      return;
    }
    setCustomerStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!custAddress.trim()) {
      setErrorMessage('Please provide your doorstep delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const routeName = `${custArea} Route R-04`;
      const newCust = await addCustomer({
        name: custName.trim(),
        type: 'HOUSEHOLD',
        phone: custPhone.trim(),
        email: custEmail.trim() || undefined,
        address: custAddress.trim(),
        area: custArea,
        route: routeName,
        dairyName: selectedDairyName,
        latitude: custLat,
        longitude: custLng,
        preferredTime: custPreferredTime,
        balance: 0,
        activeSubscriptionsCount: 1,
        status: 'Active',
      });

      // Create initial subscription linked to selected dairy
      addSubscription({
        customerId: newCust.id,
        customerName: newCust.name,
        dairyName: selectedDairyName,
        productVariant: custVariant,
        quantityLiters: parseFloat(custQuantity) || 1.0,
        timeSlot: custSlot,
        frequency: 'Daily',
        unitPrice: products.find((p) => p.variant === custVariant)?.sellingPrice || (custVariant === 'A2 Desi Cow Milk' ? 85 : custVariant === 'Buffalo Milk' ? 70 : 62),
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });

      setCustSuccess({
        id: newCust.id,
        name: newCust.name,
        phone: newCust.phone,
        dairyName: selectedDairyName,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Customer registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRegisteredCustomer = async () => {
    if (!custSuccess) return;
    setIsSubmitting(true);
    await login({
      loginId: custSuccess.phone,
      password: custPassword || 'password123',
      role: 'CUSTOMER',
    });
    router.push('/mobile/customer');
  };

  // -------------------------------------------------------------
  // DAIRY OWNER REGISTRATION HANDLER
  // -------------------------------------------------------------
  const handleRegisterDairy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newDairyName.trim() || !newOwnerName.trim() || !newDairyEmail.trim() || !newDairyPhone.trim() || !newDairyPassword.trim()) {
      setErrorMessage('Please fill in all required dairy information.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdDairy = await addDairy({
        name: newDairyName.trim(),
        ownerName: newOwnerName.trim(),
        email: newDairyEmail.trim(),
        phone: newDairyPhone.trim(),
        city: newDairyCity.trim(),
        address: newDairyAddress.trim(),
        latitude: newDairyLat,
        longitude: newDairyLng,
        password: newDairyPassword.trim(),
      });

      if (createdDairy) {
        setSelectedDairyName(createdDairy.name);
        refreshDairies();
        setDairySuccess({
          name: createdDairy.name,
          ownerName: createdDairy.ownerName || (createdDairy as any).owner_name || newOwnerName.trim(),
          email: createdDairy.email,
          latitude: createdDairy.latitude || newDairyLat,
          longitude: createdDairy.longitude || newDairyLng,
          address: createdDairy.address || newDairyAddress.trim(),
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Dairy registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginNewDairyOwner = async () => {
    if (!dairySuccess) return;
    setIsSubmitting(true);
    await login({
      loginId: dairySuccess.email,
      password: newDairyPassword || 'dairy123',
      role: 'OWNER',
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white p-2 shadow-2xl shadow-emerald-950/60 border border-emerald-900/40">
            <Image
              src="/logo.png"
              alt="DairyPulse Cow Analytics Logo"
              width={72}
              height={72}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Dairy<span className="text-emerald-400">Pulse</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
              Multi-Tenant Fresh Milk Delivery & Farm Operations Network
            </p>
          </div>
        </div>

        {/* 3 Main Tabs: Sign In | Customer Sign Up | Register Dairy */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1 text-[11px] font-bold shadow-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-xl transition text-center ${
              activeTab === 'signin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setCustomerStep(1);
              setErrorMessage(null);
              setCustSuccess(null);
              refreshDairies();
            }}
            className={`py-2 px-1 rounded-xl transition text-center ${
              activeTab === 'customer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Sign Up
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('dairy');
              setErrorMessage(null);
              setDairySuccess(null);
            }}
            className={`py-2 px-1 rounded-xl transition text-center ${
              activeTab === 'dairy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Dairy
          </button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800">
          
          {/* ================= TAB 1: SIGN IN ================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select User Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('OWNER')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'OWNER'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Admin</span>
                    <span className="text-[9px] text-slate-400">Dairy Owner</span>
                  </button>

                  {/* Delivery Rider */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('DELIVERY')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'DELIVERY'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold">Rider</span>
                    <span className="text-[9px] text-slate-400">Delivery App</span>
                  </button>

                  {/* Customer */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('CUSTOMER')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'CUSTOMER'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-bold">Customer</span>
                    <span className="text-[9px] text-slate-400">Subscriber</span>
                  </button>
                </div>
              </div>

              {/* Login Method Toggle (Password vs Phone OTP) */}
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-slate-700">Authentication Method</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setOtpSent(false);
                      setErrorMessage(null);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      authMode === 'password'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('phone_otp');
                      setErrorMessage(null);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      authMode === 'phone_otp'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Phone OTP
                  </button>
                </div>
              </div>

              {/* Login ID / Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {authMode === 'phone_otp'
                    ? 'Mobile Phone Number *'
                    : selectedRole === 'OWNER'
                    ? 'Dairy Owner Email / Phone'
                    : selectedRole === 'DELIVERY'
                    ? 'Rider Gmail / Mobile Phone'
                    : 'Mobile Phone / Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {authMode === 'phone_otp' ? <Phone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <input
                    type={authMode === 'phone_otp' ? 'tel' : 'text'}
                    required
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      setNotFoundPrompt(false);
                    }}
                    placeholder={
                      authMode === 'phone_otp'
                        ? '+91 98765 43210'
                        : selectedRole === 'OWNER'
                        ? 'owner@dairy.com or +91 98...'
                        : selectedRole === 'DELIVERY'
                        ? 'rider@gmail.com or +91 98...'
                        : '+91 98... or user@example.com'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Password Mode Input */}
              {authMode === 'password' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Phone OTP Mode Input (Step 2: Enter code) */}
              {authMode === 'phone_otp' && otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit SMS Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-emerald-300 rounded-xl text-xs font-mono tracking-widest font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Account Not Found Interactive Prompt */}
              {notFoundPrompt && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">No account found with this ID</p>
                      <p className="text-amber-700 mt-0.5 leading-relaxed">
                        We couldn&apos;t find an existing account for <strong>{notFoundId}</strong> under <strong>{selectedRole}</strong> role. Would you like to create one now?
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    {selectedRole === 'CUSTOMER' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('customer');
                          setCustomerStep(1);
                          if (notFoundId.includes('@')) {
                            setCustEmail(notFoundId);
                          } else if (/\d{5,}/.test(notFoundId)) {
                            setCustPhone(notFoundId);
                          }
                          setNotFoundPrompt(false);
                          setErrorMessage(null);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                      >
                        <span>Create Customer Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedRole === 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('dairy');
                          if (notFoundId.includes('@')) {
                            setNewDairyEmail(notFoundId);
                          } else if (/\d{5,}/.test(notFoundId)) {
                            setNewDairyPhone(notFoundId);
                          }
                          setNotFoundPrompt(false);
                          setErrorMessage(null);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                      >
                        <span>Register New Dairy Farm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedRole === 'DELIVERY' && (
                      <p className="text-[11px] text-amber-800">
                        Delivery rider accounts are provisioned directly by dairy farm owners under the Staff section.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Error Feedback */}
              {errorMessage && !notFoundPrompt && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Verifying...'
                    : authMode === 'phone_otp'
                    ? otpSent
                      ? 'Verify Code & Sign In'
                      : 'Send OTP Code'
                    : 'Sign In to Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Real Supabase Google OAuth Divider */}
              <div className="pt-1">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    or continue with
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer hover:border-slate-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: CUSTOMER SIGN UP (3-STEP WIZARD) ================= */}
          {activeTab === 'customer' && (
            <div>
              {custSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Customer Account Created!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Welcome to <strong>{custSuccess.dairyName}</strong>, {custSuccess.name}!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Dairy:</span>
                      <span className="font-bold text-emerald-700">{custSuccess.dairyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer ID:</span>
                      <span className="font-mono font-bold text-slate-900">{custSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Login Mobile Phone:</span>
                      <span className="font-mono font-bold text-slate-900">{custSuccess.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subscription Status:</span>
                      <span className="font-semibold text-emerald-600">Active Daily Doorstep</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoginRegisteredCustomer}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Open Customer Portal Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Step Progress Bar */}
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                      <span className={customerStep === 1 ? 'text-emerald-600' : 'text-slate-500'}>
                        1. Create Account
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      <span className={customerStep === 2 ? 'text-emerald-600' : 'text-slate-500'}>
                        2. Select Dairy
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      <span className={customerStep === 3 ? 'text-emerald-600' : 'text-slate-500'}>
                        3. Address & Milk
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: customerStep === 1 ? '33%' : customerStep === 2 ? '66%' : '100%' }}
                      />
                    </div>
                  </div>

                  {/* STEP 1: CREATE ACCOUNT */}
                  {customerStep === 1 && (
                    <form onSubmit={handleStep1Next} className="space-y-3.5">
                      <div className="text-xs text-slate-500">
                        Enter your contact details to create your customer profile.
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          placeholder="e.g. Priya Kulkarni"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mobile Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                            placeholder="+91 98..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={custEmail}
                            onChange={(e) => setCustEmail(e.target.value)}
                            placeholder="priya@example.com"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Account Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={custPassword}
                          onChange={(e) => setCustPassword(e.target.value)}
                          placeholder="Create a password"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {errorMessage && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>Next: Select Dairy Farm</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* STEP 2: SELECT DAIRY */}
                  {customerStep === 2 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Select the dairy farm to deliver your daily fresh milk:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => refreshDairies()}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                          >
                            Refresh
                          </button>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                            {dairies.length} available
                          </span>
                        </div>
                      </div>

                      {/* Search / Filter dairies */}
                      <div className="relative">
                        <input
                          type="text"
                          value={dairySearch}
                          onChange={(e) => setDairySearch(e.target.value)}
                          placeholder="Search dairy farm, owner, or city..."
                          className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>

                      {dairies.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-2.5">
                          <Building2 className="w-8 h-8 text-amber-500 mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">No Dairies Registered Yet</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              There are currently no active dairy farms registered in the cloud database.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('dairy')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Register a Dairy Farm</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {dairies
                            .filter((d) => {
                              const q = dairySearch.trim().toLowerCase();
                              if (!q) return true;
                              const dName = (d.name || '').toLowerCase();
                              const dCity = (d.city || '').toLowerCase();
                              const dOwner = (d.ownerName || (d as any).owner_name || '').toLowerCase();
                              return dName.includes(q) || dCity.includes(q) || dOwner.includes(q);
                            })
                            .map((d) => {
                              const isSelected = selectedDairyName.toLowerCase() === d.name.toLowerCase();
                              const isCreatedByUser = (dairySuccess && d.name.toLowerCase() === dairySuccess.name.toLowerCase()) || d.name.toLowerCase() === 'ritesh';
                              return (
                                <div
                                  key={d.id}
                                  onClick={() => setSelectedDairyName(d.name)}
                                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                                      : 'border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <span>{d.name}</span>
                                        {isCreatedByUser && (
                                          <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                                            Your Dairy
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        Owner: {d.ownerName || (d as any).owner_name || 'Farm Owner'} • {d.city || 'Pune'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                      {d.rating || 4.9}
                                    </span>
                                    <input
                                      type="radio"
                                      name="selectedDairy"
                                      checked={isSelected}
                                      onChange={() => setSelectedDairyName(d.name)}
                                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {errorMessage && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerStep(1)}
                          className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleStep2Next}
                          className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <span>Next: Address & Milk</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ADDRESS & MILK REQUIREMENTS */}
                  {customerStep === 3 && (
                    <form onSubmit={handleStep3Submit} className="space-y-3.5">
                      {/* Selected Dairy Banner */}
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-medium">
                          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Selected Dairy: <strong>{selectedDairyName}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomerStep(2)}
                          className="text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Doorstep Delivery Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          placeholder="e.g. Flat 402, Rohan Nilay, Baner Road"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Interactive Map Location Picker for Delivery Boy */}
                      <MapLocationPicker
                        initialLat={custLat}
                        initialLng={custLng}
                        areaHint={custArea}
                        onLocationSelect={(lat, lng) => {
                          setCustLat(lat);
                          setCustLng(lng);
                        }}
                        label="Drop Map Pin for Delivery Boy"
                        compact={false}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Delivery Area / Route
                          </label>
                          <select
                            value={custArea}
                            onChange={(e) => setCustArea(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Baner">Baner (Route R-04)</option>
                            <option value="Aundh">Aundh (Route A-1)</option>
                            <option value="Kothrud">Kothrud (Route K-02)</option>
                            <option value="Viman Nagar">Viman Nagar (Route V-01)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Milk Variant Requirement
                          </label>
                          <select
                            value={custVariant}
                            onChange={(e) => setCustVariant(e.target.value as MilkVariant)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            {products && products.length > 0 ? (
                              products.map((p) => (
                                <option key={p.id || p.variant} value={p.variant}>
                                  {p.name} ({p.variant}) (₹{p.sellingPrice}/L)
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="Cow Milk">Cow Milk (₹62/L)</option>
                                <option value="Buffalo Milk">Buffalo Milk (₹70/L)</option>
                                <option value="Toned Milk">Toned Milk (₹54/L)</option>
                                <option value="A2 Desi Cow Milk">A2 Desi Cow Milk (₹85/L)</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Daily Quantity
                          </label>
                          <select
                            value={custQuantity}
                            onChange={(e) => setCustQuantity(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="0.5">0.5 Liter (1 Packet)</option>
                            <option value="1.0">1.0 Liter (2 Packets)</option>
                            <option value="1.5">1.5 Liters (3 Packets)</option>
                            <option value="2.0">2.0 Liters (4 Packets)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Delivery Shift
                          </label>
                          <select
                            value={custSlot}
                            onChange={(e) => setCustSlot(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 - 7:30 AM)</option>
                            <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 - 7:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Choice: Preferred Delivery Time Window */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            Preferred Delivery Time (Your Choice)
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Custom Time</span>
                        </label>
                        <select
                          value={custPreferredTime}
                          onChange={(e) => setCustPreferredTime(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Early Morning: 5:30 AM - 6:30 AM">Early Morning (5:30 AM - 6:30 AM) &bull; First Batch</option>
                          <option value="6:00 AM - 7:30 AM">Morning Standard (6:00 AM - 7:30 AM) &bull; Regular</option>
                          <option value="7:30 AM - 8:30 AM">Morning Late (7:30 AM - 8:30 AM) &bull; Working Families</option>
                          <option value="Evening: 5:30 PM - 7:00 PM">Evening (5:30 PM - 7:00 PM) &bull; Fresh Night Supply</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Our dispatch team sequences delivery partner routes according to your preferred time slot.</p>
                      </div>

                      {errorMessage && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCustomerStep(2)}
                          className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                        >
                          <span>{isSubmitting ? 'Subscribing...' : 'Complete & Subscribe'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: REGISTER NEW DAIRY (OWNER) ================= */}
          {activeTab === 'dairy' && (
            <div>
              {dairySuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Dairy Farm Registered!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Welcome to the DairyPulse Network, <strong>{dairySuccess.name}</strong>!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dairy Name:</span>
                      <span className="font-bold text-slate-900">{dairySuccess.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Owner Name:</span>
                      <span className="font-semibold text-slate-800">{dairySuccess.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admin Login Email:</span>
                      <span className="font-mono font-bold text-emerald-700">{dairySuccess.email}</span>
                    </div>
                    {dairySuccess.address && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dairy Plant Address:</span>
                        <span className="font-semibold text-slate-800">{dairySuccess.address}</span>
                      </div>
                    )}
                    {dairySuccess.latitude && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plant GPS Coordinates:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {dairySuccess.latitude.toFixed(4)}, {dairySuccess.longitude?.toFixed(4)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Role:</span>
                      <span className="font-semibold text-emerald-600">Dairy Admin / Owner</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoginNewDairyOwner}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Launch Dairy Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterDairy} className="space-y-3.5">
                  <div className="pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">Register a New Dairy Farm</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Create an Admin account to manage your own dairy inventory, riders, and subscribers.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dairy / Farm Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDairyName}
                      onChange={(e) => setNewDairyName(e.target.value)}
                      placeholder="e.g. Shivneri Dairy Farm"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newOwnerName}
                        onChange={(e) => setNewOwnerName(e.target.value)}
                        placeholder="e.g. Ramesh Shinde"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City / Region *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDairyCity}
                        onChange={(e) => setNewDairyCity(e.target.value)}
                        placeholder="e.g. Pune, Satara"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newDairyPhone}
                        onChange={(e) => setNewDairyPhone(e.target.value)}
                        placeholder="+91 98..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Owner Login Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newDairyEmail}
                        onChange={(e) => setNewDairyEmail(e.target.value)}
                        placeholder="owner@shivneri.com"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dairy Processing Plant Address
                    </label>
                    <input
                      type="text"
                      value={newDairyAddress}
                      onChange={(e) => setNewDairyAddress(e.target.value)}
                      placeholder="e.g. Gate No 142, Khed-Shivapur Road, Pune"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Interactive Map Location Picker for Dairy Farm / Plant */}
                  <div className="pt-1">
                    <MapLocationPicker
                      initialLat={newDairyLat}
                      initialLng={newDairyLng}
                      areaHint={newDairyCity || 'Pune'}
                      label="Pin Dairy Farm / Plant Location on Map"
                      onLocationSelect={(lat, lng) => {
                        setNewDairyLat(lat);
                        setNewDairyLng(lng);
                      }}
                      compact={false}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newDairyPassword}
                      onChange={(e) => setNewDairyPassword(e.target.value)}
                      placeholder="Create secure admin password"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering Dairy...' : 'Register Dairy & Create Admin ID'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Bottom Explainer Note */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>
            <strong>Multi-Dairy Network Architecture:</strong> Multiple dairies can register &bull; Customers select their preferred dairy &bull; Full supply chain management.
          </p>
          <p className="text-slate-600">DairyPulse Enterprise Milk Platform</p>
        </div>
      </div>
    </div>
  );
}
