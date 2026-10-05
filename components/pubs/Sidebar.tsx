"use client";

import { ChevronRight, Newspaper, Users } from "lucide-react";
import { navItems, type NavKey } from "@/config/navigation";
import { icons } from "./icons";

interface SidebarProps {
  active: NavKey;
  setActive: (key: NavKey) => void;
  setShowForm: (show: boolean) => void;
}

export function Sidebar({ active, setActive, setShowForm }: SidebarProps) {
  return (
    <aside className="hidden w-[252px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:block">
      <div className="flex items-center gap-3 px-2">
        {/* <div className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <Newspaper size={20} />
        </div> */}
        <div>
          <p className="text-sm font-bold tracking-tight">
            Gestion<span className="text-violet-600">.</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
            communication
          </p>
        </div>
      </div>

      <div className="mt-12">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Espace contenu
        </p>
        <nav className="mt-3 grid gap-1">
          {navItems.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            const selected = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key);
                  setShowForm(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  selected
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {Icon && <Icon size={18} strokeWidth={selected ? 2.5 : 1.8} />}
                <span>{item.label}</span>
                {selected && <ChevronRight className="ml-auto" size={15} />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-36">
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-white/10">
            <Users size={16} />
          </div>
          <p className="text-sm font-semibold">Besoin d’aide ?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Retrouvez nos guides pour gérer vos contenus.
          </p>
          <button className="mt-3 text-xs font-semibold text-violet-300">
            Consulter les guides →
          </button>
        </div>
      </div>
    </aside>
  );
}