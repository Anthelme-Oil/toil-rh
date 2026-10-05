"use client";

import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { publicationMeta } from "@/config/navigation";
import { PublicationType } from "@/types";
import { PublicationCardDispatcher } from "./PublicationCardDispatcher";

interface ListingProps {
  type: PublicationType;
  items: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

export function Listing({ type, items, onEdit, onDelete }: ListingProps) {
  const meta = publicationMeta[type];

  return (
  <div className="grid gap-6 xl:grid-cols-[minmax(280px,280px)_minmax(0,1fr)]">
  {/* Panneau latéral récapitulatif */}
  <div className="hidden self-start overflow-hidden rounded-2xl border border-slate-200 bg-white xl:block">
    <div className="h-40 bg-slate-50 p-5">
      <img
        src={meta.image}
        alt={`Illustration ${meta.label}`}
        className="h-full w-full object-contain mix-blend-multiply"
      />
    </div>

    <div className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
        En un coup d’œil
      </p>

      <p className="mt-2 text-3xl font-bold">
        {items.length}
      </p>

      <p className="text-sm text-slate-500">
        {meta.label.toLowerCase()} récentes
      </p>

      <div className="mt-5 h-px bg-slate-100" />

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Gardez vos contenus à jour pour une communication claire et régulière.
      </p>
    </div>
  </div>

  {/* Grille des cartes dynamiques */}
 <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
  {items.map((item, idx) => (
    <div
      key={item.id || item.title || item.titre || idx}
      className="group relative flex min-w-0 h-full flex-col"
    >
      {/* Action Bar Flottante */}
      <div className="absolute right-3 top-3 z-30 flex items-center gap-1 rounded-xl bg-white/90 p-1 shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label="Modifier"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-violet-50 hover:text-violet-600"
          >
            <Edit3 size={15} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="Supprimer"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Carte */}
      <div className="flex h-full min-h-0 w-full flex-1">
        <PublicationCardDispatcher
          type={type}
          data={item}
        />
      </div>
    </div>
  ))}

  {!items.length && (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
      Aucune publication trouvée.
    </div>
  )}
</div>
</div>
  );
}