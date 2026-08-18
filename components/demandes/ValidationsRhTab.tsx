'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Validations DRH & Traitements RH (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { Landmark, FileCheck, ShieldCheck, FileText, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import type { DemandeConge } from '@/types';

interface ValidationsRhTabProps {
  isLoadingDomiciliations: boolean;
  domiciliationsList: any[];
  isLoadingAttestations: boolean;
  attestationsList: any[];
  isLoadingConges: boolean;
  congesRhList: DemandeConge[];
  isDRH: boolean;
  isRH: boolean;
  isRHPrint: boolean;
  isAdmin: boolean;
  onTraiterDomiciliationDRH: (demandeId: string, action: 'VALIDER' | 'REFUSER', motifRefus?: string) => void;
  onTraiterDomiciliationRH: (demandeId: string) => void;
  onTraiterAttestationDRH: (demandeId: string, action: 'VALIDER' | 'REFUSER', motifRefus?: string) => void;
  onTraiterAttestationRH: (demandeId: string) => void;
  onTraiterConge: (
    id: string,
    action: 'APPROUVER' | 'REFUSER',
    role: 'RH',
    motifRefus?: string,
    item?: DemandeConge
  ) => void;
}

export function ValidationsRhTab({
  isLoadingDomiciliations,
  domiciliationsList,
  isLoadingAttestations,
  attestationsList,
  isLoadingConges,
  congesRhList,
  isDRH,
  isRH,
  isRHPrint,
  isAdmin,
  onTraiterDomiciliationDRH,
  onTraiterDomiciliationRH,
  onTraiterAttestationDRH,
  onTraiterAttestationRH,
  onTraiterConge,
}: ValidationsRhTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Section 1: Domiciliations Bancaires ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-600" />
          Demandes de Domiciliation Bancaire ({domiciliationsList.length})
        </h2>
        <p className="text-sm text-text-secondary">
          Workflow DRH (Validation / Refus avec motif) et Traitement RH (Mise à disposition du document).
        </p>

        {isLoadingDomiciliations ? (
          <div className="py-6 flex items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            Chargement des domiciliations...
          </div>
        ) : domiciliationsList.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/40 rounded-xl border border-emerald-200 text-emerald-800 text-sm">
            Aucune demande de domiciliation bancaire en attente.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {domiciliationsList.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.banque} ({item.agenceBancaire})
                    </span>
                    <span className="text-xs text-text-muted">
                      Demandée pour le : {item.dateSouhaitee ? new Date(item.dateSouhaitee).toLocaleDateString('fr-FR') : 'ND'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">
                    {item.nomDemandeur} ({item.emailDemandeur})
                  </h3>
                  {item.ribUrl && (
                    <a
                      href={item.ribUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> Voir le RIB joint
                    </a>
                  )}
                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200 mt-1">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.statut === 'EN_ATTENTE_DRH'
                        ? 'bg-amber-100 text-amber-800'
                        : item.statut === 'VALIDEE_DRH'
                        ? 'bg-blue-100 text-blue-800'
                        : item.statut === 'REFUSEE_DRH'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.statut === 'EN_ATTENTE_DRH'
                      ? 'En attente DRH'
                      : item.statut === 'VALIDEE_DRH'
                      ? 'Validée DRH (À traiter)'
                      : item.statut === 'REFUSEE_DRH'
                      ? 'Refusée par DRH'
                      : 'Traitée / Document dispo'}
                  </span>

                  {item.statut === 'EN_ATTENTE_DRH' && (isDRH || isAdmin) && (
                    <>
                      <button
                        onClick={() => onTraiterDomiciliationDRH(item.id, 'VALIDER')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        Valider (DRH)
                      </button>
                      <button
                        onClick={() => onTraiterDomiciliationDRH(item.id, 'REFUSER')}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {item.statut === 'VALIDEE_DRH' && (isRH || isRHPrint || isAdmin) && (
                    <button
                      onClick={() => onTraiterDomiciliationRH(item.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Marquer comme Traitée / Doc Dispo
                    </button>
                  )}

                  {item.statut === 'TRAITEE' && (
                    <button
                      onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Voir / Imprimer Doc Officiel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Attestations de Travail ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          Demandes d&apos;Attestation de Travail ({attestationsList.length})
        </h2>
        <p className="text-sm text-text-secondary">
          Validation DRH et génération du document officiel pour T-OIL, STSL ou COMPEL.
        </p>

        {isLoadingAttestations ? (
          <div className="py-6 flex items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Chargement des demandes d&apos;attestations...
          </div>
        ) : attestationsList.length === 0 ? (
          <div className="p-6 text-center bg-blue-50/40 rounded-xl border border-blue-200 text-blue-900 text-sm">
            Aucune demande d&apos;attestation de travail en attente.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {attestationsList.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {item.societe}
                    </span>
                    <span className="text-xs text-text-muted">
                      Créée le : {item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : 'ND'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">
                    {item.nomDemandeur} ({item.emailDemandeur})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Motif : <strong className="text-slate-800">{item.motif}</strong>
                  </p>
                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200 mt-1">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.statut === 'EN_ATTENTE_DRH'
                        ? 'bg-amber-100 text-amber-800'
                        : item.statut === 'VALIDEE_DRH'
                        ? 'bg-blue-100 text-blue-800'
                        : item.statut === 'REFUSEE_DRH'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.statut === 'EN_ATTENTE_DRH'
                      ? 'En attente DRH'
                      : item.statut === 'VALIDEE_DRH'
                      ? 'Validée DRH (À traiter RH)'
                      : item.statut === 'REFUSEE_DRH'
                      ? 'Refusée par DRH'
                      : 'Attestation Générée / Prête'}
                  </span>

                  {item.statut === 'EN_ATTENTE_DRH' && (isDRH || isAdmin) && (
                    <>
                      <button
                        onClick={() => onTraiterAttestationDRH(item.id, 'VALIDER')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        Valider DRH
                      </button>
                      <button
                        onClick={() => onTraiterAttestationDRH(item.id, 'REFUSER')}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {item.statut === 'VALIDEE_DRH' && (isRH || isRHPrint || isAdmin) && (
                    <button
                      onClick={() => onTraiterAttestationRH(item.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Générer & Mettre à dispo
                    </button>
                  )}

                  {item.statut === 'TRAITEE' && (
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Voir / Imprimer Doc Officiel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 3: Demandes de Congé DRH ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Demandes de congé à valider (DRH)
        </h2>

        {isLoadingConges ? (
          <div className="py-6 flex items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            Chargement des congés...
          </div>
        ) : congesRhList.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-900 text-sm">
            Toutes les demandes de congés sont à jour.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {congesRhList.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.typeConge}
                    </span>
                    <span className="text-xs text-text-muted">
                      du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'} au{' '}
                      {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                  <p className="text-xs text-text-secondary">
                    Demandeur : <span className="font-semibold">{item.demandeurNom || item.demandeurEmail}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.statut === 'Accordée' || item.statut === 'Refusée' ? (
                    <button
                      onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-600" />
                      <span>Imprimer Attestation</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => item.id && onTraiterConge(item.id, 'APPROUVER', 'RH', undefined, item)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Valider DRH
                      </button>
                      <button
                        onClick={() => item.id && onTraiterConge(item.id, 'REFUSER', 'RH', undefined, item)}
                        className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
