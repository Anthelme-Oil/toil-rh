'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Tv, ArrowRight, GraduationCap, ShieldCheck, Sparkles, Clock, X } from 'lucide-react';

interface VideoItem {
  id: string;
  titre: string;
  categorie: string;
  duree: string;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}

const DASHBOARD_VIDEOS: VideoItem[] = [
  {
    id: 'v-1',
    titre: 'Mot de la Direction Générale — Vision 2026',
    categorie: 'Institutionnel',
    duree: '8 min 03 s',
    date: '10 Août 2026',
    thumbnailUrl: '/video/VIDEO-2026-06-04-13-54-29.mp4#t=2',
    videoUrl: '/video/VIDEO-2026-06-04-13-54-29.mp4',
    description: 'Message de bienvenue et cap stratégique pour le groupe COMPEL STSL T-OIL.',
  },
];

export default function VideosSection() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              Vidéos & Actualités Médias
            </h2>
            <p className="text-xs text-text-muted">
              Découvrez les capsules d'actualités, messages de la direction et tutoriels.
            </p>
          </div>
        </div>

        {/* Bouton d'accès direct Onboarding */}
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm transition-all duration-200 hover:scale-[1.02]"
        >
          <GraduationCap className="w-4 h-4 text-amber-300" />
          Formations
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grille de Vidéos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {DASHBOARD_VIDEOS.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setSelectedVideo(vid)}
            className="group relative bg-surface-alt/40 rounded-xl border border-border hover:border-primary/40 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            {/* Thumbnail avec overlay play */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              {vid.videoUrl.endsWith('.mp4') || vid.thumbnailUrl.includes('.mp4') ? (
                <video
                  src={`${vid.videoUrl}#t=2`}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
              ) : (
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.titre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Bouton Play */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/20">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Badges sur l'image */}
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-emerald-300 backdrop-blur-md">
                  {vid.categorie}
                </span>
              </div>
              <div className="absolute bottom-2.5 right-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
                  <Clock className="w-3 h-3 text-amber-300" />
                  {vid.duree}
                </span>
              </div>
            </div>

            {/* Informations textuelles */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {vid.titre}
                </h3>
                <p className="text-[11px] text-text-muted line-clamp-2 mt-1 leading-relaxed">
                  {vid.description}
                </p>
              </div>
              <span className="text-[10px] text-text-muted font-medium pt-2 block border-t border-border/40">
                Publié le {vid.date}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lecteur Vidéo Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <h3 className="text-sm font-bold truncate pr-4">{selectedVideo.titre}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <video src={selectedVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
            <div className="p-4 bg-slate-950 text-slate-300 text-xs leading-relaxed">
              <p>{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
