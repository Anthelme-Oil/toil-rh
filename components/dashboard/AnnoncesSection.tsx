// ═══════════════════════════════════════════════════════════════
// Section Annonces Importantes
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { Megaphone, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import type { Annonce } from '@/types';

interface AnnoncesSectionProps {
  annonces: Annonce[];
}

function getAnnonceStyle(type: Annonce['type']) {
  switch (type) {
    case 'urgent':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100/50',
        border: 'border-l-4 border-red-500',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        titleColor: 'text-red-700',
      };
    case 'warning':
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50/50',
        border: 'border-l-4 border-amber',
        icon: <AlertTriangle className="w-5 h-5 text-amber" />,
        titleColor: 'text-amber-dark',
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-primary-50 to-primary-100/50',
        border: 'border-l-4 border-primary',
        icon: <Info className="w-5 h-5 text-primary" />,
        titleColor: 'text-primary-dark',
      };
  }
}

export default function AnnoncesSection({ annonces }: AnnoncesSectionProps) {
  if (annonces.length === 0) return null;

  return (
    <div
      className="bg-white rounded-xl p-5 card-hover animate-fade-in-up delay-3"
      style={{ boxShadow: 'var(--shadow-card)' }}
      id="section-annonces"
    >
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-text-primary">
          Annonces importantes
        </h2>
      </div>

      {/* Liste des annonces */}
      <div className="space-y-3">
        {annonces.map((annonce) => {
          const style = getAnnonceStyle(annonce.type);
          return (
            <div
              key={annonce.id}
              className={`${style.bg} ${style.border} rounded-lg p-4`}
              id={`annonce-${annonce.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {style.icon}
                    <h3 className={`text-sm font-bold ${style.titleColor}`}>
                      {annonce.titre}
                    </h3>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed pl-7">
                    {annonce.contenu}
                  </p>
                </div>
                {annonce.lien && (
                  <Link
                    href={annonce.lien}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
