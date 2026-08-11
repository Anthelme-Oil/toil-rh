// ═══════════════════════════════════════════════════════════════
// Page d'Accueil / Dashboard — Tableau de bord principal
// ═══════════════════════════════════════════════════════════════
//
// Server Component qui agrège les données depuis SharePoint
// et MySQL et compose le dashboard à partir de composants
// modulaires.
// ═══════════════════════════════════════════════════════════════

import Navbar from '@/components/layout/Navbar';
import HeroBanner from '@/components/dashboard/HeroBanner';
import ActualitesSection from '@/components/dashboard/ActualitesSection';
import AccesRapidesSection from '@/components/dashboard/AccesRapidesSection';
import MesDemandesSection from '@/components/dashboard/MesDemandesSection';
import VideosSection from '@/components/dashboard/VideosSection';
import AnnoncesSection from '@/components/dashboard/AnnoncesSection';
import EvenementsSection from '@/components/dashboard/EvenementsSection';

// ── Données statiques (liens d'outils M365 — pas du mock, c'est un catalogue fixe) ──
import { outilsM365 } from '@/lib/mock-data';

// ── Services SharePoint & MySQL ──
import { getActualites, getAnnonces, getEvenementsDuJour } from '@/lib/sharepoint';
import { getCompteursDemandesParType } from '@/lib/demandes';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  const userEmail = session?.user?.email || '';

  // Récupération en parallèle des données réelles
  const [actualites, annonces, evenements, compteurs] = await Promise.all([
    getActualites(3),
    getAnnonces(),
    getEvenementsDuJour(),
    userEmail ? getCompteursDemandesParType(userEmail) : Promise.resolve({ materiel: 0, acces: 0, it: 0, rh: 0 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navigation ── */}
      <Navbar />

      {/* ── Bandeau héro ── */}
      <HeroBanner />

      {/* ── Contenu principal (glisse par-dessus la bannière au scroll) ── */}
      <main className="relative z-10 flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-8">
          {/* ── Ligne 1 : Actualités / Accès rapides / Mes demandes ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActualitesSection actualites={actualites} />
            <AccesRapidesSection outils={outilsM365} />
            <MesDemandesSection compteurs={compteurs} />
          </div>

          {/* ── Ligne 2 : Section Vidéos & Actualités Médias (avec accès Onboarding) ── */}
          <VideosSection />

          {/* ── Ligne 3 : Annonces / Événements ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnoncesSection annonces={annonces} />
            <EvenementsSection evenements={evenements} />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-white border-t border-border mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
            <p>© {new Date().getFullYear()} COMPEL STSL T-OIL — Tous droits réservés</p>
            <div className="flex items-center gap-4">
              <a href="/mentions-legales" className="hover:text-primary transition-colors">
                Mentions légales
              </a>
              <a href="/contact" className="hover:text-primary transition-colors">
                Contact IT
              </a>
              <a href="/aide" className="hover:text-primary transition-colors">
                Aide
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
