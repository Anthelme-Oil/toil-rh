'use client';

import React from 'react';
import { Sparkles, GraduationCap, CheckCircle2, Clock, Trophy } from 'lucide-react';
import type { UserOnboardingProgress } from '@/types';

interface HeroOnboardingProps {
  userName: string;
  progress: UserOnboardingProgress | null;
  totalModules: number;
  totalDuration: number;
}

export function HeroOnboarding({
  userName,
  progress,
  totalModules,
  totalDuration,
}: HeroOnboardingProps) {
  const completedCount = progress?.modulesCompletes?.length || 0;
  const percentage = progress?.pourcentageGlobal || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-primary-dark to-emerald-950 text-white p-6 sm:p-10 shadow-2xl mb-8 border border-white/10">
      {/* Arrière-plan décoratif et motifs lumineux */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Partie Gauche : Salutation & Présentation */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Parcours d'Intégration T-OIL
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Bienvenue chez T-OIL, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">{userName}</span> !
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            Découvrez l'histoire du groupe COMPEL STSL T-OIL, nos engagements sécurité HSE,
            vos avantages RH et la prise en main rapide de vos outils informatiques.
          </p>

          {/* Statistiques rapides en pilules */}
          <div className="flex items-center gap-4 pt-2 flex-wrap text-xs font-medium text-emerald-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>{totalModules} Modules au total</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>~{totalDuration} min de visionnage</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-emerald-300" />
              <span>Badge d'Intégration</span>
            </div>
          </div>
        </div>

        {/* Partie Droite : Jauge de progression visuelle */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-w-[280px] shadow-lg">
          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            {/* SVG Cercle de Progression */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-400 transition-all duration-700 ease-out"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Texte pourcentage central */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none">{percentage}%</span>
              <span className="text-[10px] text-emerald-200 font-semibold uppercase mt-0.5">Complété</span>
            </div>
          </div>

          <div className="w-full space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-100">
              <span>Progression</span>
              <span className="font-bold text-white">
                {completedCount} / {totalModules} modules
              </span>
            </div>

            {/* Barre linéaire fine */}
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {percentage === 100 && (
            <div className="mt-3 text-xs font-bold text-amber-300 flex items-center gap-1 animate-bounce">
              <CheckCircle2 className="w-4 h-4" /> Parcours 100% Validé ! Bravo !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
