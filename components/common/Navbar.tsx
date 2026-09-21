'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Menu, 
  User, 
  Search, 
  RefreshCw, 
  Home, 
  Newspaper, 
  Wrench, 
  Users,
  CalendarCheck
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    userName, 
    userEmail, 
    userRole, 
    isDRH, 
    isAdmin, 
    isRoomManager, 
    isManager, 
    refreshPermissions, 
    isLoading 
  } = useUser();

  // Libellé propre pour le badge selon les flags
  const getRoleBadgeLabel = () => {
    if (isAdmin) return 'Administrateur';
    if (isDRH) return 'DRH';
    if (isRoomManager) return 'IT Manager';
    if (isManager) return 'Manager (N+1)';
    return userRole || 'Employé';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
      {/* ── Gauche : Menu Mobile, Search & Navigation Rapide Public ── */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Barre de recherche */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une demande..."
            className="h-9 w-64 xl:w-72 rounded-full bg-gray-100 pl-9 pr-4 text-sm text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Séparateur vertical */}
        <div className="hidden md:block h-6 w-px bg-gray-200" />

        {/* Liens rapides vers l'espace public */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>

          <Link
            href="/informations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Newspaper className="h-4 w-4" />
            <span>Informations & Actualités</span>
          </Link>

          <Link
            href="/outils"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Wrench className="h-4 w-4" />
            <span>Outils</span>
          </Link>
           <Link
            href="/communautes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>communautés</span>
          </Link>

           <Link
            href="/reservations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Reservations</span>
          </Link>
        </nav>
      </div>

      {/* ── Droite : Actions & Profil Utilisateur ── */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Force Refresh Permissions */}
        <button
          onClick={refreshPermissions}
          title="Rafraîchir les permissions"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="h-6 w-px bg-gray-200" />

        {/* Profil connecté */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {userName || userEmail.split('@')[0]}
            </p>
            <p className="text-xs font-medium text-blue-600">{getRoleBadgeLabel()}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};