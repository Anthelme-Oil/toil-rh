// ═══════════════════════════════════════════════════════════════
// Page Informations / Actualités — Données Réelles SharePoint
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft, Radio } from 'lucide-react';
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

  // Tri du plus récent au plus ancien
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

      {/* ── En-tête Principal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold backdrop-blur-md border border-white/10">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            Kiosque d&apos;Information Groupe
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Actualités & Communication Interne
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Suivez la vie de l&apos;entreprise, les faits marquants, les annonces RH et les consignes QSE en temps réel.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
            <span className="block text-2xl font-black text-white">{actualites.length}</span>
            <span className="text-[11px] text-emerald-200 font-medium uppercase tracking-wider">Articles publiés</span>
          </div>
        </div>
      </div>

      {/* ── Composant Client (Actualités SharePoint réelles) ── */}
      <ActualitesListClient initialActualites={actualites} />
    </div>
  );
}
