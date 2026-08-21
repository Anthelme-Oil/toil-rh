'use client';

// ═══════════════════════════════════════════════════════════════
// Component — Badges de Statut pour Demandes & Services
// Directement adapté aux rôles N+1, DRH, RH & Collaborateur
// ═══════════════════════════════════════════════════════════════

import { Clock, ShieldCheck, Printer, CheckCircle2, XCircle } from 'lucide-react';

interface DemandeStatusBadgeProps {
  statut: string;
  className?: string;
}

export function DemandeStatusBadge({ statut, className = '' }: DemandeStatusBadgeProps) {
  const s = (statut || '').toUpperCase().trim();

  // 1. EN ATTENTE RH / DRH
  if (
    s === 'EN_ATTENTE_RH' ||
    s === 'EN ATTENTE RH' ||
    s === 'EN_ATTENTE_DRH' ||
    s === 'EN ATTENTE DE VALIDATION DRH'
  ) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200/80 flex items-center gap-1.5 shadow-2xs ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>EN ATTENTE RH</span>
      </span>
    );
  }

  // 2. EN ATTENTE IMPRESSION / TRAITEMENT RH
  if (
    s === 'VALIDEE_DRH' ||
    s === 'EN_ATTENTE_IMPRESSION' ||
    s === 'EN ATTENTE IMPRESSION' ||
    s === 'VALIDÉE DRH (À TRAITER RH)'
  ) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-900 border border-cyan-200/80 flex items-center gap-1.5 shadow-2xs ${className}`}
      >
        <Printer className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
        <span>EN ATTENTE IMPRESSION</span>
      </span>
    );
  }

  // 3. ACCORDÉ / TRAITÉE / DOCUMENT DISPONIBLE
  if (
    s === 'ACCORDÉE' ||
    s === 'ACCORDEE' ||
    s === 'APPROUVE' ||
    s === 'APPROUVÉE' ||
    s === 'TRAITEE' ||
    s === 'TRAITÉE' ||
    s === 'ACCORDÉ' ||
    s === 'DOCUMENT DISPONIBLE'
  ) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>ACCORDÉ</span>
      </span>
    );
  }

  // 4. REFUSÉ / REFUSÉE / REFUSEE DRH
  if (
    s === 'REFUSÉE' ||
    s === 'REFUSEE' ||
    s === 'REFUSE' ||
    s === 'REFUSEE_DRH' ||
    s === 'REFUSÉ' ||
    s === 'REFUSÉE PAR DRH'
  ) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-900 border border-red-200/80 flex items-center gap-1.5 shadow-2xs ${className}`}
      >
        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span>REFUSÉ</span>
      </span>
    );
  }

  // 5. EN ATTENTE N+1 (Par Défaut)
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>EN ATTENTE VALIDATION N+1</span>
    </span>
  );
}
