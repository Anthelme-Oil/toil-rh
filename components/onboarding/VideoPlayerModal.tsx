'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Download, FileText, Clock, Play, ShieldAlert, Award } from 'lucide-react';
import type { OnboardingModule } from '@/types';

interface VideoPlayerModalProps {
  module: OnboardingModule | null;
  isOpen: boolean;
  isCompleted: boolean;
  onClose: () => void;
  onToggleComplete: (moduleId: string) => void;
}

export function VideoPlayerModal({
  module,
  isOpen,
  isCompleted,
  onClose,
  onToggleComplete,
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la Modale */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="bg-primary/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-primary/40">
              {module.code}
            </span>
            <h2 className="text-lg font-bold truncate max-w-lg text-white">
              {module.titre}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Vidéo HTML5 */}
        <div className="relative bg-black w-full aspect-video flex items-center justify-center overflow-hidden">
          {module.videoUrl ? (
            <video
              src={module.videoUrl}
              controls
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
              poster={module.thumbnailUrl}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 p-6 text-center">
              <Play className="w-12 h-12 text-slate-600" />
              <p className="text-sm">Vidéo en cours de préparation sur le serveur Stream.</p>
            </div>
          )}
        </div>

        {/* Zone d'Information & Documents joints */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-surface-alt/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Clock className="w-3.5 h-3.5" /> {module.dureeMinutes} minutes
                </span>
                <span>•</span>
                <span className="capitalize font-medium">Catégorie: {module.categorie}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed pt-1">
                {module.description}
              </p>
            </div>

            {/* Bouton Action Marquer Comme Vu */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onToggleComplete(module.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-primary text-white hover:bg-primary-dark hover:scale-[1.02] shadow-primary/20'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-white'}`} />
                {isCompleted ? 'Module Validé (Cliquer pour annuler)' : 'Marquer comme vu'}
              </button>
            </div>
          </div>

          {/* Section Documents Rattachés (Fiches PDF à télécharger) */}
          {module.documentsAssocies && module.documentsAssocies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Documents & Supports téléchargeables
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {module.documentsAssocies.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    download
                    onClick={(e) => {
                      if (doc.url === '#') {
                        e.preventDefault();
                        alert(`Téléchargement de "${doc.titre}" (Fichier de démonstration)`);
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        PDF
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                          {doc.titre}
                        </p>
                        <span className="text-[10px] text-text-muted">
                          {doc.tailleFormatted || 'Fichier PDF'}
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-surface-alt group-hover:bg-primary/10 text-text-muted group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
