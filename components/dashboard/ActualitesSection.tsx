'use client';

// ═══════════════════════════════════════════════════════════════
// Section Actualités — Dernières nouvelles SharePoint
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { Actualite } from '@/types';

interface ActualitesSectionProps {
  actualites: Actualite[];
}

/** Formate une date ISO en format français lisible */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Couleurs de catégorie */
function getCategoryColor(categorie?: string): string {
  switch (categorie?.toLowerCase()) {
    case 'hse':
      return 'bg-primary-100 text-primary-700';
    case 'politique':
      return 'bg-accent-50 text-accent';
    case 'formation':
      return 'bg-amber-50 text-amber-dark';
    default:
      return 'bg-surface-alt text-text-secondary';
  }
}

/** Icône placeholder pour les news sans image ou avec image cassée */
function NewsPlaceholder({ categorie }: { categorie?: string }) {
  const colors: Record<string, string> = {
    hse: 'from-primary to-primary-dark',
    politique: 'from-accent to-accent-dark',
    formation: 'from-amber to-amber-light',
  };
  const gradient = colors[categorie?.toLowerCase() || ''] || 'from-primary to-primary-light';

  return (
    <div
      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
    >
      <Newspaper className="w-7 h-7 text-white" />
    </div>
  );
}

export default function ActualitesSection({ actualites }: ActualitesSectionProps) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div
      className="bg-white rounded-xl p-5 card-hover animate-fade-in-up flex flex-col justify-between"
      style={{ boxShadow: 'var(--shadow-card)' }}
      id="section-actualites"
    >
      <div>
        {/* En-tête */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Actualités</h2>
          </div>
          <Link
            href="/informations"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors focus-ring"
            id="link-toutes-actualites"
          >
            Voir toutes les actualités
          </Link>
        </div>

        {/* Liste des actualités */}
        <div className="space-y-4">
          {actualites.map((actu, index) => {
            const isBroken = brokenImages[actu.id] || !actu.imageUrl;

            return (
              <Link
                key={actu.id}
                href={`/informations/${actu.id}`}
                className={`flex items-start gap-4 p-3 -mx-1 rounded-xl hover:bg-surface-alt transition-colors duration-200 group delay-${index + 1}`}
                id={`actualite-${actu.id}`}
              >
                {!isBroken ? (
                  <img
                    src={actu.imageUrl}
                    alt={actu.titre}
                    onError={() => handleImageError(actu.id)}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/40"
                  />
                ) : (
                  <NewsPlaceholder categorie={actu.categorie} />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {actu.categorie && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${getCategoryColor(actu.categorie)}`}
                      >
                        {actu.categorie}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {actu.titre}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                    {actu.description}
                  </p>
                  <span className="text-[11px] text-text-muted mt-1 block">
                    {formatDate(actu.datePublication)}
                  </span>
                </div>
              </Link>
            );
          })}

          {actualites.length === 0 && (
            <p className="text-sm text-text-muted text-center py-6">
              Aucune actualité pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
