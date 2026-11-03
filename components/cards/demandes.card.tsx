"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronDown, 
  FileText 
} from "lucide-react";

import { getMyRequests } from "@/lib/services/my-requests";
import { RequestItem } from "@/types";
import { WorkflowStepper, WorkflowStep, StepStatus } from "../WorkflowStepper";
import Loader from "../Loader";

// Helper pour convertir les statuts Backend vers le type StepStatus du Stepper
function parseStepStatus(status?: string | null): StepStatus {
  if (!status || status === "NON_REQUIS") return "PENDING";
  const s = status.toUpperCase();
  if (s.includes("VALIDE") || s === "APPROVED" || s === "COMPLETED") return "COMPLETED";
  if (s.includes("REJET") || s === "REJECTED") return "REJECTED";
  if (s.includes("EN_COURS") || s.includes("ATTENTE") || s === "IN_PROGRESS") return "IN_PROGRESS";
  return "PENDING";
}

// Transforme la RequestItem en tableau d'étapes compatible avec WorkflowStepper
function buildWorkflowSteps(item: RequestItem): WorkflowStep[] {
  // Si un historique de validation détaillé est présent, l'utiliser en priorité
  if (item.historiqueValidations && item.historiqueValidations.length > 0) {
    return item.historiqueValidations.map((h, idx) => ({
      id: h.stepId || `step-${idx}`,
      nom: h.nom || `Étape ${idx + 1}`,
      role: h.role || "VALIDEUR",
      valideur: h.valideur,
      statut: parseStepStatus(h.statut),
      dateValidation: h.dateValidation,
      commentaire: h.commentaire,
    }));
  }

  // Sinon, construction dynamique basée sur les champs standard (N1, RH, IT)
  const steps: WorkflowStep[] = [];

  if (item.statutN1 && item.statutN1 !== "NON_REQUIS") {
    steps.push({
      id: "n1",
      nom: "Validation N1",
      role: "Manager",
      valideur: item.emailManager || undefined,
      statut: parseStepStatus(item.statutN1),
      dateValidation: item.dateValidationN1 || undefined,
      commentaire: item.commentaireN1 || undefined,
    });
  }

  if (item.statutRH && item.statutRH !== "NON_REQUIS") {
    steps.push({
      id: "rh",
      nom: "Validation RH",
      role: "Ressources Humaines",
      statut: parseStepStatus(item.statutRH),
      dateValidation: item.dateValidationRH || undefined,
      commentaire: item.commentaireRH || undefined,
    });
  }

  if (item.statutIT && item.statutIT !== "NON_REQUIS") {
    steps.push({
      id: "it",
      nom: "Validation IT",
      role: "Support IT",
      statut: parseStepStatus(item.statutIT),
      dateValidation: item.dateValidationIT || undefined,
      commentaire: item.commentaireIT || undefined,
    });
  }

  return steps;
}

// Badge pour le statut global
function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || "";

  if (s.includes("valide") || s.includes("approuve") || s === "approved") {
    return {
      label: "Validée",
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      icon: CheckCircle2,
    };
  }
  if (s.includes("rejet") || s.includes("refus") || s === "rejected") {
    return {
      label: "Rejetée",
      className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
      icon: XCircle,
    };
  }
  return {
    label: "En cours",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: Clock,
  };
}

export default function DemandesCard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const data = await getMyRequests();
      setRequests(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes :", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="w-full rounded-0 border-0 border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
      {/* En-tête de la Card */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Mes dernières demandes
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Suivi en temps réel de l'avancement
          </p>
        </div>
        <Link
          href="/demandes/suivi"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          Voir tout <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : recentRequests.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
          Aucune demande répertoriée.
        </div>
      ) : (
        <div className="mt-2 divide-y divide-slate-100/80 dark:divide-slate-800/50">
          {recentRequests.map((item) => {
            const statusConfig = getStatusBadge(item.statutActuel || item.statut);
            const StatusIcon = statusConfig.icon;
            const steps = buildWorkflowSteps(item);
            const isExpanded = expandedId === item.id;

            const title =
              item.titre ||
              item.motif ||
              item.typeConge ||
              item.typeDemande ||
              "Demande sans titre";

            const dateFormatted = new Date(
              item.creeLe || item.dateCreation
            ).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            });

            return (
              <div key={item.id} className="py-3 transition-all">
                {/* Ligne d'en-tête cliquable */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between cursor-pointer group py-1.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Info Gauche */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0 group-hover:bg-slate-200/70 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {title}
                        </p>
                        {item.reference && (
                          <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                            #{item.reference}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {dateFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Statut Droite + Flèche d'expansion */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusConfig.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>

                    {/* {steps.length > 0 && (
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )} */}
                  </div>
                </div>

                {/* Section dépliante : WorkflowStepper */}
                {/* {isExpanded && steps.length > 0 && (
                  <div className="mt-3 pt-3 pb-2 px-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50 animate-in fade-in-50 duration-200">
                    <WorkflowStepper steps={steps} />
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}