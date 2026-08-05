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

  // Charger l'historique au montage du composant
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/demandes');
        if (res.ok) {
          const data = await res.json();
          const formatted = (data.data || []).map((d: any) => {
            const typeLabel = DEMANDE_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === d.type)?.label || d.type;
            const dateFormatted = d.dateCreation 
              ? new Date(d.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Date inconnue';
            return {
              id: d.id,
              titre: d.titre,
              typeLabel,
              date: dateFormatted,
              statut: d.statut,
              priorite: d.priorite,
            };
          });
          setDemandesHistory(formatted);
        }
      } catch (err) {
        console.error('Erreur chargement historique demandes:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

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
            Mes demandes ({demandesHistory.length})
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
              Validations Équipe (N+1)
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
              Validation RH (Finale)
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
          {/* ── CATALOGUE DE DEMANDES (3 COLONNES D'APRÈS LA MAQUETTE) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {DEMANDE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                {/* En-tête de catégorie */}
                <div className="pb-2 border-b border-border">
                  <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                    {category.title}
                  </h2>
                </div>

                {/* Cartes d'options */}
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
                        {/* Icon Container */}
                        <div className="w-10 h-10 rounded-lg bg-surface-alt group-hover:bg-primary-50 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                        </div>

                        {/* Label */}
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
            En tant que supérieur hiérarchique, examinez et validez les demandes d'absence de vos collaborateurs.
          </p>
          <div className="p-8 text-center bg-amber-50/50 rounded-xl border border-amber-200 text-amber-900 text-sm">
            <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2 animate-pulse" />
            <p className="font-bold">Aucune demande en attente de votre validation N+1 pour le moment.</p>
            <p className="text-xs text-amber-700 mt-1">Dès qu'un collaborateur indique votre email comme responsable, la demande apparaîtra ici.</p>
          </div>
        </div>
      ) : activeTab === 'validations_rh' ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Demandes de congé à valider (Service RH)
          </h2>
          <p className="text-sm text-text-secondary">
            Validez les demandes pré-approuvées par les responsables N+1 pour enregistrement et mise à jour du planning global.
          </p>
          <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-900 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold">Toutes les demandes validées par les managers sont à jour.</p>
          </div>
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
            {isLoadingHistory ? (
              <div className="py-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Chargement de vos demandes...
              </div>
            ) : demandesHistory.length === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                Aucune demande trouvée dans l'historique pour {userEmail}.
              </div>
            ) : (
              demandesHistory.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-muted">{item.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-200">
                        {item.typeLabel}
                      </span>
                      <span className="text-xs text-text-muted">• {item.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{item.titre}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      item.statut === 'resolu'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.statut === 'en_cours'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.statut === 'resolu' ? 'Résolu' : item.statut === 'en_cours' ? 'En cours' : 'En attente'}
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
