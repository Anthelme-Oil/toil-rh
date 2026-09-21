'use client';

// ═══════════════════════════════════════════════════════════════
// Header — Barre de navigation supérieure (Intranet & Accueil)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Search, Bell, Menu, X, UserCheck, LayoutGrid } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import { BASE_NAV_LINKS, DYNAMIC_NAV_LINKS } from '@/config/navigation';

interface HeaderProps {
  /** Liste explicite des routes autorisées à afficher ce header */
  allowedRoutes?: string[];
  /** Liste des routes exclues de l'affichage */
  excludedRoutes?: string[];
}

export default function Header({ allowedRoutes, excludedRoutes }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const userPermissions = useUser();
  const { userEmail, userName, userRole, isAuthenticated } = userPermissions;

  // 1. Restriction d'affichage selon les routes
  const shouldRender = useMemo(() => {
    if (excludedRoutes && excludedRoutes.includes(pathname)) {
      return false;
    }
    if (allowedRoutes && allowedRoutes.length > 0) {
      return allowedRoutes.some((route) => 
        route === '/' ? pathname === '/' : pathname.startsWith(route)
      );
    }
    return true;
  }, [pathname, allowedRoutes, excludedRoutes]);

  // 2. Filtrage dynamique des liens
  const navLinks = useMemo(() => {
    const dynamicLinks = DYNAMIC_NAV_LINKS.filter(
      (link) => link.hasAccess && link.hasAccess(userPermissions)
    );
    return [...BASE_NAV_LINKS, ...dynamicLinks];
  }, [userPermissions]);

  // 3. Détection du lien actif
  const activeHref = useMemo(() => {
    let bestMatch = '';
    for (const link of navLinks) {
      const isMatch =
        link.href === '/'
          ? pathname === '/'
          : pathname === link.href || pathname.startsWith(link.href + '/');
      if (isMatch && link.href.length > bestMatch.length) {
        bestMatch = link.href;
      }
    }
    return bestMatch;
  }, [pathname, navLinks]);

  const isActive = (href: string) => href === activeHref;

  if (!shouldRender) return null;

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-200 print:hidden">
      <div className="max-w-full mx-auto">
        <div
          className="bg-white/95 backdrop-blur-md p-4 shadow-sm transition-all duration-200"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* ── Logo ── */}
            <Link href="/" className="flex-shrink-0 focus-ring" id="nav-logo">
              <Logo />
            </Link>

            {/* ── Navigation Desktop ── */}
         <nav
  className="
    hidden lg:flex
    flex-1
    items-center justify-center
    gap-2 xl:gap-2.5 2xl:gap-3
    min-w-0
    overflow-x-auto
    scrollbar-none
    py-1
    mx-4
  "
  id="nav-main"
>  {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                const isEspace = Boolean(link.isEspaceLink);

                // Style spécifique pour les liens vers les Espaces
              if (isEspace) {
  return (
    <Link
      key={link.href}
      href={link.href}
      className={`
        group relative flex shrink-0 items-center gap-2
        rounded-xl px-3.5 py-2
        text-[11px] font-semibold
        xl:text-xs 2xl:text-sm
        whitespace-nowrap
        transition-all duration-200
        focus-ring
        border
        ${
          active
            ? `
              bg-[var(--color-primary)]
              text-white
              border-[var(--color-primary)]
              shadow-md
              shadow-[var(--color-primary)]/20
            `
            : `
              bg-[var(--color-primary)]/[0.07]
              text-[var(--color-primary)]
              border-[var(--color-primary)]/20
              hover:bg-[var(--color-primary)]/[0.12]
              hover:border-[var(--color-primary)]/40
              hover:shadow-sm
            `
        }
      `}
      id={`nav-link-${link.href.replace('/', '') || 'home'}`}
    >
      {/* Icône */}
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : (
        <LayoutGrid className="h-4 w-4 shrink-0" />
      )}

      {/* Nom */}
      <span>{link.label}</span>

      {/* Badge ESPACE */}
      <span
        className={`
          ml-1 rounded-md
          px-1.5 py-0.5
          text-[8px]
          font-extrabold
          uppercase
          tracking-wider
          transition-colors
          ${
            active
              ? 'bg-white/15 text-white'
              : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
          }
        `}
      >
        Espace
      </span>
    </Link>
  );
}

                // Style standard
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2 py-1.5 xl:px-2.5 2xl:px-3 text-[11px] xl:text-xs 2xl:text-sm transition-all duration-200 rounded-lg whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 focus-ring ${
                      active
                        ? 'font-bold text-primary bg-primary-50/80 after:absolute after:bottom-0.5 after:left-1.5 after:right-1.5 after:h-[2.5px] after:bg-primary after:rounded-full'
                        : 'font-medium text-text-secondary hover:text-primary hover:bg-primary-50'
                    }`}
                    id={`nav-link-${link.href.replace('/', '') || 'home'}`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Actions droites ── */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
              {/* Barre de recherche */}
              <div
                className={`hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  searchFocused
                    ? 'border-primary bg-white ring-2 ring-primary-100 w-48'
                    : 'border-border bg-surface-alt/80 w-36'
                }`}
              >
                <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  className="bg-transparent text-xs outline-none w-full placeholder:text-text-muted"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  id="nav-search"
                />
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring"
                title="Notifications"
                id="nav-notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              </button>

              {/* Avatar & Profil */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-alt transition-colors focus-ring"
                  title="Mon Profil & Rôle"
                  id="nav-avatar"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-text-primary truncate max-w-[120px]">
                      {userName}
                    </span>
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                      {userRole}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-border shadow-xl p-4 z-50 animate-fade-in space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-primary truncate">{userName || 'Non connecté'}</p>
                        <p className="text-[11px] text-text-muted truncate">{userEmail || 'Aucune session active'}</p>
                        {userRole && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary text-[10px] font-extrabold uppercase">
                            Rôle : {userRole}
                          </span>
                        )}
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        Se déconnecter
                      </button>
                    ) : (
                      <button
                        onClick={() => signIn('azure-ad')}
                        className="w-full py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        Connexion Microsoft 365
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle mobile */}
              <button
                className="lg:hidden p-2 text-text-secondary hover:text-primary rounded-xl transition-colors focus-ring ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu navigation"
                id="nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Menu Mobile ── */}
          {mobileMenuOpen && (
            <nav className="lg:hidden border-t border-border py-3 space-y-1 animate-slide-down" id="nav-mobile-menu">
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl border border-border bg-surface-alt">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent text-sm outline-none w-full"
                  id="nav-mobile-search"
                />
              </div>

              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                const isEspace = Boolean(link.isEspaceLink);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2.5 text-sm transition-all rounded-xl ${
                      isEspace
                        ? active
                          ? 'font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                          : 'font-semibold bg-primary-50 text-primary border border-primary/20 hover:bg-primary-100/70'
                        : active
                          ? 'font-bold text-primary bg-primary-50 border-l-4 border-primary pl-4'
                          : 'font-medium text-text-secondary hover:text-primary hover:bg-primary-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      {Icon ? <Icon className="w-4 h-4" /> : isEspace ? <LayoutGrid className="w-4 h-4" /> : null}
                      <span>{link.label}</span>
                    </div>

                    {isEspace && (
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        Espace
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}