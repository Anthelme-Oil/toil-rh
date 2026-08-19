'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Validations Équipe (N+1) (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { UserCheck, Loader2, Calendar, FileText, CheckCircle2, Check, X, User } from 'lucide-react';
import type { DemandeConge } from '@/types';
import { DemandeStatusBadge } from './DemandeStatusBadge';

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
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');

  const pendingList = congesN1List.filter((item) => {
    const s = (item.statut || '').toUpperCase();
    return s === 'EN ATTENTE DE VALIDATION' || s === 'EN_ATTENTE' || s === 'EN_ATTENTE_N1';
  });

  const displayedList = filterMode === 'pending' ? pendingList : congesN1List;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Validations N+1 (Équipes)
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Demandes d&apos;absence soumises à votre validation hiérarchique ({userEmail}).
          </p>
        </div>

        {/* Toggle de filtre dynamique */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ À traiter ({pendingList.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Toutes ({congesN1List.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-secondary text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span>Chargement des demandes d&apos;équipe...</span>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-8 text-center bg-amber-50/40 rounded-2xl border border-amber-200 text-amber-900 text-sm space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-base text-slate-900">Tout est à jour !</p>
          <p className="text-xs text-slate-600">
            {filterMode === 'pending'
              ? 'Aucune demande de congé en attente de votre validation N+1.'
              : 'Aucune demande enregistrée dans votre périmètre N+1.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((item) => {
            const s = (item.statut || '').toUpperCase();
            const isPendingN1 =
              s === 'EN ATTENTE DE VALIDATION' || s === 'EN_ATTENTE' || s === 'EN_ATTENTE_N1';

            const initials = item.demandeurNom
              ? item.demandeurNom.slice(0, 2).toUpperCase()
              : item.demandeurEmail
              ? item.demandeurEmail.slice(0, 2).toUpperCase()
              : 'U';

            return (
              <div
                key={item.id}
                className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
              >
                {/* Ligne d'en-tête de la demande */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{item.titre}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          {item.typeConge || 'Congé Payé'}
                        </span>
                        {item.dateCreation && (
                          <span className="text-[11px] text-slate-400">
                            Demandé le {new Date(item.dateCreation).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto">
                    <DemandeStatusBadge statut={item.statut} />
                  </div>
                </div>

                {/* ── Bloc Résumé : Demandeur, Motif, Dates & Durée ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl text-xs text-slate-700 border border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Demandeur
                      </span>
                      <span className="font-bold text-slate-900 block truncate">
                        {item.demandeurNom || 'Non renseigné'}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {item.demandeurEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Motif de la demande
                      </span>
                      <span className="font-medium text-slate-800 block truncate">
                        {item.motif || 'Non précisé'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Période & Durée
                      </span>
                      <span className="font-semibold text-slate-900 block">
                        {item.dateDebut
                          ? new Date(item.dateDebut).toLocaleDateString('fr-FR')
                          : '-'}
                        {' ➔ '}
                        {item.dateFin
                          ? new Date(item.dateFin).toLocaleDateString('fr-FR')
                          : '-'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">
                        ({item.nombreJours} jour(s))
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Pied avec actions (Boutons masqués si déjà validé N+1) ── */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  {isPendingN1 ? (
                    <>
                      <button
                        onClick={() =>
                          item.id && onTraiterConge(item.id, 'REFUSER', 'N1', undefined, item)
                        }
                        className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 text-red-600" />
                        <span>Refuser</span>
                      </button>

                      <button
                        onClick={() =>
                          item.id && onTraiterConge(item.id, 'APPROUVER', 'N1', undefined, item)
                        }
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Valider N+1</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        Validée au niveau N+1 — Transmise à la DRH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
