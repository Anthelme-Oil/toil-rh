'use client';

// ═══════════════════════════════════════════════════════════════
// Page — Service en Développement
// ═══════════════════════════════════════════════════════════════

import { Wrench } from 'lucide-react';

export default function DevNotice() {
  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-bold text-slate-900">
            Service en cours de développement
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Le formulaire de demande pour ce service est actuellement en cours d&apos;implémentation. Il sera disponible très prochainement sur votre portail Intranet.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
}