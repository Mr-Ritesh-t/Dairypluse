'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Milk,
  Truck,
  RotateCw,
  CheckCircle2,
  Calendar,
  CreditCard,
  Layers,
  ArrowRight,
  Sparkles,
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import LoadingSkeleton from '../loading';

const STATUS_MESSAGES = [
  'Connecting to chilling center milk silo telemetry...',
  'Synchronizing morning 5:00 AM delivery route manifests...',
  'Verifying Fat (3.5%+) & SNF (8.5%+) intake quality charts...',
  'Reconciling customer WhatsApp invoice balances & UPI ledgers...',
  'Validating household vacation pauses & 10:00 PM cutoff locks...',
  'Optimizing rider stop sequence across residential societies...',
];

export default function LoadingShowcasePage() {
  const [activeTab, setActiveTab] = useState<'SPLASH' | 'SKELETON' | 'MOBILE'>('SPLASH');
  const [statusIndex, setStatusIndex] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(68);
  const [isSimulating, setIsSimulating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP: Continuous ripple and emblem breathing animation
  useGSAP(
    () => {
      // Concentric ambient ripple rings
      gsap.to('.gsap-loading-ripple-1', {
        scale: 1.45,
        opacity: 0,
        duration: 2.4,
        repeat: -1,
        ease: 'power1.out',
      });

      gsap.to('.gsap-loading-ripple-2', {
        scale: 1.6,
        opacity: 0,
        duration: 3.0,
        delay: 0.9,
        repeat: -1,
        ease: 'power1.out',
      });

      // Emblem breathing pulse
      gsap.to('.gsap-loading-emblem', {
        scale: 1.04,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  // GSAP: Smooth text transition when status message cycles
  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-status-text',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    },
    { dependencies: [statusIndex], scope: containerRef }
  );

  // Cycle status messages
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // Simulate progress bar animation
  useEffect(() => {
    if (!isSimulating) return;
    setSimulatedProgress(10);
    const interval = setInterval(() => {
      setSimulatedProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSimulating(false), 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 10;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FEFBF6] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6"
    >
      {/* ── Control Header ── */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-4 h-4 text-teal-700" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              DairyPulse Loading Page &amp; Suspense States
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Official Next.js App Router Suspense boundary &amp; real-time operational state visualizer.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#F6F2EA] p-1 rounded-xl border border-stone-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('SPLASH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SPLASH'
                ? 'bg-white text-teal-900 shadow-xs border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-teal-700" />
            <span>Brand Splash</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SKELETON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SKELETON'
                ? 'bg-white text-teal-900 shadow-xs border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-teal-700" />
            <span>Dashboard Skeleton</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MOBILE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MOBILE'
                ? 'bg-white text-teal-900 shadow-xs border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-700" />
            <span>Mobile Dispatch</span>
          </button>
        </div>
      </div>

      {/* ── View 1: Brand Splash & Central Progress Loader ── */}
      {activeTab === 'SPLASH' && (
        <div className="relative min-h-[65vh] rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/60 via-white to-[#F6F2EA] border border-stone-200/80 p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs overflow-hidden">
          {/* Background Milk Ripple Circles animated via GSAP */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-teal-200/60 pointer-events-none gsap-loading-ripple-1" />
          <div className="absolute w-[580px] h-[580px] rounded-full border border-teal-300/40 pointer-events-none gsap-loading-ripple-2" />

          {/* Central Glassmorphic Card */}
          <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200/90 flex flex-col items-center space-y-6">
            {/* Animated Brand Emblem */}
            <div className="relative gsap-loading-emblem">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 p-0.5 shadow-lg shadow-teal-700/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-3">
                  <Image
                    src="/icon.png"
                    alt="DairyPulse Icon"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Ambient Live Ring */}
              <span className="absolute -inset-1 rounded-2xl border-2 border-teal-600 animate-pulse opacity-40" />

              {/* Status Badge Pin */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-extrabold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                <span>DairyPulse ERP Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Loading Operations Hub
              </h2>
            </div>

            {/* Dynamic Status Progress Indicator */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-stone-700 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-teal-700 animate-spin" />
                  <span>Syncing Datasets</span>
                </span>
                <span className="text-teal-800 font-mono tabular-nums">
                  {simulatedProgress}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/80">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>

              {/* Rotating Status Narrative */}
              <div className="h-10 flex items-center justify-center">
                <p className="text-xs text-stone-600 font-medium leading-relaxed italic gsap-status-text">
                  &ldquo;{STATUS_MESSAGES[statusIndex]}&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Simulation Trigger */}
            <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => setIsSimulating(true)}
                className="text-teal-800 hover:text-teal-900 font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? 'Simulating Load...' : '▶ Re-run Simulation'}
              </button>

              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL Secured</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── View 2: Dashboard Skeleton (Suspense View) ── */}
      {activeTab === 'SKELETON' && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-900 flex items-center justify-between">
            <span className="font-semibold">
              Previewing official Next.js Suspense boundary component (<code className="font-mono text-teal-800 bg-white/70 px-1.5 py-0.5 rounded">src/app/loading.tsx</code>).
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-teal-800 text-white px-2 py-0.5 rounded-md">
              Live Preview
            </span>
          </div>

          <LoadingSkeleton />
        </div>
      )}

      {/* ── View 3: Mobile Dispatch Device Preview ── */}
      {activeTab === 'MOBILE' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-full max-w-sm bg-stone-900 p-3.5 rounded-[40px] shadow-2xl border-4 border-stone-800">
            {/* Phone Screen Notch */}
            <div className="w-28 h-4 bg-stone-800 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 mr-2" />
              <div className="w-8 h-1 bg-stone-700 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="bg-[#FEFBF6] rounded-[28px] p-4 min-h-[520px] flex flex-col justify-between space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                    <Milk className="w-4 h-4 text-teal-700" />
                  </div>
                  <span className="font-extrabold text-xs text-stone-900">
                    5:00 AM Dispatch
                  </span>
                </div>
                <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
              </div>

              {/* Shimmer Stops */}
              <div className="space-y-2.5 flex-1 pt-2">
                <div className="h-4 w-32 bg-stone-200 rounded-md animate-pulse mb-3" />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 bg-stone-200 rounded-md animate-pulse" />
                      <div className="h-5 w-12 bg-teal-50 rounded-md animate-pulse" />
                    </div>
                    <div className="h-3 w-40 bg-stone-100 rounded-md animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Bottom Nav Skeleton */}
              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-around">
                <div className="w-6 h-6 bg-stone-200 rounded-lg animate-pulse" />
                <div className="w-6 h-6 bg-stone-200 rounded-lg animate-pulse" />
                <div className="w-6 h-6 bg-stone-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Route Links ── */}
      <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <span className="font-medium">Navigate to active DairyPulse modules:</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1">
            <span>Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/delivery" className="font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1">
            <span>Deliveries</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/billing" className="font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1">
            <span>Billing</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/inventory" className="font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1">
            <span>Inventory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
