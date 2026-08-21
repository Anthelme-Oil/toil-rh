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
  fonction?: string;
  matricule?: string;
  service?: string;
  motif: string;
  statut: string;
  dateCreation: string;
  dateValidationDRH?: string;
  dateTraitementRH?: string;
  typeDemande?: string;
  typeConge?: string;
  dateDebut?: string;
  dateFin?: string;
  dateReprise?: string;
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

  const societeUpper = (item.societe || 'STSL').toUpperCase();

  const societeShortName =
    societeUpper === 'STSL'
      ? 'STSL'
      : societeUpper === 'COMPEL'
      ? 'COMPEL'
      : 'T-OIL';

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '........................................';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const dateDelivranceCourt = item.dateTraitementRH || item.dateValidationRH || item.dateValidationDRH
    ? new Date(item.dateTraitementRH || item.dateValidationRH || item.dateValidationDRH!).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const dateDelivrance = item.dateTraitementRH || item.dateValidationRH || item.dateValidationDRH
    ? new Date(item.dateTraitementRH || item.dateValidationRH || item.dateValidationDRH!).toLocaleDateString('fr-FR', {
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
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-10 sm:p-14 border border-slate-300 print:shadow-none print:border-none print:p-4 print:w-full print:max-w-none text-slate-900 leading-relaxed font-sans">
        {/* Header Entête Officielle sous forme d'encadrement */}
        {isConge ? (
          <div className="border-2 border-slate-900 mb-8">
            <div className="grid grid-cols-12 divide-x-2 divide-slate-900 border-b-2 border-slate-900">
              {/* Colonne 1: Logo */}
              <div className="col-span-4 p-3 flex items-center justify-center bg-white min-h-[95px]">
                <div className="relative w-40 h-16">
                  <Image
                    src={logoSrc}
                    alt={item.societe || 'Société'}
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </div>

              {/* Colonne 2: Titre central */}
              <div className="col-span-5 p-3 flex items-center justify-center font-bold text-base sm:text-lg text-slate-900 text-center tracking-wide uppercase bg-white">
                ATTESTATION DE CONGÉ
              </div>

              {/* Colonne 3: Métadonnées de référence */}
              <div className="col-span-3 p-3 text-[11px] text-slate-800 space-y-0.5 flex flex-col justify-center bg-white">
                <p>Référence : EN__ TGRH __</p>
                <p>IR : __</p>
                <p>Date d&apos;application : {dateDelivranceCourt}</p>
                <p>Page 1 sur 1</p>
              </div>
            </div>
          </div>
        ) : (
          /* Header classique pour attestation de travail */
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
                Réf: ATT-{item.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {isConge ? (
          /* Header et document officiel Attestation de congé selon les modèles Word STSL & T-Oil */
          <div>
            <div className="flex justify-between items-start mb-10 border-b border-slate-200 pb-6">
              {/* Logo à gauche */}
              <div className="relative w-48 h-20">
                <Image
                  src={logoSrc}
                  alt={item.societe || 'Société'}
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>

              {/* Coordonnées de l'entreprise à droite */}
              <div className="text-right text-xs font-serif text-slate-800 leading-snug space-y-0.5 font-medium">
                {societeUpper === 'STSL' ? (
                  <>
                    <p className="font-bold text-slate-900 text-sm">Société Togolaise de Stockage Lomé</p>
                    <p className="font-bold text-slate-900">STSL</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 text-sm">Togo Oil Company SA</p>
                    <p className="font-bold text-slate-900">T-Oil</p>
                  </>
                )}
                <p>Route d’Aného</p>
                <p>(Zone Industrielle)</p>
                <p>B.P. 797 Lomé-Togo</p>
                <p>Tél. : (228) 22 23 72 00/01</p>
              </div>
            </div>

            {/* Titre central souligné */}
            <div className="text-center my-8">
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase underline underline-offset-8 text-slate-900 font-serif">
                ATTESTATION DE CONGÉ
              </h1>
            </div>

            {/* Corps de l'attestation en format lettre officielle Word */}
            <div className="space-y-6 text-base font-serif text-slate-900 leading-relaxed px-1">
              <p className="text-justify">
                Nous soussignés,{' '}
                <strong>
                  {societeUpper === 'STSL'
                    ? 'STSL'
                    : 'Togo Oil Company (T-Oil)'}
                </strong>
                , attestons par la présente que{' '}
                <strong>Monsieur / Madame</strong>{' '}
                <span className="font-bold underline">
                  {item.nomDemandeur.toUpperCase()}
                </span>{' '}
                est employé(e) au sein de notre Société et occupe actuellement le poste de{' '}
                <span className="font-bold underline">
                  {item.poste || item.fonction || '....................................................................'}
                </span>{' '}
                au sein du service / département{' '}
                <span className="font-bold underline">
                  {item.service || '....................................................................'}
                </span>
                .
              </p>

              <p className="text-justify">
                L&apos;intéressé(e) bénéficie d&apos;un congé de type{' '}
                <span className="font-bold underline">
                  {item.typeConge || '....................................................................'}
                </span>
                , du{' '}
                <span className="font-bold underline">
                  {formatDate(item.dateDebut)}
                </span>{' '}
                au{' '}
                <span className="font-bold underline">
                  {formatDate(item.dateFin)}
                </span>
                , soit{' '}
                <span className="font-bold underline">
                  {item.nombreJours || '...........'}
                </span>{' '}
                jours.
              </p>

              <p className="text-justify">
                La reprise de service est prévue le{' '}
                <span className="font-bold underline">
                  {item.dateReprise ? formatDate(item.dateReprise) : formatDate(item.dateFin)}
                </span>
                .
              </p>

              <p className="text-justify pt-2">
                En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
              </p>

              {/* Fait à Lomé */}
              <div className="pt-4">
                <p>
                  Fait à Lomé, le{' '}
                  <span className="font-bold underline">
                    {dateDelivranceCourt}
                  </span>
                </p>
              </div>

              {/* Circuit de validation */}
              <div className="pt-6 space-y-2 font-serif text-sm">
                <p className="font-bold text-base text-slate-900">Circuit de validation</p>

                <div className="space-y-1.5 pl-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold">Validé par :</span>
                    <span className="font-medium underline min-w-[200px]">
                      {item.managerNom || '................................................................'}
                    </span>
                    <span className="italic text-slate-700">(Manager hiérarchique)</span>
                    <span className="font-bold ml-4">Date :</span>
                    <span className="underline">
                      {formatDate(item.dateValidationN1 || item.dateCreation)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2 pt-1">
                    <span className="font-bold">Approuvé par :</span>
                    <span className="font-medium underline min-w-[200px]">
                      {item.drhNom || '................................................................'}
                    </span>
                    <span className="italic text-slate-700">(Directrice des Ressources Humaines)</span>
                    <span className="font-bold ml-4">Date :</span>
                    <span className="underline">
                      {formatDate(item.dateValidationRH || item.dateValidationDRH || item.dateCreation)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures autorisées DRH & DG */}
              <div className="grid grid-cols-2 gap-8 text-center pt-12 pb-6 font-sans">
                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">La Directrice des Ressources Humaines</p>
                    <p className="text-xs text-slate-600 italic pt-1">Signature et cachet</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Nom : <span className="underline">{item.drhNom || '...................................................'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Le Directeur Général</p>
                    <p className="text-xs text-slate-600 italic pt-1">Signature et cachet</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Nom : <span className="underline">...................................................</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Attestation de travail classique */
          <div className="space-y-5 text-base text-justify font-serif text-slate-800 leading-8 my-6">
            <div className="text-center my-6">
              <h1 className="text-2xl font-bold font-sans tracking-wider uppercase underline underline-offset-8 text-slate-900">
                ATTESTATION DE TRAVAIL
              </h1>
            </div>

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
