// components/WarningBanner.tsx
'use client';

import { useState } from 'react';
import { Sparkles, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import { SuggestionModal } from '../modals/SuggestionModal';

export default function WarningBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-0 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border border-amber-500/30 p-4 shadow-sm backdrop-blur-md  mt-[88px]">
        {/* Effet de lueur/clignotement subtil en arrière-plan */}
        <div className="absolute inset-0 bg-amber-400/5 animate-pulse pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-bounce">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Nouveau
                </span>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Espace d'amélioration continue de l'Intranet
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Votre avis compte ! Aidez-nous à optimiser votre expérience quotidienne en partageant vos idées ou en signalant vos retours.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0 cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Donner mon avis
          </button>
        </div>
      </div>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}