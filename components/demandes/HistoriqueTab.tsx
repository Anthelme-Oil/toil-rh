'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Historique des Demandes Collaborateur (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { Landmark, FileCheck, Plus, Printer, Loader2 } from 'lucide-react';
import type { DemandeConge } from '@/types';

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Mes demandes ({userEmail})
          </h2>
          <button
            onClick={onNewDemandeClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouvelle demande
          </button>
        </div>

        {/* ── Domiciliations de l'utilisateur ── */}
        {domiciliationsList.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-border">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" /> Demandes de Domiciliation Bancaire
            </h3>
            {domiciliationsList.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.banque} — Agence {item.agenceBancaire}
                  </h4>
                  <p className="text-xs text-slate-500">Date souhaitée : {item.dateSouhaitee}</p>
                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      item.statut === 'TRAITEE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.statut === 'REFUSEE_DRH'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.statut === 'TRAITEE'
                      ? 'Document Disponible'
                      : item.statut === 'REFUSEE_DRH'
                      ? 'Refusée'
                      : 'En cours de validation'}
                  </span>

                  {item.statut === 'TRAITEE' && (
                    <button
                      onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Voir / Imprimer Domiciliation</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Attestations de travail de l'utilisateur ── */}
        {attestationsList.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-border">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" /> Demandes d&apos;Attestation de Travail
            </h3>
            {attestationsList.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Société : {item.societe}</h4>
                  <p className="text-xs text-slate-500">Motif : {item.motif}</p>
                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      item.statut === 'TRAITEE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.statut === 'REFUSEE_DRH'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.statut === 'TRAITEE'
                      ? 'Document Disponible'
                      : item.statut === 'REFUSEE_DRH'
                      ? 'Refusée'
                      : 'En cours de validation'}
                  </span>

                  {item.statut === 'TRAITEE' && (
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Voir / Imprimer Attestation</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Congés de l'utilisateur ── */}
        <div className="divide-y divide-border">
          {isLoadingConges ? (
            <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Chargement de vos demandes...
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
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-muted">ID: #{item.id}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-200">
                      {item.typeConge}
                    </span>
                    <span className="text-xs text-text-muted">
                      • du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'}{' '}
                      au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      item.statut?.toLowerCase().includes('accord') ||
                      item.statut?.toLowerCase().includes('approuv')
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.statut?.toLowerCase().includes('refus')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.statut || 'En attente'}
                  </span>

                  {(item.statut?.toLowerCase().includes('accord') ||
                    item.statut?.toLowerCase().includes('approuv')) && (
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
