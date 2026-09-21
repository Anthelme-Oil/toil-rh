"use client";

import React, { useState, useEffect ,useMemo} from "react";
import { WorkflowStepper } from "@/components/WorkflowStepper";
import { getWorkflowStepsSequence, WorkflowType, WorkflowStatus } from "@/lib/workflows/engine";
import { Clock, CheckCircle2, XCircle, Loader2, FileText, ChevronRight, MessageSquare, ArrowRightCircle } from "lucide-react";
import { getMyRequests } from "@/lib/services/my-requests";
import { RequestItem,FilterKey } from "@/types";
import RequestFilters from "@/components/RequestFilters";
import AttachmentCard from "@/components/AttachmentCard";
export default function SuiviDemandesPage() {
  const [demandes, setDemandes] = useState<RequestItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
const [activeFilter, setActiveFilter] =
    useState<FilterKey>('pending');


  useEffect(() => {
    fetchMyRequests();
  }, []);
const filteredRequest = useMemo(() => {
  return demandes.filter((demande) => {
    const statut = demande?.statutActuel?.toUpperCase() || "";

    switch (activeFilter) {
      case "pending":
        return !["APPROUVE","REFUSE"].includes(statut);

      case "validated":
        return statut.includes("APPROUVE");

      case "refused":
        return statut.includes("REFUSE");

      case "all":
        return true;

      default:
        return true;
    }
  });
}, [demandes, activeFilter]);

useEffect(() => {
  if (filteredRequest.length === 0) {
    setSelectedId(null);
    return;
  }

  const selectedStillExists = filteredRequest.some(
    (demande) => demande.id === selectedId
  );

  if (!selectedStillExists) {
    setSelectedId(filteredRequest[0].id);
  }
}, [filteredRequest, selectedId]);

const fetchMyRequests = async () => {
  try {
    setLoading(true);

    const data = await getMyRequests();

    setDemandes(data);

    // La sélection sera gérée par filteredRequest
    setSelectedId(null);
  } catch (err) {
    console.error("Erreur chargement demandes:", err);
  } finally {
    setLoading(false);
  }
};

// console.log("filteredREquest=>",filteredRequest)

  const selectedDemande = demandes.find((d) => d.id === selectedId);
  //  console.log("demandes ",selectedDemande)

  // Fusion des commentaires spécifiques du schéma pour s'assurer que le stepper les reçoit
  const enrichedHistorique = selectedDemande ? [
    ...(selectedDemande.historique || []),
    ...(selectedDemande.commentaireN1 ? [{ stepId: 'N1', commentaire: selectedDemande.commentaireN1 }] : []),
    ...(selectedDemande.commentaireRH ? [{ stepId: 'RH', commentaire: selectedDemande.commentaireRH }] : []),
    ...(selectedDemande.commentaireIT ? [{ stepId: 'IT', commentaire: selectedDemande.commentaireIT }] : []),
  ] : [];

  const computedSteps = selectedDemande
    ? getWorkflowStepsSequence(
        selectedDemande.type,
        selectedDemande.statutActuel,
        enrichedHistorique
      )
    : [];

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case "APPROUVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approuvé
          </span>
        );
      case "REFUSE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3.5 h-3.5" /> Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> En cours
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 md:p-10 space-y-8 bg-slate-50/50  shadow-sm">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suivi des Demandes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualisez en temps réel l'avancement et le circuit de validation de vos requêtes.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          Total : <span className="font-bold text-slate-800">{demandes.length}</span> demandes
        </div>
      </div>

      <RequestFilters
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}

      />

      {filteredRequest.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Aucune demande trouvée</h3>
          <p className="text-sm text-slate-400 mt-1">Vous n'avez pas encore soumis de requête.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE GAUCHE : Liste des demandes */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-0 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Liste des requêtes</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filteredRequest.map((demande) => {
                const isSelected = demande.id === selectedId;
                return (
                  <div
                    key={demande.id}
                    onClick={() => setSelectedId(demande.id)}
                    className={`p-4 cursor-pointer transition-all text-left flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/60 border-l-4 border-emerald-600 shadow-xs"
                        : "hover:bg-slate-50/80 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {demande.reference || "REF"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(demande.creeLe).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {demande.titre}
                      </p>
                      {/* Affichage rapide de la prochaine étape dans la liste */}
                      {!demande.estTerminee && !demande.estRejetee && demande.nextStep && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <ArrowRightCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">En attente : {demande.nextStep.nom}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-emerald-600 translate-x-0.5" : "text-slate-300"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLONNE DROITE : Panneau de détails & Stepper dynamique */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-0 shadow-xs p-6 md:p-8 space-y-8">
            {selectedDemande ? (
              <>
                {/* En-tête de la demande sélectionnée */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {selectedDemande.reference}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {selectedDemande.type}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 pt-1">
                      {selectedDemande.titre}
                    </h2>
                  </div>
                  <div>{getStatusBadge(selectedDemande.statutActuel)}</div>
                </div>

                {/* Indicateur explicite de la prochaine étape */}
                {!selectedDemande.estTerminee && !selectedDemande.estRejetee && selectedDemande.nextStep && (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
                    <ArrowRightCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-amber-800">Prochaine étape active</h4>
                      <p className="text-sm font-medium text-amber-900 mt-0.5">
                        En attente de validation par : <span className="underline font-bold">{selectedDemande.nextStep.role}</span> ({selectedDemande.nextStep.nom})
                      </p>
                    </div>
                  </div>
                )}

                {
                  selectedDemande?.pieceJointe && (
                     <AttachmentCard
                     fileUrl={selectedDemande.pieceJointe}
                     fileName={`${selectedDemande?.typeDemande}_${selectedDemande?.reference}`}

                     />
                  )
                }

                {/* Bloc du Stepper dynamique */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Circuit de validation en temps réel
                  </h3>
                  <div className="bg-slate-50/60 border-0 border-slate-200/70 rounded-xl p-6 shadow-2xs">
                    <WorkflowStepper steps={computedSteps} />
                  </div>
                </div>

                {/* Affichage direct global des commentaires si présents (ex: Motif du rejet) */}
                {(selectedDemande.commentaireN1 || selectedDemande.commentaireRH || selectedDemande.commentaireIT) && (
                  <div className="bg-rose-50/50 border border-rose-200/60 rounded-[5px] p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4" /> Motifs / Commentaires des validateurs
                    </div>
                    {selectedDemande.commentaireN1 && (
                      <p className="text-xs text-slate-700">
                        <strong className="text-rose-900">N+1 :</strong> {selectedDemande.commentaireN1}
                      </p>
                    )}
                    {selectedDemande.commentaireRH && (
                      <p className="text-xs text-slate-700">
                        <strong className="text-rose-900">DRH / RH :</strong> {selectedDemande.commentaireRH}
                      </p>
                    )}
                    {selectedDemande.commentaireIT && (
                      <p className="text-xs text-slate-700">
                        <strong className="text-rose-900">IT :</strong> {selectedDemande.commentaireIT}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Sélectionnez une demande dans la liste pour afficher son suivi détaillé.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}