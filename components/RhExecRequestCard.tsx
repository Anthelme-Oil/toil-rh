// @/components/RhExecRequestCard.tsx
"use client";

import React, { useState } from "react";
import { FileText, Download, CheckCircle2, User, Calendar } from "lucide-react";

interface RhExecRequestCardProps {
  demande: any;
  onValidateAndDownload: (demandeId: string, typeDemande: string) => Promise<void>;
}

export default function RhExecRequestCard({ demande, onValidateAndDownload }: RhExecRequestCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleAction = async () => {
    try {
      setDownloading(true);
      await onValidateAndDownload(demande.id, demande.typeDemande);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
            {demande.reference || demande.id.slice(-6).toUpperCase()}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {demande.typeDemande}
          </span>
        </div>
        
        <h4 className="text-base font-bold text-slate-900 truncate">{demande.titre}</h4>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" /> {demande.nomDemandeur || demande.emailDemandeur}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(demande.creeLe).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
        <button
          onClick={handleAction}
          disabled={downloading}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          {downloading ? (
            <>Traitement...</>
          ) : (
            <>
              <Download className="w-4 h-4 text-emerald-400" /> Télécharger l'historique & Valider
            </>
          )}
        </button>
      </div>
    </div>
  );
}