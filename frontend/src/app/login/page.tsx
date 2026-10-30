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
  Eye,
  EyeOff,
  Check,
  BarChart3,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';

export default function LoginPage() {
  const router = useRouter();
  const { user, logout, login, loginWithGoogle, loginWithPhoneOtp, verifyPhoneOtp } = useAuth();
  const { dairies, addDairy, addCustomer, addSubscription, refreshDairies, products, addStaff } = useDairyPulse();

  // Tab: 'signin' | 'customer' | 'dairy'
  const [activeTab, setActiveTab] = useState<'signin' | 'customer' | 'dairy'>('signin');

  // Sign In state
  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      window.location.href = target;
    }, 250);
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
        const targetRole: UserRole = selectedRole === 'DELIVERY' ? 'DELIVERY' : (res.user?.role || selectedRole);
        setSuccessMessage(`Welcome back, ${res.user?.name || 'DairyPulse user'}! Redirecting to delivery portal...`);
        redirectToRole(targetRole);
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
    <div className="min-h-screen bg-[#F0F8F4] relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* Desktop Background Image (Scenic pastoral view uploaded by user) */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/images/login-desktop-bg.jpg"
          alt="DairyPulse Farm PC Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Mobile Background Image (Exact full-height pasture & leaves uploaded by user) */}
      <div className="lg:hidden fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/images/login-mobile-bg.jpg"
          alt="DairyPulse Farm Mobile Background"
          fill
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Main Split Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-screen">
        
        {/* ================= LEFT COLUMN: HERO & BRAND (Desktop) ================= */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between pt-10 pb-4 px-8 lg:px-12 xl:px-16 min-h-screen">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs border border-emerald-200/70 bg-white p-1 shrink-0">
              <Image
                src="/images/dairypulse-badge.png"
                alt="DairyPulse"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Dairy<span className="text-emerald-600">Pulse</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Aapke Dairy Business ka Smart Saathi
              </p>
            </div>
          </div>

          {/* Main Headline & Feature Circles */}
          <div className="my-auto py-4 space-y-6 max-w-lg">
            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Manage Your <br />
                Dairy Business <br />
                <span className="text-emerald-600">Effortlessly</span>
              </h1>
              <p className="text-sm xl:text-base text-slate-600 font-normal leading-relaxed max-w-md pt-1">
                From milk stock to deliveries, billing and reports — everything in one simple platform.
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-4 gap-3 pt-2 max-w-md">
              <div className="text-center group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-2xs group-hover:scale-105 transition">
                  <Milk className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                  Manage<br />Inventory
                </p>
              </div>

              <div className="text-center group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-2xs group-hover:scale-105 transition">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                  Handle<br />Customers
                </p>
              </div>

              <div className="text-center group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-2xs group-hover:scale-105 transition">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                  Track<br />Deliveries
                </p>
              </div>

              <div className="text-center group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-2xs group-hover:scale-105 transition">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                  Get<br />Reports
                </p>
              </div>
            </div>
          </div>

          {/* Spacer allowing background milk cans on wooden table to show through */}
          <div className="relative h-44 xl:h-52 max-w-md pointer-events-none" />
        </div>

        {/* ================= RIGHT COLUMN: AUTH CARD (Mobile & Desktop) ================= */}
        <div className="w-full max-w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-6">
          
          {/* Mobile Header Branding (Visible on mobile only) */}
          <div className="lg:hidden text-center pt-1 pb-3 px-2 space-y-1.5 w-full">
            <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-xs border border-emerald-200/70 bg-white p-1 mx-auto">
              <Image
                src="/images/dairypulse-badge.png"
                alt="DairyPulse"
                width={52}
                height={52}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Dairy<span className="text-emerald-600">Pulse</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Aapke Dairy Business ka Smart Saathi
              </p>
            </div>
          </div>

          {/* Main Card Container */}
          <div
            className={`w-full sm:max-w-[490px] lg:max-w-[530px] sm:mx-auto relative z-20 transition-all ${
              activeTab === 'signin'
                ? 'bg-transparent sm:bg-white sm:rounded-3xl sm:shadow-xl sm:shadow-emerald-950/5 sm:border sm:border-slate-200/80 p-0 sm:p-7'
                : 'bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 p-4 sm:p-7'
            }`}
          >
            
            {/* 3 Top Tabs: Sign In | Customer Sign Up | Register Dairy (Desktop & Tablet) */}
            <div className="hidden sm:grid bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 grid-cols-3 gap-1 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setNotFoundPrompt(false);
                }}
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'signin'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
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
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'customer'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Customer Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('dairy');
                  setErrorMessage(null);
                  setDairySuccess(null);
                }}
                className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'dairy'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Register Dairy</span>
              </button>
            </div>

            {/* Mobile Header when in Registration Tabs */}
            {activeTab !== 'signin' && (
              <div className="sm:hidden flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-xs font-bold text-slate-500">
                  {activeTab === 'customer' ? 'Customer Sign Up' : 'Dairy Farm Registration'}
                </span>
              </div>
            )}

            {/* ================= TAB 1: SIGN IN ================= */}
            {activeTab === 'signin' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
                
                {/* Active Session Warning / Switcher */}
                {user && (
                  <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-amber-900 truncate text-[11px] sm:text-xs font-medium">
                        Currently signed in as: <strong>{user.name}</strong> ({user.role})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        window.location.reload();
                      }}
                      className="text-[11px] sm:text-xs font-bold text-rose-700 hover:text-rose-900 bg-white px-2.5 py-1 rounded-xl border border-rose-200 shadow-2xs hover:bg-rose-50 transition cursor-pointer shrink-0"
                    >
                      Log Out
                    </button>
                  </div>
                )}

                {/* Heading (Desktop only, matches Mockup 1) */}
                <div className="hidden sm:block text-center mb-4 sm:mb-5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Welcome to <span className="text-slate-900">Dairy</span><span className="text-emerald-600">Pulse</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to access your dairy management dashboard
                  </p>
                </div>

                {/* Select Your Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 sm:mb-2">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('OWNER')}
                      className={`relative p-2 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
                        selectedRole === 'OWNER'
                          ? 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {selectedRole === 'OWNER' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-slate-900 truncate">Admin</span>
                        <span className="block text-[9.5px] sm:text-[11px] text-slate-400 truncate">Dairy Owner</span>
                      </div>
                    </button>

                    {/* Rider */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('DELIVERY')}
                      className={`relative p-2 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
                        selectedRole === 'DELIVERY'
                          ? 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {selectedRole === 'DELIVERY' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-slate-900 truncate">Rider</span>
                        <span className="block text-[9.5px] sm:text-[11px] text-slate-400 truncate">Delivery Staff</span>
                      </div>
                    </button>

                    {/* Customer */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('CUSTOMER')}
                      className={`relative p-2 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
                        selectedRole === 'CUSTOMER'
                          ? 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {selectedRole === 'CUSTOMER' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-slate-900 truncate">Customer</span>
                        <span className="block text-[9.5px] sm:text-[11px] text-slate-400 truncate">Milk Subscriber</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Hint for Delivery Rider */}
                {selectedRole === 'DELIVERY' && (
                  <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                      <span className="text-blue-900 font-medium truncate text-[11px] sm:text-xs">
                        Demo Rider: <strong className="font-mono text-blue-700">9876543210</strong> (pwd: <strong className="font-mono text-blue-700">rider123</strong>)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId('9876543210');
                        setPassword('rider123');
                        setErrorMessage(null);
                        setNotFoundPrompt(false);
                      }}
                      className="text-[11px] sm:text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-100/50 transition cursor-pointer shrink-0"
                    >
                      Fill
                    </button>
                  </div>
                )}

                {/* Authentication Method Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Authentication Method
                  </label>
                  <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 grid grid-cols-2 gap-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setOtpSent(false);
                        setErrorMessage(null);
                      }}
                      className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                        authMode === 'password'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('phone_otp');
                        setErrorMessage(null);
                      }}
                      className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                        authMode === 'phone_otp'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                  </div>
                </div>

                {/* Email or Phone Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedRole === 'DELIVERY' ? 'Rider Phone Number or Email' : 'Email or Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
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
                        selectedRole === 'DELIVERY'
                          ? 'Enter 10-digit mobile number or email'
                          : 'owner@dairypulse.in or +91 98765 43210'
                      }
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                {authMode === 'password' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Phone OTP Step 2: 6-digit Code */}
                {authMode === 'phone_otp' && otpSent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
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
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-emerald-300 rounded-xl text-sm font-mono tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
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

                {/* Remember Me and Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setErrorMessage(
                        'To reset your password, please switch to Phone OTP or contact support@dairypulse.in.'
                      )
                    }
                    className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer text-xs"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Account Not Found Interactive Prompt */}
                {notFoundPrompt && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">No account found with this ID</p>
                        <p className="text-amber-700 mt-0.5 leading-relaxed">
                          We couldn&apos;t find an existing account for <strong>{notFoundId}</strong> under{' '}
                          <strong>{selectedRole}</strong> role. Would you like to create one now?
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
                        <div className="w-full space-y-2 pt-1">
                          <p className="text-[11px] text-amber-800">
                            No rider account found for &quot;{notFoundId}&quot;. You can auto-create this rider now or open the staff portal.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                  const phoneVal = /\d{5,}/.test(notFoundId) ? notFoundId : '9876543210';
                                  const emailVal = notFoundId.includes('@') ? notFoundId : undefined;
                                  const riderName = notFoundId.includes('@') ? notFoundId.split('@')[0] : `Rider ${notFoundId.slice(-4)}`;
                                  await addStaff({
                                    name: riderName,
                                    role: 'Delivery Rider',
                                    phone: phoneVal,
                                    email: emailVal,
                                    password: password || 'rider123',
                                    assignedArea: 'Main Delivery Route',
                                    status: 'On Duty',
                                    deliveriesToday: 0,
                                    rating: 5.0,
                                  });
                                  setNotFoundPrompt(false);
                                  setSuccessMessage('Rider created! Logging in now...');
                                  const res = await login({
                                    loginId: notFoundId,
                                    password: password || 'rider123',
                                    role: 'DELIVERY',
                                  });
                                  if (res.success) {
                                    redirectToRole('DELIVERY');
                                  }
                                } catch (e: any) {
                                  setErrorMessage(e.message || 'Auto-creation failed.');
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                            >
                              <span>Auto-Create & Sign In as Rider</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href="/staff"
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1 text-xs"
                            >
                              <span>Staff Portal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error and Success Messages */}
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
                  className="w-full py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 hover:shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isSubmitting
                      ? 'Signing In...'
                      : authMode === 'phone_otp'
                      ? otpSent
                        ? 'Verify & Sign In'
                        : 'Send OTP Code'
                      : 'Sign In to Dashboard'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    OR CONTINUE WITH
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300 cursor-pointer disabled:opacity-50"
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

                {/* Mobile Registration Switcher (Visible on Mobile Only) */}
                <div className="sm:hidden text-center text-xs text-slate-500 pt-2 space-y-1 select-none">
                  <p>Don&apos;t have an account?</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('customer');
                        setCustomerStep(1);
                        setErrorMessage(null);
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Sign Up as Customer
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('dairy');
                        setErrorMessage(null);
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Register Dairy
                    </button>
                  </div>
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
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                            >
                              Register First Dairy Farm
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {dairies
                              .filter((d) => {
                                if (!dairySearch.trim()) return true;
                                const q = dairySearch.toLowerCase();
                                return (
                                  d.name.toLowerCase().includes(q) ||
                                  (d.ownerName && d.ownerName.toLowerCase().includes(q)) ||
                                  (d.city && d.city.toLowerCase().includes(q))
                                );
                              })
                              .map((dairy) => {
                                const isSelected =
                                  selectedDairyName.toLowerCase() === dairy.name.toLowerCase();
                                return (
                                  <div
                                    key={dairy.id}
                                    onClick={() => setSelectedDairyName(dairy.name)}
                                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-start justify-between gap-3 ${
                                      isSelected
                                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        <Building2 className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <h4 className="font-bold text-slate-900">{dairy.name}</h4>
                                          {isSelected && (
                                            <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                          )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                          Owner: {dairy.ownerName || (dairy as any).owner_name || 'Dairy Specialist'} &bull;{' '}
                                          {dairy.city || 'Pune'}
                                        </p>
                                        {dairy.address && (
                                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                            {dairy.address}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <input
                                        type="radio"
                                        name="dairy_choice"
                                        checked={isSelected}
                                        onChange={() => setSelectedDairyName(dairy.name)}
                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setCustomerStep(1)}
                            className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStep2Next}
                            disabled={!selectedDairyName}
                            className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                          >
                            <span>Next: Address & Milk</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ADDRESS & MILK REQUIREMENTS */}
                    {customerStep === 3 && (
                      <form onSubmit={handleStep3Submit} className="space-y-3.5">
                        <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center justify-between">
                          <span>
                            Delivering from: <strong>{selectedDairyName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setCustomerStep(2)}
                            className="text-emerald-700 underline font-bold cursor-pointer"
                          >
                            Change
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Delivery Address (Doorstep) *
                          </label>
                          <input
                            type="text"
                            required
                            value={custAddress}
                            onChange={(e) => setCustAddress(e.target.value)}
                            placeholder="Flat / House No., Wing, Society / Building Name"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                          />
                        </div>

                        {/* Interactive Location Picker */}
                        <div className="pt-0.5">
                          <MapLocationPicker
                            initialLat={custLat}
                            initialLng={custLng}
                            areaHint={custArea}
                            label="Pin Your Delivery Location on Map (For Rider GPS)"
                            onLocationSelect={(lat, lng) => {
                              setCustLat(lat);
                              setCustLng(lng);
                            }}
                            compact={true}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Delivery Area / Zone
                            </label>
                            <select
                              value={custArea}
                              onChange={(e) => setCustArea(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Baner">Baner</option>
                              <option value="Aundh">Aundh</option>
                              <option value="Kothrud">Kothrud</option>
                              <option value="Wakad">Wakad</option>
                              <option value="Viman Nagar">Viman Nagar</option>
                              <option value="Hadapsar">Hadapsar</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Preferred Milk Variant
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
                              <option value="0.5">0.5 Liter (Small)</option>
                              <option value="1.0">1.0 Liter (Standard)</option>
                              <option value="1.5">1.5 Liters</option>
                              <option value="2.0">2.0 Liters (Family)</option>
                              <option value="3.0">3.0 Liters</option>
                              <option value="5.0">5.0 Liters</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Delivery Slot
                            </label>
                            <select
                              value={custSlot}
                              onChange={(e) => setCustSlot(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 - 7:30 AM)</option>
                              <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 - 7:00 PM)</option>
                              <option value="Both">Both (Morning & Evening)</option>
                            </select>
                          </div>
                        </div>

                        {errorMessage && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setCustomerStep(2)}
                            className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                          >
                            <span>{isSubmitting ? 'Registering...' : 'Complete & Subscribe'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: REGISTER NEW DAIRY FARM ================= */}
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
                        <strong>{dairySuccess.name}</strong> is now live on the DairyPulse Network.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dairy Name:</span>
                        <span className="font-bold text-emerald-700">{dairySuccess.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Owner / Manager:</span>
                        <span className="font-medium text-slate-800">{dairySuccess.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Login ID / Email:</span>
                        <span className="font-mono font-bold text-slate-900">{dairySuccess.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plant GPS:</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          {dairySuccess.latitude?.toFixed(4)}, {dairySuccess.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoginNewDairyOwner}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Launch Dairy Management Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterDairy} className="space-y-3.5">
                    <div className="text-xs text-slate-500">
                      Join the DairyPulse network as an independent dairy plant or cooperative.
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Dairy / Farm Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDairyName}
                        onChange={(e) => setNewDairyName(e.target.value)}
                        placeholder="e.g. Shivneri Dairy Farm"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Owner Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          placeholder="e.g. Vikram Gaikwad"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Operational City *
                        </label>
                        <input
                          type="text"
                          required
                          value={newDairyCity}
                          onChange={(e) => setNewDairyCity(e.target.value)}
                          placeholder="Pune"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Interactive Map Location Picker for Dairy Farm / Plant */}
                    <div className="pt-0.5">
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
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

          {/* Mobile Bottom Spacing for Pastoral Background with Cows & Barn */}
          <div className="lg:hidden h-28 sm:h-32 w-full pointer-events-none" />

          {/* Bottom Footnote (Desktop only) */}
          <div className="hidden lg:block text-center text-[11px] text-slate-400 mt-5 space-y-0.5">
            <p>DairyPulse &bull; Aapke Dairy Business ka Smart Saathi</p>
          </div>
        </div>

      </div>
    </div>
  );
}
