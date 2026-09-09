'use client';

// ═══════════════════════════════════════════════════════════════
// Page Demandes & Services — Orchestrateur Senior Modularisé
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  UserCheck,
  UserPlus,
  CalendarDays,
  Landmark,
  FileCheck,
  Box,
  Monitor,
  Wrench,
  ShoppingCart,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { TypeDemande, DemandeConge } from '@/types';
import { DemandeCongeModal } from '@/components/demandes/DemandeCongeModal';
import { DemandeDomiciliationModal } from '@/components/demandes/DemandeDomiciliationModal';
import { DemandeAttestationModal } from '@/components/demandes/DemandeAttestationModal';
import { CatalogueTab, DemandeCategory } from '@/components/demandes/CatalogueTab';
import { ValidationsN1Tab } from '@/components/demandes/ValidationsN1Tab';
import { ValidationsRhTab } from '@/components/demandes/ValidationsRhTab';
import { HistoriqueTab } from '@/components/demandes/HistoriqueTab';
import { RefusalModal } from '@/components/demandes/RefusalModal';
import { DevNoticeModal } from '@/components/demandes/DevNoticeModal';
import { useUser } from '@/context/UserContext';

const DEMANDE_CATEGORIES: DemandeCategory[] = [
  {
    id: 'administrative',
    title: 'Demandes Administratives',
    description: 'Gestion des comptes, RH, congés et attestations',
    color: 'emerald',
    items: [
      {
        id: 'renouvellement_compte' as TypeDemande,
        label: 'Renouvellement de compte IT',
        icon: UserCheck,
        description: "Demande de prolongation ou réactivation d'accès utilisateur IT",
      },
      {
        id: 'creation_suppression_compte' as TypeDemande,
        label: 'Création ou suppression de Compte IT',
        icon: UserPlus,
        description: 'Ouverture pour nouvel arrivant ou clôture de compte',
      },
      {
        id: 'demande_conges' as TypeDemande,
        label: 'Demande d\'absence',
        icon: CalendarDays,
        description: 'Soumission des dates de congés payés ou absences',
      },
      {
        id: 'domiciliation_bancaire' as TypeDemande,
        label: 'Domiciliation Bancaire',
        icon: Landmark,
        description: "Mise à jour du Relevé d'Identité Bancaire (RIB)",
      },
      {
        id: 'attestation_travail' as TypeDemande,
        label: 'Attestation de travail',
        icon: FileCheck,
        description: 'Demande de certificat de travail (T-OIL, STSL, COMPEL)',
      },
    ],
  },
  {
    id: 'it',
    title: 'Demandes IT',
    description: 'Consommables, matériel et support technique',
    color: 'blue',
    items: [
      {
        id: 'consommables' as TypeDemande,
        label: 'Consommables',
        icon: Box,
        description: "Cartouches d'encre, papier, toners et fournitures bureau",
      },
      {
        id: 'materiel_informatique' as TypeDemande,
        label: 'Matériel informatique',
        icon: Monitor,
        description: "Ordinateurs, écrans, souris, claviers et accessoires",
      },
      {
        id: 'maintenance_logicielle' as TypeDemande,
        label: 'Maintenance logicielle / Installation',
        icon: Wrench,
        description: 'Installation de logiciels, mises à jour, correctifs',
      },
      {
        id: 'achat_materiel' as TypeDemande,
        label: 'Achat de matériel spécifique',
        icon: ShoppingCart,
        description: "Demande d'acquisition d'équipements non standards",
      },
    ],
  },
  {
    id: 'autre',
    title: 'Autres Services',
    description: 'Besoins métiers, accès et autorisations',
    color: 'purple',
    items: [
      {
        id: 'besoin_metier' as TypeDemande,
        label: 'Besoin Métier / Evolution',
        icon: Briefcase,
        description: 'Demande de nouvelles fonctionnalités ou droits applicatifs',
      },
      {
        id: 'autorisation_acces' as TypeDemande,
        label: "Autorisation d'accès au site",
        icon: ShieldCheck,
        description: 'Badges visiteurs, accès aux zones sécurisées ou dépôts',
      },
    ],
  },
];

export default function DemandesPage() {
  const { userEmail, isRH, isDRH, isRHPrint, isManager, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<'catalogue' | 'historique' | 'validations_n1' | 'validations_rh'>('catalogue');

  // Modales de workflow
  const [isCongeModalOpen, setIsCongeModalOpen] = useState(false);
  const [isDomiciliationModalOpen, setIsDomiciliationModalOpen] = useState(false);
  const [isAttestationModalOpen, setIsAttestationModalOpen] = useState(false);

  // Lists & Loading
  const [congesHistory, setCongesHistory] = useState<DemandeConge[]>([]);
  const [congesN1List, setCongesN1List] = useState<DemandeConge[]>([]);
  const [congesRhList, setCongesRhList] = useState<DemandeConge[]>([]);
  const [isLoadingConges, setIsLoadingConges] = useState(false);

  const [domiciliationsList, setDomiciliationsList] = useState<any[]>([]);
  const [isLoadingDomiciliations, setIsLoadingDomiciliations] = useState(false);

  const [attestationsList, setAttestationsList] = useState<any[]>([]);
  const [isLoadingAttestations, setIsLoadingAttestations] = useState(false);

  // Client cache
  const congesCacheRef = useRef<Map<string, { data: any[]; fetchedAt: number }>>(new Map());
  const CONGES_CLIENT_CACHE_TTL = 2 * 60 * 1000;

  // Charger les congés
  const loadCongesData = async (tab: string, forceRefresh = false) => {
    if (!userEmail) return;

    const cacheKey = `${tab}:${userEmail}`;
    if (!forceRefresh) {
      const cached = congesCacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.fetchedAt < CONGES_CLIENT_CACHE_TTL) {
        if (tab === 'historique') setCongesHistory(cached.data);
        if (tab === 'validations_n1') setCongesN1List(cached.data);
        if (tab === 'validations_rh') setCongesRhList(cached.data);
        return;
      }
    }

    setIsLoadingConges(true);
    try {
      let url = `/api/demandes/conges?email=${encodeURIComponent(userEmail)}&_t=${Date.now()}`;
      if (tab === 'validations_n1') url += '&role=n1';
      if (tab === 'validations_rh') url += '&role=rh';

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = data.demandes || [];
        congesCacheRef.current.set(cacheKey, { data: list, fetchedAt: Date.now() });

        if (tab === 'historique') setCongesHistory(list);
        if (tab === 'validations_n1') setCongesN1List(list);
        if (tab === 'validations_rh') setCongesRhList(list);
      }
    } catch (err) {
      console.error('Erreur chargement congés:', err);
    } finally {
      setIsLoadingConges(false);
    }
  };

  // Charger les Domiciliations Bancaires
  const loadDomiciliationData = async (tab: string) => {
    if (!userEmail) return;
    setIsLoadingDomiciliations(true);
    try {
      let role = 'collaborateur';
      if (tab === 'validations_rh') role = isDRH ? 'drh' : 'rh';

      const res = await fetch(`/api/demandes/domiciliation?role=${role}&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDomiciliationsList(data.demandes || []);
      }
    } catch (err) {
      console.error('Erreur chargement domiciliations:', err);
    } finally {
      setIsLoadingDomiciliations(false);
    }
  };

  // Charger les Attestations de Travail
  const loadAttestationsData = async (tab: string) => {
    if (!userEmail) return;
    setIsLoadingAttestations(true);
    try {
      let role = 'collaborateur';
      if (tab === 'validations_rh') role = isDRH ? 'drh' : 'rh';

      const res = await fetch(`/api/demandes/attestation?role=${role}&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAttestationsList(data.demandes || []);
      }
    } catch (err) {
      console.error('Erreur chargement attestations:', err);
    } finally {
      setIsLoadingAttestations(false);
    }
  };

  const invalidateCongesCache = () => {
    congesCacheRef.current.clear();
  };

  useEffect(() => {
    loadCongesData(activeTab);
    if (activeTab === 'historique' || activeTab === 'validations_rh') {
      loadDomiciliationData(activeTab);
      loadAttestationsData(activeTab);
    }
  }, [activeTab, userEmail]);

  // État Modale de motif de refus
  const [refusalModal, setRefusalModal] = useState<{
    isOpen: boolean;
    id?: string;
    typeDemande?: 'CONGE' | 'DOMICILIATION' | 'ATTESTATION';
    role?: 'N1' | 'RH' | 'DRH';
    item?: any;
  }>({ isOpen: false });
  const [isSubmittingRefusal, setIsSubmittingRefusal] = useState(false);

  // Modale devNotice
  const [devNoticeItem, setDevNoticeItem] = useState<{ id: string; label: string } | null>(null);

  // Actions Traitement Congé
  const handleTraiterConge = async (
    id: string,
    action: 'APPROUVER' | 'REFUSER',
    role: 'N1' | 'RH',
    motifRefusParam?: string,
    item?: DemandeConge
  ) => {
    if (action === 'REFUSER' && !motifRefusParam) {
      setRefusalModal({ isOpen: true, id, typeDemande: 'CONGE', role, item });
      return;
    }

    // Mise à jour optimiste immédiate de l'interface
    if (role === 'N1') {
      setCongesN1List((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                statut: action === 'APPROUVER' ? 'EN_ATTENTE_RH' : 'Refusée',
              }
            : c
        )
      );
    } else {
      setCongesRhList((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                statut: action === 'APPROUVER' ? 'Accordée' : 'Refusée',
              }
            : c
        )
      );
    }

    try {
      const res = await fetch('/api/demandes/conges/traiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          role,
          motifRefus: motifRefusParam,
          demandeurNom: item?.demandeurNom,
          demandeurEmail: item?.demandeurEmail,
          typeConge: item?.typeConge,
          dateDebut: item?.dateDebut,
          dateFin: item?.dateFin,
          nombreJours: item?.nombreJours,
        }),
      });
      if (res.ok) {
        setRefusalModal({ isOpen: false });
        invalidateCongesCache();
        await loadCongesData(activeTab, true);
      } else {
        await loadCongesData(activeTab, true);
      }
    } catch (err) {
      console.error('Erreur traitement congé:', err);
      await loadCongesData(activeTab, true);
    }
  };

  // Actions Traitement Domiciliation
  const handleTraiterDomiciliationDRH = async (
    demandeId: string,
    action: 'VALIDER' | 'REFUSER',
    motifRefusParam?: string
  ) => {
    if (action === 'REFUSER' && !motifRefusParam) {
      setRefusalModal({ isOpen: true, id: demandeId, typeDemande: 'DOMICILIATION', role: 'DRH' });
      return;
    }

    // Optimistic update
    setDomiciliationsList((prev) =>
      prev.map((d) =>
        d.id === demandeId
          ? {
              ...d,
              statut: action === 'VALIDER' ? 'VALIDEE_DRH' : 'REFUSEE_DRH',
              motifRefus: motifRefusParam || d.motifRefus,
            }
          : d
      )
    );

    try {
      const res = await fetch('/api/demandes/domiciliation/traiter-drh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId, action, motifRefus: motifRefusParam }),
      });
      if (res.ok) {
        setRefusalModal({ isOpen: false });
        await loadDomiciliationData(activeTab);
      } else {
        await loadDomiciliationData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement DRH Domiciliation:', err);
      await loadDomiciliationData(activeTab);
    }
  };

  const handleTraiterDomiciliationRH = async (demandeId: string) => {
    // Optimistic update
    setDomiciliationsList((prev) =>
      prev.map((d) => (d.id === demandeId ? { ...d, statut: 'TRAITEE' } : d))
    );

    try {
      const res = await fetch('/api/demandes/domiciliation/traiter-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId }),
      });
      if (res.ok) {
        await loadDomiciliationData(activeTab);
      } else {
        await loadDomiciliationData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement RH Domiciliation:', err);
      await loadDomiciliationData(activeTab);
    }
  };

  // Actions Traitement Attestation
  const handleTraiterAttestationDRH = async (
    demandeId: string,
    action: 'VALIDER' | 'REFUSER',
    motifRefusParam?: string
  ) => {
    if (action === 'REFUSER' && !motifRefusParam) {
      setRefusalModal({ isOpen: true, id: demandeId, typeDemande: 'ATTESTATION', role: 'DRH' });
      return;
    }

    // Optimistic update
    setAttestationsList((prev) =>
      prev.map((a) =>
        a.id === demandeId
          ? {
              ...a,
              statut: action === 'VALIDER' ? 'VALIDEE_DRH' : 'REFUSEE_DRH',
              motifRefus: motifRefusParam || a.motifRefus,
            }
          : a
      )
    );

    try {
      const res = await fetch('/api/demandes/attestation/traiter-drh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId, action, motifRefus: motifRefusParam }),
      });
      if (res.ok) {
        setRefusalModal({ isOpen: false });
        await loadAttestationsData(activeTab);
      } else {
        await loadAttestationsData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement DRH Attestation:', err);
      await loadAttestationsData(activeTab);
    }
  };

  const handleTraiterAttestationRH = async (demandeId: string) => {
    // Optimistic update
    setAttestationsList((prev) =>
      prev.map((a) => (a.id === demandeId ? { ...a, statut: 'TRAITEE' } : a))
    );

    try {
      const res = await fetch('/api/demandes/attestation/traiter-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId }),
      });
      if (res.ok) {
        await loadAttestationsData(activeTab);
      } else {
        await loadAttestationsData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement RH Attestation:', err);
      await loadAttestationsData(activeTab);
    }
  };

  function handleSelectDemande(item: { id: TypeDemande; label: string }) {
    if (item.id === 'demande_conges') {
      setIsCongeModalOpen(true);
      return;
    }
    if (item.id === 'domiciliation_bancaire') {
      setIsDomiciliationModalOpen(true);
      return;
    }
    if (item.id === 'attestation_travail') {
      setIsAttestationModalOpen(true);
      return;
    }
    setDevNoticeItem(item);
  }

  const handleRefusalSubmit = async (reason: string) => {
    if (!refusalModal.id) return;
    setIsSubmittingRefusal(true);
    try {
      if (refusalModal.typeDemande === 'DOMICILIATION') {
        await handleTraiterDomiciliationDRH(refusalModal.id, 'REFUSER', reason);
      } else if (refusalModal.typeDemande === 'ATTESTATION') {
        await handleTraiterAttestationDRH(refusalModal.id, 'REFUSER', reason);
      } else if (refusalModal.role === 'N1' || refusalModal.role === 'RH') {
        await handleTraiterConge(
          refusalModal.id,
          'REFUSER',
          refusalModal.role,
          reason,
          refusalModal.item
        );
      }
    } finally {
      setIsSubmittingRefusal(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Demandes & Services</span>
      </div>

      {/* ── En-tête & Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Demandes & Services</h1>
            <p className="text-sm text-text-secondary">
              Portail unique des demandes administratives, IT et services internes
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex items-center bg-surface-alt p-1 rounded-xl border border-border flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            Catalogue des demandes
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'historique'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            Mes demandes ({congesHistory.length + domiciliationsList.length + attestationsList.length})
          </button>

          {(isManager || isAdmin) && (
            <button
              onClick={() => setActiveTab('validations_n1')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'validations_n1'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Validations Équipe (N+1) ({congesN1List.length})
            </button>
          )}

          {(isDRH || isRH || isRHPrint || isAdmin) && (
            <button
              onClick={() => setActiveTab('validations_rh')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'validations_rh'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Validation DRH & Treatment ({congesRhList.length + domiciliationsList.length + attestationsList.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs Content ── */}
      {activeTab === 'catalogue' && (
        <CatalogueTab categories={DEMANDE_CATEGORIES} onSelectDemande={handleSelectDemande} />
      )}

      {activeTab === 'validations_n1' && (
        <ValidationsN1Tab
          isLoading={isLoadingConges}
          congesN1List={congesN1List}
          userEmail={userEmail}
          onTraiterConge={handleTraiterConge}
        />
      )}

      {activeTab === 'validations_rh' && (
        <ValidationsRhTab
          isLoadingDomiciliations={isLoadingDomiciliations}
          domiciliationsList={domiciliationsList}
          isLoadingAttestations={isLoadingAttestations}
          attestationsList={attestationsList}
          isLoadingConges={isLoadingConges}
          congesRhList={congesRhList}
          isDRH={isDRH}
          isRH={isRH}
          isRHPrint={isRHPrint}
          isAdmin={isAdmin}
          onTraiterDomiciliationDRH={handleTraiterDomiciliationDRH}
          onTraiterDomiciliationRH={handleTraiterDomiciliationRH}
          onTraiterAttestationDRH={handleTraiterAttestationDRH}
          onTraiterAttestationRH={handleTraiterAttestationRH}
          onTraiterConge={handleTraiterConge}
        />
      )}

      {activeTab === 'historique' && (
        <HistoriqueTab
          userEmail={userEmail}
          domiciliationsList={domiciliationsList}
          attestationsList={attestationsList}
          congesHistory={congesHistory}
          isLoadingConges={isLoadingConges}
          onNewDemandeClick={() => setActiveTab('catalogue')}
        />
      )}

      {/* ── Workflow Modals ── */}
      <DemandeCongeModal
        isOpen={isCongeModalOpen}
        onClose={() => setIsCongeModalOpen(false)}
        onSuccess={() => {
          invalidateCongesCache();
          loadCongesData('historique', true);
          setActiveTab('historique');
        }}
      />

      <DemandeDomiciliationModal
        isOpen={isDomiciliationModalOpen}
        onClose={() => setIsDomiciliationModalOpen(false)}
        onSuccess={() => {
          loadDomiciliationData('historique');
          setActiveTab('historique');
        }}
      />

      <DemandeAttestationModal
        isOpen={isAttestationModalOpen}
        onClose={() => setIsAttestationModalOpen(false)}
        onSuccess={() => {
          loadAttestationsData('historique');
          setActiveTab('historique');
        }}
      />

      <RefusalModal
        isOpen={refusalModal.isOpen}
        onClose={() => setRefusalModal({ isOpen: false })}
        onSubmit={handleRefusalSubmit}
        isSubmitting={isSubmittingRefusal}
      />

      <DevNoticeModal
        item={devNoticeItem}
        onClose={() => setDevNoticeItem(null)}
      />
    </div>
  );
}
