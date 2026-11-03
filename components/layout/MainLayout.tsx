'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-alt/30 overflow-hidden">
      {/* ── Menu Latéral ── */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Structure Principale ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-full mx-auto space-y-6 px-4 sm:px-6 lg:px-8  ">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}