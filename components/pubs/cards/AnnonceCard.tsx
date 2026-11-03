"use client";

import {
  AlertTriangle,
  Info,
  Bell,
  ExternalLink,
} from "lucide-react";

import { Annonce } from "@/types";

const typeStyles = {
  urgent: {
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
    accent: "bg-red-500",
  },

  warning: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Bell,
    accent: "bg-amber-500",
  },

  info: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Info,
    accent: "bg-blue-500",
  },
};

export function AnnonceCard({ data }: { data: Annonce }) {
  const style =
    typeStyles[data.type as keyof typeof typeStyles] ??
    typeStyles.info;

  const Icon = style.icon;

  return (
    <article className="relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full w-1.5 ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${style.badge}`}
        >
          <Icon size={14} />

          {data.type || "Information"}
        </span>

        <span className="text-xs font-medium text-slate-400">
          {new Date(data.datePublication).toLocaleDateString("fr-FR")}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900">
        {data.titre}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {data.contenu}
      </p>

      {data.lien && (
        <a
          href={data.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
        >
          En savoir plus
          <ExternalLink size={13} />
        </a>
      )}
    </article>
  );
}