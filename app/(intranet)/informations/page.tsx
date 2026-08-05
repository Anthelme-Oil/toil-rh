// ═══════════════════════════════════════════════════════════════
// Page Informations / Actualités
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft, Calendar, Tag, Plus } from 'lucide-react';
import { mockActualites } from '@/lib/mock-data';
import { getActualites } from '@/lib/sharepoint';

export const metadata: Metadata = {
  title: 'Actualités & Informations',
  description: 'Retrouvez toutes les actualités et informations de COMPEL STSL T-OIL.',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCatStyle(cat?: string) {
  switch (cat?.toLowerCase()) {
    case 'hse': return 'bg-primary-100 text-primary-700 border-primary-200';
    case 'politique': return 'bg-accent-50 text-accent border-red-200';
    case 'formation': return 'bg-amber-50 text-amber border-amber-200';
    default: return 'bg-surface-alt text-text-secondary border-border';
  }
}

export default async function InformationsPage() {
  const spActualites = await getActualites(20);
  const actualites = spActualites.length > 0 ? spActualites : mockActualites;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Informations</span>
      </div>

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Actualités & Informations</h1>
            <p className="text-sm text-text-secondary">
              Retrouvez les dernières nouvelles de l&apos;entreprise
            </p>
          </div>
        </div>

        <Link
          href="/informations/creer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Publier un blog / actualité
        </Link>
      </div>


      {/* ── Liste des actualités ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actualites.map((actu, i) => (
          <Link
            key={actu.id}
            href={`/informations/${actu.id}`}
            className={`bg-white rounded-xl overflow-hidden card-hover animate-fade-in-up flex flex-col justify-between group delay-${i + 1}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
            id={`article-${actu.id}`}
          >
            <div>
              {/* Image ou Placeholder */}
              <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center relative overflow-hidden">
                {actu.imageUrl ? (
                  <img
                    src={actu.imageUrl}
                    alt={actu.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Newspaper className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
                )}
                {actu.categorie && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getCatStyle(actu.categorie)}`}>
                    {actu.categorie}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5">
                <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {actu.titre}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">
                  {actu.description}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(actu.datePublication)}
              </div>
              <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                Lire la suite →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Message si vide ── */}
      {actualites.length === 0 && (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-lg font-medium text-text-secondary">
            Aucune actualité pour le moment
          </p>
          <p className="text-sm text-text-muted mt-1">
            Les nouvelles informations apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  );
}
