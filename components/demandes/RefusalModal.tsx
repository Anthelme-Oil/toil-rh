'use client';

// ═══════════════════════════════════════════════════════════════
// Modale — Saisie Obligatoire du Motif de Refus (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RefusalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function RefusalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: RefusalModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onSubmit(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Saisie du Motif de Refus
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Veuillez indiquer la raison de ce refus. Ce motif sera enregistré et transmis au collaborateur par e-mail.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motif de Refus <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="ex: Pièce justificative invalide / Chevauchement..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirmer le Refus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
