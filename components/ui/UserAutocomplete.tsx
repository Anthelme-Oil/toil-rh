'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserCheck, Search, Loader2, X, Check, Building2, Briefcase } from 'lucide-react';
import type { UserDirectoryItem } from '@/types';

interface UserAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectUser?: (user: UserDirectoryItem) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  dropUp?: boolean;
}


// Couleurs de dégradé élégantes pour les avatars
const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function UserAutocomplete({
  value,
  onChange,
  onSelectUser,
  placeholder = 'Rechercher un collaborateur (nom, e-mail)...',
  required = false,
  className = '',
  disabled = false,
  dropUp = false,
}: UserAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<UserDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Cache mémoire côté client pour éviter tout re-fetch inutile
  const cacheRef = useRef<Map<string, UserDirectoryItem[]>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchroniser l'état interne si la prop `value` change depuis l'extérieur
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fermer le dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction de recherche avec cache & debounce
  const fetchUsers = useCallback((searchQuery: string) => {
    const q = searchQuery.trim();

    if (q.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    const cacheKey = q.toLowerCase();

    // 1. Vérification en cache mémoire instantanée (0ms)
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey) || [];
      setResults(cached);
      setIsLoading(false);
      setIsOpen(cached.length > 0);
      setSelectedIndex(cached.length > 0 ? 0 : -1);
      return;
    }

    setIsLoading(true);

    // 2. Annulation du timer précédent (Debounce 300ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          const list: UserDirectoryItem[] = data.users || [];
          
          // Mise en cache de la recherche
          cacheRef.current.set(cacheKey, list);

          setResults(list);
          setIsOpen(list.length > 0);
          setSelectedIndex(list.length > 0 ? 0 : -1);
        }
      } catch (err) {
        console.error('[UserAutocomplete] Erreur lors de la recherche:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    fetchUsers(val);
  };

  const handleSelect = (user: UserDirectoryItem) => {
    setQuery(user.mail);
    onChange(user.mail);
    if (onSelectUser) {
      onSelectUser(user);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Navigation au clavier (Flèches Haut/Bas, Entrée, Échap)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Champ de saisie principal */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 bg-surface-alt border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm disabled:opacity-50"
        />

        {/* Icône gauche (UserCheck) */}
        <UserCheck className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />

        {/* Icône droite (Loading ou Clear) */}
        <div className="absolute right-3 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              title="Effacer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-text-muted pointer-events-none" />
          )}
        </div>
      </div>

      {/* Menu déroulant de l'annuaire */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 ${
            dropUp ? 'bottom-full mb-1.5' : 'mt-1.5'
          } bg-white border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in divide-y divide-border/40`}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted bg-surface-alt/50 flex items-center justify-between">
            <span>Annuaire d'entreprise</span>
            <span>{results.length} résultat(s)</span>
          </div>

          {results.map((user, idx) => {
            const isSelected = idx === selectedIndex;
            const initials = getInitials(user.displayName);
            const gradient = getAvatarGradient(user.displayName);

            return (
              <div
                key={user.id || user.mail}
                onClick={() => handleSelect(user)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-50/70 border-l-4 border-primary' : 'hover:bg-surface-alt/60'
                }`}
              >
                {/* Avatar avec initiales */}
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  {initials}
                </div>

                {/* Détails de l'utilisateur */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-text-primary truncate">
                      {user.displayName}
                    </h4>
                    {query.toLowerCase() === user.mail.toLowerCase() && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Sélectionné
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-primary font-medium truncate mt-0.5">
                    {user.mail}
                  </p>

                  {(user.jobTitle || user.department) && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {user.jobTitle && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary bg-surface-alt px-2 py-0.5 rounded-md border border-border/60">
                          <Briefcase className="w-2.5 h-2.5 text-text-muted" />
                          {user.jobTitle}
                        </span>
                      )}
                      {user.department && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                          <Building2 className="w-2.5 h-2.5" />
                          {user.department}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
