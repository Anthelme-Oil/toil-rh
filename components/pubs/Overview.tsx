"use client";

import { CalendarDays, ChevronRight, Megaphone, Newspaper, PlaySquare } from "lucide-react";
import { publicationMeta, type NavKey } from "@/config/navigation";
import { PublicationType } from "@/types";
import { PublicationRow } from "./PublicationRow";
import { useUser } from "@/context/UserContext";

const typeOrder: PublicationType[] = [
  "actualites",
  "annonces",
  "evenements",
  "videos",
];

interface OverviewProps {
  filtered: any[];
  setActive: (key: NavKey) => void;
}

export function Overview({ filtered, setActive }: OverviewProps) {
  const {userName}=useUser();
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {typeOrder.map((type) => {
         
          const meta = publicationMeta[type];
          const count = filtered.filter((p) => p.givenType === type).length;
          // console.log("meta",meta)
          // console.log("filtered",filtered)
          
          return (
            <button
              key={type}
              onClick={() => setActive(type)}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                  type === "actualites"
                    ? "bg-violet-100 text-violet-600"
                    : type === "annonces"
                    ? "bg-orange-100 text-orange-600"
                    : type === "evenements"
                    ? "bg-pink-100 text-pink-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {type === "actualites" ? (
                  <Newspaper size={21} />
                ) : type === "annonces" ? (
                  <Megaphone size={21} />
                ) : type === "evenements" ? (
                  <CalendarDays size={21} />
                ) : (
                  <PlaySquare size={21} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{meta.label}</p>
                <p className="mt-0.5 text-xl font-bold">
                  {count}
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    publications
                  </span>
                </p>
              </div>
              <ChevronRight
                className="ml-auto text-slate-300 transition group-hover:translate-x-1"
                size={17}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
  {/* Publications */}
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-100 p-5">
      <div>
        <h2 className="font-semibold">Publications récentes</h2>
        <p className="mt-1 text-xs text-slate-400">
          Les dernières publications ajoutées
        </p>
      </div>

      <button
        onClick={() => setActive("actualites")}
        className="text-xs font-semibold text-violet-600"
      >
        Tout voir
      </button>
    </div>

    <div className="divide-y divide-slate-100">
      {filtered.slice(0, 6).map((item, idx) => (
        <PublicationRow
          key={item.id || item.title || idx}
          item={item}
        />
      ))}
    </div>
  </div>

  {/* Espace éditorial */}
  <div className="relative self-start h-[220px] overflow-hidden rounded-2xl bg-violet-700 p-6 text-white">
    <div className="relative z-10 max-w-[60%]">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-200">
        Votre espace éditorial
      </p>

      <h2 className="mt-3 text-2xl font-bold leading-tight">
        Donnez vie à vos idées.
      </h2>

      <p className="mt-3 text-sm leading-6 text-violet-100">
        Une publication bien pensée crée une vraie connexion avec votre
        communauté.
      </p>

      <button
        onClick={() => setActive("actualites")}
        className="mt-6 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-50"
      >
        Créer une publication
      </button>
    </div>

    <img
      src={publicationMeta.actualites.image}
      alt="Illustration de publication"
      className="absolute -bottom-4 -right-12 h-48 w-56 object-contain opacity-90 mix-blend-multiply"
    />
  </div>
</div>
    </>
  );
}