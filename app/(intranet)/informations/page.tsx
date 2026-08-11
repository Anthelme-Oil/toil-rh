// ═══════════════════════════════════════════════════════════════
// Page Informations / Actualités
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft } from 'lucide-react';
import { mockActualites } from '@/lib/mock-data';
import { getActualites } from '@/lib/sharepoint';
import ActualitesListClient from '@/components/actualites/ActualitesListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Actualités & Informations',
  description: 'Retrouvez toutes les actualités et informations de COMPEL STSL T-OIL.',
};

export default async function InformationsPage() {
  const spActualites = await getActualites(100);
  const actualites = spActualites.length > 0 ? spActualites : [...mockActualites];

  // Tri garanti du plus récent au plus ancien
  actualites.sort((a, b) => {
    const dateA = a.datePublication ? new Date(a.datePublication).getTime() : 0;
    const dateB = b.datePublication ? new Date(b.datePublication).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-semibold">Informations & Actualités</span>
      </div>

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Actualités & Informations</h1>
            <p className="text-sm text-text-secondary">
              Retrouvez toutes les nouvelles de l&apos;entreprise triées du plus récent au plus ancien et filtrables par catégorie.
            </p>
          </div>
        </div>
      </div>

      {/* ── Composant Interactif (Liste déroulante, recherche et filtre par catégorie) ── */}
      <ActualitesListClient initialActualites={actualites} />
    </div>
  );
}
