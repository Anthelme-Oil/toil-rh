"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, MessageSquare, X } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (commentaire: string) => void;
  actionType: "VALIDATE" | "REJECT" | "DELETE" | null;
  requestTitle: string;
  loading: boolean;
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  requestTitle,
  loading,
}: ActionModalProps) {
  const [commentaire, setCommentaire] = useState("");

  // Réinitialiser le champ texte à chaque ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setCommentaire("");
    }
  }, [isOpen]);

  if (!isOpen || !actionType) return null;

  const isReject = actionType === "REJECT";
  const isDel = actionType ==='DELETE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReject && !commentaire.trim()) {
      alert("Un motif est obligatoire pour un rejet.");
      return;
    }
    onConfirm(commentaire);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* En-tête */}
        <div className={`p-6 pb-4 flex items-start justify-between border-b ${(isReject || isDel) ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${(isReject || isDel) ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {(isReject || isDel) ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-base font-bold ${(isReject || isDel) ? 'text-rose-900' : 'text-emerald-900'}`}>
                {isReject ? "Confirmer le rejet" :isDel ?  "Confirmer la suppression ": "Confirmer l'approbation"}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{requestTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
       { <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isDel &&(<div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Commentaire / Motif {isReject && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              placeholder={isReject ? "Précisez le motif du rejet (requis)..." : "Ajouter un commentaire optionnel..."}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-700 resize-none"
              required={isReject}
            />
          </div>)}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 ${
                (isReject || isDel)? 'bg-rose-600 hover:bg-rose-700' :  'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isReject ? "Confirmer le rejet" : isDel ? "Confirmer la suppression" : "Confirmer l'approbation"}
            </button>
          </div>
        </form>}
      </div>
    </div>
  );
}