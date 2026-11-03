"use client";

import React from "react";
import { CheckCircle2, XCircle, Loader2, CalendarDays, Eye } from "lucide-react";
import { RequestItem as PendingRequest } from "@/types";
import AttachmentCard from "./AttachmentCard";

// export interface PendingRequest {
//   id: string;
//   reference?: string;
//   titre: string;
//   typeDemande: string;
//   statut: string;
//   nomDemandeur: string;
//   emailDemandeur: string;
//   creeLe: string;
//   motif?: string;
// }

type Urgency = "calme" | "attention" | "urgent";

function getUrgency(creeLe: string): { level: Urgency; days: number } {
  const days = Math.max(0, Math.floor((Date.now() - new Date(creeLe).getTime()) / 86400000));
  if (days >= 7) return { level: "urgent", days };
  if (days >= 3) return { level: "attention", days };
  return { level: "calme", days };
}

function relativeLabel(days: number) {
  if (days === 0) return "Reçue aujourd'hui";
  if (days === 1) return "Reçue hier";
  return `En attente depuis ${days} jours`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const URGENCY_STYLES: Record<Urgency, { bar: string; dot: string; text: string; label: (d: number) => string }> = {
  urgent: {
    bar: "bg-[#A8503D]",
    dot: "bg-[#A8503D]",
    text: "text-[#A8503D]",
    label: (d) => `Urgent · ${d} j`,
  },
  attention: {
    bar: "bg-[#A9782F]",
    dot: "bg-[#A9782F]",
    text: "text-[#A9782F]",
    label: (d) => `À traiter · ${d} j`,
  },
  calme: {
    bar: "bg-slate-300",
    dot: "bg-slate-400",
    text: "text-slate-500",
    label: () => "Récemment reçue",
  },
};

interface RequestCardProps {
  demande: PendingRequest;
  isProcessing: boolean;
  onOpenDetails: (demande: PendingRequest) => void;
  onOpenActionModal: (demandeId: string, actionType: "VALIDATE" | "REJECT") => void;
}

export default function RequestCard({
  demande,
  isProcessing,
  onOpenDetails,
  onOpenActionModal,
}: RequestCardProps) {
  const urgency = getUrgency(demande.creeLe);
  const style = URGENCY_STYLES[urgency.level];

  return (
    <div className="group relative flex bg-white border border-[#10192E]/8 rounded-lg overflow-hidden transition-shadow hover:shadow-[0_4px_24px_-8px_rgba(16,25,46,0.12)]">
      {/* Repère d'urgence */}
      <div className={`w-1 shrink-0 ${style.bar}`} />

     

      <div className="flex-1 p-6 space-y-5">
        {/* En-tête du dossier */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#10192E] text-[#F7F7F5] flex items-center justify-center text-xs font-semibold tracking-wide">
              {initials(demande.nomDemandeur || demande.emailDemandeur)}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                {demande.reference && (
                  <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {demande.reference}
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase text-[#A9782F] bg-[#A9782F]/10 px-2 py-0.5 rounded-full">
                  {demande.typeDemande}
                </span>
              </div>
              <h2 className="font-serif text-lg text-[#10192E] leading-snug">{demande.titre}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  <strong className="text-slate-700 font-medium">{demande.nomDemandeur || "Demandeur"}</strong>
                  {" · "}
                  {demande.emailDemandeur}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium shrink-0 pl-[3.25rem] md:pl-0">
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className={style.text}>{style.label(urgency.days)}</span>
          </div>
        </div>

        {/* Motif ou résumé */}
        {demande.motif && (
          <blockquote className="pl-4 border-l-2 border-[#10192E]/10 text-sm text-slate-600 italic leading-relaxed line-clamp-2">
            {demande.motif}
          </blockquote>
        )}

        {/* Pied de dossier & Actions */}
         {
        demande?.pieceJointe && (
          <AttachmentCard
          fileName={`${demande?.typeDemande}_${demande?.reference}`}
          fileUrl={demande?.pieceJointe}
          />
        )
      }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-0 border-[#10192E]/6 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(demande.creeLe).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            <span className="text-slate-300 mx-1">·</span>
            {relativeLabel(urgency.days)}
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton pour ouvrir la modale de détails */}
            <button
              onClick={() => onOpenDetails(demande)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" /> Détails
            </button>

            <button
              onClick={() => onOpenActionModal(demande.id, "REJECT")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 rounded-md hover:border-[#A8503D]/40 hover:text-[#A8503D] active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <XCircle className="w-3.5 h-3.5" /> Rejeter
            </button>

            <button
              onClick={() => onOpenActionModal(demande.id, "VALIDATE")}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#10192E] hover:bg-[#A9782F] rounded-md shadow-sm active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Approuver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}