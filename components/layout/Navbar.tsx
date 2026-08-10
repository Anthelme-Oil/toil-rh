'use client';

// ═══════════════════════════════════════════════════════════════
// Navbar — Barre de navigation avec détection de la page active (souligné)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Search, Bell, Settings, HelpCircle, Menu, X, UserCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useUser } from '@/context/UserContext';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Informations', href: '/informations' },
  { label: 'Outils', href: '/outils' },
  { label: 'Demandes & Services', href: '/demandes' },
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Réservations', href: '/reservations' },
  { label: 'Formations', href: '/formations' },
  { label: 'Communautés', href: '/communautes' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { userEmail, userName, userRole, setUserEmail } = useUser();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-3">
        <div
          className="bg-white/95 backdrop-blur-md rounded-2xl border border-border/80 px-4 sm:px-6 shadow-sm transition-all duration-200"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link href="/" className="flex-shrink-0 focus-ring" id="nav-logo">
              <Logo />
            </Link>

            {/* ── Navigation Desktop ── */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-2 xl:ml-4 flex-1 justify-center" id="nav-main">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2 py-1.5 xl:px-3 text-xs xl:text-[13px] transition-all duration-200 rounded-lg whitespace-nowrap focus-ring ${
                      active
                        ? 'font-bold text-primary bg-primary-50/80 after:absolute after:bottom-0.5 after:left-2 after:right-2 after:h-[2.5px] after:bg-primary after:rounded-full'
                        : 'font-medium text-text-secondary hover:text-primary hover:bg-primary-50'
                    }`}
                    id={`nav-link-${link.href.replace('/', '') || 'home'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Actions droites ── */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Barre de recherche */}
              <div
                className={`hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  searchFocused
                    ? 'border-primary bg-white ring-2 ring-primary-100 w-52'
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

              {/* Icônes d'actions */}
              <button
                className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring"
                title="Notifications"
                id="nav-notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              </button>
              {/* <button
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring hidden sm:block"
                title="Paramètres"
                id="nav-settings"
              >
                <Settings className="w-5 h-5" />
              </button> */}
              {/* <button
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring hidden sm:block"
                title="Aide"
                id="nav-help"
              >
                <HelpCircle className="w-5 h-5" />
              </button> */}

              {/* Avatar & Profil utilisateur avec menu déroulant */}
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

                {/* Menu déroulant Profil / Connexion */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-border shadow-xl p-4 z-50 animate-fade-in space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-primary truncate">{userName}</p>
                        <p className="text-[11px] text-text-muted truncate">{userEmail}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary text-[10px] font-extrabold uppercase">
                          Rôle : {userRole}
                        </span>
                      </div>
                    </div>

                    {/* Simulation / Test de compte */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-text-secondary">
                        Changer de compte (Mode test/démo) :
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="ex: lino@gmail.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-alt text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    {/* Bouton Connexion SSO Microsoft 365 */}
                    <button
                      onClick={() => signIn('azure-ad')}
                      className="w-full py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Connexion Microsoft 365 (Entra ID)
                    </button>
                  </div>
                )}
              </div>

              {/* Menu mobile toggle */}
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

          {/* ── Menu mobile ── */}
          {mobileMenuOpen && (
            <nav
              className="lg:hidden border-t border-border py-3 space-y-1 animate-slide-down"
              id="nav-mobile-menu"
            >
              {/* Recherche mobile */}
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
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2.5 text-sm transition-colors rounded-xl ${
                      active
                        ? 'font-bold text-primary bg-primary-50 border-l-4 border-primary pl-4'
                        : 'font-medium text-text-secondary hover:text-primary hover:bg-primary-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
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
