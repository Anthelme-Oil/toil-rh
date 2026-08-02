'use client';

// ═══════════════════════════════════════════════════════════════
// Navbar — Barre de navigation avec détection de la page active (souligné)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Search, Bell, Settings, HelpCircle, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Informations', href: '/informations' },
  { label: 'Outils', href: '/outils' },
  { label: 'Demandes & Services', href: '/demandes' },
  { label: 'Réservations', href: '/reservations' },
  { label: 'Formations', href: '/formations' },
  { label: 'Communautés', href: '/communautes' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

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
            <nav className="hidden lg:flex items-center gap-1 ml-6" id="nav-main">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-sm transition-all duration-200 rounded-lg whitespace-nowrap focus-ring ${
                      active
                        ? 'font-bold text-primary bg-primary-50/80 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2.5px] after:bg-primary after:rounded-full'
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
            <div className="flex items-center gap-2">
              {/* Barre de recherche */}
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  searchFocused
                    ? 'border-primary bg-white ring-2 ring-primary-100 w-60'
                    : 'border-border bg-surface-alt/80 w-48'
                }`}
              >
                <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  className="bg-transparent text-sm outline-none w-full placeholder:text-text-muted"
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
              <button
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring hidden sm:block"
                title="Paramètres"
                id="nav-settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors focus-ring hidden sm:block"
                title="Aide"
                id="nav-help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Avatar utilisateur */}
              <button
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold ml-1 focus-ring"
                title="Mon profil"
                id="nav-avatar"
              >
                U
              </button>

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
