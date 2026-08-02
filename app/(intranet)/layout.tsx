// ═══════════════════════════════════════════════════════════════
// Layout Intranet — Navbar partagée entre toutes les pages
// ═══════════════════════════════════════════════════════════════

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
