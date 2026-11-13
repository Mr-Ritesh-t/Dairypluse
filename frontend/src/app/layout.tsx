import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F766E',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'DairyPulse — Modern Farm Operations, Milk Delivery & Billing Hub',
    template: '%s | DairyPulse',
  },
  description: 'Enterprise dairy farm distribution platform for fresh milk collection, doorstep subscriptions, commercial shop orders, delivery routing, and WhatsApp billing.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'DairyPulse — Dairy Operations Hub',
    description: 'Fresh milk distribution, delivery dispatch, customer subscriptions, and billing automation.',
    images: ['/logo.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#FEFBF6] text-stone-900 selection:bg-teal-100 selection:text-teal-900" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
