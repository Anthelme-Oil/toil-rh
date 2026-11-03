
"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  title?: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;

  /**
   * Définit le style de la confirmation.
   * - danger : suppression, annulation, etc.
   * - success : validation, approbation, etc.
   * - warning : action sensible
   * - default : action standard
   */
  variant?: "danger" | "success" | "warning" | "default";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,

  title = "Confirmer l'action",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",

  confirmText = "Confirmer",
  cancelText = "Annuler",

  loading = false,

  variant = "default",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      header: "bg-rose-50/50 border-rose-100",
      iconWrapper: "bg-rose-100 text-rose-600",
      title: "text-rose-900",
      button: "bg-rose-600 hover:bg-rose-700",
      icon: XCircle,
    },

    success: {
      header: "bg-emerald-50/50 border-emerald-100",
      iconWrapper: "bg-emerald-100 text-emerald-600",
      title: "text-emerald-900",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: CheckCircle2,
    },

    warning: {
      header: "bg-amber-50/50 border-amber-100",
      iconWrapper: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      button: "bg-amber-600 hover:bg-amber-700",
      icon: AlertTriangle,
    },

    default: {
      header: "bg-slate-50 border-slate-100",
      iconWrapper: "bg-slate-100 text-slate-600",
      title: "text-slate-900",
      button: "bg-slate-700 hover:bg-slate-800",
      icon: CheckCircle2,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (loading) return;

    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* En-tête */}
        <div
          className={`p-6 pb-4 flex items-start justify-between border-b ${config.header}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconWrapper}`}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div>
              <h3
                className={`text-base font-bold ${config.title}`}
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 ${config.button}`}
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

