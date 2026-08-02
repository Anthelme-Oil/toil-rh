// ═══════════════════════════════════════════════════════════════
// Section Accès Rapides — Grille des outils M365
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import Image from 'next/image';
import { Grid3X3 } from 'lucide-react';
import type { OutilM365 } from '@/types';

interface AccesRapidesProps {
  outils: OutilM365[];
}

export default function AccesRapidesSection({ outils }: AccesRapidesProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 card-hover animate-fade-in-up delay-1"
      style={{ boxShadow: 'var(--shadow-card)' }}
      id="section-acces-rapides"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Accès rapides</h2>
        </div>
        <Link
          href="/outils"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors focus-ring"
          id="link-tous-outils"
        >
          Voir tous les outils
        </Link>
      </div>

      {/* Grille d'outils */}
      <div className="grid grid-cols-3 gap-3">
        {outils.map((outil) => (
          <a
            key={outil.nom}
            href={outil.url}
            target={outil.url.startsWith('/') ? '_self' : '_blank'}
            rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-alt transition-all duration-200 group focus-ring"
            id={`outil-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="w-11 h-11 relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Image
                src={outil.icone}
                alt={outil.nom}
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-medium text-text-secondary group-hover:text-primary transition-colors text-center leading-tight">
              {outil.nom}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
