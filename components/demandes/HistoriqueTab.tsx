'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Historique des Demandes Collaborateur (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { Landmark, FileCheck, Plus, Printer, Loader2, Calendar, FileText, User } from 'lucide-react';
import type { DemandeConge } from '@/types';
import { DemandeStatusBadge } from './DemandeStatusBadge';

interface HistoriqueTabProps {
  userEmail: string | null;
  domiciliationsList: any[];
  attestationsList: any[];
  congesHistory: DemandeConge[];
  isLoadingConges: boolean;
  onNewDemandeClick: () => void;
}

export function HistoriqueTab({
  userEmail,
  domiciliationsList,
  attestationsList,
  congesHistory,
  isLoadingConges,
  onNewDemandeClick,
}: HistoriqueTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Mes demandes ({userEmail})
            </h2>
            <p className="text-sm text-text-secondary">
              Suivi et historique de toutes vos demandes de services et d&apos;absences.
            </p>
          </div>
          <button
            onClick={onNewDemandeClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouvelle demande
          </button>
        </div>

        {/* ── Domiciliations de l'utilisateur ── */}
        {domiciliationsList.length > 0 && (
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" /> Demandes de Domiciliation Bancaire
            </h3>
            {domiciliationsList.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.banque} — Agence {item.agenceBancaire}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date souhaitée : {item.dateSouhaitee || 'ND'}
                    </p>
                  </div>
                  <div>
                    <DemandeStatusBadge statut={item.statut} />
                  </div>
                </div>

                {/* Summary box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl text-xs border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Demandeur : <strong>{item.nomDemandeur || userEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Banque : <strong>{item.banque} ({item.agenceBancaire})</strong></span>
                  </div>
                </div>

                {item.motifRefus && (
                  <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                    Motif du refus : {item.motifRefus}
                  </p>
                )}

                {item.statut === 'TRAITEE' && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Voir / Imprimer Domiciliation</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Attestations de travail de l'utilisateur ── */}
        {attestationsList.length > 0 && (
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" /> Demandes d&apos;Attestation de Travail
            </h3>
            {attestationsList.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Société : {item.societe}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Motif : {item.motif}</p>
                  </div>
                  <div>
                    <DemandeStatusBadge statut={item.statut} />
                  </div>
                </div>

                {/* Summary box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl text-xs border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Demandeur : <strong>{item.nomDemandeur || userEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Créée le : <strong>{item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : 'ND'}</strong></span>
                  </div>
                </div>

                {item.motifRefus && (
                  <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                    Motif du refus : {item.motifRefus}
                  </p>
                )}

                {item.statut === 'TRAITEE' && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Voir / Imprimer Attestation</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Congés de l'utilisateur ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" /> Demandes de Congés & Absences
          </h3>

          {isLoadingConges ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Chargement de vos demandes de congé...</span>
            </div>
          ) : congesHistory.length === 0 &&
            domiciliationsList.length === 0 &&
            attestationsList.length === 0 ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              Aucune demande enregistrée.
            </div>
          ) : (
            congesHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.titre}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.typeConge} — ({item.nombreJours} jour(s))
                    </p>
                  </div>
                  <div>
                    <DemandeStatusBadge statut={item.statut} />
                  </div>
                </div>

                {/* ── Summary Info Box (Demandeur, Motif, Dates) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl text-xs text-slate-700 border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      Demandeur : <strong>{item.demandeurNom || userEmail}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Motif : <strong>{item.motif || 'Non précisé'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Période :{' '}
                      <strong>
                        {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '-'} ➔{' '}
                        {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '-'}
                      </strong>
                    </span>
                  </div>
                </div>

                {(item.statut?.toLowerCase().includes('accord') ||
                  item.statut?.toLowerCase().includes('approuv')) && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer Attestation de Congé</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
