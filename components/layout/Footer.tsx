// ═══════════════════════════════════════════════════════════════
// Footer — Pied de page du portail
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto" id="site-footer">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} COMPEL STSL T-OIL — Tous droits réservés</p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors">
              Mentions légales
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact IT
            </Link>
            <Link href="/aide" className="hover:text-primary transition-colors">
              Aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
