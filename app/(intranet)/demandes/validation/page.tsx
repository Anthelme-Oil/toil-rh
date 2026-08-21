'use client';

// ═══════════════════════════════════════════════════════════════
// Espace Validation Manager (N+1) & DRH — T-OIL Intranet
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Clock,
  User,
  Calendar,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Search,
  Printer,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import type { DemandeConge } from '@/types';
import { DemandeStatusBadge } from '@/components/demandes/DemandeStatusBadge';

export default function ValidationDemandesPage() {
  const { userEmail, isManager, isRH, isDRH, isRHPrint, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<'n1' | 'rh'>('n1');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

  const [demandesN1, setDemandesN1] = useState<DemandeConge[]>([]);
  const [demandesRH, setDemandesRH] = useState<DemandeConge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Modal / Champ de motif pour Refus
  const [refusingDemande, setRefusingDemande] = useState<DemandeConge | null>(null);
  const [motifRefus, setMotifRefus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchDemandes = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      // 1. Demandes à valider en tant que N+1
      const resN1 = await fetch(`/api/demandes/conges?email=${encodeURIComponent(userEmail)}&role=n1&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (resN1.ok) {
        const dataN1 = await resN1.json();
        setDemandesN1(dataN1.demandes || []);
      }

      // 2. Demandes à valider en tant que RH (DRH)
      if (isDRH || isRH || isRHPrint || isAdmin) {
        const resRH = await fetch(`/api/demandes/conges?email=${encodeURIComponent(userEmail)}&role=rh&_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (resRH.ok) {
          const dataRH = await resRH.json();
          setDemandesRH(dataRH.demandes || []);
        }
      }
    } catch (err) {
      console.error('[Validation] Erreur récupération demandes:', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, isDRH, isRH, isRHPrint, isAdmin]);

  useEffect(() => {
    fetchDemandes();
  }, [fetchDemandes]);

  // Définir l'onglet par défaut et sécurité d'accès
  useEffect(() => {
    if (!isManager && (isDRH || isRH || isRHPrint || isAdmin)) {
      setActiveTab('rh');
    }
  }, [isManager, isDRH, isRH, isRHPrint, isAdmin]);

  useEffect(() => {
    if (!isDRH && !isRH && !isRHPrint && !isAdmin && activeTab === 'rh') {
      setActiveTab('n1');
    }
  }, [isDRH, isRH, isRHPrint, isAdmin, activeTab]);

  const handleTraiter = async (
    demandeId: string,
    action: 'APPROUVER' | 'REFUSER',
    role: 'N1' | 'RH',
    reason?: string
  ) => {
    setActionId(demandeId);

    // Optimistic state update immediately
    if (role === 'N1') {
      setDemandesN1((prev) =>
        prev.map((d) =>
          d.id === demandeId
            ? {
                ...d,
                statut: action === 'APPROUVER' ? 'EN_ATTENTE_RH' : 'Refusée',
              }
            : d
        )
      );
    } else {
      setDemandesRH((prev) =>
        prev.map((d) =>
          d.id === demandeId
            ? {
                ...d,
                statut: action === 'APPROUVER' ? 'Accordée' : 'Refusée',
              }
            : d
        )
      );
    }

    try {
      const res = await fetch('/api/demandes/conges/traiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: demandeId,
          action,
          role,
          motifRefus: reason || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          message: action === 'APPROUVER' ? 'Demande approuvée avec succès.' : 'Demande refusée.',
          type: 'success',
        });
        setRefusingDemande(null);
        setMotifRefus('');
        await fetchDemandes();
        setTimeout(() => setNotification(null), 3500);
      } else {
        throw new Error(data.error || 'Erreur lors du traitement.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setNotification({ message: msg, type: 'error' });
      await fetchDemandes();
    } finally {
      setActionId(null);
    }
  };

  const pendingN1List = demandesN1.filter((d) => {
    const s = (d.statut || '').toUpperCase();
    return s === 'EN ATTENTE DE VALIDATION' || s === 'EN_ATTENTE' || s === 'EN_ATTENTE_N1';
  });

  const pendingRHList = demandesRH.filter((d) => {
    const s = (d.statut || '').toUpperCase();
    return s === 'EN_ATTENTE_RH' || s === 'EN ATTENTE RH' || s === 'EN_ATTENTE_DRH';
  });

  const pendingN1Count = pendingN1List.length;
  const pendingRHCount = pendingRHList.length;

  const currentDemandes = activeTab === 'n1' ? demandesN1 : demandesRH;
  const filteredDemandes = currentDemandes.filter((d) => {
    const s = (d.statut || '').toUpperCase();
    if (filterStatus === 'pending') {
      if (activeTab === 'n1' && s !== 'EN ATTENTE DE VALIDATION' && s !== 'EN_ATTENTE' && s !== 'EN_ATTENTE_N1') {
        return false;
      }
      if (activeTab === 'rh' && s !== 'EN_ATTENTE_RH' && s !== 'EN ATTENTE RH' && s !== 'EN_ATTENTE_DRH') {
        return false;
      }
    }
    const q = searchQuery.toLowerCase();
    return (
      d.demandeurNom?.toLowerCase().includes(q) ||
      d.demandeurEmail?.toLowerCase().includes(q) ||
      d.titre?.toLowerCase().includes(q) ||
      d.motif?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-emerald-600" />
            Espace Validation Manager & DRH
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les approbations de demandes de congés et d'absences attribuées à votre responsabilité.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDemandes}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Onglets de Rôle (N+1 vs DRH/RH) & Sous-Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {(isManager || isAdmin) && (
            <button
              onClick={() => setActiveTab('n1')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'n1'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Équipes N+1</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'n1'
                    ? pendingN1Count > 0 ? 'bg-amber-400 text-amber-950' : 'bg-white/20 text-white'
                    : pendingN1Count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {pendingN1Count > 0 ? `${pendingN1Count} à traiter` : demandesN1.length}
              </span>
            </button>
          )}

          {(isDRH || isRH || isRHPrint || isAdmin) && (
            <button
              onClick={() => setActiveTab('rh')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rh'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Espace DRH</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'rh'
                    ? pendingRHCount > 0 ? 'bg-amber-400 text-amber-950' : 'bg-white/20 text-white'
                    : pendingRHCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {pendingRHCount > 0 ? `${pendingRHCount} à traiter` : demandesRH.length}
              </span>
            </button>
          )}
        </div>

        {/* Sous-Filtres: À traiter vs Toutes */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ À traiter ({activeTab === 'n1' ? pendingN1Count : pendingRHCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Toutes ({activeTab === 'n1' ? demandesN1.length : demandesRH.length})
          </button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de collaborateur, email ou motif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-transparent text-sm focus:outline-none text-slate-800"
          />
        </div>
        <div className="text-xs font-medium text-slate-500 pr-2">
          {filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des Demandes */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Chargement des demandes à valider...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Tout est à jour !</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Aucune demande en attente de validation n'est actuellement attribuée à ce rôle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDemandes.map((demande) => {
            const mainAttachment = demande.piecesJointes?.[0] || (demande.pieceJointeUrl ? { name: 'Pièce jointe', url: demande.pieceJointeUrl } : null);

            const s = (demande.statut || '').toUpperCase();
            const isPendingN1 = activeTab === 'n1' && (s === 'EN ATTENTE DE VALIDATION' || s === 'EN_ATTENTE' || s === 'EN_ATTENTE_N1');
            const isPendingRH = activeTab === 'rh' && (s === 'EN_ATTENTE_RH' || s === 'EN ATTENTE RH' || s === 'EN_ATTENTE_DRH');

            const initials = demande.demandeurNom
              ? demande.demandeurNom.slice(0, 2).toUpperCase()
              : demande.demandeurEmail
              ? demande.demandeurEmail.slice(0, 2).toUpperCase()
              : 'U';

            return (
              <div
                key={demande.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* En-tête de la demande */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{demande.titre}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-700">{demande.demandeurNom}</span>
                        <span>({demande.demandeurEmail})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DemandeStatusBadge statut={demande.statut} />
                  </div>
                </div>

                {/* ── Bloc Résumé Demandeur, Motif, Période & Durée ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-3.5 rounded-xl text-xs text-slate-700 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Demandeur</span>
                      <span className="font-bold text-slate-900 block truncate">{demande.demandeurNom || 'Non renseigné'}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{demande.demandeurEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Motif de la demande</span>
                      <span className="font-medium text-slate-800 block truncate">{demande.motif || 'Non précisé'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Période & Durée</span>
                      <span className="font-semibold text-slate-900 block">
                        {demande.dateDebut ? new Date(demande.dateDebut).toLocaleDateString('fr-FR') : '-'}
                        {' ➔ '}
                        {demande.dateFin ? new Date(demande.dateFin).toLocaleDateString('fr-FR') : '-'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">({demande.nombreJours} jour(s))</span>
                    </div>
                  </div>
                </div>

                {/* Fichier / Justificatif SharePoint */}
                {mainAttachment && (
                  <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-950 truncate">
                        Justificatif : {mainAttachment.name}
                      </span>
                    </div>

                    {mainAttachment.url ? (
                      <a
                        href={mainAttachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <span>Ouvrir dans SharePoint</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Document joint</span>
                    )}
                  </div>
                )}

                {/* Actions Approbation / Refus ou Impression */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  {demande.statut === 'Accordée' || demande.statut === 'APPROUVEE' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/demandes/attestation/${demande.id}`, '_blank')}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-emerald-700" />
                        <span>Imprimer l&apos;Attestation</span>
                      </button>
                    </div>
                  ) : activeTab === 'n1' && !isPendingN1 ? (
                    <span className="text-xs text-teal-900 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Validée par vous — Transmise à la DRH
                    </span>
                  ) : (isPendingN1 || isPendingRH) && ((activeTab === 'n1' && (isManager || isAdmin)) || (activeTab === 'rh' && (isDRH || isRH || isAdmin))) ? (
                    <>
                      <button
                        onClick={() => setRefusingDemande(demande)}
                        disabled={actionId === demande.id}
                        className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4 text-red-600" />
                        <span>Refuser</span>
                      </button>

                      <button
                        onClick={() =>
                          handleTraiter(demande.id!, 'APPROUVER', activeTab === 'n1' ? 'N1' : 'RH')
                        }
                        disabled={actionId === demande.id}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {actionId === demande.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>{activeTab === 'n1' ? 'Approuver (N+1)' : 'Approuver (DRH)'}</span>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Saisie du Motif de Refus */}
      {refusingDemande && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Refuser la demande
              </h3>
              <button
                onClick={() => setRefusingDemande(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Veuillez indiquer le motif du refus pour la demande de{' '}
              <strong className="text-slate-900">{refusingDemande.demandeurNom}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif du refus (obligatoire) :
              </label>
              <textarea
                rows={3}
                required
                placeholder="ex: Dates incompatibles avec le planning d'équipe..."
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRefusingDemande(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!motifRefus.trim() || actionId === refusingDemande.id}
                onClick={() =>
                  handleTraiter(
                    refusingDemande.id!,
                    'REFUSER',
                    activeTab === 'n1' ? 'N1' : 'RH',
                    motifRefus
                  )
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionId === refusingDemande.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
