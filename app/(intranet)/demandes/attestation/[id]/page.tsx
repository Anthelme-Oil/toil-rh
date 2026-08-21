'use client';

// ═══════════════════════════════════════════════════════════════
// Page Document Officiel — Attestation de Travail & Congé Imprimable
// (Supports T-OIL S.A., STSL S.A., et COMPEL S.A.)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, use } from 'react';
import { Printer, ArrowLeft, Loader2, FileCheck } from 'lucide-react';
import Image from 'next/image';

interface AttestationItem {
  id: string;
  nomDemandeur: string;
  emailDemandeur: string;
  nom: string;
  prenom: string;
  societe: 'T-OIL' | 'STSL' | 'COMPEL' | string;
  poste?: string;
  motif: string;
  statut: string;
  dateCreation: string;
  dateValidationDRH?: string;
  dateTraitementRH?: string;
  typeDemande?: string;
  typeConge?: string;
  dateDebut?: string;
  dateFin?: string;
  nombreJours?: number;

  // Circuit de validation & personnes ayant approuvé la demande
  managerNom?: string;
  managerEmail?: string;
  managerPoste?: string;
  dateValidationN1?: string;
  statutN1?: string;
  commentaireN1?: string;

  drhNom?: string;
  drhPoste?: string;
  dateValidationRH?: string;
  statutRH?: string;
  commentaireRH?: string;
}

export default function PageAttestationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<AttestationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // Tenter par ID directement en premier
        const resId = await fetch(`/api/demandes/attestation?id=${encodeURIComponent(id)}&_t=${Date.now()}`);
        if (resId.ok) {
          const dataId = await resId.json();
          if (dataId.demande) {
            setItem(dataId.demande);
            return;
          }
        }

        const res = await fetch(`/api/demandes/attestation?role=collaborateur&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const found = (data.demandes || []).find((d: AttestationItem) => String(d.id) === String(id));
          if (found) {
            setItem(found);
            return;
          }
        }

        // Tenter en rôle RH
        const resRh = await fetch(`/api/demandes/attestation?role=rh&_t=${Date.now()}`);
        if (resRh.ok) {
          const dataRh = await resRh.json();
          const foundRh = (dataRh.demandes || []).find((d: AttestationItem) => String(d.id) === String(id));
          if (foundRh) {
            setItem(foundRh);
            return;
          }
        }

        setError('Document d\'attestation introuvable.');
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de l\'attestation.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center space-y-4 print:bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Génération du document officiel en cours...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-lg text-center space-y-4">
          <p className="text-red-600 text-sm font-bold">{error || 'Document non disponible.'}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>
    );
  }

  const isConge = item.typeDemande === 'attestation_conge' || Boolean(item.dateDebut || item.typeConge);

  const societeUpper = (item.societe || 'T-OIL').toUpperCase();

  const societeName =
    societeUpper === 'STSL'
      ? 'SOCIÉTÉ TOGOLAISE DE STOCKAGE DE LOMÉ (STSL S.A.)'
      : societeUpper === 'COMPEL'
      ? 'COMPEL S.A.'
      : 'T-OIL S.A.';

  const logoSrc =
    societeUpper === 'STSL'
      ? '/images/STSL_TG.png'
      : societeUpper === 'COMPEL'
      ? '/images/E1 STSL.png'
      : '/images/ToilTG.png';

  const dateDelivrance = item.dateTraitementRH || item.dateValidationRH
    ? new Date(item.dateTraitementRH || item.dateValidationRH!).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="min-h-screen bg-slate-200 py-8 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      {/* Action Bar (Cachée à l'impression) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs border border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux demandes</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimer / Télécharger en PDF</span>
        </button>
      </div>

      {/* Sheet A4 Canvas (Zone imprimable) */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-10 sm:p-14 border border-slate-300 print:shadow-none print:border-none print:p-4 print:w-full print:max-w-none text-slate-900 font-serif leading-relaxed">
        {/* Header Entête Officielle */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-8">
          <div className="space-y-1">
            <div className="relative w-44 h-16">
              <Image
                src={logoSrc}
                alt={item.societe || 'Société'}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <p className="text-[11px] font-sans font-extrabold tracking-widest text-slate-800 uppercase pt-2">
              {societeName}
            </p>
            <p className="text-[9px] font-sans text-slate-500">Direction des Ressources Humaines</p>
          </div>

          <div className="text-right font-sans text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">RÉPUBLIQUE TOGOLAISE</p>
            <p className="text-[10px]">Travail - Liberté - Patrie</p>
            <p className="text-[10px] text-slate-500 pt-2">Lomé, le {dateDelivrance}</p>
            <p className="text-[9px] text-slate-400 font-mono">
              Réf: {isConge ? 'AC' : 'ATT'}-{item.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Titre du document */}
        <div className="text-center my-6">
          <h1 className="text-2xl font-bold font-sans tracking-wider uppercase underline underline-offset-8 text-slate-900">
            {isConge ? 'DEMANDE DE CONGÉ' : 'ATTESTATION DE TRAVAIL'}
          </h1>
        </div>

        {isConge ? (
          /* Document Présentant la Demande de Congé */
          <div className="space-y-6 font-sans">
            {/* 1. Informations Collaborateur */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                1. Informations du Collaborateur
              </h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Nom & Prénom :</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{item.nomDemandeur.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Adresse E-mail :</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">{item.emailDemandeur}</p>
                </div>
                <div>
                  <span className="text-slate-500">Société d&apos;appartenance :</span>
                  <p className="font-bold text-emerald-800 text-xs mt-0.5">{societeName}</p>
                </div>
                {item.poste && (
                  <div>
                    <span className="text-slate-500">Fonction / Poste :</span>
                    <p className="font-semibold text-slate-800 text-xs mt-0.5">{item.poste}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Caractéristiques & Période du Congé */}
            <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-2">
                2. Détails & Période du Congé
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Type de congé :</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{item.typeConge || 'Congé Payé'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date de début :</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">
                    {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Date de reprise / Fin :</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">
                    {item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Nombre de jours :</span>
                  <p className="font-bold text-emerald-700 text-sm mt-0.5">
                    {item.nombreJours || 1} jour(s) ouvrable(s)
                  </p>
                </div>
                {item.motif && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Motif / Observations :</span>
                    <p className="font-medium text-slate-800 text-xs mt-0.5">{item.motif}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Approbateurs (Manager Approbateur & RH Approbateur) */}
            <div className="space-y-3 pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>3. Visas des Approbateurs</span>
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Manager Approbateur */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold uppercase text-[9px] text-slate-500">Manager Approbateur (N+1)</span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-100 text-emerald-800">
                      Visa Accordé
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">{item.managerNom || 'Manager Hiérarchique N+1'}</p>
                  {item.managerPoste && <p className="text-[10px] text-slate-600">{item.managerPoste}</p>}
                  {item.managerEmail && <p className="text-[9px] text-slate-400 font-mono">{item.managerEmail}</p>}
                  <p className="text-[9px] text-slate-500 pt-1.5 border-t border-slate-200 mt-1">
                    Approuvé le : {item.dateValidationN1 ? new Date(item.dateValidationN1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(item.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* RH Approbateur */}
                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold uppercase text-[9px] text-emerald-800">RH Approbateur</span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-600 text-white">
                      Validé & Certifié
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">{item.drhNom || 'Direction des Ressources Humaines'}</p>
                  <p className="text-[10px] text-slate-600">{item.drhPoste || 'Directeur des RH'}</p>
                  <p className="text-[9px] text-slate-500 pt-1.5 border-t border-emerald-200 mt-1">
                    Approuvé le : {item.dateValidationRH || item.dateValidationDRH ? new Date(item.dateValidationRH || item.dateValidationDRH!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : dateDelivrance}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Zones de Signatures Autorisées (DRH & DG) */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-6 text-center">
                Signatures Autorisées
              </p>
              <div className="grid grid-cols-2 gap-8 text-center font-sans">
                <div className="space-y-14">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-900">Le Directeur des Ressources Humaines (DRH)</p>
                    <p className="text-[10px] text-slate-500">Signature & Visa DRH</p>
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-2 text-[9px] text-slate-400">
                    Cachet officiel & Signature
                  </div>
                </div>

                <div className="space-y-14">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-900">La Direction Générale (DG)</p>
                    <p className="text-[10px] text-slate-500">Signature & Visa DG</p>
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-2 text-[9px] text-slate-400">
                    Cachet officiel & Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Corps de l'attestation de travail classique */
          <div className="space-y-5 text-base text-justify font-serif text-slate-800 leading-8 my-6">
            <p>
              Je soussigné, <strong>Directeur des Ressources Humaines</strong> de la société{' '}
              <strong>{societeName}</strong>, atteste par la présente que :
            </p>

            <div className="bg-slate-50 p-5 rounded-lg border-l-4 border-slate-800 font-sans my-5 space-y-1.5 text-sm">
              <p>
                <strong>Nom & Prénom :</strong> {item.nomDemandeur.toUpperCase()}
              </p>
              <p>
                <strong>Adresse E-mail :</strong> {item.emailDemandeur}
              </p>
              {item.poste && (
                <p>
                  <strong>Fonction / Poste :</strong> {item.poste}
                </p>
              )}
              <p>
                <strong>Société d&apos;appartenance :</strong> {societeName}
              </p>
            </div>

            <p>
              est bien employé(e) au sein de notre société et exerce ses fonctions en toute régularité.
            </p>

            <p>
              La présente attestation est délivrée à l&apos;intéressé(e) sur sa demande, pour servir et valoir ce que de droit
              {item.motif ? `, notamment dans le cadre de : « ${item.motif} »` : '.'}
            </p>

            {/* Zone de Signature Officielle (Attestation de Travail) */}
            <div className="mt-10 pt-4 flex justify-end">
              <div className="text-center font-sans space-y-12 w-72">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-900">Pour la Direction Générale</p>
                  <p className="text-[11px] font-semibold text-slate-700">Le Directeur des Ressources Humaines</p>
                </div>

                <div className="border-t border-dashed border-slate-400 pt-2 text-[10px] text-slate-400">
                  Cachet officiel & Signature autorisée
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer bas de page */}
        <div className="mt-12 border-t border-slate-200 pt-3 text-center font-sans text-[9px] text-slate-400 space-y-0.5">
          <p className="font-bold text-slate-600">{societeName}</p>
          <p>Document généré et certifié électroniquement via le Portail Intranet T-OIL/STSL/COMPEL</p>
        </div>
      </div>
    </div>
  );
}
