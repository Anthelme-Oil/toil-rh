'use client';

// ═══════════════════════════════════════════════════════════════
// Layout Dispatcher — Sélectionne le Layout selon la route statique
// ═══════════════════════════════════════════════════════════════
//AppLayoutDispatcher.tsx
import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import SingleLayout from '@/components/layout/SingleLayout';
import {isSingleLayoutRoute} from '@/config/routes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Si la route courante est configurée pour le SingleLayout (ex: '/', '/information')
  if (isSingleLayoutRoute(pathname)) {
    return <SingleLayout>{children}</SingleLayout>;
  }

  // 2. Pour toutes les autres routes (ex: '/validations', '/admin') -> MainLayout (Navbar + Sidebar + Footer)
  return <MainLayout>{children}</MainLayout>;
}