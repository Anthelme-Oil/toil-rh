'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Validations Équipe (N+1) (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { UserCheck, Clock, Loader2 } from 'lucide-react';
import type { DemandeConge } from '@/types';

interface ValidationsN1TabProps {
  isLoading: boolean;
  congesN1List: DemandeConge[];
  userEmail: string | null;
  onTraiterConge: (
    id: string,
    action: 'APPROUVER' | 'REFUSER',
    role: 'N1',
    motifRefus?: string,
    item?: DemandeConge
  ) => void;
}

export function ValidationsN1Tab({
  isLoading,
  congesN1List,
  userEmail,
  onTraiterConge,
}: ValidationsN1TabProps) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6 animate-fade-in">
      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-amber-500" />
        Demandes de congé à valider (N+1)
      </h2>
      <p className="text-sm text-text-secondary">
        Demandes d&apos;absence adressées à vous ({userEmail}) en tant que supérieur hiérarchique.
      </p>

      {isLoading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          Chargement des demandes...
        </div>
      ) : congesN1List.length === 0 ? (
        <div className="p-8 text-center bg-amber-50/50 rounded-xl border border-amber-200 text-amber-900 text-sm">
          <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="font-bold">Aucune demande en attente de votre validation N+1.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {congesN1List.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {item.typeConge}
                  </span>
                  <span className="text-xs text-text-muted">
                    du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'}{' '}
                    au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                <p className="text-xs text-text-secondary">
                  Statut : <span className="font-semibold text-amber-700">{item.statut}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => item.id && onTraiterConge(item.id, 'APPROUVER', 'N1', undefined, item)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Valider N+1
                </button>
                <button
                  onClick={() => item.id && onTraiterConge(item.id, 'REFUSER', 'N1', undefined, item)}
                  className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
