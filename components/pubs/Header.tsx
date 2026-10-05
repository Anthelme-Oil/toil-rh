"use client";

import { Newspaper, Search } from "lucide-react";

interface HeaderProps {
  query: string;
  setQuery: (query: string) => void;
}

export function Header({ query, setQuery }: HeaderProps) {
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white">
          <Newspaper size={18} />
        </div>
        <span className="font-bold">
          COM<span className="text-violet-600">.</span>
        </span>
      </div>

      <div className="relative hidden w-72 md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une publication…"
          className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-3 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-violet-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm text-slate-400">Partagez l’information, faites vivre l’intranet</p>
          {/* <p className="text-xs text-slate-400">Administratrice</p> */}
        </div>
        {/* <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
          MD
        </div> */}
      </div>
    </header>
  );
}