"use client";

import { Calendar, MapPin, Clock } from "lucide-react";
import { Evenement } from "@/types";

export function EvenementCard({ data }: { data: Evenement }) {
  const startDate = new Date(data.dateDebut);
  const day = startDate.getDate();
  const month = startDate.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
  const time = startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <article className="group flex overflow-hidden ">
      {/* Bloc Date Rose/Pink */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center border-r border-slate-100 bg-pink-50/60 p-4 text-center">
        <span className="text-2xl font-extrabold text-pink-600">{day}</span>
        <span className="text-xs font-bold tracking-wider text-pink-500 uppercase">{month}</span>
      </div>

      {/* Détails */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-600 transition">
            {data.titre}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {data.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            {time}
          </span>

          {data.lieu && (
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin size={13} className="text-pink-500" />
              {data.lieu}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}