// ═══════════════════════════════════════════════════════════════
// Page Informations / Actualités — Données Réelles SharePoint
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getActualites } from '@/lib/sharepoint';
import ActualitesListClient from '@/components/actualites/ActualitesListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Actualités & Informations — T-OIL STSL',
  description: 'Retrouvez toutes les actualités, annonces et informations du groupe T-OIL & STSL.',
};

export default async function InformationsPage() {
  const actualites = await getActualites(100);

  // Tri du plus récent au plus ancien par défaut
  actualites.sort((a, b) => {
    const dateA = a.datePublication ? new Date(a.datePublication).getTime() : 0;
    const dateB = b.datePublication ? new Date(b.datePublication).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
      {/* ── Fil d'Ariane épuré ── */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link
          href="/"
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Accueil
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Informations & Actualités</span>
      </nav>

      {/* ── Hub Exécutif Unifié & Liste d'Actualités ── */}
      <ActualitesListClient initialActualites={actualites} />
    </div>
  );
}
