'use client';

// ═══════════════════════════════════════════════════════════════
// Modale — Notice Service en Développement (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { Wrench } from 'lucide-react';

interface DevNoticeModalProps {
  item: { id: string; label: string } | null;
  onClose: () => void;
}

export function DevNoticeModal({ item, onClose }: DevNoticeModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Service en cours de développement
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Le formulaire de demande pour <strong className="text-emerald-700 font-semibold">&laquo; {item.label} &raquo;</strong> est actuellement en cours d&apos;implémentation. Il sera disponible très prochainement sur votre portail Intranet.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
}
