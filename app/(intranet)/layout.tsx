'use client';

// app/(intranet)/layout.tsx
import React from 'react';
import AppLayoutDispatcher from '@/components/layout/AppLayoutDispatcher';

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutDispatcher>{children}</AppLayoutDispatcher>;
}