'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Validations DRH & Traitements RH (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { Landmark, FileCheck, ShieldCheck, FileText, CheckCircle2, Printer, Loader2, Calendar, User } from 'lucide-react';
import type { DemandeConge } from '@/types';
import { DemandeStatusBadge } from './DemandeStatusBadge';

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
          Workflow DRH (Validation / Refus) et Traitement RH (Impression / Mise à disposition).
        </p>

        {isLoadingDomiciliations ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Chargement des domiciliations...</span>
          </div>
        ) : domiciliationsList.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/40 rounded-xl border border-emerald-200 text-emerald-800 text-sm">
            Aucune demande de domiciliation bancaire enregistrée.
          </div>
        ) : (
          <div className="space-y-4">
            {domiciliationsList.map((item) => {
              const initials = item.nomDemandeur
                ? item.nomDemandeur.slice(0, 2).toUpperCase()
                : item.emailDemandeur
                ? item.emailDemandeur.slice(0, 2).toUpperCase()
                : 'U';

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
                >
                  {/* En-tête Carte */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {item.banque} — Agence {item.agenceBancaire}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700">{item.nomDemandeur}</span>
                          <span>({item.emailDemandeur})</span>
                        </p>
                      </div>
                    </div>

                    <div className="self-start sm:self-auto">
                      <DemandeStatusBadge statut={item.statut} />
                    </div>
                  </div>

                  {/* ── Bloc Résumé : Demandeur, Motif / Agence, Dates ── */}
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
                          {item.nomDemandeur || 'Non renseigné'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.emailDemandeur}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Établissement & RIB
                        </span>
                        <span className="font-medium text-slate-800 block truncate">
                          {item.banque} ({item.agenceBancaire})
                        </span>
                        {item.ribUrl && (
                          <a
                            href={item.ribUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold"
                          >
                            <FileText className="w-3 h-3" /> Voir le RIB
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Date souhaitée
                        </span>
                        <span className="font-semibold text-slate-900 block">
                          {item.dateSouhaitee
                            ? new Date(item.dateSouhaitee).toLocaleDateString('fr-FR')
                            : 'Date non définie'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {item.statut === 'EN_ATTENTE_DRH' && (isDRH || isAdmin) && (
                      <>
                        <button
                          onClick={() => onTraiterDomiciliationDRH(item.id, 'REFUSER')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => onTraiterDomiciliationDRH(item.id, 'VALIDER')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                        >
                          Valider (DRH)
                        </button>
                      </>
                    )}

                    {item.statut === 'VALIDEE_DRH' && (isRH || isRHPrint || isAdmin) && (
                      <button
                        onClick={() => onTraiterDomiciliationRH(item.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marquer comme Traitée / Imprimée
                      </button>
                    )}

                    {item.statut === 'TRAITEE' && (
                      <button
                        onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Voir / Imprimer Doc Officiel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Chargement des demandes d&apos;attestations...</span>
          </div>
        ) : attestationsList.length === 0 ? (
          <div className="p-6 text-center bg-blue-50/40 rounded-xl border border-blue-200 text-blue-900 text-sm">
            Aucune demande d&apos;attestation de travail enregistrée.
          </div>
        ) : (
          <div className="space-y-4">
            {attestationsList.map((item) => {
              const initials = item.nomDemandeur
                ? item.nomDemandeur.slice(0, 2).toUpperCase()
                : item.emailDemandeur
                ? item.emailDemandeur.slice(0, 2).toUpperCase()
                : 'U';

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
                >
                  {/* En-tête Carte */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Attestation — Société {item.societe}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700">{item.nomDemandeur}</span>
                          <span>({item.emailDemandeur})</span>
                        </p>
                      </div>
                    </div>

                    <div className="self-start sm:self-auto">
                      <DemandeStatusBadge statut={item.statut} />
                    </div>
                  </div>

                  {/* ── Bloc Résumé : Demandeur, Motif, Dates ── */}
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
                          {item.nomDemandeur || 'Non renseigné'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.emailDemandeur}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Motif de l&apos;attestation
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
                          Date de soumission
                        </span>
                        <span className="font-semibold text-slate-900 block">
                          {item.dateCreation
                            ? new Date(item.dateCreation).toLocaleDateString('fr-FR')
                            : 'ND'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.motifRefus && (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                      Motif du refus : {item.motifRefus}
                    </p>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {item.statut === 'EN_ATTENTE_DRH' && (isDRH || isAdmin) && (
                      <>
                        <button
                          onClick={() => onTraiterAttestationDRH(item.id, 'REFUSER')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => onTraiterAttestationDRH(item.id, 'VALIDER')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                        >
                          Valider DRH
                        </button>
                      </>
                    )}

                    {item.statut === 'VALIDEE_DRH' && (isRH || isRHPrint || isAdmin) && (
                      <button
                        onClick={() => onTraiterAttestationRH(item.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Générer & Mettre à dispo
                      </button>
                    )}

                    {item.statut === 'TRAITEE' && (
                      <button
                        onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Voir / Imprimer Doc Officiel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 3: Demandes de Congé DRH ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Demandes de congé à valider (DRH) ({congesRhList.length})
        </h2>

        {isLoadingConges ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Chargement des congés...</span>
          </div>
        ) : congesRhList.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-900 text-sm">
            Toutes les demandes de congés DRH sont à jour.
          </div>
        ) : (
          <div className="space-y-4">
            {congesRhList.map((item) => {
              const initials = item.demandeurNom
                ? item.demandeurNom.slice(0, 2).toUpperCase()
                : item.demandeurEmail
                ? item.demandeurEmail.slice(0, 2).toUpperCase()
                : 'U';

              const isPendingRH = item.statut === 'EN_ATTENTE_RH';

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
                >
                  {/* En-tête Carte */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{item.titre}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700">{item.demandeurNom}</span>
                          <span>({item.demandeurEmail})</span>
                        </p>
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
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Type & Motif
                        </span>
                        <span className="font-medium text-slate-800 block truncate">
                          {item.typeConge} — {item.motif || 'Non précisé'}
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

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {isPendingRH && (isDRH || isRH || isAdmin) ? (
                      <>
                        <button
                          onClick={() => item.id && onTraiterConge(item.id, 'REFUSER', 'RH', undefined, item)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => item.id && onTraiterConge(item.id, 'APPROUVER', 'RH', undefined, item)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                        >
                          Valider DRH
                        </button>
                      </>
                    ) : (item.statut === 'Accordée' || item.statut === 'APPROUVEE') ? (
                      <button
                        onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Printer className="w-4 h-4 text-white" />
                        <span>Imprimer Attestation de Congé</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
