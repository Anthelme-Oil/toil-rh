'use client';

// ═══════════════════════════════════════════════════════════════
// Section Accès Rapides — Dashboard principal
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Accès rapides</h2>
        </div>
        <Link
          href="/outils"
          className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors focus-ring"
          id="link-tous-outils"
        >
          Voir tous les outils →
        </Link>
      </div>

      {/* Grille d'outils (Preview des outils clés) */}
      <div className="grid grid-cols-4 gap-2.5">
        {outils.slice(0, 8).map((outil) => (
          <a
            key={outil.nom}
            href={outil.url}
            target={outil.url.startsWith('/') ? '_self' : '_blank'}
            rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-surface-alt transition-all duration-200 group focus-ring border border-transparent hover:border-border"
            id={`outil-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="w-10 h-10 relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Image
                src={outil.icone}
                alt={outil.nom}
                width={40}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain"
              />
            </div>
            <span className="text-[11px] font-semibold text-text-secondary group-hover:text-primary transition-colors text-center leading-tight truncate w-full">
              {outil.nom}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
