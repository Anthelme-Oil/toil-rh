'use client';

// ═══════════════════════════════════════════════════════════════
// Page Document Imprimable — Attestation de Domiciliation Bancaire
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, CheckCircle2, Loader2, Landmark } from 'lucide-react';

interface DomiciliationDetail {
  id: string;
  titre: string;
  nomDemandeur: string;
  emailDemandeur: string;
  nom: string;
  prenom: string;
  banque: string;
  agenceBancaire: string;
  dateSouhaitee: string;
  commentaire?: string;
  ribUrl?: string;
  documentFinalUrl?: string;
  statut: string;
  dateCreation: string;
  dateValidationDRH?: string;
  dateTraitementRH?: string;
}

export default function DomiciliationDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const demandeId = resolvedParams.id;

  const [demande, setDemande] = useState<DomiciliationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDemande() {
      try {
        const res = await fetch(`/api/demandes/domiciliation?role=collaborateur`);
        if (res.ok) {
          const data = await res.json();
          const found = (data.demandes || []).find((d: any) => d.id === demandeId);
          if (found) {
            setDemande(found);
          } else {
            // Réessayer en mode DRH/RH au cas où
            const resAdmin = await fetch(`/api/demandes/domiciliation?role=drh`);
            if (resAdmin.ok) {
              const dataAdmin = await resAdmin.json();
              const foundAdmin = (dataAdmin.demandes || []).find((d: any) => d.id === demandeId);
              if (foundAdmin) setDemande(foundAdmin);
              else setError('Demande de domiciliation introuvable.');
            }
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement du document.');
      } finally {
        setLoading(false);
      }
    }

    fetchDemande();
  }, [demandeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          Génération du document de domiciliation...
        </div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <p className="text-red-600 font-bold text-lg mb-2">Erreur</p>
          <p className="text-slate-600 text-sm mb-4">{error || 'Document non disponible.'}</p>
          <Link
            href="/demandes"
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux demandes
          </Link>
        </div>
      </div>
    );
  }

  const dateEffetFormatted = demande.dateSouhaitee
    ? new Date(demande.dateSouhaitee).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR');

  const dateValidationFormatted = demande.dateValidationDRH
    ? new Date(demande.dateValidationDRH).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR');

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      {/* ── Action bar (masquée à l'impression) ── */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux demandes
        </Link>

        <div className="flex items-center gap-3">
          {demande.ribUrl && (
            <a
              href={demande.ribUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" /> Voir le RIB joint
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimer l'Attestation
          </button>
        </div>
      </div>

      {/* ── Document PDF Imprimable ── */}
      <div className="max-w-4xl mx-auto bg-white p-10 sm:p-14 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-8 text-slate-900 font-sans space-y-8">
        {/* En-tête Entreprise */}
        <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-14">
              <Image
                src="/images/ToilTG.png"
                alt="Logo T-OIL"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">T-OIL S.A.</h1>
              <p className="text-xs text-slate-500 font-medium">
                Société Togolaise d'Entreposage et de Distribution de Produits Pétroliers
              </p>
              <p className="text-[11px] text-slate-400">Lomé — République Togolaise</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800">Réf : DOM/{demande.id.substring(0, 8).toUpperCase()}</p>
            <p>Date d'émission : {new Date().toLocaleDateString('fr-FR')}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              DOCUMENT OFFICIEL
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center py-4 space-y-2">
          <h2 className="text-2xl font-black tracking-wide text-emerald-900 uppercase">
            ATTESTATION DE DOMICILIATION BANCAIRE
          </h2>
          <p className="text-xs text-slate-500 italic">
            Engagement de virement de salaire sur compte bancaire
          </p>
        </div>

        {/* Corps du texte */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-800">
          <p>
            La Société <strong>T-OIL S.A.</strong> atteste par la présente que le salaire mensuel de son collaborateur :
          </p>

          {/* Fiche Employé */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Nom & Prénom :</span>
                <strong className="text-base text-slate-900">{demande.nomDemandeur}</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Adresse E-mail :</span>
                <strong className="text-sm text-slate-800">{demande.emailDemandeur}</strong>
              </div>
            </div>
          </div>

          <p>
            Sera régulièrement viré à compter du <strong>{dateEffetFormatted}</strong> sur son compte bancaire ouvert auprès de l'établissement financier ci-après désigné :
          </p>

          {/* Coordonnées Bancaires */}
          <div className="bg-emerald-50/60 p-6 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base pb-2 border-b border-emerald-200">
              <Landmark className="w-5 h-5 text-emerald-600" />
              Établissement Bancaire Bénéficiaire
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Nom de la Banque :</span>
                <strong className="text-slate-900 text-base">{demande.banque}</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Agence Bancaire :</span>
                <strong className="text-slate-900 text-base">{demande.agenceBancaire}</strong>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 italic pt-2">
            La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
          </p>
        </div>

        {/* Zone de Signatures & Cachet */}
        <div className="pt-10 grid grid-cols-2 gap-8 border-t border-slate-200 text-center">
          <div className="space-y-12">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Le Collaborateur</p>
              <p className="text-[11px] text-slate-400">Lu et approuvé</p>
            </div>
            <div className="text-xs text-slate-500 italic">
              {demande.nomDemandeur}
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Pour la Direction des Ressources Humaines</p>
              <p className="text-[11px] text-slate-400">Validé le {dateValidationFormatted}</p>
            </div>
            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 mx-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Signature & Cachet Électronique T-OIL
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="pt-8 text-center text-[10px] text-slate-400 border-t border-slate-100">
          T-OIL S.A. — Siege Social : Lomé Togo — Document généré automatiquement via le Portail Intranet d'Entreprise.
        </div>
      </div>
    </div>
  );
}
