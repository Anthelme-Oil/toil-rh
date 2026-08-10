'use client';

// ═══════════════════════════════════════════════════════════════
// Page Demandes & Services — Catalogue des demandes & Formulaire
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { TypeDemande, PrioriteDemande } from '@/types';
import { DemandeCongeModal } from '@/components/demandes/DemandeCongeModal';

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
        description: 'Demande de prolongation ou réactivation d\'accès utilisateur IT',
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
        description: 'Mise à jour du Relevé d\'Identité Bancaire (RIB)',
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
        description: 'Cartouches d\'encre, papier, toners et fournitures bureau',
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
        description: 'Demande d\'acquisition d\'équipements ou services',
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

const prioriteOptions: { value: PrioriteDemande; label: string; color: string }[] = [
  { value: 'basse', label: 'Basse', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'normale', label: 'Normale', color: 'bg-primary-50 text-primary border-primary-200' },
  { value: 'haute', label: 'Haute', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-50 text-red-600 border-red-200' },
];

import { useUser } from '@/context/UserContext';

export default function DemandesPage() {
  const { userEmail, isRH, isManager, isAdmin, userRole } = useUser();
  const [selectedDemande, setSelectedDemande] = useState<{ id: TypeDemande; label: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'historique' | 'validations_n1' | 'validations_rh'>('catalogue');
  const [isCongeModalOpen, setIsCongeModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<TypeDemande>('renouvellement_compte');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<PrioriteDemande>('normale');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Historique des demandes de l'utilisateur
  const [demandesHistory, setDemandesHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Historique et Validations des congés SharePoint
  const [congesHistory, setCongesHistory] = useState<any[]>([]);
  const [congesN1List, setCongesN1List] = useState<any[]>([]);
  const [congesRhList, setCongesRhList] = useState<any[]>([]);
  const [isLoadingConges, setIsLoadingConges] = useState(false);

  // Charger l'historique et validations selon l'onglet
  const loadCongesData = async (tab: string) => {
    if (!userEmail) return;
    setIsLoadingConges(true);
    try {
      let url = `/api/demandes/conges?email=${encodeURIComponent(userEmail)}`;
      if (tab === 'validations_n1') url += '&role=n1';
      if (tab === 'validations_rh') url += '&role=rh';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const list = data.demandes || [];
        if (tab === 'historique') setCongesHistory(list);
        if (tab === 'validations_n1') setCongesN1List(list);
        if (tab === 'validations_rh') setCongesRhList(list);
      }
    } catch (err) {
      console.error('Erreur chargement congés SharePoint:', err);
    } finally {
      setIsLoadingConges(false);
    }
  };

  useEffect(() => {
    loadCongesData(activeTab);
  }, [activeTab, userEmail]);

  // Traitement approbation / refus
  const handleTraiterConge = async (id: string, action: 'APPROUVER' | 'REFUSER', role: 'N1' | 'RH') => {
    try {
      const res = await fetch('/api/demandes/conges/traiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, role }),
      });
      if (res.ok) {
        loadCongesData(activeTab);
      }
    } catch (err) {
      console.error('Erreur traitement congé:', err);
    }
  };

  function handleSelectDemande(item: { id: TypeDemande; label: string }) {
    if (item.id === 'demande_conges') {
      setIsCongeModalOpen(true);
      return;
    }
    setSelectedDemande(item);
    setType(item.id);
    setTitre(`${item.label} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`);
  }

  async function handleSubmit(e: React.FormEvent) {
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
        throw new Error(data.error || 'Erreur lors de la soumission de la demande.');
      }

      const labelSelected = DEMANDE_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === type)?.label || titre;

      setDemandesHistory([
        {
          id: `DEM-2026-${String(demandesHistory.length + 1).padStart(3, '0')}`,
          titre: titre,
          typeLabel: labelSelected,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          statut: 'en_attente',
          priorite: priorite,
        },
        ...demandesHistory,
      ]);

      setStatus('success');
      setTitre('');
      setDescription('');
      setPriorite('normale');
      setSelectedDemande(null);

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
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
            Mes demandes ({congesHistory.length})
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

          {(isRH || isAdmin) && (
            <button
              onClick={() => setActiveTab('validations_rh')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'validations_rh'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Validation RH (Finale) ({congesRhList.length})
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
              Votre demande a été insérée dans Microsoft Lists et transmise pour traitement.
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
        </>
      ) : activeTab === 'validations_n1' ? (
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
              Chargement des demandes de votre équipe...
            </div>
          ) : congesN1List.length === 0 ? (
            <div className="p-8 text-center bg-amber-50/50 rounded-xl border border-amber-200 text-amber-900 text-sm">
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-bold">Aucune demande en attente de votre validation N+1.</p>
              <p className="text-xs text-amber-700 mt-1">
                Dès qu'un collaborateur effectue une demande à votre destination, elle s'affichera ici.
              </p>
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
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Demandes de congé à valider (Service RH)
          </h2>
          <p className="text-sm text-text-secondary">
            Toutes les demandes enregistrées dans le système SharePoint.
          </p>

          {isLoadingConges ? (
            <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              Chargement global des demandes...
            </div>
          ) : congesRhList.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-900 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold">Toutes les demandes sont à jour.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {congesRhList.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.typeConge}
                      </span>
                      <span className="text-xs text-text-muted">
                        du {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'ND'} au {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : 'ND'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                    <p className="text-xs text-text-secondary">Statut : <span className="font-semibold text-emerald-700">{item.statut}</span></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTraiterConge(item.id, 'APPROUVER', 'RH')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      Approuver RH
                    </button>
                    <button
                      onClick={() => handleTraiterConge(item.id, 'REFUSER', 'RH')}
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
      ) : activeTab === 'historique' ? (
        /* ── VUE HISTORIQUE DES DEMANDES ── */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              Historique de vos demandes ({userEmail})
            </h2>
            <button
              onClick={() => setActiveTab('catalogue')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
            >
              <Plus className="w-4 h-4" /> Nouvelle demande
            </button>
          </div>

          <div className="divide-y divide-border">
            {isLoadingConges ? (
              <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Chargement de vos demandes depuis SharePoint...
              </div>
            ) : congesHistory.length === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                Aucune demande trouvée dans SharePoint pour {userEmail}.
              </div>
            ) : (
              congesHistory.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* Modal Demande de congé */}
      <DemandeCongeModal
        isOpen={isCongeModalOpen}
        onClose={() => setIsCongeModalOpen(false)}
        onSuccess={() => setActiveTab('historique')}
      />
    </div>
  );
}
