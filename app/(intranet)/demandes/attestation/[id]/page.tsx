'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, Printer, X, ShieldCheck, CheckCircle2, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';

interface AttestationDetails {
  id: string;
  titre: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif: string;
  statut: string;
  demandeurNom: string;
  demandeurEmail: string;
  demandeurPoste: string;
  demandeurDepartement: string;
  managerNom: string;
  managerEmail: string;
  managerPoste: string;
  dateCreation: string;
  dateValidationN1: string | null;
  commentaireN1: string;
  statutN1: string;
  dateValidationRH: string | null;
  commentaireRH: string;
  statutRH: string;
}

export default function AttestationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<AttestationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await fetch(`/api/demandes/conges/${id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erreur lors du chargement des détails.');
        }
        const data = await res.json();
        setDetails(data.demande);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getFriendlyTypeConge = (type: string) => {
    switch (type) {
      case 'conge_paye':
        return 'Congé Annuel Payé';
      case 'arrêt maladie':
      case 'arret_maladie':
        return 'Arrêt Maladie';
      case 'permission':
        return 'Permission Exceptionnelle';
      case 'conge_maternite':
        return 'Congé de Maternité / Paternité';
      case 'recup':
      case 'recuperation':
        return 'Récupération';
      default:
        return type || 'Congé';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Génération du certificat de congé...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Une erreur est survenue</h2>
        <p className="text-sm text-slate-500 max-w-md text-center">{error || 'Demande introuvable.'}</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
        >
          Fermer la fenêtre
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50 print:bg-white text-slate-950 font-sans antialiased">
      {/* ── BARRE D'ACTIONS FLOATING (Cachée à l'impression) ── */}
      <div className="print:hidden bg-slate-900 text-white py-3.5 px-6 shadow-md sticky top-0 z-50 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Aperçu avant Impression
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Enregistrer en PDF</span>
          </button>
        </div>
      </div>

      {/* ── CONTENU DE L'ATTESTATION ── */}
      <div className="max-w-[800px] mx-auto my-8 print:my-0 p-8 sm:p-12 bg-white border border-slate-200 print:border-0 rounded-3xl print:rounded-none shadow-xl print:shadow-none space-y-8 relative overflow-hidden">
        
        {/* En-tête de l'entreprise avec le Logo Officiel */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6">
          <div className="flex items-start gap-4">
            <img
              src="/images/image.png"
              alt="Logo T-OIL"
              className="w-16 h-16 object-contain"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                T-OIL TOGO
              </h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">
                Société Nationale de Distribution de Produits Pétroliers
              </p>
              <p className="text-[9px] text-slate-400">
                Lomé, Togo • Tél: +228 22 23 45 67 • info@togosh.com
              </p>
            </div>
          </div>
          <div className="text-right space-y-1 text-xs">
            <p className="text-[10px] text-slate-400">
              Réf : <span className="font-mono font-bold text-slate-800">{details.id}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Date : {new Date(details.dateCreation).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Titre du document */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight uppercase">
            ATTESTATION D&apos;AUTORISATION DE CONGÉ
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Document officiel justifiant la validation du circuit d&apos;autorisation d&apos;absence au sein de T-OIL.
          </p>
        </div>

        {/* Section 1 : Informations Collaborateur */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-600" />
            1. Informations du Collaborateur
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400">Nom Complet :</span>
              <p className="font-bold text-slate-900 mt-0.5">{details.demandeurNom}</p>
            </div>
            <div>
              <span className="text-slate-400">Adresse Email :</span>
              <p className="font-semibold text-slate-800 mt-0.5">{details.demandeurEmail}</p>
            </div>
            <div>
              <span className="text-slate-400">Département :</span>
              <p className="font-bold text-slate-850 mt-0.5">{details.demandeurDepartement}</p>
            </div>
            <div>
              <span className="text-slate-400">Poste Occupé :</span>
              <p className="font-semibold text-slate-800 mt-0.5">{details.demandeurPoste}</p>
            </div>
          </div>
        </div>

        {/* Section 2 : Détails du Congé */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-600" />
            2. Période & Type de Congé
          </h3>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 print:bg-white print:border-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 block">Type d&apos;absence :</span>
              <span className="font-bold text-slate-950 text-sm">
                {getFriendlyTypeConge(details.typeConge)}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 block">Date de Début :</span>
              <span className="font-bold text-slate-900">
                {new Date(details.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 block">Date de Fin :</span>
              <span className="font-bold text-slate-900">
                {new Date(details.dateFin).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 block">Nombre de Jours :</span>
              <span className="font-extrabold text-slate-900 text-base">{details.nombreJours} jour(s)</span>
            </div>
          </div>
          {details.motif && (
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 block mb-0.5">Motif ou justification :</span>
              <p className="italic text-slate-700">{details.motif}</p>
            </div>
          )}
        </div>

        {/* Section 3 : Historique d'Approbation */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            3. Circuit de Validation Électronique
          </h3>
          <div className="space-y-4">
            {/* Étape 1 : Soumission */}
            <div className="relative pl-6 border-l-2 border-slate-200 pb-1 flex gap-3 items-start">
              <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400"></div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900">Soumission de la demande</p>
                <p className="text-slate-500">
                  Par <span className="font-semibold">{details.demandeurNom}</span> le {new Date(details.dateCreation).toLocaleDateString('fr-FR')} à {new Date(details.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Étape 2 : Manager N+1 */}
            <div className="relative pl-6 border-l-2 border-slate-200 pb-1 flex gap-3 items-start">
              <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500`}></div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  Approbation du Supérieur Hiérarchique N+1
                </p>
                <p className="text-slate-500">
                  Par <span className="font-semibold text-slate-700">{details.managerNom}</span> ({details.managerPoste}) 
                  {details.dateValidationN1 && ` le ${new Date(details.dateValidationN1).toLocaleDateString('fr-FR')} à ${new Date(details.dateValidationN1).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                {details.commentaireN1 && (
                  <p className="text-slate-650 bg-slate-50 p-2 rounded-lg italic mt-1 max-w-lg">
                    &ldquo;{details.commentaireN1}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Étape 3 : RH / DRH */}
            <div className="relative pl-6 flex gap-3 items-start">
              <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500`}></div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  Approbation Finale Direction Ressources Humaines (DRH)
                </p>
                <p className="text-slate-500">
                  Par la <span className="font-semibold text-slate-700">Direction RH T-OIL</span> 
                  {details.dateValidationRH && ` le ${new Date(details.dateValidationRH).toLocaleDateString('fr-FR')} à ${new Date(details.dateValidationRH).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                {details.commentaireRH && (
                  <p className="text-slate-650 bg-slate-50 p-2 rounded-lg italic mt-1 max-w-lg">
                    &ldquo;{details.commentaireRH}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section signatures et bas de page */}
        <div className="border-t border-slate-200 pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-12">
            <div>
              <p className="text-slate-400">Signature du Bénéficiaire</p>
              <p className="text-[10px] text-slate-350 italic mt-1">Signature numérique intégrée</p>
            </div>
            <p className="font-bold text-slate-800">{details.demandeurNom}</p>
          </div>
          <div className="space-y-12">
            <div>
              <p className="text-slate-400">Pour la Direction des Ressources Humaines</p>
              <p className="text-[10px] text-slate-350 italic mt-1">Visa électronique</p>
            </div>
            <p className="font-bold text-slate-800">Le Service RH T-OIL</p>
          </div>
        </div>

        {/* Mention légale de sécurité */}
        <div className="text-center text-[9px] text-slate-400 pt-8 border-t border-slate-100 space-y-1">
          <p>
            Ce document est généré de manière sécurisée par l&apos;intranet national de T-OIL.
          </p>
          <p className="font-mono">
            Identifiant unique de validation : {details.id}
          </p>
        </div>
      </div>
    </div>
  );
}
