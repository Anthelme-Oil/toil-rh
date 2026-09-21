import Header  from './Header';

import { Footer } from '../common/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function SingleLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-alt/30">
      {/* ── Navigation Globale ── */}
      <Header />

      {/* ── Contenu Principal ── */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* ── Pied de Page ── */}
      <Footer />
    </div>
  );
}