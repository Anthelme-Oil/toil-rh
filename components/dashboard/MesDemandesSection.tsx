// ═══════════════════════════════════════════════════════════════
// Section Mes Demandes — Suivi des demandes internes
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import {
  ClipboardList,
  Package,
  KeyRound,
  Monitor,
  FileText,
  ChevronRight,
  Eye,
} from 'lucide-react';
import type { CompteursDemandesParType } from '@/types';

interface MesDemandesProps {
  compteurs: CompteursDemandesParType;
}

const demandeItems = [
  {
    type: 'materiel' as const,
    label: 'Demande de matériel',
    description: "Demande d'équipement et de fourniture",
    icon: Package,
    href: '/demandes?type=materiel',
    color: 'text-primary',
    bgColor: 'bg-primary-50',
  },
  {
    type: 'acces' as const,
    label: "Demande d'accès",
    description: "Demandes d'accès aux applications",
    icon: KeyRound,
    href: '/demandes?type=acces',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    type: 'it' as const,
    label: 'Demande IT',
    description: 'Incident, assistance ou support technique',
    icon: Monitor,
    href: '/demandes?type=it',
    color: 'text-amber',
    bgColor: 'bg-amber-50',
  },
  {
    type: 'rh' as const,
    label: 'Demande RH',
    description: 'Congés, attestations, documents administratifs',
    icon: FileText,
    href: '/demandes?type=rh',
    color: 'text-accent',
    bgColor: 'bg-accent-50',
  },
];

export default function MesDemandesSection({ compteurs }: MesDemandesProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 card-hover animate-fade-in-up delay-2"
      style={{ boxShadow: 'var(--shadow-card)' }}
      id="section-mes-demandes"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Mes demandes</h2>
        </div>
        <Link
          href="/demandes"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors focus-ring"
          id="link-toutes-demandes"
        >
          Voir toutes mes demandes
        </Link>
      </div>

      {/* Liste des types de demandes */}
      <div className="space-y-2">
        {demandeItems.map((item) => {
          const Icon = item.icon;
          const count = compteurs[item.type];

          return (
            <Link
              key={item.type}
              href={item.href}
              className="flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-surface-alt transition-colors duration-200 group"
              id={`demande-${item.type}`}
            >
              <div
                className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-1">
                  {item.description}
                </p>
              </div>
              {count > 0 && (
                <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0 badge-pulse">
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Lien suivi des demandes */}
        <Link
          href="/demandes/suivi"
          className="flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-surface-alt transition-colors duration-200 group mt-1"
          id="demande-suivi"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
              Suivi de mes demandes
            </h3>
            <p className="text-xs text-text-secondary">
              Consulter l&apos;état et l&apos;historique
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}
