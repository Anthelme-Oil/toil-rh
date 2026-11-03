import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface QuickLinkItem {
  name: string;
  desc?: string;
  href: string;
  logo: string;
  isActive?: boolean;
}

interface QuickLinksProps {
  visibleApps: QuickLinkItem[];
  announce?: (message: string) => void;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({
  visibleApps,
  announce = () => {},
}) => {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      {/* En-tête */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[#98a4b9]">
            Votre quotidien
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-[-.04em] text-[#2b4282]">
            Accès rapides
          </h2>
        </div>
        <Link
          href="/outils"
          className="hidden items-center gap-1 text-sm font-bold text-[#079bc2] transition-colors hover:text-[#057a99] sm:flex"
        >
          Voir toutes les applications <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Alignement propre des cercles avec taille fixe */}
      <div className="flex flex-wrap items-center justify-start gap-5 sm:gap-6">
        {visibleApps.map((app, index) => {
          const isActive = app.isActive || index === 0; // Le 1er est actif par défaut

          return (
            <a
              key={app.name}
              href={app.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => announce(`Ouverture de ${app.name}`)}
              className={`group flex size-28 flex-col items-center justify-center rounded-full p-2 text-center transition-all duration-300 hover:scale-105 sm:size-32 ${
                isActive
                  ? "bg-[#2b3e6f] text-white shadow-lg shadow-[#2b3e6f]/20"
                  : "bg-[#f5f8fc] text-[#2b3e6f] hover:bg-[#eaf0f9]"
              }`}
            >
              {/* Icône */}
              <div className="mb-1.5 flex size-6 items-center justify-center sm:size-7">
                <img
                  src={app.logo}
                  alt=""
                  className={`size-full object-contain transition-transform group-hover:scale-110 ${
                    isActive ? "brightness-0 invert" : ""
                  }`}
                />
              </div>

              {/* Texte centré et ajusté */}
              <span className="max-w-[85px] text-[11px] font-bold leading-tight tracking-tight sm:max-w-[100px] sm:text-xs">
                {app.name}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
};