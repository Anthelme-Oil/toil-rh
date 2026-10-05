"use client";

import { Clock3, User, Tag, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Actualite } from "@/types";

interface Props {
  data: Actualite;
  onEdit?: (item: Actualite) => void;
  onDelete?: (id: string) => void;
}

export function ActualiteCard({ data }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden ">
      {/* Zone Image */}
      {data.imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={data.imageUrl}
            alt={data.titre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {data.categorie && (
            <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-violet-700 backdrop-blur-md shadow-sm">
              {data.categorie}
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-24 w-full items-center justify-between border-b border-slate-100 bg-gradient-to-br from-violet-50 to-indigo-50/50 px-5">
          <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700">
            {data.categorie || "Actualité"}
          </span>
          <span className="text-xs text-slate-400">{data.tempsLecture || "3 min"}</span>
        </div>
      )}

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            {new Date(data.datePublication).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {data.tempsLecture && data.imageUrl && (
            <span>{data.tempsLecture} de lecture</span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
          {data.titre}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {data.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <div className="grid size-6 place-items-center rounded-full bg-slate-100 text-slate-500">
              <User size={12} />
            </div>
            <span>{data.auteur || "Rédaction"}</span>
          </div>

          <button className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
            Lire <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}