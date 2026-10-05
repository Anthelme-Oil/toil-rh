"use client";

import { CalendarDays, ChevronRight, Megaphone, Newspaper, Play } from "lucide-react";
import { publicationMeta } from "@/config/navigation";
import { PublicationCardDispatcher } from "./PublicationCardDispatcher";
interface PublicationRowProps {
  item: any; // Type dynamique ou adapté selon vos objets de publication
}

export function PublicationRow({ item }: PublicationRowProps) {
  
  return (
    <div className="flex items-center gap-4 p-4">
      <div
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          item.givenType === "actualites"
            ? "bg-violet-100 text-violet-600"
            : item.givenType === "annonces"
            ? "bg-orange-100 text-orange-600"
            : item.givenType === "evenements"
            ? "bg-pink-100 text-pink-600"
            : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {item.givenType === "actualites" ? (
          <Newspaper size={17} />
        ) : item.givenType === "annonces" ? (
          <Megaphone size={17} />
        ) : item.givenType === "evenements" ? (
          <CalendarDays size={17} />
        ) : (
          <Play size={17} fill="currentColor" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.title || item.titre}</p>
        <p className="mt-1 text-xs text-slate-400">
          {publicationMeta[item.giventType as keyof typeof publicationMeta]?.label} · {item.date || item.datePublication}
        </p>
      </div>
      <button
        aria-label="Ouvrir"
        className="hidden rounded-lg p-2 text-slate-300 hover:bg-slate-100 hover:text-slate-600 sm:block"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}