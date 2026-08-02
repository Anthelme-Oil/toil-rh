// ═══════════════════════════════════════════════════════════════
// Section Événements du Jour
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { Evenement } from '@/types';

interface EvenementsSectionProps {
  evenements: Evenement[];
}

export default function EvenementsSection({ evenements }: EvenementsSectionProps) {
  const now = new Date();
  const jour = now.getDate();
  const mois = now.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();

  return (
    <div
      className="bg-white rounded-xl p-5 card-hover animate-fade-in-up delay-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
      id="section-evenements"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">
            Événements du jour
          </h2>
        </div>
        <Link
          href="/reservations"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors focus-ring"
          id="link-calendrier-complet"
        >
          Voir le calendrier complet
        </Link>
      </div>

      {/* Contenu */}
      <div className="flex items-center gap-5">
        {/* Calendrier mini */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center text-white">
          <span className="text-2xl font-bold leading-none">{jour}</span>
          <span className="text-xs font-semibold uppercase tracking-wider mt-0.5 text-white/80">
            {mois}
          </span>
        </div>

        {/* Événements ou message vide */}
        {evenements.length > 0 ? (
          <div className="flex-1 space-y-2">
            {evenements.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {evt.titre}
                  </p>
                  {evt.lieu && (
                    <p className="text-xs text-text-muted">{evt.lieu}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Aucun événement prévu aujourd&apos;hui
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Bonne journée productive !
              </p>
            </div>
            {/* Icône calendrier décorative */}
            <div className="ml-auto flex-shrink-0 opacity-30">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="40" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                <rect x="4" y="8" width="40" height="10" rx="4" fill="currentColor" opacity="0.1" />
                <rect x="12" y="4" width="2" height="8" rx="1" fill="currentColor" />
                <rect x="34" y="4" width="2" height="8" rx="1" fill="currentColor" />
                {/* Grid */}
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4, 5, 6].map((col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={8 + col * 5}
                      y={22 + row * 5}
                      width="3"
                      height="3"
                      rx="0.5"
                      fill="currentColor"
                      opacity="0.2"
                    />
                  ))
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
