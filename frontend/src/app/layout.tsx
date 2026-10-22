import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'DairyPulse — Dairy Distribution & Management Platform',
  description: 'Centralized dairy distribution management platform for milk stock, subscriptions, shop orders, deliveries, and billing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F4F7FB]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
