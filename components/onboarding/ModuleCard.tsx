'use client';

import React from 'react';
import { Play, Check, Clock, FileText, Shield, Monitor, HeartHandshake, Award } from 'lucide-react';
import type { OnboardingModule } from '@/types';

interface ModuleCardProps {
  module: OnboardingModule;
  isCompleted: boolean;
  onOpenVideo: (module: OnboardingModule) => void;
  onToggleComplete: (moduleId: string, e: React.MouseEvent) => void;
}

const CATEGORY_CONFIG: Record<
  OnboardingModule['categorie'],
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  culture: {
    label: 'Culture & Valeurs',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-700',
    icon: HeartHandshake,
  },
  securite: {
    label: 'Sécurité & HSE',
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-700',
    icon: Shield,
  },
  it: {
    label: 'Outils IT & Digital',
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-700',
    icon: Monitor,
  },
  rh: {
    label: 'Guide & Avantages RH',
    bg: 'bg-purple-500/10 border-purple-500/30',
    text: 'text-purple-700',
    icon: Award,
  },
};

export function ModuleCard({
  module,
  isCompleted,
  onOpenVideo,
  onToggleComplete,
}: ModuleCardProps) {
  const categoryInfo = CATEGORY_CONFIG[module.categorie] || CATEGORY_CONFIG.culture;
  const CategoryIcon = categoryInfo.icon;
  const docCount = module.documentsAssocies?.length || 0;

  return (
    <div
      onClick={() => onOpenVideo(module)}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col ${
        isCompleted
          ? 'border-emerald-500/50 bg-emerald-50/20'
          : 'border-border hover:border-primary/40'
      }`}
    >
      {/* Miniature avec Overlay de Lecture */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={module.thumbnailUrl}
          alt={module.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Bouton Play Flottant */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all duration-300 backdrop-blur-sm border border-white/20">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Badges Supérieurs */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Badge Catégorie */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border backdrop-blur-md text-[11px] font-bold ${categoryInfo.bg} ${categoryInfo.text} shadow-sm bg-white/90`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            {categoryInfo.label}
          </span>

          {/* Bouton Coche Validation */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(module.id, e);
            }}
            title={isCompleted ? 'Marquer comme non vu' : 'Marquer comme vu'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isCompleted
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-white/80 text-text-muted hover:bg-white hover:text-primary'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Badge Durée & Code en Bas de la miniature */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium">
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide">
            {module.code}
          </span>
          <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px]">
            <Clock className="w-3 h-3 text-amber-300" />
            {module.dureeMinutes} min
          </span>
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
              {module.titre}
            </h3>
          </div>
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {module.description}
          </p>
        </div>

        {/* Pied de la Carte */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          {docCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-semibold bg-surface-alt px-2 py-1 rounded-md">
              <FileText className="w-3.5 h-3.5 text-primary" />
              {docCount} document(s) joint(s)
            </span>
          ) : (
            <span className="text-[11px] text-text-muted italic">Vidéo explicative</span>
          )}

          {isCompleted ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" /> Validé
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-primary group-hover:underline">
              Visionner →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
