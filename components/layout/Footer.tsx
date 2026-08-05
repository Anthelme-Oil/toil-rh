// ═══════════════════════════════════════════════════════════════
// Footer — Pied de page premium T-OIL / COMPEL STSL
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import {
  ShieldCheck,
  ExternalLink,
  PhoneCall,
  Mail,
  MapPin,
  FileText,
  HelpCircle,
  Headphones,
  Newspaper,
  LayoutDashboard,
  Building2,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="relative text-gray-300 border-t border-emerald-950/60 mt-auto overflow-hidden bg-[#06140b]"
      style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(26, 107, 60, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(13, 74, 39, 0.2) 0px, transparent 50%),
          linear-gradient(to bottom, #07170d, #040c07)
        `,
      }}
    >
      {/* Ligne d'accentuation supérieure verte */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/30">
          
          {/* ── Colonne 1 : Marque & Présentation ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">T-OIL</span>
                <span className="text-xs block text-emerald-400/80 font-medium -mt-1">COMPEL STSL Intranet</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Plateforme centralisée d&apos;entreprise pour l&apos;accès aux informations,
              procédures internes, documents RH/IT et suivi des demandes.
            </p>

            {/* Badge statut système */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Services Microsoft 365 opérationnels</span>
            </div>
          </div>

          {/* ── Colonne 2 : Navigation Rapide ── */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              Navigation Rapide
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Accueil Dashboard
                </Link>
              </li>
              <li>
                <Link href="/informations" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Actualités & Blogs
                </Link>
              </li>
              <li>
                <Link href="/procedures" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Procédures IT & RH
                </Link>
              </li>
              <li>
                <Link href="/demandes" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Mes Demandes Internes
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Annuaire d&apos;Entreprise
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Colonne 3 : Support & Assistance ── */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" />
              Support & Aide
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/demandes/nouvelle?type=it" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Assistance Informatique (IT)
                </Link>
              </li>
              <li>
                <Link href="/demandes/nouvelle?type=rh" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> Service Ressources Humaines
                </Link>
              </li>
              <li>
                <Link href="/aide" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500/50">›</span> FAQ & Guides Utilisateur
                </Link>
              </li>
              <li>
                <a
                  href="https://portal.office.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 text-emerald-300 font-medium"
                >
                  Portail Microsoft 365 <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* ── Colonne 4 : Contact & Info ── */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Contact & Support
            </h3>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Siège COMPEL STSL T-OIL, Lomé, Togo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="mailto:support@toil.tg" className="hover:text-emerald-300 transition-colors">
                  support@toil.tg
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Poste interne : #8080 (IT Support)</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Barre Basse : Copyright & Liens ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} COMPEL STSL T-OIL. Tous droits réservés.</p>
          
          <div className="flex items-center gap-6 text-xs">
            <Link href="/mentions-legales" className="hover:text-emerald-400 transition-colors">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-emerald-400 transition-colors">
              Confidentialité
            </Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">
              Contact IT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
