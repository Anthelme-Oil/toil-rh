"use client";

import { useState } from "react";
import { Play, Clock, Sparkles, X } from "lucide-react";
import { getVideoEmbedUrl } from "@/utils/videoUtils"

interface VideoData {
  id?: string;
  titre: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  categorie?: string;
  duree?: string;
  datePublication?: string;
}

export function VideoCard({ data }: { data: VideoData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { isEmbed, src } = getVideoEmbedUrl(data.videoUrl);

  return (
    <article className="group flex flex-col overflow-hidden">
      {/* Zone Vidéo / Miniature */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {isPlaying ? (
          <div className="relative h-full w-full">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute right-2 top-2 z-20 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
              title="Fermer la vidéo"
            >
              <X size={16} />
            </button>
            {isEmbed ? (
              <iframe
                src={src}
                title={data.titre}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={src} controls autoPlay className="h-full w-full object-cover" />
            )}
          </div>
        ) : (
          <div className="relative h-full w-full cursor-pointer" onClick={() => setIsPlaying(true)}>
            {data.thumbnailUrl ? (
              <img
                src={data.thumbnailUrl}
                alt={data.titre}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-950 to-slate-900 text-slate-600">
                <Sparkles size={40} />
              </div>
            )}

            {/* Overlay sombre + Bouton Play */}
            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid size-14 place-items-center rounded-full bg-white/90 text-emerald-600 shadow-xl backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                <Play size={22} className="ml-1 fill-current" />
              </div>
            </div>

            {/* Durée */}
            {data.duree && (
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Clock size={11} />
                {data.duree}
              </span>
            )}

            {data.categorie && (
              <span className="absolute left-3 top-3 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                {data.categorie}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta Infos */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
          {data.titre}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 leading-relaxed">
          {data.description}
        </p>
      </div>
    </article>
  );
}