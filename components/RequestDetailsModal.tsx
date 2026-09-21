"use client";

import React from "react";
import { X, FileText, User, Mail, Calendar, Tag, ShieldAlert } from "lucide-react";
import { PendingRequest } from "./RequestCard";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  demande: PendingRequest | null;
}

export default function RequestDetailsModal({ isOpen, onClose, demande }: RequestDetailsModalProps) {
  if (!isOpen || !demande) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#A9782F]" />
            <h3 className="font-serif text-lg text-[#10192E]">Détails de la demande</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Titre & Référence */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {demande.reference && (
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {demande.reference}
                </span>
              )}
              <span className="text-xs font-semibold text-[#A9782F] bg-[#A9782F]/10 px-2.5 py-0.5 rounded-full">
                {demande.typeDemande}
              </span>
            </div>
            <h4 className="text-xl font-serif text-[#10192E] pt-1">{demande.titre}</h4>
          </div>

          {/* Informations Demandeur */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Demandeur</h5>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{demande.nomDemandeur || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{demande.emailDemandeur}</span>
              </div>
            </div>
          </div>

          {/* Statut & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Statut actuel</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" /> {demande.statut}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Date de soumission</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(demande.creeLe).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Motif / Description détaillée */}
          {demande.motif && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Motif / Commentaire</h5>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                {demande.motif}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page de la modale */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}