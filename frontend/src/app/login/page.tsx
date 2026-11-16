'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PageHead } from '@/components/common/PageHead';
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
  Milk,
  AlertCircle,
  Building2,
  ChevronRight,
  Search,
  BadgeCheck,
  Eye,
  EyeOff,
  Check,
  BarChart3,
  UserPlus,
  ExternalLink,
  Sparkles,
  RotateCw,
  Award,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import MapLocationPicker from '@/components/delivery/MapLocationPicker';

export default function LoginPage() {
  const router = useRouter();
  const { user, logout, login, loginWithGoogle, loginWithPhoneOtp, verifyPhoneOtp } = useAuth();
  const { dairies, addDairy, addCustomer, addSubscription, refreshDairies, products } = useDairyPulse();

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
  const [otpCountdown, setOtpCountdown] = useState(45);

  // Account Not Found Interactivity State
  const [notFoundPrompt, setNotFoundPrompt] = useState(false);
  const [notFoundId, setNotFoundId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password helper modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // GSAP Scope Ref
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // GSAP: Continuous subtle floating effect on hero illustration only (zero opacity delay on auth form)
  useGSAP(
    () => {
      gsap.to('.gsap-float-artwork', {
        y: -5,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: mainContainerRef }
  );

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

  // Keep selectedDairyName synchronized with available dairies list and clear stale offline data
  useEffect(() => {
    refreshDairies();
    if (typeof window !== 'undefined' && !user) {
      try {
        localStorage.removeItem('dairypulse_staff');
        localStorage.removeItem('dairypulse_registered_dairies');
        localStorage.removeItem('dairypulse_routes');
        localStorage.removeItem('dairypulse_salary_payments');
      } catch (e) {
        console.warn('LocalStorage cleanup warning:', e);
      }
    }
  }, [user]);

  useEffect(() => {
    if (dairies && dairies.length > 0) {
      if (!selectedDairyName || !dairies.some((d) => d.name.toLowerCase() === selectedDairyName.toLowerCase())) {
        setSelectedDairyName(dairies[0].name);
      }
    }
  }, [dairies, selectedDairyName]);

  // OTP Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, otpCountdown]);

  const [custAddress, setCustAddress] = useState('');
  const [custArea, setCustArea] = useState('');
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
            setOtpCountdown(45);
            setSuccessMessage(`Verification OTP sent to ${loginId}. Please enter the 6-digit code below.`);
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
        rememberMe,
      });

      if (res.success) {
        const targetRole: UserRole = selectedRole === 'DELIVERY' ? 'DELIVERY' : (res.user?.role || selectedRole);
        setSuccessMessage(`Welcome back, ${res.user?.name || 'DairyPulse user'}! Redirecting to your portal...`);
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
      const routeName = `${custArea || 'Main Area'} Route R-04`;
      const newCust = await addCustomer({
        name: custName.trim(),
        type: 'HOUSEHOLD',
        phone: custPhone.trim(),
        email: custEmail.trim() || undefined,
        address: custAddress.trim(),
        area: custArea || 'Sector 1',
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
      password: custPassword,
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
      password: newDairyPassword,
      role: 'OWNER',
    });
    router.push('/');
  };

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-[#FEFBF6] relative flex flex-col justify-between overflow-x-clip selection:bg-teal-100 selection:text-teal-900 font-sans"
    >
      <PageHead
        title="Portal Sign In | DairyPulse"
        description="Unified enterprise access for dairy plant owners, early-morning delivery fleets, and household milk subscribers."
      />

      {/* Clean, Modern SaaS Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft top-left emerald atmospheric orb */}
        <div className="absolute -top-32 -left-32 w-[620px] h-[620px] bg-emerald-500/6 rounded-full blur-3xl" />
        
        {/* Soft bottom-right teal atmospheric orb */}
        <div className="absolute -bottom-36 -right-36 w-[680px] h-[680px] bg-teal-600/6 rounded-full blur-3xl" />

        {/* Ambient pastoral landscape curves (SVG) */}
        <svg
          className="absolute -top-12 -left-24 w-[750px] h-[550px] text-emerald-100/40"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0C150 120 320 80 450 200C580 320 620 450 600 600H0V0Z"
            fill="currentColor"
          />
        </svg>

        <svg
          className="absolute bottom-0 right-0 w-[900px] h-[480px] text-teal-100/30"
          viewBox="0 0 1000 550"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 320C200 240 400 350 650 220C900 90 980 180 1000 250V550H0V320Z"
            fill="currentColor"
          />
        </svg>

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#0F766E 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Split Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-screen px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ================= LEFT COLUMN: HERO & BRAND (Desktop) ================= */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between py-6 px-4 lg:px-8 xl:px-12 min-h-[90vh]">
          
          {/* Top Logo & Trust Badge */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-md border border-emerald-200/80 bg-white p-1.5 shrink-0 transition-transform hover:scale-105">
                <Image
                  src="/images/dairypulse-badge.png"
                  alt="DairyPulse Emblem"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    Dairy<span className="text-[#0F766E]">Pulse</span>
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    Enterprise Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Aapke Dairy Business ka Smart Saathi
                </p>
              </div>
            </div>

            {/* Social Proof Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-xs text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Trusted by <strong>120+ Dairies</strong> &amp; <strong>15,000+ Daily Households</strong></span>
            </div>
          </div>

          {/* Main Headline & Value Props */}
          <div className="my-auto py-6 space-y-6 max-w-lg">
            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Run Your Entire <br />
                Dairy Operations <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-emerald-600">
                  On Autopilot
                </span>
              </h1>
              <p className="text-sm xl:text-base text-slate-600 font-normal leading-relaxed max-w-md pt-1">
                Automated 5:00 AM dispatch manifests, cold-chain silo telemetry, recurring household milk subscriptions, and automated WhatsApp billing in one secure platform.
              </p>
            </div>

            {/* Clean Featured Milk Hero Illustration */}
            <div className="relative pt-1 max-w-md gsap-float-artwork">
              <div className="relative overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white to-stone-50/60 p-2 shadow-xs">
                <Image
                  src="/images/login-milk-hero-clean.png"
                  alt="Fresh Dairy Can, Milk Bottles and Glass"
                  width={450}
                  height={226}
                  className="w-full h-auto object-contain rounded-xl"
                  priority
                />
              </div>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-md">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
                    <Milk className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Silo Stock</h4>
                    <p className="text-[10px] text-slate-500">Fat/SNF calculations</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/70 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">5 AM Dispatch</h4>
                    <p className="text-[10px] text-slate-500">GPS route sequencing</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Subscriptions</h4>
                    <p className="text-[10px] text-slate-500">Vacation &amp; cutoffs</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/70 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">UPI Billing</h4>
                    <p className="text-[10px] text-slate-500">WhatsApp PDF ledger</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Compliance Bar */}
          <div className="pt-4 border-t border-stone-200/60 flex items-center gap-6 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>FSSAI &amp; ISO 22000 Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>99.8% On-Time Dispatch</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AUTH CARD (Mobile & Desktop) ================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-2 sm:py-6">
          
          {/* Mobile Header Branding */}
          <div className="lg:hidden text-center pb-4 px-2 space-y-1.5 w-full">
            <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-md border border-emerald-200/80 bg-white p-1.5 mx-auto">
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
                Dairy<span className="text-[#0F766E]">Pulse</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Aapke Dairy Business ka Smart Saathi
              </p>
            </div>
          </div>

          {/* Main Auth Card (Solid White, Crisp Rendering, No Blur) */}
          <div className="w-full max-w-md sm:max-w-[490px] lg:max-w-[530px] bg-white rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/90 p-5 sm:p-7 relative z-20 transition-all">
            
            {/* 3 Top Segmented Tabs */}
            <div className="grid bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 grid-cols-3 gap-1 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setNotFoundPrompt(false);
                }}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'signin'
                    ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Sign In</span>
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
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'customer'
                    ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Customer Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('dairy');
                  setErrorMessage(null);
                  setDairySuccess(null);
                }}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  activeTab === 'dairy'
                    ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Register Dairy</span>
              </button>
            </div>

            {/* Mobile Header when in Registration Tabs */}
            {activeTab !== 'signin' && (
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-teal-800 cursor-pointer"
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
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Active Session Warning / Switcher */}
                {user && (
                  <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-amber-900 truncate text-[11px] sm:text-xs font-medium">
                        Active Session: <strong>{user.name}</strong> ({user.role})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        window.location.reload();
                      }}
                      className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-white px-2.5 py-1 rounded-xl border border-rose-200 shadow-2xs hover:bg-rose-50 transition cursor-pointer shrink-0"
                    >
                      Log Out
                    </button>
                  </div>
                )}

                {/* Heading */}
                <div className="text-center mb-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Welcome to <span className="text-slate-900">Dairy</span><span className="text-[#0F766E]">Pulse</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to access your dairy management workspace
                  </p>
                </div>

                {/* Select Your Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Admin / Owner */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('OWNER')}
                      className={`relative p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer min-w-0 ${
                        selectedRole === 'OWNER'
                          ? 'border-2 border-[#0F766E] bg-teal-50/70 text-teal-950 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      {selectedRole === 'OWNER' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-[#0F766E] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-stone-900 truncate">Admin</span>
                        <span className={`block text-[11px] truncate ${selectedRole === 'OWNER' ? 'text-teal-800 font-semibold' : 'text-stone-500'}`}>
                          Dairy Owner
                        </span>
                      </div>
                    </button>

                    {/* Rider / Delivery */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('DELIVERY')}
                      className={`relative p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer min-w-0 ${
                        selectedRole === 'DELIVERY'
                          ? 'border-2 border-[#0F766E] bg-teal-50/70 text-teal-950 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      {selectedRole === 'DELIVERY' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-700 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-sky-700" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-stone-900 truncate">Rider</span>
                        <span className={`block text-[11px] truncate ${selectedRole === 'DELIVERY' ? 'text-teal-800 font-semibold' : 'text-stone-500'}`}>
                          Delivery Fleet
                        </span>
                      </div>
                    </button>

                    {/* Customer */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('CUSTOMER')}
                      className={`relative p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer min-w-0 ${
                        selectedRole === 'CUSTOMER'
                          ? 'border-2 border-[#0F766E] bg-teal-50/70 text-teal-950 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      {selectedRole === 'CUSTOMER' && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="w-full min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-stone-900 truncate">Customer</span>
                        <span className={`block text-[11px] truncate ${selectedRole === 'CUSTOMER' ? 'text-teal-800 font-semibold' : 'text-stone-500'}`}>
                          Subscriber
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Authentication Method Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Authentication Method
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {authMode === 'password' ? 'Password login' : 'Instant OTP verification'}
                    </span>
                  </div>
                  <div className="bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 grid grid-cols-2 gap-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setOtpSent(false);
                        setErrorMessage(null);
                      }}
                      className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        authMode === 'password'
                          ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
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
                      className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        authMode === 'phone_otp'
                          ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                  </div>
                </div>

                {/* Email or Phone Number Input */}
                <div>
                  <label htmlFor="loginId" className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedRole === 'DELIVERY' ? 'Rider Mobile Number or Email' : 'Email or Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="loginId"
                      name="username"
                      type={authMode === 'phone_otp' ? 'tel' : 'text'}
                      autoComplete="username"
                      inputMode={authMode === 'phone_otp' ? 'tel' : 'text'}
                      required
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        setNotFoundPrompt(false);
                      }}
                      placeholder={
                        selectedRole === 'DELIVERY'
                          ? 'Enter 10-digit mobile number or email'
                          : 'Enter your registered email or phone'
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                {authMode === 'password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="passwordInput" className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="passwordInput"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition shadow-2xs font-medium"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label htmlFor="otpCodeInput" className="block text-xs font-bold text-slate-700">
                        6-Digit SMS Verification Code
                      </label>
                      {otpCountdown > 0 ? (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Resend in {otpCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            setOtpCountdown(45);
                            await loginWithPhoneOtp(loginId.trim());
                            setSuccessMessage(`New code sent to ${loginId}`);
                          }}
                          className="text-[11px] text-[#0F766E] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="otpCodeInput"
                        name="oneTimeCode"
                        type="text"
                        maxLength={6}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-mono tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition shadow-2xs text-center"
                      />
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
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] border-stone-300 cursor-pointer accent-[#0F766E]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[#0F766E] hover:text-teal-800 font-semibold hover:underline cursor-pointer text-xs"
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
                          className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
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
                          className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                        >
                          <span>Register New Dairy Farm</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {selectedRole === 'DELIVERY' && (
                        <div className="w-full space-y-2 pt-1">
                          <p className="text-[11px] text-amber-800">
                            No rider account found for &quot;{notFoundId}&quot;. Delivery fleet accounts are provisioned by your dairy owner.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href="/staff"
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1 text-xs"
                            >
                              <span>Open Staff Directory</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setShowForgotModal(true)}
                              className="text-xs text-[#0F766E] font-semibold hover:underline cursor-pointer"
                            >
                              Contact Support
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error and Success Messages */}
                {errorMessage && !notFoundPrompt && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === 'phone_otp'
                          ? otpSent
                            ? 'Verify & Sign In'
                            : 'Send OTP Code'
                          : 'Sign In to Dashboard'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-3 text-xs font-semibold text-slate-400">
                    Or continue with
                  </span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition flex items-center justify-center gap-2.5 shadow-2xs hover:border-stone-300 cursor-pointer disabled:opacity-50"
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

                {/* Mobile Registration Switcher */}
                <div className="text-center text-xs text-slate-500 pt-2 space-y-1 select-none">
                  <p>Don&apos;t have an account?</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('customer');
                        setCustomerStep(1);
                        setErrorMessage(null);
                      }}
                      className="text-[#0F766E] font-bold hover:underline cursor-pointer"
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
                      className="text-[#0F766E] font-bold hover:underline cursor-pointer"
                    >
                      Register Dairy Farm
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ================= TAB 2: CUSTOMER SIGN UP (3-STEP WIZARD) ================= */}
            {activeTab === 'customer' && (
              <div>
                {custSuccess ? (
                  <div className="py-6 text-center space-y-4 animate-in fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Customer Account Created!</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Welcome to <strong>{custSuccess.dairyName}</strong>, {custSuccess.name}!
                      </p>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Selected Dairy:</span>
                        <span className="font-bold text-[#0F766E]">{custSuccess.dairyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer ID:</span>
                        <span className="font-mono font-bold text-slate-900">{custSuccess.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Login Mobile:</span>
                        <span className="font-mono font-bold text-[#0F766E]">{custSuccess.phone}</span>
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
                      className="w-full py-3 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Open Customer Portal Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Step Progress Bar */}
                    <div className="pb-3 border-b border-stone-100">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                        <span className={customerStep === 1 ? 'text-[#0F766E]' : 'text-slate-400'}>
                          1. Profile
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className={customerStep === 2 ? 'text-[#0F766E]' : 'text-slate-400'}>
                          2. Select Dairy
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className={customerStep === 3 ? 'text-[#0F766E]' : 'text-slate-400'}>
                          3. Milk &amp; Address
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F766E] h-full transition-all duration-300 rounded-full"
                          style={{ width: customerStep === 1 ? '33%' : customerStep === 2 ? '66%' : '100%' }}
                        />
                      </div>
                    </div>

                    {/* STEP 1: CREATE ACCOUNT */}
                    {customerStep === 1 && (
                      <form onSubmit={handleStep1Next} className="space-y-3.5">
                        <div className="text-xs text-slate-500">
                          Enter your contact details to create your customer subscription profile.
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
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                              inputMode="tel"
                              value={custPhone}
                              onChange={(e) => setCustPhone(e.target.value)}
                              placeholder="+91 98..."
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                            placeholder="Create a password (min 6 characters)"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                          className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                          <span>Choose your local dairy farm partner:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => refreshDairies()}
                              className="text-[10px] text-[#0F766E] hover:underline font-semibold cursor-pointer"
                            >
                              Refresh
                            </button>
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
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
                            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition"
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
                              className="px-3 py-1.5 bg-[#0F766E] text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-teal-800 transition cursor-pointer"
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
                                        ? 'border-[#0F766E] bg-teal-50/70 shadow-xs'
                                        : 'border-stone-200 hover:border-teal-200 hover:bg-stone-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? 'bg-[#0F766E] text-white'
                                            : 'bg-stone-100 text-stone-600'
                                        }`}
                                      >
                                        <Building2 className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <h4 className="font-bold text-slate-900">{dairy.name}</h4>
                                          {isSelected && (
                                            <BadgeCheck className="w-4 h-4 text-[#0F766E] fill-teal-100" />
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
                                        className="w-4 h-4 text-[#0F766E] focus:ring-[#0F766E] border-stone-300 accent-[#0F766E]"
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
                            className="w-1/3 py-2 border border-stone-200 hover:bg-stone-50 text-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStep2Next}
                            disabled={!selectedDairyName}
                            className="w-2/3 py-2 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <span>Next: Address &amp; Milk</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ADDRESS & MILK REQUIREMENTS */}
                    {customerStep === 3 && (
                      <form onSubmit={handleStep3Submit} className="space-y-3.5">
                        <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/80 text-[11px] text-teal-900 flex items-center justify-between">
                          <span>
                            Delivering from: <strong>{selectedDairyName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setCustomerStep(2)}
                            className="text-[#0F766E] underline font-bold cursor-pointer"
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
                            placeholder="Flat / House No., Wing, Society / Building Name"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                              Delivery Area / Locality
                            </label>
                            <input
                              type="text"
                              required
                              value={custArea}
                              onChange={(e) => setCustArea(e.target.value)}
                              placeholder="e.g. Sector 14, Hinjawadi"
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Milk Variant
                            </label>
                            <select
                              value={custVariant}
                              onChange={(e) => setCustVariant(e.target.value as MilkVariant)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E]"
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
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E]"
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
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E]"
                            >
                              <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 - 7:30 AM)</option>
                              <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 - 7:00 PM)</option>
                              <option value="Both">Both (Morning &amp; Evening)</option>
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
                            className="w-1/3 py-2 border border-stone-200 hover:bg-stone-50 text-slate-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-2/3 py-2 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
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
                  <div className="py-6 text-center space-y-4 animate-in fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Dairy Farm Registered!</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>{dairySuccess.name}</strong> is now live on the DairyPulse Network.
                      </p>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dairy Name:</span>
                        <span className="font-bold text-[#0F766E]">{dairySuccess.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Owner / Manager:</span>
                        <span className="font-medium text-slate-800">{dairySuccess.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Admin Login:</span>
                        <span className="font-mono font-bold text-[#0F766E]">{dairySuccess.email}</span>
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
                      className="w-full py-3 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                        placeholder="e.g. Shivneri Organic Dairy Farm"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                          inputMode="tel"
                          value={newDairyPhone}
                          onChange={(e) => setNewDairyPhone(e.target.value)}
                          placeholder="+91 98..."
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] font-medium"
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
                      className="w-full py-3 bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Registering Dairy...' : 'Register Dairy & Create Admin ID'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Mobile Bottom Pasture Scene */}
          <div className="lg:hidden w-full max-w-md sm:max-w-[490px] mt-4 overflow-hidden rounded-2xl shadow-xs border border-stone-200/80">
            <Image
              src="/images/login-farm-pasture-clean.png"
              alt="Dairy Farm Pasture with Grazing Cows"
              width={472}
              height={174}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Bottom Footnote */}
          <div className="text-center text-[11px] text-slate-500 mt-4 space-y-0.5">
            <p>DairyPulse &bull; Aapke Dairy Business ka Smart Saathi</p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#0F766E]">
              <HelpCircle className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-sm">Reset or Recover Password</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To instantly access your account without a password:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Switch to <strong>Phone OTP</strong> mode to receive a 6-digit one-time passcode on your registered mobile.</li>
              <li>Or contact your dairy system administrator at <a href="mailto:support@dairypulse.in" className="text-[#0F766E] font-semibold underline">support@dairypulse.in</a>.</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
