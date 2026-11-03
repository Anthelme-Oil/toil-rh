'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  LogOut,
  Search,
  PenSquare,
  Plus,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  Circle,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import { NAV_ITEMS } from '@/config/navigation';
import { UserPermissions } from '@/types/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<
    Record<string, boolean>
  >({});

  // 1. Récupération des permissions du contexte
  const {
    isRH,
    isManager,
    isAdmin,
    isDRH,
    isRHPrint,
    isRoomManager,
    isCom,
    isLoading,
    userName,
    userEmail,
    userRole,
  } = useUser();

  const userPermissions: UserPermissions = useMemo(
    () => ({
      isRH,
      isManager,
      isAdmin,
      isDRH,
      isRHPrint,
      isRoomManager,
      isCom,
    }),
    [
      isRH,
      isManager,
      isAdmin,
      isDRH,
      isRHPrint,
      isRoomManager,
      isCom,
    ]
  );

  const subChart = (
    text: string | null | undefined,
    end: number = 2
  ): string | null | undefined => {
    if (!text) return null;

    if (text && end !== 2) {
      const res = text.substring(0, end);
      return `${res}...`;
    }

    return text.substring(0, end);
  };

  // 2. Filtrage récursif des menus selon les permissions
  const filteredNavItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      const validSubItems = item.subItems?.filter((sub) => {
        if (sub.isPublicForUser) return true;

        if (sub.hasAccess) {
          return sub.hasAccess(userPermissions);
        }

        return false;
      });

      return {
        ...item,
        subItems: validSubItems,
      };
    }).filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.subItems?.some((sub) =>
          sub.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const hasValidAccess =
        item.isPublicForUser ||
        (item.hasAccess && item.hasAccess(userPermissions)) ||
        (item.subItems && item.subItems.length > 0);

      return hasValidAccess && matchesSearch;
    });
  }, [userPermissions, searchQuery]);

  /**
   * Gestion automatique de l'expansion des sous-menus.
   */
  useEffect(() => {
    setExpandedItems(() => {
      const next: Record<string, boolean> = {};

      filteredNavItems.forEach((item) => {
        const isSubActive = item.subItems?.some(
          (sub) => pathname === sub.href
        );

        next[item.title] = Boolean(isSubActive);
      });

      return next;
    });
  }, [pathname, filteredNavItems]);

  /**
   * Ouverture / fermeture manuelle d'un sous-menu.
   */
  const toggleSubMenu = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#06120e] text-slate-200 transition-all duration-300 ease-in-out lg:static border-r border-emerald-950/60 shadow-2xl ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72'}`}
      >
        {/* En-tête */}
        <div className="flex justify-between items-center px-4 pt-4">
          <div className="lg:hidden flex-1" />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-emerald-900/40 rounded-lg transition-colors ml-auto"
            title={isCollapsed ? 'Déplier' : 'Réduire'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brand & Logo */}
        <div className="flex items-center px-4 pt-1 pb-3">
          <Link
            href="/"
            onClick={onClose}
            className="group flex items-center gap-3 transition-transform hover:scale-102"
          >
            <div
              className={`relative flex ${
                isCollapsed ? 'h-14 w-14' : 'h-22 w-22'
              } shrink-0 items-center justify-center p-1`}
            >
              <Image
                src="/images/logo_officiel_toil.png"
                alt="Logo Officiel"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col mt-8">
                <span className="text-sm font-extrabold tracking-tight text-white">
                  Portail
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  Intranet
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Barre de recherche */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <div className="relative flex items-center rounded-xl bg-[#040c09] border border-emerald-900/40 px-3 py-2 text-slate-200 focus-within:border-emerald-500 transition-all">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />

              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-500 text-slate-200"
              />

              <PenSquare className="h-3.5 w-3.5 text-slate-400 ml-2 shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation Principale */}
        <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto scrollbar-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />

              {!isCollapsed && (
                <span>Chargement des accès...</span>
              )}
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const Icon = item.icon;

              const hasSub = Boolean(
                item.subItems && item.subItems.length > 0
              );

              const isExpanded = expandedItems[item.title];

              const isActive =
                pathname === item.href ||
                Boolean(
                  item.subItems?.some(
                    (sub) => pathname === sub.href
                  )
                );

              // ==========================================
              // MENU AVEC SOUS-MENUS
              // ==========================================
              if (hasSub && !isCollapsed) {
                return (
                  <div key={item.title} className="space-y-1">
                    <button
                      onClick={() => toggleSubMenu(item.title)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-900/50 shadow-md'
                          : 'text-slate-300 hover:bg-emerald-950/30 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 ${
                            isActive
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        />

                        <span className="truncate">
                          {item.title}
                        </span>
                      </div>

                      {/* Flèche avec rotation animée */}
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ease-in-out ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Sous-menu avec animation fluide de hauteur et d'opacité */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-2 pr-1 space-y-1 border-l border-emerald-900/50 ml-3 my-1">
                          {item.subItems?.map((sub) => {
                            const isSubActive =
                              pathname === sub.href;

                            const SubIcon =
                              sub.icon || Circle;

                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all ${
                                  isSubActive
                                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                                }`}
                              >
                                <SubIcon
                                  className={`h-3 w-3 ${
                                    isSubActive
                                      ? 'text-emerald-400'
                                      : 'text-slate-500'
                                  }`}
                                />

                                <span className="truncate">
                                  {sub.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // ==========================================
              // LIEN SIMPLE
              // ==========================================
              const firstSubHref =
                item.subItems?.[0]?.href || item.href;

              return (
                <Link
                  key={item.title}
                  href={
                    isCollapsed && hasSub
                      ? firstSubHref
                      : item.href
                  }
                  onClick={onClose}
                  title={isCollapsed ? item.title : undefined}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-950/50'
                      : 'text-slate-300 hover:bg-emerald-950/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? 'text-slate-950'
                          : 'text-slate-400'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate">
                        {item.title}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer / Profil utilisateur */}
        <div className="p-4 border-t border-emerald-950/60 space-y-3">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-emerald-950 border border-emerald-800/40 flex items-center justify-center">
                    <span className="text-center text-[12px]">
                      {subChart(userName, 2)}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {subChart(userName, 10)}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      T-Oil / STSL / COMPEL
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    signOut({ callbackUrl: '/login' })
                  }
                  title="Se déconnecter"
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-emerald-950 border border-emerald-800/40">
                <Image
                  src="/images/default-avatar.png"
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>

              <button
                onClick={() =>
                  signOut({ callbackUrl: '/login' })
                }
                title="Se déconnecter"
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};