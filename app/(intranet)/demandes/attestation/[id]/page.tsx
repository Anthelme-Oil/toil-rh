'use client';

// ═══════════════════════════════════════════════════════════════
// Page Document Officiel — Attestation de Travail Imprimable
// (Supports T-OIL S.A., STSL S.A., et COMPEL S.A.)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, use } from 'react';
import { Printer, ArrowLeft, Loader2, FileCheck, Building2 } from 'lucide-react';
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
}

export default function PageAttestationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<AttestationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/demandes/attestation?role=collaborateur&_t=${Date.now()}`);
        if (!res.ok) throw new Error('Erreur de chargement');
        const data = await res.json();
        const found = (data.demandes || []).find((d: AttestationItem) => String(d.id) === String(id));
        if (found) {
          setItem(found);
        } else {
          // Si non trouvé dans collaborateur, tenter en rôle RH
          const resRh = await fetch(`/api/demandes/attestation?role=rh&_t=${Date.now()}`);
          if (resRh.ok) {
            const dataRh = await resRh.json();
            const foundRh = (dataRh.demandes || []).find((d: AttestationItem) => String(d.id) === String(id));
            if (foundRh) setItem(foundRh);
            else setError('Attestation de travail non trouvée.');
          } else {
            setError('Attestation de travail non trouvée.');
          }
        }
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
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center space-y-4">
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
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>
    );
  }

  const societeName =
    item.societe === 'STSL'
      ? 'SOCIÉTÉ TOGOLAISE DE STOCKAGE DE LOMÉ (STSL S.A.)'
      : item.societe === 'COMPEL'
      ? 'COMPEL S.A.'
      : 'T-OIL S.A.';

  const logoSrc =
    item.societe === 'STSL'
      ? '/images/STSL_TG.png'
      : item.societe === 'COMPEL'
      ? '/images/E1 STSL.png'
      : '/images/E1 T-OIL.png';

  const dateDelivrance = item.dateTraitementRH
    ? new Date(item.dateTraitementRH).toLocaleDateString('fr-FR', {
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
    <div className="min-h-screen bg-slate-200 py-8 px-4 sm:px-6">
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
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-12 sm:p-16 border border-slate-300 print:shadow-none print:border-none print:p-8 print:w-full print:max-w-none text-slate-900 font-serif leading-relaxed">
        {/* Header Entête Officielle */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-10">
          <div className="space-y-1">
            <div className="relative w-36 h-14">
              <Image
                src={logoSrc}
                alt={item.societe}
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
            <p className="text-[9px] text-slate-400 font-mono">Réf: ATT-{item.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Titre du document */}
        <div className="text-center my-12">
          <h1 className="text-2xl font-bold font-sans tracking-wider uppercase underline underline-offset-8 text-slate-900">
            ATTESTATION DE TRAVAIL
          </h1>
        </div>

        {/* Corps de l'attestation */}
        <div className="space-y-6 text-base text-justify font-serif text-slate-800 leading-8 my-10">
          <p>
            Je soussigné, <strong>Directeur des Ressources Humaines</strong> de la société{' '}
            <strong>{societeName}</strong>, atteste par la présente que :
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-800 font-sans my-6 space-y-2 text-sm">
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
            La présente attestation est délivrée à l&apos;intéressé(e) sur sa demande, pour servir et valoir ce que de droit, notamment dans le cadre de :{' '}
            <em>« {item.motif} »</em>.
          </p>
        </div>

        {/* Zone de Signature Officielle */}
        <div className="mt-16 pt-8 flex justify-end">
          <div className="text-center font-sans space-y-16 w-72">
            <div>
              <p className="text-xs font-bold uppercase text-slate-900">Pour la Direction Général</p>
              <p className="text-[11px] font-semibold text-slate-700">Le Directeur des Ressources Humaines</p>
            </div>

            <div className="border-t border-dashed border-slate-400 pt-2 text-[10px] text-slate-400">
              Cachet officiel & Signature autorisée
            </div>
          </div>
        </div>

        {/* Footer bas de page */}
        <div className="mt-20 border-t border-slate-200 pt-4 text-center font-sans text-[9px] text-slate-400 space-y-0.5">
          <p className="font-bold text-slate-600">{societeName}</p>
          <p>Document généré et certifié électroniquement via le Portail Intranet T-OIL/STSL/COMPEL</p>
        </div>
      </div>
    </div>
  );
}
