'use client';

// ═══════════════════════════════════════════════════════════════
// Page Demandes & Services — Catalogue & Gestions des Workflows
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
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  Printer,
  ChevronRight,
  Download,
  FileText,
  XCircle,
} from 'lucide-react';
import type { TypeDemande, PrioriteDemande, DemandeConge } from '@/types';
import { DemandeCongeModal } from '@/components/demandes/DemandeCongeModal';
import { DemandeDomiciliationModal } from '@/components/demandes/DemandeDomiciliationModal';
import { useUser } from '@/context/UserContext';

interface DemandeOption {
  id: TypeDemande;
  label: string;
  category: 'administrative' | 'it' | 'autre';
  icon: React.ElementType;
  description: string;
}

const DEMANDE_CATEGORIES = [
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
        label: 'Demande de congés',
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
        description: 'Demande de certificat de travail ou fiche de paie',
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
        description: 'PC, écran, souris, clavier, casque et accessoires',
      },
      {
        id: 'intervention' as TypeDemande,
        label: 'Intervention',
        icon: Wrench,
        description: 'Assistance technique sur site ou dépannage à distance',
      },
    ],
  },
  {
    id: 'autre',
    title: 'Autres demandes',
    description: 'Achats, déplacements et autorisations d\'accès',
    color: 'indigo',
    items: [
      {
        id: 'fiche_achat' as TypeDemande,
        label: "Fiche d'achat",
        icon: ShoppingCart,
        description: "Demande d'acquisition d'équipements ou services",
      },
      {
        id: 'ordre_mission' as TypeDemande,
        label: 'Ordre de mission',
        icon: Briefcase,
        description: 'Validation de déplacement professionnel et prise en charge',
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
  const [selectedDemande, setSelectedDemande] = useState<{ id: TypeDemande; label: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'historique' | 'validations_n1' | 'validations_rh'>('catalogue');
  
  // Modales
  const [isCongeModalOpen, setIsCongeModalOpen] = useState(false);
  const [isDomiciliationModalOpen, setIsDomiciliationModalOpen] = useState(false);

  // Form State pour demandes génériques IT / Fournitures
  const [type, setType] = useState<TypeDemande>('renouvellement_compte');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<PrioriteDemande>('normale');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Historique et Validations des congés
  const [congesHistory, setCongesHistory] = useState<any[]>([]);
  const [congesN1List, setCongesN1List] = useState<any[]>([]);
  const [congesRhList, setCongesRhList] = useState<any[]>([]);
  const [isLoadingConges, setIsLoadingConges] = useState(false);

  // Demandes de Domiciliation Bancaire
  const [domiciliationsList, setDomiciliationsList] = useState<any[]>([]);
  const [isLoadingDomiciliations, setIsLoadingDomiciliations] = useState(false);

  // Cache client
  const congesCacheRef = useRef<Map<string, { data: any[]; fetchedAt: number }>>(new Map());
  const CONGES_CLIENT_CACHE_TTL = 2 * 60 * 1000;

  // Charger les données de congés
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
      let url = `/api/demandes/conges?email=${encodeURIComponent(userEmail)}`;
      if (tab === 'validations_n1') url += '&role=n1';
      if (tab === 'validations_rh') url += '&role=rh';

      const res = await fetch(url);
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

  // Charger les données de Domiciliation Bancaire
  const loadDomiciliationData = async (tab: string) => {
    if (!userEmail) return;
    setIsLoadingDomiciliations(true);
    try {
      let role = 'collaborateur';
      if (tab === 'validations_rh') role = isDRH ? 'drh' : 'rh';

      const res = await fetch(`/api/demandes/domiciliation?role=${role}`);
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

  const invalidateCongesCache = () => {
    congesCacheRef.current.clear();
  };

  useEffect(() => {
    loadCongesData(activeTab);
    if (activeTab === 'historique' || activeTab === 'validations_rh') {
      loadDomiciliationData(activeTab);
    }
  }, [activeTab, userEmail]);

  // État pour la modale de motif de refus
  const [refusalModal, setRefusalModal] = useState<{
    isOpen: boolean;
    id?: string;
    typeDemande?: 'CONGE' | 'DOMICILIATION';
    role?: 'N1' | 'RH' | 'DRH';
    item?: any;
  }>({ isOpen: false });
  const [refusalReason, setRefusalReason] = useState('');
  const [isSubmittingRefusal, setIsSubmittingRefusal] = useState(false);

  // Traitement approbation / refus Congé
  const handleTraiterConge = async (
    id: string,
    action: 'APPROUVER' | 'REFUSER',
    role: 'N1' | 'RH',
    motifRefusParam?: string,
    item?: DemandeConge
  ) => {
    if (action === 'REFUSER' && !motifRefusParam) {
      setRefusalModal({ isOpen: true, id, typeDemande: 'CONGE', role, item });
      setRefusalReason('');
      return;
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
        setRefusalReason('');
        invalidateCongesCache();
        loadCongesData(activeTab, true);
      }
    } catch (err) {
      console.error('Erreur traitement congé:', err);
    }
  };

  // Traitement DRH pour Domiciliation
  const handleTraiterDomiciliationDRH = async (
    demandeId: string,
    action: 'VALIDER' | 'REFUSER',
    motifRefusParam?: string
  ) => {
    if (action === 'REFUSER' && !motifRefusParam) {
      setRefusalModal({ isOpen: true, id: demandeId, typeDemande: 'DOMICILIATION', role: 'DRH' });
      setRefusalReason('');
      return;
    }

    try {
      const res = await fetch('/api/demandes/domiciliation/traiter-drh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId, action, motifRefus: motifRefusParam }),
      });
      if (res.ok) {
        setRefusalModal({ isOpen: false });
        setRefusalReason('');
        loadDomiciliationData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement DRH Domiciliation:', err);
    }
  };

  // Traitement RH pour Domiciliation (Marquer comme Traitée)
  const handleTraiterDomiciliationRH = async (demandeId: string) => {
    try {
      const res = await fetch('/api/demandes/domiciliation/traiter-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandeId }),
      });
      if (res.ok) {
        loadDomiciliationData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement RH Domiciliation:', err);
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
    setSelectedDemande(item);
    setType(item.id);
    setTitre(`${item.label} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`);
  }

  async function handleSubmitGeneric(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, type, description, priorite }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission.');
      }

      setStatus('success');
      setTitre('');
      setDescription('');
      setPriorite('normale');
      setSelectedDemande(null);

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Une erreur est survenue.');
    }
  }

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

      {/* ── En-tête ── */}
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
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'catalogue'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            Catalogue des demandes
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'historique'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            Mes demandes ({congesHistory.length + domiciliationsList.length})
          </button>

          {(isManager || isAdmin) && (
            <button
              onClick={() => setActiveTab('validations_n1')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
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
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'validations_rh'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Validation DRH & Treatment ({congesRhList.length + domiciliationsList.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Notification globale de succès ── */}
      {status === 'success' && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Demande enregistrée avec succès !</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Votre demande a été enregistrée et transmise au service concerné.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'catalogue' ? (
        <>
          {/* ── CATALOGUE DE DEMANDES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {DEMANDE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="pb-2 border-b border-border">
                  <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectDemande(item)}
                        className="w-full text-left bg-white border border-emerald-500/40 hover:border-emerald-600 hover:shadow-md rounded-xl p-4 transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-surface-alt group-hover:bg-primary-50 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors flex-1">
                          {item.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-primary transition-all flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire générique IT si sélectionné */}
          {selectedDemande && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-md max-w-2xl mx-auto my-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> {selectedDemande.label}
              </h3>
              <form onSubmit={handleSubmitGeneric} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la demande</label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Motif</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDemande(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Soumettre
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : activeTab === 'validations_n1' ? (
        /* ── VUE VALIDATIONS N+1 ── */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Demandes de congé à valider (N+1)
          </h2>
          <p className="text-sm text-text-secondary">
            Demandes d'absence adressées à vous ({userEmail}) en tant que supérieur hiérarchique.
          </p>

          {isLoadingConges ? (
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
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {item.typeConge}
                      </span>
                      <span className="text-xs text-text-muted">
                        du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'} au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                    <p className="text-xs text-text-secondary">Statut : <span className="font-semibold text-amber-700">{item.statut}</span></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTraiterConge(item.id, 'APPROUVER', 'N1')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      Valider N+1
                    </button>
                    <button
                      onClick={() => handleTraiterConge(item.id, 'REFUSER', 'N1')}
                      className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'validations_rh' ? (
        /* ── VUE VALIDATION DRH & TRAITEMENT RH ── */
        <div className="space-y-8 animate-fade-in">
          {/* Section 1: Domiciliations Bancaires */}
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
                      {/* Statut Badge */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.statut === 'EN_ATTENTE_DRH'
                          ? 'bg-amber-100 text-amber-800'
                          : item.statut === 'VALIDEE_DRH'
                          ? 'bg-blue-100 text-blue-800'
                          : item.statut === 'REFUSEE_DRH'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.statut === 'EN_ATTENTE_DRH'
                          ? 'En attente DRH'
                          : item.statut === 'VALIDEE_DRH'
                          ? 'Validée DRH (À traiter)'
                          : item.statut === 'REFUSEE_DRH'
                          ? 'Refusée par DRH'
                          : 'Traitée / Document dispo'}
                      </span>

                      {/* Actions selon le statut */}
                      {item.statut === 'EN_ATTENTE_DRH' && (isDRH || isAdmin) && (
                        <>
                          <button
                            onClick={() => handleTraiterDomiciliationDRH(item.id, 'VALIDER')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                          >
                            Valider (DRH)
                          </button>
                          <button
                            onClick={() => handleTraiterDomiciliationDRH(item.id, 'REFUSER')}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg"
                          >
                            Refuser
                          </button>
                        </>
                      )}

                      {item.statut === 'VALIDEE_DRH' && (isRH || isRHPrint || isAdmin) && (
                        <button
                          onClick={() => handleTraiterDomiciliationRH(item.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marquer comme Traitée / Doc Dispo
                        </button>
                      )}

                      {item.statut === 'TRAITEE' && (
                        <button
                          onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
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

          {/* Section 2: Validation des Congés RH */}
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
                          du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'} au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
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
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-600" />
                          <span>Imprimer Attestation</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleTraiterConge(item.id, 'APPROUVER', 'RH', undefined, item)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                          >
                            Valider DRH
                          </button>
                          <button
                            onClick={() => handleTraiterConge(item.id, 'REFUSER', 'RH', undefined, item)}
                            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
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
      ) : activeTab === 'historique' ? (
        /* ── VUE HISTORIQUE MES DEMANDES ── */
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Mes demandes ({userEmail})
              </h2>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
              >
                <Plus className="w-4 h-4" /> Nouvelle demande
              </button>
            </div>

            {/* Domiciliations de l'utilisateur */}
            {domiciliationsList.length > 0 && (
              <div className="space-y-3 pb-6 border-b border-border">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" /> Demandes de Domiciliation Bancaire
                </h3>
                {domiciliationsList.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.banque} — Agence {item.agenceBancaire}</h4>
                      <p className="text-xs text-slate-500">Date souhaitée : {item.dateSouhaitee}</p>
                      {item.motifRefus && (
                        <p className="text-xs text-red-600 font-semibold mt-1">Motif du refus : {item.motifRefus}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.statut === 'TRAITEE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.statut === 'REFUSEE_DRH'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.statut === 'TRAITEE'
                          ? 'Document Disponible'
                          : item.statut === 'REFUSEE_DRH'
                          ? 'Refusée'
                          : 'En cours de validation'}
                      </span>

                      {item.statut === 'TRAITEE' && (
                        <button
                          onClick={() => window.open(`/demandes/domiciliation/${item.id}`, '_blank')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
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

            {/* Congés de l'utilisateur */}
            <div className="divide-y divide-border">
              {isLoadingConges ? (
                <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Chargement de vos demandes...
                </div>
              ) : congesHistory.length === 0 && domiciliationsList.length === 0 ? (
                <div className="py-8 text-center text-text-secondary text-sm">
                  Aucune demande enregistrée.
                </div>
              ) : (
                congesHistory.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-text-muted">ID: #{item.id}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-200">
                          {item.typeConge}
                        </span>
                        <span className="text-xs text-text-muted">
                          • du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'} au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.statut?.toLowerCase().includes('accord') || item.statut?.toLowerCase().includes('approuv')
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.statut?.toLowerCase().includes('refus')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.statut || 'En attente'}
                      </span>

                      {(item.statut?.toLowerCase().includes('accord') || item.statut?.toLowerCase().includes('approuv')) && (
                        <button
                          onClick={() => window.open(`/demandes/attestation/${item.id}`, '_blank')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
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
      ) : null}

      {/* Modale Demande de congé */}
      <DemandeCongeModal
        isOpen={isCongeModalOpen}
        onClose={() => setIsCongeModalOpen(false)}
        onSuccess={() => {
          invalidateCongesCache();
          loadCongesData('historique', true);
          setActiveTab('historique');
        }}
      />

      {/* Modale Demande de Domiciliation Bancaire */}
      <DemandeDomiciliationModal
        isOpen={isDomiciliationModalOpen}
        onClose={() => setIsDomiciliationModalOpen(false)}
        onSuccess={() => {
          loadDomiciliationData('historique');
          setActiveTab('historique');
        }}
      />

      {/* Modale de Saisie Obligatoire du Motif de Refus */}
      {refusalModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /> Saisie du Motif de Refus
              </h3>
              <button
                onClick={() => setRefusalModal({ isOpen: false })}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Veuillez indiquer la raison de ce refus. Ce motif sera enregistré et transmis au collaborateur par e-mail.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motif de Refus <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="ex: Pièce justificative invalide / Chevauchement..."
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefusalModal({ isOpen: false })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!refusalReason.trim() || isSubmittingRefusal}
                onClick={async () => {
                  if (!refusalModal.id) return;
                  setIsSubmittingRefusal(true);
                  if (refusalModal.typeDemande === 'DOMICILIATION') {
                    await handleTraiterDomiciliationDRH(refusalModal.id, 'REFUSER', refusalReason);
                  } else if (refusalModal.role === 'N1' || refusalModal.role === 'RH') {
                    await handleTraiterConge(
                      refusalModal.id,
                      'REFUSER',
                      refusalModal.role,
                      refusalReason,
                      refusalModal.item
                    );
                  }
                  setIsSubmittingRefusal(false);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingRefusal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
